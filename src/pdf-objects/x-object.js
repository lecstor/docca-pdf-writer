import zlib from 'zlib';

import * as objects from './';

const pdfKeys = [
  'Type', 'Subtype', 'Length', 'BitsPerComponent', 'ColorSpace',
  'Width', 'Height', 'Filter', 'DecodeParms', 'Mask', 'SMask',
];

export function create(props) {
  return objects.init({ type: 'XObject', pdfKeys, props });
}

export function getPdfObject(object, { noDeflate = false } = {}) {
  console.log(object);
  const data = new Buffer(noDeflate ? object.data : zlib.deflateSync(object.data), 'binary');
  return objects.objectToPdfStream({ ...object, data });
}

