import _forEach from 'lodash/forEach';

// import * as objects from '../';
import * as content from './';

// export function create(props) {
//   return props;
//   // const defaults = { x: 0, y: 0, lines: [] };
//   // return objects.init({ props, defaults });
// }

export function toString(object) {
  let markup = [
    'q\nBT',
    `${object.x} ${object.y} Td`,
  ];
  console.log(JSON.stringify({textObject: object}, null, 2));
  let currentColor = [0, 0, 0];
  if (!object.lines[0].color) {
    console.log('setColor object');
    ({ markup, currentColor } = content.setColor(markup, object.color, { currentColor }));
  }
  _forEach(object.lines, line => {
  // _forEach(object.lines, (line, idx) => {
    // if (idx) markup.push(`${line.leading} TL\nT*`); // set leading and move down by that amount
    if (!line.parts[0].color) {
      console.log('setColor line');
      ({ markup, currentColor } = content.setColor(markup, (line.color || object.color), { currentColor }));
    }
    _forEach(line.parts, part => {
      console.log('setColor part');
      ({ markup, currentColor } = content.setColor(markup, part.color || line.color || object.color, { currentColor }));
      markup.push(`/${part.font} ${part.size} Tf`);
      markup.push(`(${part.text}) Tj`);
    });
    markup.push(`${line.leading} TL\nT*`); // set leading and move down by that amount
  });
  markup.push('ET\nQ\n');
  return markup.join('\n');
}

