import _mapValues from 'lodash/mapValues';
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
    dests: {},
  };
  return objects.init({ type: 'Catalog', pdfKeys, props, defaults });
}

export function getPdfObject(object) {
  const inflated = {
    ...object,
    pages: objects.pdfReference(object.pages),
    dests: _mapValues(object.dests, dest => `[${dest.join(' ')}]\n`),
  };
  const pdf = objects.toPdf(inflated);
  return `${objects.getPdfHeadReference(object)}\n${pdf}\nendobj\n`;
}

const destinationMap = {
  xyz: (catalog, page, { top, left, zoom }) => ([page, '/XYZ', left, top, zoom]),
  fit: (catalog, page) => ([page, '/Fit']),
  fith: (catalog, page, { top }) => ([page, '/FitH', top]),
  fitv: (catalog, page, { left }) => ([page, '/FitV', left]),
  fitr: (catalog, page, { top, right, bottom, left }) =>
    ([page, '/FitR', left, bottom, right, top]),
  fitb: (catalog, page) => ([page, '/FitB']),
  fitbh: (catalog, page, { top }) => ([page, '/FitBH', top]),
  fitbv: (catalog, page, { left }) => ([page, '/FitBV', left]),
};

export function addDestination(
  catalog, name, page, { type = 'XYZ', top, right, bottom, left, zoom }
) {
  return {
    ...catalog,
    dests: {
      ...catalog.dests,
      [name]: destinationMap[type](catalog, page, { top, right, bottom, left, zoom }),
    },
  };
}
