import fs from 'fs';
import tape from 'tape';

process.env.DOCCA_FONT_DIR = '/Users/jason/Development/docca/fonts';

import Writer from '../src';
import { fontTools, TextBlock, getColor } from '../src/text';

tape('index', t => {
  const file = fs.createWriteStream('test/output/index.pdf');

  const writer = Writer({ file });
  const fontManager = fontTools.FontManager(writer);

  const imagePromises = [
    writer.addImage({ handle: 'jpeg', file: 'test/fixtures/images/basic.jpg' }),
    writer.addImage({ handle: 'png', file: 'test/fixtures/images/pil123p.png' }),
  ];

  TextBlock({ font: 'NotoSans-Regular', size: 12, width: 300, color: 'black' })
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

      writer.setText({
        x: 1 + padding + pagePadding,
        y: 1 + padding + pagePadding,
        lines: block.lines,
        meta: block.meta,
      });

      writer.setText({
        x: 1 + padding + pagePadding,
        y: 1 + padding + pagePadding + block.bounding.height,
        lines: block.lines, meta: block.meta,
      });

      writer.setGraphics({
        paths: [
          {
            color: getColor('purple'),
            fillColor: getColor('lightgrey'),
            parts: [
              {
                op: 'rectangle',
                x: 50, y: 300,
                width: block.width, height: block.bounding.height,
              },
            ],
          },
        ],
      });
      writer.setText({ x: 50, y: 300, lines: block.lines, meta: block.meta });
      writer.setImage('jpeg', { width: 100, height: 80, x: 400, y: 300 });

      fontManager.addFontsToPage(block.fonts);

      writer.setImage('jpeg', { width: 100, height: 80, x: 400, y: 50 });
      writer.setImage('png', { width: 100, height: 80, x: 400, y: 150 });

      TextBlock({ font: 'NotoSans-Regular', size: 12, width: 300, color: 'black' })
        .add('porem ipsum dolor sit amet, consectetur. Lorem ipsum dolor sit amet', { size: 15 })
        .format({ fontManager })
        .then(block2 => {
          writer.setGraphics({
            paths: [
              {
                color: getColor('purple'),
                fillColor: getColor('lightgrey'),
                parts: [
                  {
                    op: 'rectangle',
                    x: 50, y: 400,
                    // width: block2.width, height: block2.bounding.height,
                    width: block2.meta.width, height: 30, // block2.meta.height,
                  },
                ],
              },
            ],
          });
          writer.setText({ x: 50, y: 400, lines: block2.lines, meta: block2.meta });

          fontManager.addFontsToPdf();

          Promise.all(imagePromises)
            .then(() => {
              writer.done();
              t.ok(true, 'completed!');
              t.end();
            });
        });
    });
});
