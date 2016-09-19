import forEach from 'lodash/forEach'
import remove from 'lodash/remove'
import map from 'lodash/map'

/**
 * format text style list into lines
 * @param   {Array} content  text style meta
 * @returns {Array}          text lines meta
 *
 *  content: [
 *    { font: 'noto', size: 12, text: 'Hello World\n\nor ' },
 *    { font: 'noto-bold', size: 15, text: 'Καλημέρα κόσμε\n' },
 *    { font: 'noto', size: 12, text: 'or こんにちは 世界' },
 *  ]
 *
 *  returns: [
 *    { parts: [{ "font": "noto", "size": 12, "text": "Hello World" }] },
 *    {
 *      parts: [
 *        { "font": "noto", "size": 12, "text": "or " },
 *        { "font": "noto-bold", "size": 15, "text": "Καλημέρα κόσμε" },
 *      ],
 *    },
 *    { parts: [{ "font": "noto", "size": 12, "text": "or こんにちは 世界" }] },
 *  ],
 */
export default function delineateText (content) {
  const lines = []
  let line = []
  forEach(content, style => {
    const styleLines = style.text.split('\n')
    forEach(styleLines, (text, idx) => {
      line.push({ ...style, text })
      if (idx < styleLines.length - 1) {
        if (line.length > 1) remove(line, { text: '' })
        lines.push(line)
        line = []
      }
    })
  })
  if (line.length > 1) remove(line, { text: '' })
  if (line.length) lines.push(line)
  return map(lines, lin => ({ parts: lin }))
}

