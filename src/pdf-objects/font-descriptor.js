
import * as objects from './';

const pdfKeys = [
  'Type', 'FontName', 'FontFile2', 'FontBBox', 'Flags', 'StemV', 'ItalicAngle',
  'Ascent', 'Descent', 'CapHeight', 'XHeight',
];

export function create(props) {
  return objects.init({ type: 'FontDescriptor', pdfKeys, props });
}

export function getPdfObject(object) {
  const pdf = objects.toPdf({
    ...object,
    fontfile2: object.fontfile2 && objects.pdfReference(object.fontfile2),
  });
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`;
}

