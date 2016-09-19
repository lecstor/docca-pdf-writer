
export default function ({ x, y = 0, x2 = 0, y2 = 0, width = 0 }) {
  const markup = []
  markup.push(`${width} w`)
  if (x || x === 0) markup.push(`${x} ${y} m`)
  markup.push(`${x2} ${y2} l`)
  return markup.join('\n')
}
