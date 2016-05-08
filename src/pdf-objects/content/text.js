import _forEach from 'lodash/forEach';

// import * as objects from '../';
import * as content from './';

export function toString(object) {
  let markup = [
    'q\nBT',
    `${object.x} ${object.y} Td`,
  ];
  let currentColor = [0, 0, 0];
  if (!object.lines[0].color) {
    ({ markup, currentColor } = content.setColor(markup, object.color, { currentColor }));
  }
  _forEach(object.lines, line => {
    const lineColor = line.color || object.color;
    if (!line.parts[0].color) {
      ({ markup, currentColor } = content.setColor(markup, lineColor, { currentColor }));
    }
    _forEach(line.parts, part => {
      const partColor = part.color || lineColor;
      ({ markup, currentColor } = content.setColor(markup, partColor, { currentColor }));
      markup.push(`/${part.font} ${part.size} Tf`);
      markup.push(`(${part.text}) Tj`);
    });
    markup.push(`${line.leading} TL\nT*`); // set leading and move down by that amount
  });
  markup.push('ET\nQ\n');
  return markup.join('\n');
}

