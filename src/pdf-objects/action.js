
import * as objects from './'

const pdfKeys = [
  'Type', 'S', 'Next',
  'URI', 'IsMap' // URI Action
]

export function create (props) {
  return objects.init({ type: 'Action', pdfKeys, props })
}

export function getPdfObject (object) {
  const pdf = objects.toPdf(object)
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`
}

