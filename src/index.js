import merge from 'lodash/merge';
import forEach from 'lodash/forEach';
import isArray from 'lodash/isArray';
import get from 'lodash/get';
import find from 'lodash/find';
import values from 'lodash/values';

import TTFFont from 'ttfjs';

import Promise from 'bluebird';

import {
  pdfDict, xref,
  Catalog, Pages, Page, Stream, Resources, ProcSet, Trailer,
  Font, FontFile, FontDescriptor, TextContent, ImageContent,
} from 'pdf-serializer';

import Image from './image';


const pdfDocument = {
  objectIdCounter: 0,
  fontObjectNameCounter: 0,
  fontId: 200,

  nextObjectId() {
    return ++this.objectIdCounter;
  },

  nextFontObjectName() {
    return `/F${++this.fontObjectNameCounter}`;
  },

  nextFontId() {
    return `/DOC${this.fontId++}`.replace(/(\d)/g, num => String.fromCharCode(+num + 65));
  },

  props: {
    catalog: 'catalog',
    pages: 'pages',
    procSet: 'procSet',
    // page: 'pages',
  },

  addObjects(objects) {
    // console.log(objects);
    const props = this.props;
    if (isArray(objects)) {
      forEach(objects, object => {
        object.id = object.id || this.nextObjectId();
        this.objects.push(object);
      });
      return;
    }
    forEach(objects, (object, key) => {
      object.id = this.nextObjectId();
      this.objects.push(object);
      if (props[key]) {
        if (props[key] === key) {
          this[key] = object;
        } else {
          if (!this[props[key]]) this[props[key]] = [];
          this[props[key]].push(object);
        }
      }
    });
  },

  addPage({ mediaBox } = {}) {
    const page = Page({
      Parent: this.pages,
      MediaBox: mediaBox || this.mediaBox,
      Resources: Resources({ ProcSet: this.procSet }),
    });
    this.addObjects({ page });
    this.pages.addPage(page);
    this.currentPage = page;
    return page;
  },

  addStream({ stream = Stream() } = {}) {
    const page = this.currentPage || this.addPage();
    this.addObjects({ stream });
    this.currentStream = stream;
    page.addContent(stream);
    return stream;
  },

  addContent(content) {
    const stream = this.currentStream || this.addStream();
    // const stream = this.addStream();
    stream.addContent(content);
  },

  addImages(images) {
    forEach(images, (file, name) => {
      const objects = Image({ file });
      this.addObjects(objects);
      this.images[name] = objects.shift();
    });
  },

  placeImage({ name, width, height, x, y }) {
    this.addContent(ImageContent({ name: `/${name}`, width, height, x, y }));
    if (!this.currentPage.Resources.XObject) {
      this.currentPage.Resources.XObject = {};
    }
    this.currentPage.Resources.XObject[name] = this.images[name];
  },

  addTTFFont({ name, file }) {
    const ttfFont = new TTFFont(file);
    const fontId = this.nextFontId();
    const fontObjectName = this.nextFontObjectName();
    const embeddedFontFile = FontFile();

    const fontDesc = FontDescriptor({
      FontName: fontId,
      FontFile2: embeddedFontFile,
      FontBBox: `[${ttfFont.bbox.join(' ')}]`,
      Flags: ttfFont.flags,
      StemV: ttfFont.stemV,
      ItalicAngle: ttfFont.italicAngle,
      Ascent: ttfFont.ascent,
      Descent: ttfFont.descent,
      CapHeight: ttfFont.capHeight,
      XHeight: get(ttfFont, 'tables.os2.xHeight') || 0,
    });

    const fontObj = Font({
      BaseFont: fontId,
      FontDescriptor: fontDesc,
      Subtype: '/TrueType',
      Name: fontObjectName,
      Encoding: '/MacRomanEncoding',
    });

    this.addObjects([embeddedFontFile, fontDesc, fontObj]);
    this.fonts.push({
      name,
      font: ttfFont,
      subset: ttfFont.subset(),
      descriptor: fontDesc,
      fontObject: fontObj,
      embedded: embeddedFontFile,
    });
  },

  fontSubsetToBuffer(ab) {
    const buffer = new Buffer(ab.byteLength);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
    }
    return buffer;
  },

  addText({ font, x, y, size, text }) {
    const docFont = find(this.fonts, { name: font });
    docFont.subset.use(text);

    // deflate
    // const textObjString = Text({
    //   text: docFont.subset.encode(text).replace(/([\\()])/g, '\\$1'),
    //   font: docFont.fontObject.Name,
    //   x, y, size,
    // }).toString();
    // const stream = Stream({ Filter: '/FlateDecode', data: new Buffer(zlib.deflateSync(textObjString), 'binary') });

    // no deflate
    const stream = Stream();
    stream.addContent(
      TextContent({
        text: docFont.subset.encode(text).replace(/([\\()])/g, '\\$1'),
        font: docFont.fontObject.Name,
        x, y, size,
      })
    );

    this.addStream({ stream });
    this.currentPage.addFont(docFont.fontObject);
  },

  embedTTFFonts() {
    forEach(this.fonts, font => {
      font.subset.embed();
      font.embedded.data = this.fontSubsetToBuffer(font.subset.save());
      const subsetCodes = Object.keys(font.subset.subset);
      const metrics = font.subset.font.tables.hmtx.metrics;
      const codeMap = font.subset.font.codeMap;
      const unitsPerEm = font.font.tables.head.unitsPerEm;
      font.fontObject.FirstChar = +subsetCodes[0];
      font.fontObject.LastChar = +subsetCodes[subsetCodes.length - 1];
      const widths = values(font.subset.subset).map(code => {
        const mappedCode = codeMap[`${code}`];
        if (!(mappedCode && metrics[mappedCode])) return Math.round(1000 * 1000 / unitsPerEm);
        return Math.round(metrics[mappedCode] * 1000 / unitsPerEm); // 2048);
      });
      font.fontObject.Widths = `[${widths.join(' ')}]`;
    });
  },

  done() {
    this.embedTTFFonts();

    this.fileOffset = 0;
    this.fileBuffer = [];
    const offsets = [];
    this.addToFileBuffer(`%PDF-1.4\n%\xFF\xFF\xFF\xFF`);

    forEach(this.objects, (obj, idx) => {
      const content = obj.toObject();
      offsets[this.objects[idx].id] = this.addToFileBuffer(content);
    });
    const trailer = Trailer({Size: offsets.length + 1, Root: this.catalog });
    const startx = this.addToFileBuffer(xref({ offsets, trailer }));
    this.addToFileBuffer(`startxref\n${startx}\n%%EOF`);

    return new Promise((resolve, reject) => {
      // https://nodejs.org/dist/latest-v4.x/docs/api/stream.html#stream_class_stream_writable
      this.file.end(Buffer.concat(this.fileBuffer), () => resolve());
      // this.file.write(Buffer.concat(this.fileBuffer), () => {
      //   this.file.on('finish', () => resolve());
      //   this.file.end();
      // });
    });
  },

  addToFileBuffer(data) {
    let buffer = data;
    if (!Buffer.isBuffer(data)) buffer = new Buffer(data + '\n', 'binary');
    const startedAt = this.fileOffset;
    this.fileOffset += buffer.length;
    this.fileBuffer.push(buffer);
    return startedAt;
  },
};

const Document = (props) => {
  merge(props, {
    size: [595.28, 841.89],
    mediaBox: [0, 0, 595.28, 841.89],
  });
  const doc = Object.assign(Object.create(pdfDocument), props);
  doc.objects = [];
  doc.fonts = [];
  doc.images = {};
  const pages = Pages();
  const catalog = Catalog({
    Pages: pages,
  });
  const procSet = ProcSet({ data: ['/PDF', '/Text', '/ImageB', '/ImageC', '/ImageI'] });
  doc.addObjects({ catalog, pages, procSet });
  return doc;
};

export default Document;
