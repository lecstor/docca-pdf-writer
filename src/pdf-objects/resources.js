import _isEmpty from 'lodash/isEmpty';

import { init, pdfReference, toPdf } from './';

const pdfKeys = [
  'ProcSet', 'Font', 'XObject',
  'ExtGState', 'ColorSpace', 'Pattern', 'Shading', 'Properties',
];

export function create(props) {
  return init({ pdfKeys, props });
}

export function addFont(object, font) {
  const fontRef = pdfReference(font);
  return { ...object, font: { ...object.font, [font.name]: fontRef } };
}

export function getPdfObject(object) {
  if (!object || _isEmpty(object)) return undefined;
  const pdf = toPdf({
    ...object,
    // procset: object.procset && toPdf(object.procset.data),
    procset: object.procset && pdfReference(object.procset),
  });
  return `${pdf}`;
}

