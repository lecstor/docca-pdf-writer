import _forEach from 'lodash/forEach';
import _has from 'lodash/has';
import _keys from 'lodash/keys';
import _map from 'lodash/map';
import _mapKeys from 'lodash/mapKeys';
import _merge from 'lodash/merge';
import _reduce from 'lodash/reduce';
import _values from 'lodash/values';

import Image from './image';

import ImageManager from './image-manager';

import { fontTools, TextBlock, getColor } from './text';

import * as pdfObjects from './pdf-objects';

const FontManager = fontTools.FontManager;

export { fontTools, FontManager, ImageManager, TextBlock, getColor };

const ttf = fontTools.truetype;

const {
  Action, Catalog, ColorProfile, FontDescriptor, FontFile, Font, Info,
  Metadata, OutputIntent, Page, Pages, ProcSet, Resources, Stream, ToUnicode, Trailer,
  XObject, Content, pdfReference, xref,
} = pdfObjects;

const pdfWriter = {
  objectIdCounter: 0,

  nextObjectId() { return ++this.objectIdCounter; },

  addOID(obj) {
    if (obj._id) return obj;
    const oid = this.nextObjectId();
    // console.log('addOID', oid, obj);
    return { ...obj, _id: oid };
  },

  /**
   * add a page to the document
   * @param {Array} options.mediaBox  array of 4 numbers describing the document mediabox
   */
  addPage({ mediaBox } = {}) {
    const page = this.addOID(Page.create({
      parent: this.pages,
      mediabox: mediaBox || this.mediaBox,
      resources: Resources.create({ procset: this.procSet }),
    }));
    this.pages = Pages.addPage(this.pages, page);
    if (this.page) this.writeObject(this.page);
    this.page = page;
    this.addStream();
    return this.page;
  },

  /**
   * add a stream to the current page
   * @param {Object} options.stream  a Stream object
   */
  addStream({ stream = this.addOID(Stream.create()) } = {}) {
    const page = this.page || this.addPage();
    if (this.stream && this.stream.data) this.writeObject(this.stream);
    this.stream = stream;
    this.page = Page.addContent(page, stream);
  },

  /**
   * add a font subset to the PDF
   * @param {Object} options.subsetData
   * @param {Object} options.characterData
   * @param {Object} options.font
   * @param {String} options.font.baseFont
   * @param {Array}  options.font.bbox
   * @param {Object} options.font.flags
   * @param {Object} options.font.stemV
   * @param {Object} options.font.italicAngle
   * @param {Number} options.font.ascent
   * @param {Number} options.font.descent
   * @param {Number} options.font.capHeight
   * @param {Object} options.font.tables
   * @param {Object} options.font.tables.os2
   * @param {Number} options.font.tables.os2.xHeight
   * @returns {Object}  the PDF font object
   */
  addFont({ font, subsetData, subsetTag, characterData, unicodeCmapData, fontId, fontName }) {
    const fontFile = this.addOID(FontFile.create(ttf.getFontFileProps(subsetData)));
    const fontDescriptorProps = ttf.getFontDescriptor({ font, subsetTag, fontFile });
    const pdfFontDescriptor = this.addOID(FontDescriptor.create(fontDescriptorProps));
    const tounicode = this.addOID(ToUnicode.create({ data: unicodeCmapData }));

    const fontData = ttf.getFont({
      _id: this.fonts[fontName],
      descriptor: pdfFontDescriptor,
      fontId,
      tounicode,
      firstChar: characterData.firstChar,
      lastChar: characterData.lastChar,
      widths: `[${characterData.widths.join(' ')}]`,
    });

    const fontObj = this.addOID(Font.create(fontData));
    this.writeObject(fontFile);
    this.writeObject(tounicode);
    this.writeObject(pdfFontDescriptor);
    this.writeObject(fontObj);
    return fontObj;
  },

  /**
   * add a font to the current page
   * @param {String} fontName  the name of the font, eg NotoSans-Regular
   * @param {String} id        the PDF font identifier used in text operations.
   */
  addFontToPage(fontName, id) {
    const page = this.page || this.addPage();
    this.page = Page.addFont(page, { _id: this.fonts[fontName], name: id });
  },

  /**
   * stores and returns an id for the PDF font object.
   * This id can be used in a page's resources object to include the font in the page.
   * @param   {String} fontName  the name of the font, eg NotoSans-Regular
   * @returns {Number}           the id of the font object in the document.
   */
  registerFont(fontName) {
    this.fonts[fontName] = this.nextObjectId();
    // console.log(fontName, 'oid', this.fonts[fontName]);
    return this.fonts[fontName];
  },

  /**
   * add an image to the PDF
   * @param {String} options.handle  identifier used in calls to setImage
   * @param {[type]} options.file    image file path or data
   */
  addImage({ handle, file }) {
    this.images[handle] = Image({ file })
      .then(res => {
        const image = res;
        if (image.smask) {
          const smaskObj = this.addOID(XObject.create(image.smask));
          this.writeObject(smaskObj);
          image.smask = smaskObj;
        }
        const imageObj = this.addOID(XObject.create(image));
        this.writeObject(imageObj);
        return imageObj;
      });
    return this.images[handle];
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
    const yFlip = (this.height - y);

    const ref = Content.image.toString({ name: handle, width, height, x, y: yFlip });
    this.addContent(ref);

    return this.images[handle]
      .then(img => { this.page = Page.addImage(this.page, handle, img); });
  },

  /**
   * add content to the current stream
   * @param {Object} content  image, text, or graphics content
   */
  addContent(content) {
    if (!this.stream) this.addStream();
    this.stream = Stream.addContent(this.stream, content);
    this.page = Page.replaceLastContent(this.page, this.stream);
  },

  adjustX(x) {
    return x;
  },

  adjustY(y) {
    return this.height - y;
  },

  setText({ x, y, lines, meta }) {
    const ascent = meta.lines[0].size + meta.lines[0].descent;
    const Y = this.adjustY(y + ascent + (ascent / 12));
    const X = this.adjustX(x);

    this.addContent(
      Content.text.toString({
        x: X, lines,
        y: Y,
        meta,
      })
    );

    _forEach(lines, (line, lineIdx) => {
      _forEach(line.parts, (part, partIdx) => {
        if (part.href) {
          this.setTextHref({
            textX: X, textY: Y,
            meta, lineIdx, partIdx,
            href: part.href, color: part.color, padding: part.padding,
          });
        }
      });
    });
  },

  setGraphics({ paths }) {
    const encodedPaths = _map(paths,
      path => ({
        ...path,
        color: getColor(path.color || [0, 0, 0]),
        fillColor: getColor(path.fillColor),
        parts: _map(path.parts, part => {
          const newY = {};
          const newX = {};
          if (_has(part, 'y')) newY.y = this.adjustY(part.y);
          if (_has(part, 'y2')) newY.y2 = this.adjustY(part.y2);
          if (_has(part, 'x')) newX.x = this.adjustX(part.x);
          if (_has(part, 'x2')) newX.x2 = this.adjustX(part.x2);
          return { ...part, ...newY, ...newX };
        }),
      })
    );
    this.addContent(Content.graphics.toString({ paths: encodedPaths }));
  },

  setTextHref({ textX, textY, meta, lineIdx, partIdx, href, color, padding }) {
    const [padTop, padRight, padBottom, padLeft] = padding;

    const y = textY + padTop + _reduce(meta.lines, (total, line, idx) => {
      if (!idx || idx > lineIdx) return total;
      return total - line.height;
    }, meta.lines[lineIdx].size + meta.lines[lineIdx].descent);

    let leadingSpaceWidth = 0;
    let trailingSpaceWidth = 0;
    // find x of the left of the link part
    const x = _reduce(meta.lines[lineIdx].parts, (total, part, idx) => {
      // ignore parts after the link part
      if (idx > partIdx) return total;

      // first entry in wordWidths is actually the spaceWidth
      const spaceWidth = part.wordWidths[0];

      // add widths of parts before the link part
      if (idx !== partIdx) return total + part.width;

      // adjust for spaces at start of part
      _forEach(part.wordWidths, (width, wIdx) => {
        if (!wIdx) return true; // skip first width as it's the spaceWidth
        if (width) return false;
        leadingSpaceWidth += spaceWidth;
        return true;
      });

      // adjust for spaces at end of part
      _forEach([...part.wordWidths].reverse(), width => {
        if (width) return false;
        trailingSpaceWidth += spaceWidth;
        return true;
      });

      return total + leadingSpaceWidth - padLeft;
    }, textX);

    const partWidth = meta.lines[lineIdx].parts[partIdx].width;
    const x2 = x + partWidth - leadingSpaceWidth - trailingSpaceWidth + padLeft + padRight;
    const y2 = y - meta.lines[lineIdx].size - meta.lines[lineIdx].descent - padTop - padBottom;
    this.page = Page.addUriLink(this.page, { uri: href, x, y, x2, y2, color });
  },

  writeToFile(data) {
    let buffer = data;
    if (!Buffer.isBuffer(data)) buffer = new Buffer(`${data}\n`, 'binary');
    this.fileOffset += buffer.length;
    this.file.write(buffer);
  },

  writeObject(obj) {
    this.offsets[obj._id] = this.fileOffset;
    this.writeToFile(pdfObjects[obj.type].getPdfObject(obj));
  },

  done() {
    return Promise.all(_values(this.images))
      .then(() => {
        _forEach(['pages', 'page', 'stream'], objName => {
          if (!this[objName]) throw new Error(`${objName} not set`);
          this.writeObject(this[objName]);
        });

        const trailer = Trailer.create({
          size: _values(this.offsets).length + 1,
          root: pdfReference(this.catalog),
          info: pdfReference(this.info),
        });
        const startx = this.fileOffset;

        // sort offsets by numberic object ids
        const offsetSortable = _mapKeys(this.offsets, (value, key) => key.split(' ', 1)[0]);
        const offsets = _map(
          _keys(offsetSortable).sort((a, b) => +a - +b), id => offsetSortable[id]
        );

        this.writeToFile(xref(offsets, Trailer.getPdfObject(trailer)));
        this.writeToFile(`startxref\n${startx}\n%%EOF`);
      });
  },
};

const Writer = (props) => {
  const now = (new Date()).toISOString();
  const defaultProps = {
    size: [595.28, 841.89],
    mediaBox: [0, 0, 595.28, 841.89],
    info: {
      producer: 'Docca.io',
      creationdate: now,
      moddate: now,
    },
  };
  const doc = Object.assign(Object.create(pdfWriter), _merge(defaultProps, props));
  doc.width = doc.size[0];
  doc.height = doc.size[1];
  doc.objects = {};
  doc.fonts = {};
  doc.images = {};
  doc.offsets = {};
  doc.fileOffset = 0;
  doc.writeToFile(`%PDF-1.4\n%\xFF\xFF\xFF\xFF Docca.io\n`);

  doc.pages = doc.addOID(Pages.create());

  doc.catalog = doc.addOID(Catalog.create({ pages: doc.pages }));
  doc.writeObject(doc.catalog);

  doc.info = doc.addOID(Info.create(doc.info));
  doc.writeObject(doc.info);

  doc.procSet = doc.addOID(ProcSet.create({
    data: ['/PDF', '/Text', '/ImageB', '/ImageC', '/ImageI'],
  }));
  doc.writeObject(doc.procSet);

  return doc;
};

export default Writer;
