
import * as objects from './'

const pdfKeys = ['Size', 'Root', 'Info', 'ID']

export function create (props) {
  return objects.init({ pdfKeys, props })
}

export function getPdfObject (object) {
  return `${objects.toPdf(object)}`
}

