import merge from 'lodash/merge';
import forEach from 'lodash/forEach';
import isArray from 'lodash/isArray';
import find from 'lodash/find';

import Promise from 'bluebird';

import { ttf } from './text';
import Image from './image';

import {
  xref,
  Catalog, Pages, Page, Stream, Resources, ProcSet, Trailer,
  TextContent, ImageContent,
} from 'pdf-serializer';


const pdfDocument = {
  objectIdCounter: 0,
  fontNameCounter: 0,
  fontSubsetTagCounter: 199,

  nextObjectId() { return ++this.objectIdCounter; },
  nextFontName() { return ttf.getFontName(++this.fontNameCounter); },
  nextFontSubsetTag() { return ttf.getFontSubsetTag(++this.fontSubsetTagCounter); },

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
    stream.addContent(content);
  },

  addImages(images) {
    forEach(images, (file, handle) => {
      const objects = Image({ file });
      this.addObjects(objects);
      this.images[handle] = objects.shift();
    });
  },

  setImage(handle, { width, height, x, y }) {
    this.addContent(ImageContent({ name: `/${handle}`, width, height, x, y }));
    if (!this.currentPage.Resources.XObject) {
      this.currentPage.Resources.XObject = {};
    }
    this.currentPage.Resources.XObject[handle] = this.images[handle];
  },

  addTTFFont(handle, file) {
    const font = ttf.parseFont(file);
    const fontSubsetTag = this.nextFontSubsetTag();
    const fontName = this.nextFontName();

    const fontFile = ttf.getFontFile();
    const pdfFontDescriptor = ttf.getFontDescriptor({ font, fontSubsetTag, fontFile });
    const fontObj = ttf.getFont({ descriptor: pdfFontDescriptor, fontName });

    this.addObjects([fontFile, pdfFontDescriptor, fontObj]);

    this.fonts.push({
      handle,
      fontFile,
      subset: font.subset(),
      pdfFont: fontObj,
    });
  },

  setText(text, { font, x, y, size }) {
    const docFont = find(this.fonts, { handle: font });
    docFont.subset.use(text);

    const stream = Stream();
    stream.addContent(
      TextContent({
        text: docFont.subset.encode(text).replace(/([\\()])/g, '\\$1'),
        font: docFont.pdfFont.Name,
        x, y, size,
      })
    );

    this.addStream({ stream });
    this.currentPage.addFont(docFont.pdfFont);
  },

  embedTTFFont(font) {
    font.subset.embed();
    font.fontFile.data = ttf.subsetToBuffer(font.subset.save());
    const meta = ttf.getFontCharMeta(font.subset);
    font.pdfFont.FirstChar = meta.firstChar;
    font.pdfFont.LastChar = meta.lastChar;
    font.pdfFont.Widths = `[${meta.widths.join(' ')}]`;
  },

  done() {
    forEach(this.fonts, font => this.embedTTFFont(font));

    this.fileOffset = 0;
    this.fileBuffer = [];
    const offsets = [];
    this.addToFileBuffer(`%PDF-1.4\n%\xFF\xFF\xFF\xFF Docca.io`);

    forEach(this.objects, (obj, idx) => {
      const content = obj.toObject();
      offsets[this.objects[idx].id] = this.addToFileBuffer(content);
    });
    const trailer = Trailer({ Size: offsets.length + 1, Root: this.catalog });
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
  const catalog = Catalog({ Pages: pages });
  const procSet = ProcSet({ data: ['/PDF', '/Text', '/ImageB', '/ImageC', '/ImageI'] });
  doc.addObjects({ catalog, pages, procSet });
  return doc;
};

export default Document;
