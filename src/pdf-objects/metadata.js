import zlib from 'zlib'

import * as objects from './'

const pdfKeys = ['Type', 'Subtype', 'Length']

export function create (props) {
  const defaults = { subtype: 'XML' }
  return objects.init({ type: 'Metadata', pdfKeys, props, defaults })
}

export function getPdfObject (object, { noDeflate = false } = {}) {
  const data = new Buffer(noDeflate ? object.data : zlib.deflateSync(object.data), 'binary')
  return objects.objectToPdfStream({ ...object, data })
}

