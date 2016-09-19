
import * as objects from './';

const pdfKeys = [
  'FunctionType', // integer
    // 0 Sampled function
    // 2 Exponential interpolation function  * implemented
    // 3 Stitching function
    // 4 PostScript calculator function

  'Domain', // array
  'C0', // array
  'C1', // array
  'N', // number
];

export function create(props) {
  return objects.init({ type: 'Function', functiontype: 2, pdfKeys, props });
}

export function getPdfObject(object) {
  const pdf = objects.toPdf(object);
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`;
}
