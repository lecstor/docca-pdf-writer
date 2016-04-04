import fs from 'fs';

import readChunk from 'read-chunk';
import fileType from 'file-type';
import { PNG as PNGjs } from 'pngjs';
import zlib from 'zlib';

import { XObject } from 'pdf-serializer';

import { splitAlpha as pngSplitAlpha } from './png';
import { readMeta as jpgGetMeta } from './jpeg';

function readFile(file) {
  if (Buffer.isBuffer(file)) return file;
  return fs.readFileSync(file);
}

function getPNG(file) {
  const png = PNGjs.sync.read(readFile(file));
  const channels = pngSplitAlpha(png);
  const image = XObject({
    Subtype: '/Image',
    Filter: '/FlateDecode',
    BitsPerComponent: png.depth,
    Width: png.width, Height: png.height,
    ColorSpace: png.color ? '/DeviceRGB' : '/DeviceGray',
    data: zlib.deflateSync(channels.image),
  });
  const objects = [image];
  if (channels.alpha) {
    const smask = XObject({
      Subtype: '/Image',
      Filter: '/FlateDecode',
      data: zlib.deflateSync(channels.alpha),
      BitsPerComponent: 8,
      Width: png.width, Height: png.height,
      ColorSpace: '/DeviceGray',
    });
    image.SMask = smask;
    objects.push(smask);
  }
  return objects;
}

function getJPEG(file) {
  const jpeg = readFile(file);
  const meta = jpgGetMeta(jpeg);
  const image = XObject({
    Subtype: '/Image',
    Filter: '/DCTDecode',
    BitsPerComponent: meta.depth,
    Width: meta.width, Height: meta.height,
    ColorSpace: `/Device${{ 1: 'Gray', 3: 'RGB', 4: 'CMYK' }[meta.color]}`,
    data: jpeg,
  });
  return [image];
}

const Image = ({ file }) => {
  let buffer = file;
  if (!Buffer.isBuffer(file)) {
    buffer = readChunk.sync(file, 0, 262);
  }
  let type = fileType(buffer);
  if (type) type = type.ext;

  console.log({ file, type });

  if (type === 'jpg') {
    return getJPEG(file);
  } else if (type === 'png') {
    return getPNG(file);
  }

  throw (new Error(`Not a compatible file type: ${type || 'unknown'}`));
};

export default Image;
