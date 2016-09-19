
export function toString (object) {
  return `q
${object.width} 0 0 ${object.height} ${object.x} ${object.y - object.height} cm
/${object.name} Do
Q\n`
}

