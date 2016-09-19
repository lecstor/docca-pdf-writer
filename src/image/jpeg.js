import includes from 'lodash/includes'

const MARKERS = [
  0xFFC0, 0xFFC1, 0xFFC2, 0xFFC3, 0xFFC5, 0xFFC6, 0xFFC7,
  0xFFC8, 0xFFC9, 0xFFCA, 0xFFCB, 0xFFCC, 0xFFCD, 0xFFCE, 0xFFCF
]

function readMeta (data) {
  if (data.readUInt16BE(0) !== 0xFFD8) throw (new Error('SOI not found in JPEG'))

  let pos = 2
  let marker

  while (pos < data.length) {
    marker = data.readUInt16BE(pos)
    pos += 2
    if (includes(MARKERS, marker)) break
    pos += data.readUInt16BE(pos)
  }
  if (!includes(MARKERS, marker)) throw (new Error('Invalid JPEG.'))

  return {
    depth: data[pos + 2],
    width: data.readUInt16BE(pos + 5),
    height: data.readUInt16BE(pos + 3),
    color: data[pos + 7]
  }
}

export { readMeta }
