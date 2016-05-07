
import * as objects from './';

const pdfKeys = [
  'Type', 'Subtype', 'Contents', 'Rect', 'Border', 'BS',
  'Dest', 'H', 'PA', // Link
];

export function create(props) {
  return objects.init({ type: 'Annot', pdfKeys, props });
}

export function getPdfObject(object) {
  const pdf = objects.toPdf(object);
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`;
}

// link = {
//   Subtype: '/Link',
//   H: '/P',
//   PA: { Type: '/Action', S: 'URI', URI: 'htt://7-bit-ascii/' }
// }
//
// To support URI actions, a PDF document’s catalog (see Section 3.6.1, “Document
// Catalog”) may include a URI entry whose value is a URI dictionary. At the
// time of publication, only one entry is defined for such a dictionary (see Table
// 8.41).
