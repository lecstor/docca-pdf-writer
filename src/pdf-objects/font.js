
import * as objects from './';

const pdfKeys = [
  'Type', 'Subtype', 'Name', 'BaseFont', 'Encoding',
  'FontDescriptor', 'FirstChar', 'LastChar', 'Widths', 'ToUnicode',
];

export function create(props) {
  return objects.init({ type: 'Font', pdfKeys, props });
}

export function getPdfObject(object) {
  const pdf = objects.toPdf({
    ...object,
    fontdescriptor: objects.pdfReference(object.fontdescriptor),
    tounicode: objects.pdfReference(object.tounicode),
  });
  return `${objects.getPdfHeadReference(object)}\n${pdf}\nendobj`;
}

