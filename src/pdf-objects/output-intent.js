
import * as objects from './'

const pdfKeys = [
  'Type', 'S', 'OutputCondition', 'OutputConditionIdentifier', 'Info', 'DestOutputProfile'
]

export function create (props) {
  const defaults = {
    s: '/GTS_PDFA1',
    outputcondition: '(sRGB_IEC61966-2.1)',
    outputconditionidentifier: '(Custom)',
    info: '(sRGB IEC61966 v2.1)'
  }
  return objects.init({ type: 'OutputIntent', pdfKeys, props, defaults })
}

export function getPdfObject (object) {
  const pdf = objects.toPdf(object)
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`
}

