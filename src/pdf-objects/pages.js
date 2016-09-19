
import * as objects from './'

const pdfKeys = ['Type', 'Kids', 'Count']

export function create (props = {}) {
  const defaults = { kids: [], count: props.kids ? props.kids.length : 0 }
  return objects.init({ type: 'Pages', pdfKeys, props, defaults })
}

export function addPage (object, page) {
  return { ...object, kids: [...object.kids, page], count: object.count + 1 }
}

export function getPdfObject (object) {
  const pdf = objects.toPdf(object)
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`
}

