import _map from 'lodash/map'
import _mapValues from 'lodash/mapValues'
import _includes from 'lodash/includes'

import * as objects from './'

const pdfKeys = [
  'Title', 'Author', 'Subject', 'Keywords', 'Creator', 'Producer',
  'CreationDate', 'ModDate', 'Trapped'
]

const pdfKeysLc = _map(pdfKeys, key => key.toLowerCase())

export function create (props) {
  return objects.init({ type: 'Info', pdfKeys, props })
}

export function getPdfObject (object) {
  const pdf = objects.toPdf(_mapValues(object, (value, key) => {
    if (!value) return undefined
    if (_includes(['creationdate', 'moddate'], key)) return `(D:${value})`
    if (_includes(pdfKeysLc, key)) return `(${value})`
    return value
  }))
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`
}

