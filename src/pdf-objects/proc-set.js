
import * as objects from './'

export function create (props) {
  return objects.init({ type: 'ProcSet', props })
}

export function getPdfObject (object) {
  const pdf = objects.arrayToPdf(object.data)
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`
}

