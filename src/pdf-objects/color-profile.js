
import * as objects from './'

const pdfKeys = ['Filter', 'N', 'Length', 'Range']

export function create (props) {
  const defaults = { Filter: 'FlateDecode', N: 3, Range: [0, 1, 0, 1, 0, 1] }
  return objects.init({ pdfKeys, props, defaults })
}

export function getPdfObject (object) {
  const pdf = objects.toPdf(object)
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`
}
