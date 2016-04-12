import forEach from 'lodash/forEach';

/**
 * wrap lines to a maximum width
 * @param   {Number} options.width  max width in points
 * @param   {Array}  options.lines  text line objects
 * @param   {Object} options.meta   text line meta
 * @returns {Array}           text lines meta
 *
 *  lines: [
 *    { "parts": [{"font": "noto-bold", "size": 15, "text": "Specification Coverage"}] },
 *    { "parts": [{"font": "noto-bold", "size": 15, "text": ""}] },
 *    { "parts": [
 *      {"font": "noto", "size": 12, "text": "The following tables are implemented: "},
 *      {"font": "noto-bolditalic", "size": 12, "text": "cmap "},
 *      {"font": "noto", "size": 12, "text": "(currently only format 4), "},
 *      {"font": "noto-bold", "size": 12, "text": "glyf "},
 *      {"font": "noto", "size": 12, "text": "(glyphs are not actually Καλημέρα, only rewritten), "},
 *    ]},
 *  ]
 *
 *  returns: [
 *    { "parts": [{ "font": "noto-bold", "size": 15, "text": "Specification Coverage" }] },
 *    { "parts": [{"font": "noto-bold", "size": 15, "text": ""}] },
 *    { "parts": [{"font": "noto", "size": 12, "text": "The following tables are implemented: "}] },
 *    { "parts": [
 *      { "font": "noto-bolditalic", "size": 12, "text": "cmap " },
 *      { "font": "noto", "size": 12, "text": "(currently only format 4), " },
 *      { "font": "noto-bold", "size": 12, "text": "glyf " },
 *      { "font": "noto", "size": 12, "text": "(glyphs" }
 *    ]},
 *    { "parts": [{"font": "noto", "size": 12, "text": "are not actually Καλημέρα, only rewritten), "}] },
 *  ]
 */
export default function wrapText({ width, lines, meta }) {
  if (meta.width <= width) return lines;
  const wrapped = [];

  forEach(lines, (line, lineIdx) => {
    const lineMeta = meta.lines[lineIdx];
    if (lineMeta.width <= width) {
      wrapped.push(line);
      return true;
    }

    let newLine = { parts: [] };
    let indent = '';
    let newPartStartIdx = 0;
    let currWidth = 0;

    forEach(line.parts, (part, partIdx) => {
      const partMeta = lineMeta.parts[partIdx];
      if (currWidth + partMeta.width <= width) {
        newLine.parts.push(part);
        currWidth += partMeta.width;
        return true;
      }

      const wordWidths = [...partMeta.wordWidths];
      const spaceWidth = wordWidths.shift();

      if (!partIdx) { // the first part of the line
        indent = part.text.match(/^(\s+)/);
        currWidth = indent.length * spaceWidth;
      }

      currWidth -= spaceWidth;

      forEach(wordWidths, (wordWidth, wwIdx) => {
        if (currWidth + spaceWidth + wordWidth <= width) {
          currWidth += spaceWidth + wordWidth;
        } else {
          // get text, not including current word
          const text = part.text.split(/\s/).slice(newPartStartIdx, wwIdx).join(' ');
          // add text to line
          if (text) newLine.parts.push({ ...part, text });
          // add line to result
          wrapped.push(newLine);
          // start new line
          newLine = { parts: [] };
          currWidth = spaceWidth + wordWidth;
          newPartStartIdx = wwIdx;
        }
      });
      // end of part
      const text = part.text.split(/\s/).slice(newPartStartIdx).join(' ');
      newLine.parts.push({ ...part, text });
      newPartStartIdx = 0;
    });
    // end of line
    wrapped.push(newLine);
  });
  return wrapped;
}

