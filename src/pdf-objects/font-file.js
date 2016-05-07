import zlib from 'zlib';

import * as objects from './';

const pdfKeys = ['Length', 'Filter', 'Length1'];

export function create(props) {
  const defaults = { filter: 'FlateDecode' };
  return objects.init({ type: 'FontFile', pdfKeys, props, defaults });
}

export function getPdfObject(object) {
  const length1 = object.data.length;
  const data = new Buffer(zlib.deflateSync(object.data), 'binary');
  const length = data.length + 1;
  return objects.objectToPdfStream({ ...object, length1, data, length });
}

