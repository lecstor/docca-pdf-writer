import merge from 'lodash/merge';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import values from 'lodash/values';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import find from 'lodash/find';
import Color from 'onecolor';

import Promise from 'bluebird';

import { ttf } from './text';
import Image from './image';
import delineateText from './text/util/delineate-text';

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

  /**
   * add objects to the document
   * @param {Array|Object} objects
   */
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

  /**
   * add a page to the document
   * @param {Array} options.mediaBox  array of 4 elements describing the size of the document ([0, 0, 595.28, 841.89])
   */
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

  /**
   * add a stream to the current page
   * @param {Object} options.stream  a Stream object
   */
  addStream({ stream = Stream() } = {}) {
    const page = this.currentPage || this.addPage();
    this.addObjects({ stream });
    this.currentStream = stream;
    page.addContent(stream);
    return stream;
  },

  /**
   * add content to the current stream
   * @param {Object} content  image, text, or graphics content
   */
  addContent(content) {
    const stream = this.currentStream || this.addStream();
    stream.addContent(content);
  },

  /**
   * add images to the document
   * @param {Object} images  images to add to the document
   * Keys of the object are handles used in calls to setImage
   * Values of the object are either Buffers or file paths.
   */
  addImages(images) {
    forEach(images, (file, handle) => {
      const objects = Image({ file });
      this.addObjects(objects);
      this.images[handle] = objects.shift();
    });
  },

  /**
   * set an image on the current page
   * @param {String} handle          the name of an image previously added to the document
   * @param {Number} options.width   the width to display the image at
   * @param {Number} options.height  the height to display the image at
   * @param {Number} options.x       the horizontal position of the bottom left corner of the image
   * @param {Number} options.y       the vertical position of the bottom left corner of the image
   */
  setImage(handle, { width, height, x, y }) {
    this.addContent(ImageContent({ name: `/${handle}`, width, height, x, y }));
    if (!this.currentPage.Resources.XObject) {
      this.currentPage.Resources.XObject = {};
    }
    this.currentPage.Resources.XObject[handle] = this.images[handle];
  },

  /**
   * add a font file to the document
   * @param {String} handle  a name to refer to the font by in calls to setText
   * @param {Buffer} file    a font file
   */
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
      font,
      subset: font.subset(),
      pdfFont: fontObj,
    });
  },

  /**
   * get the width and height of a single line of text
   * @param   {Array} line                 text content, font, and size
   * @param   {Number} options.lineHeight  minimum line height for lines of text
   * @returns {Object} meta                width and height of the text line
   * @returns {Number} meta.width
   * @returns {Number} meta.height
   *
   * getTextLineMeta(
   *   [
   *     { font: 'noto', size: 12, text: 'or ' },
   *     { font: 'noto-bold', size: 15, text: 'Καλημέρα κόσμε' }
   *   ],
   *   { lineHeight: 18 }
   * );
   *
   * returns: { width: 141.80126953125, height: 20.43 }
   */
  getTextLineMeta(line, { leading = 0 } = {}) {
    return line.reduce((meta, part) => {
      const docFont = find(this.fonts, { handle: part.font });
      const partLeading = docFont.font.lineHeight(part.size);
      const partWidth = docFont.font.stringWidth(part.text, part.size);
      return {
        width: meta.width + partWidth,
        height: partLeading > meta.height ? partLeading : meta.height,
      };
    }, { width: 0, height: leading });
  },

  /**
   * get the width and height of a block of text
   * @param   {Array}  options.lines       text content, font, and size grouped by line
   * @param   {Number} options.leading     minimum leading for lines of text
   * @returns {Object} meta                width and height of the text block
   * @returns {Number} meta.width
   * @returns {Number} meta.height
   *
   * getTextMeta({
   *   leading: 18,
   *   lines: [
   *     [ { "font": "noto", "size": 12, "text": "Hello World" } ],
   *     [ { "font": "noto", "size": 12, "text": "" } ],
   *     [
   *       { "font": "noto", "size": 12, "text": "or " },
   *       { "font": "noto-bold", "size": 15, "text": "Καλημέρα κόσμε" }
   *     ],
   *     [
   *       { "font": "noto-bold", "size": 15, "text": "" },
   *       { "font": "noto", "size": 12, "text": "or こんにちは 世界" }
   *     ]
   *   ],
   * });
   *
   * returns: {
   *   width: 141.80126953125,
   *   height: 74.43,
   *   lines: [
   *     { width: 66.08203125, height: 16.344 },
   *     { width: 0, height: 16.344 },
   *     { width: 141.80126953125, height: 20.43 },
   *     { width: 67.998046875, height: 16.344 }
   *   ]
   * }
   */
  getTextMeta(lines, { leading } = {}) {
    return lines.reduce((meta, line) => {
      const lineMeta = this.getTextLineMeta(line.parts, { leading });
      return {
        width: lineMeta.width > meta.width ? lineMeta.width : meta.width,
        height: lineMeta.height + meta.height,
        lines: [...meta.lines, { width: lineMeta.width, height: lineMeta.height }],
      };
    }, { width: 0, height: 0, lines: [] });
  },

  /**
   * convert a color string to a color array
   * @param   {String} color  a hex or css color value
   * @returns {Array}         red, green, blue decimal color values (0 - 1)
   *
   * if the specified color is an array it is returned as-is
   */
  getColor(color) {
    if (!color) return null;
    if (!isString(color)) return color;
    const col = Color(color);
    return [col.red(), col.green(), col.blue()];
  },

  /**
   * set text on the current page
   * @param {Array}  options.lines  objects describing a line of text
   * @param {Number} options.x      horizontal position of the left side of the text
   * @param {Number} options.y      the vertical position of the baseline of the first line of text
   * @param {Array}  options.color  red, green, blue decimal color values (0 - 1)
   *
   * setText({
   *   x: 20, y: 800,
   *   lines: [
   *     { leading: 20, parts: [{ "font": "noto", "size": 12, "text": "Hello World" }] },
   *     {
   *       leading: 20, parts: [
   *         { "font": "noto", "size": 12, "text": "or " },
   *         { "font": "noto-bold", "size": 15, "text": "Καλημέρα κόσμε" },
   *       ],
   *     },
   *   ],
   * });
   */
  setText({ lines, x, y, color = [0, 0, 0] }) {
    const fonts = {};
    const text = map(lines, line => {
      const encoded = {
        leading: line.leading,
        parts: map(line.parts, part => {
          const docFont = fonts[part.font] || find(this.fonts, { handle: part.font });
          docFont.subset.use(part.text);
          fonts[part.font] = docFont;
          return {
            ...part,
            color: this.getColor(part.color),
            leading: docFont.font.lineHeight(part.size),
            font: docFont.pdfFont.Name,
            text: docFont.subset.encode(part.text),
          };
        }),
      };
      encoded.color = this.getColor(encoded.color);
      encoded.leading = encoded.parts.reduce(
        (leading, part) => {return part.leading > leading ? part.leading : leading; }, 0
      );
      return encoded;
    });
    this.addContent(TextContent({ x, y, color: this.getColor(color), lines: text }));
    values(fonts, font => this.currentPage.addFont(font));
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

export { delineateText };
