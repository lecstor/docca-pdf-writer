import get from 'lodash/get';
import values from 'lodash/values';
import TTFFont from 'ttfjs';

import { Font, FontFile, FontDescriptor } from 'pdf-serializer';

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
 * get a unique font name
 * @param   {Integer} counter  a number to create the name with
 * @returns {String}           a name for a font to be used in text content
 */
export function getFontName(counter) {
  return `F${counter}`;
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
 * get a PDF font file object
 * @returns {Object} PDF FontFile
 */
export function getFontFile() {
  return FontFile();
}

/**
 * get a PDF font descriptor
 * @param   {Object} options.font          ttfjs instance
 * @param   {String} options.fontSubsetTag
 * @param   {Object} options.fontFile      PDF FontFile
 * @returns {Object}                       PDF FontDescriptor
 */
export function getFontDescriptor({ font, fontSubsetTag, fontFile }) {
  return FontDescriptor({
    FontName: `/${fontSubsetTag}+${font.baseFont}`,
    FontFile2: fontFile,
    FontBBox: `[${font.bbox.join(' ')}]`,
    Flags: font.flags,
    StemV: font.stemV,
    ItalicAngle: font.italicAngle,
    Ascent: font.ascent,
    Descent: font.descent,
    CapHeight: font.capHeight,
    XHeight: get(font, 'tables.os2.xHeight') || 0,
  });
}

/**
 * get a PDF font
 * @param   {[type]} options.descriptor [description]
 * @param   {[type]} options.fontName   [description]
 * @returns {[type]}                    [description]
 */
export function getFont({ descriptor, fontName }) {
  return Font({
    BaseFont: descriptor.FontName,
    FontDescriptor: descriptor,
    Subtype: '/TrueType',
    Name: `/${fontName}`,
    Encoding: '/MacRomanEncoding',
  });
}
