import map from 'lodash/map';

/**
 * get the width and height of a single line of text
 * @param   {Array} line                 text content, font, and size
 * @param   {Number} options.leading     minimum leading for lines of text
 * @returns {Object} meta                width and height of the text line
 * @returns {Number} meta.width
 * @returns {Number} meta.height
 *
 * getLineMeta(
 *   [
 *     { font: 'noto', size: 12, text: 'or ' },
 *     { font: 'noto-bold', size: 15, text: 'Καλημέρα κόσμε' }
 *   ],
 *   { leading: 18 }
 * );
 *
 * returns: { width: 141.80126953125, height: 20.43 }
 */
export function getLineMeta(line, fonts, { leading = 0 } = {}) {
  return line.reduce((meta, part) => {
    // console.log(part.font, fonts);
    const font = fonts[part.font].font;
    const partLeading = font.lineHeight(part.size);
    const partWidth = font.stringWidth(part.text, part.size);
    const partDescent = font.lineDescent(part.size);

    const words = part.text.split(/\s/);
    const wordWidths = map([' ', ...words], word => font.stringWidth(word, part.size));
    return {
      width: meta.width + partWidth,
      height: partLeading > meta.height ? partLeading : meta.height,
      descent: partDescent < meta.descent ? partDescent : meta.descent,
      size: part.size > meta.size ? part.size : meta.size,
      parts: [...meta.parts, { width: partWidth, wordWidths }],
    };
  }, { size: 0, width: 0, descent: 0, height: leading, parts: [] });
}

/**
 * get the width and height of a block of text
 * @param   {Array}  options.lines       text content, font, and size grouped by line
 * @param   {Number} options.leading     minimum leading for lines of text
 * @returns {Object} meta                width and height of the text block
 * @returns {Number} meta.width
 * @returns {Number} meta.height
 *
 * getTextMeta({
 *   leading: 18,
 *   lines: [
 *     [ { "font": "noto", "size": 12, "text": "Hello World" } ],
 *     [ { "font": "noto", "size": 12, "text": "" } ],
 *     [
 *       { "font": "noto", "size": 12, "text": "or " },
 *       { "font": "noto-bold", "size": 15, "text": "Καλημέρα κόσμε" }
 *     ],
 *     [
 *       { "font": "noto-bold", "size": 15, "text": "" },
 *       { "font": "noto", "size": 12, "text": "or こんにちは 世界" }
 *     ]
 *   ],
 * });
 *
 * returns: {
 *   width: 141.80126953125,
 *   height: 74.43,
 *   lines: [
 *     { width: 66.08203125, height: 16.344 },
 *     { width: 0, height: 16.344 },
 *     { width: 141.80126953125, height: 20.43 },
 *     { width: 67.998046875, height: 16.344 }
 *   ]
 * }
 */
export default (lines, fonts, { leading } = {}) => {
  return lines.reduce((meta, line) => {
    const lineMeta = getLineMeta(line.parts, fonts, { leading });
    return {
      width: lineMeta.width > meta.width ? lineMeta.width : meta.width,
      height: lineMeta.height + meta.height,
      lines: [
        ...meta.lines,
        {
          width: lineMeta.width,
          height: lineMeta.height,
          size: lineMeta.size,
          descent: lineMeta.descent,
          parts: lineMeta.parts,
        },
      ],
    };
  }, { width: 0, height: 0, lines: [] });
};
