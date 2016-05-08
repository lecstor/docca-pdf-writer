import Promise from 'bluebird';
import _forEach from 'lodash/forEach';
import _keyBy from 'lodash/keyBy';
import _keys from 'lodash/keys';
import _mapValues from 'lodash/mapValues';

import * as truetype from './truetype';

export { truetype };

export function loadFonts(...fontNameList) {
  const fonts = {};
  _forEach(fontNameList, fontName => {
    fonts[fontName] = truetype.loadFont(fontName);
  });
  return Promise.props(fonts);
}

export function getSubsets(fonts, getIdentifier) {
  return _mapValues(fonts, font => {
    const subset = font.subset();
    subset.id = getIdentifier();
    return subset;
  });
}

export function arrayToObject(keys, func) {
  const obj = {};
  _forEach(keys, key => {
    obj[key] = func(key);
  });
  return obj;
}

export function FontManager(writer) {
  return {
    writer,
    fonts: {},
    fontIdCounter: 0,
    fontSubsetTagCounter: 199,

    registerFonts(fontNames) {
      const uniqueNames = _keys(_keyBy(fontNames, fontName => fontName));
      return Promise.map(uniqueNames, fontName => this.registerFont(fontName));
    },

    registerFont(fontName) {
      if (this.fonts[fontName]) return Promise.resolve(this.fonts[fontName]);

      return truetype.loadFont(fontName)
        .then(font => {
          if (!this.fonts[fontName]) {
            const regFont = {
              type: 'truetype',
              font,
              pdfRef: writer.registerFont(fontName),
              id: truetype.getFontId(++this.fontIdCounter),
              subset: font.subset(),
              tag: truetype.getFontSubsetTag(++this.fontSubsetTagCounter),
            };
            this.fonts[fontName] = regFont;
            return regFont;
          }
          return this.fonts[fontName];
        });
    },

    get(fontName) {
      return this.fonts[fontName];
    },

    getFont(fontName) {
      return this.fonts[fontName].font;
    },

    getFonts(fontNames) {
      return arrayToObject(fontNames, name => this.getFont(name));
    },

    getFontId(fontName) {
      return this.fonts[fontName].id;
    },

    getSubset(fontName) {
      return this.fonts[fontName].subset;
    },

    getSubsets(fontNames) {
      return arrayToObject(fontNames, name => this.getSubset(name));
    },

    addCharacters(fontName, characters) {
      this.fonts[fontName].subset.use(characters);
    },

    addFontsToPage(fontNames) {
      _forEach(fontNames, fontName => {
        this.writer.addFontToPage(fontName, this.getFontId(fontName));
      });
    },

    addFontsToPdf() {
      _forEach(this.fonts, (managerFont, fontName) => {
        managerFont.subset.embed();
        const subsetData = truetype.subsetToBuffer(managerFont.subset.save());
        const characterData = truetype.getFontCharMeta(managerFont.subset);
        writer.addFont({
          fontName,
          subsetData,
          characterData,
          font: managerFont.font,
          subsetTag: managerFont.tag,
          fontId: managerFont.id,
        });
      });
    },

  };
}
