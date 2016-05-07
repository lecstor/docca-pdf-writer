
import * as objects from './';

export function create(props) {
  const defaults = { name: '', x: 0, y: 0, width: 100, height: 100 };
  return objects.init({ props, defaults });
}

export function toString(object) {
  return `q
${object.width} 0 0 ${object.height} ${object.x} ${object.y} cm
${object.name} Do
Q`;
}

