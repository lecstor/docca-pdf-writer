import Promise from 'bluebird';
import fs from 'fs';

import get from 'lodash/get';
import values from 'lodash/values';

import TTFFont from 'ttfjs';

/**
 * get a PDF FontDescriptor FontName Tag
 * @param   {Integer} counter  a number to create a tag from
 * @returns {String}           a tag to be used in the name of a font subset
 *
 * Embedded font subsets require a tag to be prepended to the FontName in the
 * PDF FontDescriptor object and BaseFont in the PDF Font object. The tag must
 * consist of six uppercase characters and be unique for each font subset.
 */
export function getFontSubsetTag(counter) {
  return `DOC${counter}`.replace(/(\d)/g, num => String.fromCharCode(+num + 65));
}

/**
 * get a unique font ID
 * @param   {Integer} counter  a number to create the name with
 * @returns {String}           an ID for a font to be used in text content
 */
export function getFontId(counter) {
  return `F${counter}`;
}

/**
 * get a PDF font file object
 * @returns {Object} PDF FontFile
 */
export function getFontFileProps(data) {
  return { data };
}

/**
 * get a PDF font descriptor
 * @param   {Object} options.font          ttfjs instance
 * @param   {String} options.subsetTag
 * @param   {Object} options.fontFile      PDF FontFile
 * @returns {Object}                       PDF FontDescriptor create args
 */
export function getFontDescriptor({ font, subsetTag, fontFile }) {
  return {
    fontname: `/${subsetTag}+${font.baseFont}`,
    fontfile2: fontFile,
    fontbbox: `[${font.bbox.join(' ')}]`,
    flags: font.flags,
    stemv: font.stemV,
    italicangle: font.italicAngle,
    ascent: font.ascent,
    descent: font.descent,
    capheight: font.capHeight,
    xheight: get(font, 'tables.os2.xHeight') || 0,
  };
}

/**
 * get a PDF font
 * @param   {[type]} options.descriptor [description]
 * @param   {[type]} options.fontId     [description]
 * @returns {[type]}                    Font create args
 */
export function getFont({ _id, descriptor, fontId, firstChar, lastChar, widths }) {
  return {
    _id,
    basefont: descriptor.fontname,
    fontdescriptor: descriptor,
    subtype: 'TrueType',
    name: `${fontId}`,
    encoding: 'MacRomanEncoding',
    firstchar: firstChar,
    lastchar: lastChar,
    widths,
  };
}

/**
 * parse a font file
 * @param   {Stream} file  the contents of a truetype font file
 * @returns {Object}       an instance of ttfjs
 */
export function parseFont(file) {
  return new TTFFont(file);
}

/**
 * load a font from file
 * @param   {String} name               name of font, ie the font file name without ttf extension
 * @param   {String} [options.fontDir]  where to find the font, or process.env.DOCCA_FONT_DIR
 * @returns {Promise}                   resolves to a ttfjs instance
 */
export function loadFont(name, { fontDir = process.env.DOCCA_FONT_DIR } = {}) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${fontDir}/${name}.ttf`, (err, data) => {
      if (err) {
        console.log(`Error reading font file: ${fontDir}/${name}.ttf`);
        return reject(err);
      }
      return resolve(parseFont(data));
    });
  });
}

/**
 * return a Buffer from an ArrayBuffer
 * @param   {ArrayBuffer} subset  a ttfjs subset
 * @returns {Buffer}
 */
export function subsetToBuffer(subset) {
  const buffer = new Buffer(subset.byteLength);
  const view = new Uint8Array(subset);
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

/**
 * return subset character data
 * @param   {Object} subset          a font subset
 * @returns {Object} anon
 * @returns {Array}  anon.width      width of each character in the subset
 * @returns {Object} anon.firstChar  character code of the first character in the subset
 * @returns {Object} anon.lastChar   character code of the last character in the subset
 */
export function getFontCharMeta(subset) {
  const subsetCodes = Object.keys(subset.subset);
  const metrics = subset.font.tables.hmtx.metrics;
  const codeMap = subset.font.codeMap;
  const unitsPerEm = subset.font.tables.head.unitsPerEm;
  const widths = values(subset.subset).map(code => {
    const mappedCode = codeMap[`${code}`];
    if (!(mappedCode && metrics[mappedCode])) return Math.round(1000 * 1000 / unitsPerEm);
    return Math.round(metrics[mappedCode] * 1000 / unitsPerEm);
  });
  return {
    widths,
    firstChar: +subsetCodes[0],
    lastChar: +subsetCodes[subsetCodes.length - 1],
  };
}

/**
 * get data used to embed the font in the PDF
 * @param   {Object} font        ttfjs instance
 * @param   {String} characters  characters to use from the font
 * @returns {Object} res         font data
 * @returns {Object} res.subset
 * @returns {Object} res.subsetData
 * @returns {Object} res.characterData
 */
export function useFont(font, characters) {
  const subset = font.subset();
  subset.use(characters);
  subset.embed();
  const subsetData = subsetToBuffer(subset.save());
  const characterData = getFontCharMeta(subset);
  return { subset, subsetData, characterData };
}

