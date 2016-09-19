import zlib from 'zlib'
import _isString from 'lodash/isString'

import * as objects from './'

const pdfKeys = ['Length', 'Filter', 'Length1']

export function create (props) {
  return objects.init({ type: 'Stream', pdfKeys, props })
}

export function addContent (object, content) {
  if (_isString(content) || Buffer.isBuffer(content)) {
    return { ...object, data: (object.data || '') + content }
  }
  return { ...object, data: (object.data || '') + content.toString() + '\n' }
}

export function getPdfObject (object, { noDeflate = true } = {}) {
  let data
  if (noDeflate) {
    data = data = new Buffer(object.data, 'binary')
  } else {
    data = new Buffer(zlib.deflateSync(object.data), 'binary')
    object.filter = 'FlateDecode'
  }
  return objects.objectToPdfStream({ ...object, data })
}

