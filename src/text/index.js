import _isString from 'lodash/isString';
import _map from 'lodash/map';
import _maxBy from 'lodash/maxBy';
import _merge from 'lodash/merge';
import _pick from 'lodash/pick';

import Color from 'onecolor';

import * as fontTools from './font-tools';
import delineate from './delineate';
import wrapText from './wrap';
import getMeta, { getLineMeta } from './meta';

export { fontTools, delineate, wrapText, getMeta, getLineMeta };

function ensureLeading(opts = {}) {
  if (opts.leading || !opts.size) return opts;
  return { ...opts, leading: opts.size + opts.size / 10 };
}

/**
 * convert a color string to a color array
 * @param   {String} color  a hex or css color value
 * @returns {Array}         red, green, blue decimal color values (0 - 1)
 *
 * if the specified color is an array it is returned as-is
 */
export function getColor(color) {
  if (!color) return undefined;
  if (!_isString(color)) return color;
  const col = Color(color);
  return [col.red(), col.green(), col.blue()];
}

/**
 * [textBlock description]
 * @param   {String} options.font    [description]
 * @param   {[type]} options.size    [description]
 * @param   {[type]} options.leading [description]
 * @param   {[type]} options.wrap    [description]
 * @param   {Object} options.color   rcolor as css name or array of rgb values
 * @returns {[type]}                 [description]
 */
export function TextBlock(options) {
  const opts = ensureLeading(options);
  return {
    height: undefined,
    width: undefined,
    content: [],
    ...opts,
    color: getColor(opts.color || [0, 0, 0]),

    /**
     * add text to the block
     * @param {String} text            [description]
     * @param {String} options.font    font name
     * @param {Number} options.size    font size
     * @param {Number} options.leading distance between line baselines
     *
     * Fun Fact: In typography, leading /ˈlɛdɪŋ/ refers to the distance between the baselines of
     * successive lines of type. The term originated in the days of hand-typesetting, when thin
     * strips of lead were inserted into the forms to increase the vertical distance between lines
     * of type.
     */
    add(text, textOptions = {}) {
      const defaultTextOpts = _pick(this, 'font', 'size', 'leading', 'color');
      const textOpts = _merge({}, defaultTextOpts, ensureLeading(textOptions));
      this.content.push({
        text,
        ...textOpts,
        color: getColor(textOpts.color),
      });
      return this;
    },

    setWidth(width) {
      this.width = width;
    },

    loadFontData({ fontManager }) {
      const fontNames = _map(this.content, part => part.font);
      return fontManager.registerFonts(fontNames)
        .then(() => {
          const subsets = fontManager.getSubsets(fontNames);
          const lines = delineate(this.content);
          this.meta = getMeta(lines, subsets);
          return this;
        });
    },

    encodeLines({ lines, fontManager, subsets }) {
      return _map(lines,
        line => ({
          ...line,
          leading: _maxBy(line.parts, part => part.leading).leading,
          parts: _map(line.parts, part => {
            fontManager.addCharacters(part.font, part.text);
            const text = subsets[part.font].encode(part.text).replace(/([\\()])/g, '\\$1');
            return { ...part, text, font: fontManager.get(part.font).id };
          }),
        })
      );
    },

    format({ fontManager, width = this.width } = {}) {
      const fontNames = _map(this.content, part => part.font);
      return fontManager.registerFonts(fontNames)
        .then(() => {
          const subsets = fontManager.getSubsets(fontNames);

          let lines = delineate(this.content);
          let meta = getMeta(lines, subsets);
          if (width) {
            lines = wrapText({ width, lines, meta });
            meta = getMeta(lines, subsets);
          }
          this.meta = meta;

          this.lines = this.encodeLines({ lines, fontManager, subsets });

          const lastLine = meta.lines[meta.lines.length - 1];
          const top = -meta.lines[0].descent;
          const bottom = (lastLine.height - lastLine.size) - lastLine.descent;
          this.bounding = {
            width: meta.width,
            height: meta.height - (top + bottom),
          };

          this.fonts = fontNames;

          return this;
        });
    },

    toPojo() {
      return _pick(this, 'content', 'meta', 'lines', 'bounding', 'fonts');
    },

  };
}
