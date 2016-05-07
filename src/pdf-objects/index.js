/* eslint no-use-before-define: [2, "nofunc"] */

import _forEach from 'lodash/forEach';
import _isEmpty from 'lodash/isEmpty';
import _isObject from 'lodash/isObject';
import _isUndefined from 'lodash/isUndefined';
import _isArray from 'lodash/isArray';
import _keys from 'lodash/keys';
import _map from 'lodash/map';
import _mapKeys from 'lodash/mapKeys';
import _mapValues from 'lodash/mapValues';
import _omitBy from 'lodash/omitBy';
import _pick from 'lodash/pick';

import * as Action from './action';
import * as Annot from './annotation';
import * as Catalog from './catalog';
import * as ColorProfile from './color-profile';
import * as FontDescriptor from './font-descriptor';
import * as FontFile from './font-file';
import * as Font from './font';
import * as Metadata from './metadata';
import * as OutputIntent from './output-intent';
import * as Page from './page';
import * as Pages from './pages';
import * as ProcSet from './proc-set';
import * as Resources from './resources';
import * as Stream from './stream';
import * as Trailer from './trailer';
import * as XObject from './x-object';

import * as Content from './content';

export {
  Action, Annot, Catalog, ColorProfile, FontDescriptor, FontFile, Font, Metadata,
  OutputIntent, Page, Pages, ProcSet, Resources, Stream, Trailer, XObject,
  Content,
};

export function getPdfKeyMap(keys) {
  const keyMap = {};
  _forEach(keys, key => {
    keyMap[key.toLowerCase()] = key;
  });
  return keyMap;
}

export function init({ type, pdfKeys, props = {}, defaults = {} }) {
  const keys = _map(pdfKeys, key => key.toLowerCase());
  keys.push('_id');
  keys.push('data'); // only for streams? do this differently?
  const object = {
    ...defaults,
    ..._pick(props, keys),
  };
  if (type) object.type = type;
  if (pdfKeys) object.pdfKeys = pdfKeys;
  return object;
}

export function keyedObject(object) {
  const keyMap = getPdfKeyMap(object.pdfKeys);
  const pdfProps = _pick(object, _keys(keyMap));
  const inflated = _mapValues(pdfProps, toPdf);
  return _mapKeys(inflated, (value, key) => keyMap[key]);
}

export function objectToPdf(object) {
  const pdfObject = object.pdfKeys ? keyedObject(object) : object;
  const notOk = value => _isUndefined(value) || (_isObject(value) && _isEmpty(value));
  const defined = _omitBy(pdfObject, notOk);
  const formatted = _mapValues(defined, value => /^[A-Z]/.test(value) ? `/${value}` : value);
  return `<< ${_map(_keys(formatted), key => `/${key} ${formatted[key]}`).join('')} >>`;
}

export function objectToPdfStream(object) {
  const length = object.data.length + 1;
  const pdfObj = toPdf({ ...object, length });
  const head = `${getPdfHeadReference(object)}\n${pdfObj}\nstream\n`;
  const foot = '\n\nendstream\nendobj\n';
  return Buffer.isBuffer(object.data)
    ? Buffer.concat([new Buffer(head), object.data, new Buffer(foot) ])
    : [head, object.data, foot].join('');
}

export function arrayToPdf(array) {
  if (!(array && array.length)) return undefined;
  const arr = _map(array, value => {
    if (_isArray(value)) return arrayToPdf(value);
    if (_isObject(value)) return pdfReference(value);
    return value;
  });
  return `[${arr.join(' ')}]`;
}

export function toPdf(value) {
  if (_isArray(value)) return arrayToPdf(value);
  if (_isObject(value)) return objectToPdf(value);
  return value;
}

export function getPdfHeadReference(object) {
  return `${object._id} 0 obj`;
}

export function pdfReference(object) {
  if (!object) return undefined;
  return `${object._id} 0 R`;
}

export function xref(offsets, trailerStr) {
  const lines = [
    'xref',
    `0 ${offsets.length + 1}`,
    '0000000000 65535 f ',
  ];
  offsets.forEach(offset => {
    const formatted = `0000000000${offset}`.slice(-10);
    lines.push(`${formatted} 00000 n `);
  });
  lines.push(`trailer\n${trailerStr}`);
  return lines.join('\n');
}
