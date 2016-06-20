import _map from 'lodash/map';
import _sumBy from 'lodash/sumBy';


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
    const font = fonts[part.font].font;
    // const partLineHeight = part.leading || font.lineHeight(part.size);
    const partLineHeight = part.leading;
    const partWidth = font.stringWidth(part.text, part.size);
    const partDescent = font.lineDescent(part.size);

    const words = part.text.split(/\s/);
    const wordWidths = _map([' ', ...words], word => font.stringWidth(word, part.size));
    return {
      width: meta.width + partWidth,
      height: partLineHeight > meta.height ? partLineHeight : meta.height,
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
  const meta = lines.reduce((result, line) => {
    const lineMeta = getLineMeta(line.parts, fonts, { leading });
    return {
      width: lineMeta.width > result.width ? lineMeta.width : result.width,
      lines: [
        ...result.lines,
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

  const lineCount = meta.lines.length;
  const firstLine = meta.lines[0];
  const lastLine = meta.lines[lineCount - 1];
  // const lastLineLeading = lastLine.size / 10;
  const lastLineLeading = lastLine.height - lastLine.size;
  const firstLineAscent = firstLine.size + firstLine.descent;

  // const leadingHeight = _sumBy(meta.lines, line => line.size + (line.size / 10));
  const leadingHeight = _sumBy(meta.lines, line => line.height);
  const boundingHeight = leadingHeight - lastLineLeading;
  const baselineHeight = boundingHeight + (firstLineAscent / 10) + lastLine.descent;

  const height = {
    baseline: baselineHeight, // top to baseline of last line
    bounding: boundingHeight, // top to bottom of last line
    leading: leadingHeight,  // top to bottom inc last line lead
  };

  return { width: meta.width, height, lines: meta.lines };
};
