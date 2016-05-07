
import * as objects from './';

const pdfKeys = [
  'Type', 'Pages', 'Marked', 'Metadata',
  // optional
  'Version', 'MarkInfo', 'PageLabels', 'Names', 'Dests', 'PageLayout', 'PageMode',
  'Outlines', 'Threads', 'OpenAction', 'AA', 'URI', 'AcroForm', 'StructTreeRoot',
  'Lang', 'SpiderInfo', 'OutputIntents',
];

export function create(props) {
  const defaults = {
    marked: false,
    markinfo: false,
  };
  return objects.init({ type: 'Catalog', pdfKeys, props, defaults });
}

export function getPdfObject(object) {
  const inflated = {
    ...object,
    pages: objects.pdfReference(object.pages),
  };
  const pdf = objects.toPdf(inflated);
  return `${objects.getPdfHeadReference(object)}\n${pdf}\nendobj\n`;
}
