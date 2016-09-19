
import * as objects from './';

const pdfKeys = [
  'Type',
  'PatternType', // 2 for Shading Pattern
  'Shading', // dictionary or stream
  'Matrix', 'ExtGState',
];

export function create(props) {
  return objects.init({ type: 'Pattern', patterntype: 2, pdfKeys, props });
}

export function getPdfObject(object) {
  const pdf = objects.toPdf(object);
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`;
}
