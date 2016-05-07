
import * as graphics from './graphics';
import * as image from './image';
import * as text from './text';
import * as shapes from './shapes';

function setColor(markup, color, { currentColor = '0 0 0', type = 'rg' }) {
  if (!color) return { markup };
  const colStr = color.join(' ');
  if (colStr !== currentColor) {
    const newCurrentColor = colStr;
    return { markup: [...markup, `${colStr} ${type}`], currentColor: newCurrentColor };
  }
  return { markup, currentColor };
}

export {
  setColor,
  graphics, image, text,
  shapes,
};
