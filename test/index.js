import fs from 'fs';
import tape from 'tape';

process.env.DOCCA_FONT_DIR = '/Users/jason/Development/docca/fonts';

import Writer from '../src';
import { fontTools, textBlock, getColor } from '../src/text';

tape('index', t => {
  const file = fs.createWriteStream('test/output/index.pdf');

  const writer = Writer({ file });
  const fontManager = fontTools.FontManager(writer);

  textBlock({ font: 'NotoSans-Regular', size: 12, width: 300, color: 'black' })
    .add('Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n', { size: 15 })
    .add('Proin facilisis luctus odio', { href: 'http://docca.io', color: 'green' })
    .add(' ')
    .add('Proin facilisis luctus odio', { href: 'http://docca.io' })
    .add(' sed elementum', { font: 'NotoSans-Bold' })
    .add('.')
    .add(' Donec in placerat sem.', { color: 'red' })
    .format({ fontManager })
    .then(block => {
      const pagePadding = 10;
      const padding = 10;

      writer.setGraphics({
        paths: [
          {
            color: getColor('purple'),
            fillColor: getColor('lightgrey'),
            parts: [
              {
                op: 'rectangle',
                x: 1 + pagePadding, y: 1 + pagePadding,
                width: block.width + padding * 2, height: block.bounding.height + padding * 2,
                cornerRadius: 10,
              },
            ],
          },
          {
            color: getColor('pink'),
            fillColor: getColor('lightblue'),
            parts: [
              {
                op: 'rectangle',
                x: 1 + padding + pagePadding, y: 1 + padding + pagePadding,
                width: block.bounding.width, height: block.bounding.height,
              },
            ],
          },
        ],
      });

      writer.setText({ x: 1 + padding + pagePadding, y: 1 + padding + pagePadding, lines: block.lines, meta: block.meta });

      writer.setText({
        x: 1 + padding + pagePadding,
        y: 1 + padding + pagePadding + block.bounding.height,
        lines: block.lines, meta: block.meta,
      });

      fontManager.addFontsToPage(block.fonts);
      fontManager.addFontsToPdf();

      writer.done();
      t.ok(true, 'completed!');
      t.end();
    });
});
