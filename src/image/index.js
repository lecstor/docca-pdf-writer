import fs from 'fs';

import readChunk from 'read-chunk';
import fileType from 'file-type';
import { PNG as PNGjs } from 'pngjs';
import zlib from 'zlib';

// import { xobject } from './pdf-objects';
// import { XObject } from 'pdf-serializer';

import { splitAlpha as pngSplitAlpha } from './png';
import { readMeta as jpgGetMeta } from './jpeg';

function readFile(file) {
  if (Buffer.isBuffer(file)) return file;
  return fs.readFileSync(file);
}

function getPNG(file) {
  const png = PNGjs.sync.read(readFile(file));
  const channels = pngSplitAlpha(png);
  const image = {
    subtype: 'Image',
    filter: 'FlateDecode',
    bitspercomponent: png.depth,
    width: png.width, height: png.height,
    colorspace: png.color ? 'DeviceRGB' : 'DeviceGray',
    data: zlib.deflateSync(channels.image),
  };
  const objects = [image];
  if (channels.alpha) {
    const smask = {
      subtype: 'Image',
      filter: 'FlateDecode',
      data: zlib.deflateSync(channels.alpha),
      bitspercomponent: 8,
      width: png.width, height: png.height,
      colorspace: 'DeviceGray',
    };
    image.smask = smask;
    objects.push(smask);
  }
  return objects;
}

function getJPEG(file) {
  const jpeg = readFile(file);
  const meta = jpgGetMeta(jpeg);
  const image = {
    subtype: 'Image',
    filter: 'DCTDecode',
    bitspercomponent: meta.depth,
    width: meta.width, height: meta.height,
    colorspace: `Device${{ 1: 'Gray', 3: 'RGB', 4: 'CMYK' }[meta.color]}`,
    data: jpeg,
  };
  return [image];
}

const Image = ({ file }) => {
  let buffer = file;
  if (!Buffer.isBuffer(file)) {
    buffer = readChunk.sync(file, 0, 262);
  }
  let type = fileType(buffer);
  if (type) type = type.ext;

  if (type === 'jpg') {
    return getJPEG(file);
  } else if (type === 'png') {
    return getPNG(file);
  }

  throw (new Error(`Not a compatible file type: ${type || 'unknown'}`));
};

export default Image;
