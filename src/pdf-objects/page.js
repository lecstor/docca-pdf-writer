
import {
  init, pdfReference, toPdf, getPdfHeadReference,
  Resources,
} from './';

const pdfKeys = [
  'Type', 'Parent', 'Contents', 'Resources', 'MetaData',
  'MediaBox', 'CropBox', 'BleedBox', 'TrimBox', 'ArtBox', 'BoxColorInfo',
  'PieceInfo', 'LastModified',
  'StructParents', 'Rotate', 'Group', 'Thumb', 'B', 'Dur', 'Trans',
  'AA', 'ID', 'PZ', 'SeparationInfo',
  'Annots',
];

export function create(props) {
  const defaults = { contents: [], mediabox: [], annots: [], resources: {} };
  return init({ type: 'Page', pdfKeys, props, defaults });
}

export function addContent(object, stream) {
  return { ...object, contents: [...object.contents, stream] };
}

export function replaceLastContent(object, stream) {
  return { ...object, contents: [...object.contents.slice(0, -1), stream] };
}

export function addAnnotation(object, annot) {
  return { ...object, annots: [...object.annots, annot] };
}

export function addUriLink(object, { uri, x, y, x2, y2, color = [0, 0, 1] }) {
  const decColor = color.join(' ');
  const rect = ['[', x, y, x2, y2, ']'].join(' ');
  const annot = `<<
/Type /Annot /Subtype /Link /Rect ${rect} /H /P /C [${decColor}]
/A << /Type /Action /S /URI /URI (${uri}) >>
/BS << /Type /Border/W 1/S /U >>
>>`;
  return addAnnotation(object, annot);
}

export function setResources(object, resources) {
  return { ...object, resources };
}

export function addFont(object, font) {
  const resources = Resources.addFont(object.resources, font);
  return { ...object, resources };
}

export function addImage(object, handle, image) {
  const resources = Resources.addImage(object.resources, handle, image);
  return { ...object, resources };
}

export function getPdfObject(object) {
  const inflated = {
    ...object,
    resources: Resources.getPdfObject(object.resources),
    parent: pdfReference(object.parent),
  };
  const pdfString = toPdf(inflated);
  return `${getPdfHeadReference(object)}\n${pdfString}\nendobj\n`;
}

