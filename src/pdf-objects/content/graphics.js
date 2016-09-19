import _forEach from 'lodash/forEach'

import * as objects from '../'
import * as content from './'
import * as shapes from './shapes'

export function create (props) {
  const defaults = { name: '', x: 0, y: 0, width: 100, height: 100 }
  return objects.init({ props, defaults })
}

export function toString (object) {
  let markup = ['q']
  let currentColor = [0, 0, 0]

  _forEach(object.paths, path => {
    ({ markup, currentColor } = content.setColor(markup, path.color, { currentColor, type: 'RG' }));
    ({ markup, currentColor } = content.setColor(markup, path.fillColor, { currentColor }))

    _forEach(path.parts, part => markup.push(shapes[part.op](part)))
    if (path.close) markup.push('h')
    if (path.color && path.fillColor) {
      markup.push('B')
    } else if (path.color) {
      markup.push('S')
    } else if (path.fillColor) {
      markup.push('f')
    } else {
      markup.push('S')
    }
  })
  markup.push('Q\n')
  return markup.join('\n')
}

