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
      const fonts = {};
      _forEach(fontNames, fontName => fonts[fontName] = this.getFont(fontName));
      return fonts;
    },

    getFontId(fontName) {
      return this.fonts[fontName].id;
    },

    getSubset(fontName) {
      return this.fonts[fontName].subset;
    },

    getSubsets(fontNames) {
      const subsets = {};
      _forEach(fontNames, fontName => subsets[fontName] = this.getSubset(fontName));
      return subsets;
    },

    addCharacters(fontName, characters) {
      // console.log({fontName, characters, font: this.fonts});
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
          font: managerFont.font,
          subsetData,
          subsetTag: managerFont.tag,
          characterData,
          fontId: managerFont.id,
        });
      });
    },

  };
}
