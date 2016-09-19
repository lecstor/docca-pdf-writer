import fs from 'fs';
import tape from 'tape';

process.env.DOCCA_FONT_DIR = '/Users/jason/Development/docca/fonts';

import Writer from '../src';
import { fontTools, TextBlock, getColor } from '../src/text';

tape('text', t => {
  const file = fs.createWriteStream('test/output/text.pdf');

  const writer = Writer({ file });
  const fontManager = fontTools.FontManager(writer);


  return TextBlock({ font: 'NotoSans-Regular', size: 10, width: 500, color: 'black' })
    .add('abcdefghijklmnopqrstuvwxyz')
    .format({ fontManager })
    .then(block => {
      writer.setGraphics({
        paths: [
          {
            color: getColor('blue'),
            // fillColor: getColor('lightgrey'),
            parts: [
              {
                op: 'rectangle',
                x: 1, y: 1,
                width: block.meta.width,
                height: block.meta.height.leading,
              },
            ],
          },
          {
            color: getColor('orange'),
            // fillColor: getColor('lightgrey'),
            parts: [
              {
                op: 'rectangle',
                x: 1, y: 1,
                width: block.meta.width,
                height: block.meta.height.baseline,
              },
            ],
          },
          {
            color: getColor('green'),
            // fillColor: getColor('lightgrey'),
            parts: [
              {
                op: 'rectangle',
                x: 1, y: 1,
                width: block.meta.width,
                height: block.meta.height.bounding,
              },
            ],
          },
        ],
      });
      writer.setText({ x: 1, y: 1, lines: block.lines, meta: block.meta });

      fontManager.addFontsToPage(block.fonts);
    })

    // default leading is size + 10%
    .then(() => TextBlock({ font: 'NotoSans-Regular', leading: 11, size: 10, width: 100, color: 'black' })
      .add('abcd efgh ijkl mnop qrstu vwxyz agcd efbh ijkl mnop qrstu vwxyz')
      // .add('agcd efbh ijkl mnop qrstu vwxyz')
      .format({ fontManager })
      .then(block => {
        writer.setGraphics({
          paths: [
            {
              // height.leading: leading * numOfLines = next line pos
              color: getColor('blue'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 20,
                  width: block.meta.width,
                  height: block.meta.height.leading,
                },
              ],
            },
            {
              // height.bounding: leading * numOfLines - 1 + fontSize = bounding height
              color: getColor('green'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 20,
                  width: block.meta.width,
                  height: block.meta.height.bounding,
                },
              ],
            },
            {
              // height.baseline: leading * numOfLines - 1 + fontSize + firstLineAscent/10 - lastLineDescent
              color: getColor('orange'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 20,
                  width: block.meta.width,
                  height: block.meta.height.baseline,
                },
              ],
            },
          ],
        });
        writer.setText({ x: 1, y: 20, lines: block.lines, meta: block.meta });

        fontManager.addFontsToPage(block.fonts);
      })
    )
    .then(() => TextBlock({ font: 'NotoSans-Regular', size: 10, width: 100, color: 'black' })
      .add('abcd efgh ijkl mnop qrstu vwxyz agcd efbh ijkl mnop qrstu vwxyz')
      // .add('agcd efbh ijkl mnop qrstu vwxyz')
      .format({ fontManager })
      .then(block => {
        writer.setGraphics({
          paths: [
            {
              color: getColor('blue'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 20,
                  width: block.meta.width,
                  height: block.meta.height.leading,
                },
              ],
            },
            {
              color: getColor('orange'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 20,
                  width: block.meta.width,
                  height: block.meta.height.baseline,
                },
              ],
            },
            {
              color: getColor('green'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 20,
                  width: block.meta.width,
                  height: block.meta.height.bounding,
                },
              ],
            },
          ],
        });
        writer.setText({ x: 110, y: 20, lines: block.lines, meta: block.meta });

        fontManager.addFontsToPage(block.fonts);
      })
    )
    // default leading is size + 10%
    .then(() => TextBlock({ font: 'NotoSans-Regular', leading: 16.5, size: 15, width: 100, color: 'black' })
      .add('abcd efgh ijkl mnop qrstu vwxyz agcd efbh ijkl mnop qrstu vwxyz')
      // .add('agcd efbh ijkl mnop qrstu vwxyz')
      .format({ fontManager })
      .then(block => {
        writer.setGraphics({
          paths: [
            {
              color: getColor('blue'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 80,
                  width: block.meta.width,
                  height: block.meta.height.leading,
                },
              ],
            },
            {
              color: getColor('orange'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 80,
                  width: block.meta.width,
                  height: block.meta.height.baseline,
                },
              ],
            },
            {
              color: getColor('green'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 80,
                  width: block.meta.width,
                  height: block.meta.height.bounding,
                },
              ],
            },
          ],
        });
        writer.setText({ x: 1, y: 80, lines: block.lines, meta: block.meta });

        fontManager.addFontsToPage(block.fonts);
      })
    )
    .then(() => TextBlock({ font: 'NotoSans-Regular', size: 15, width: 100, color: 'black' })
      .add('abcd efgh ijkl mnop qrstu vwxyz agcd efbh ijkl mnop qrstu vwxyz')
      // .add('agcd efbh ijkl mnop qrstu vwxyz')
      .format({ fontManager })
      .then(block => {
        writer.setGraphics({
          paths: [
            {
              color: getColor('blue'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 80,
                  width: block.meta.width,
                  height: block.meta.height.leading,
                },
              ],
            },
            {
              color: getColor('orange'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 80,
                  width: block.meta.width,
                  height: block.meta.height.baseline,
                },
              ],
            },
            {
              color: getColor('green'),
              // fillColor: getColor('lightgrey'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 80,
                  width: block.meta.width,
                  height: block.meta.height.bounding,
                },
              ],
            },
          ],
        });
        writer.setText({ x: 110, y: 80, lines: block.lines, meta: block.meta });

        fontManager.addFontsToPage(block.fonts);
      })
    )
    .then(() =>
      TextBlock({ font: 'NotoSans-Regular', leading: 22, size: 20, width: 100, color: 'black' })
      .add('abcd efgh ijkl mnop qrstu vwxyz agcd efbh ijkl mnop qrstu vwxyz')
      .format({ fontManager })
      .then(block => {
        writer.setGraphics({
          paths: [
            {
              color: getColor('blue'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 220,
                  width: block.meta.width,
                  height: block.meta.height.leading,
                },
              ],
            },
            {
              color: getColor('orange'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 220,
                  width: block.meta.width,
                  height: block.meta.height.baseline,
                },
              ],
            },
            {
              color: getColor('green'),
              parts: [
                {
                  op: 'rectangle',
                  x: 1, y: 220,
                  width: block.meta.width,
                  height: block.meta.height.bounding,
                },
              ],
            },
          ],
        });
        writer.setText({ x: 1, y: 220, lines: block.lines, meta: block.meta });

        fontManager.addFontsToPage(block.fonts);
      })
    )
    .then(() => TextBlock({ font: 'NotoSans-Regular', size: 20, width: 100, color: 'black' })
      .add('abcd efgh ijkl mnop qrstu vwxyz agcd efbh ijkl mnop qrstu vwxyz')
      // .add('agcd efbh ijkl mnop qrstu vwxyz')
      .format({ fontManager })
      .then(block => {
        writer.setGraphics({
          paths: [
            {
              color: getColor('blue'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 220,
                  width: block.meta.width,
                  height: block.meta.height.leading,
                },
              ],
            },
            {
              color: getColor('orange'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 220,
                  width: block.meta.width,
                  height: block.meta.height.baseline,
                },
              ],
            },
            {
              color: getColor('green'),
              parts: [
                {
                  op: 'rectangle',
                  x: 110, y: 220,
                  width: block.meta.width,
                  height: block.meta.height.bounding,
                },
              ],
            },
          ],
        });
        writer.setText({ x: 110, y: 220, lines: block.lines, meta: block.meta });

        fontManager.addFontsToPage(block.fonts);
      })
    )
    .then(() => {
      fontManager.addFontsToPdf();
      writer.done();
      t.ok(true, 'completed!');
      t.end();
    });
});
