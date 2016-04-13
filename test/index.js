import fs from 'fs';
import tape from 'tape';
// import md from 'markdown';

import Document, { delineateText, wrapText } from '../src';


tape('doc-image-text', t => {
  const file = fs.createWriteStream('test/output/doc-image-text.pdf');

  const doc = Document({ file });

  const fontFile = fs.readFileSync('./test/fixtures/fonts/NotoSans-Regular.ttf');
  doc.addTTFFont('noto', fontFile);

  const fontFile2 = fs.readFileSync('./test/fixtures/fonts/NotoSans-Bold.ttf');
  doc.addTTFFont('noto-bold', fontFile2);

  const fontFile3 = fs.readFileSync('./test/fixtures/fonts/NotoSans-Italic.ttf');
  doc.addTTFFont('noto-italic', fontFile3);

  const fontFile4 = fs.readFileSync('./test/fixtures/fonts/NotoSans-BoldItalic.ttf');
  doc.addTTFFont('noto-bolditalic', fontFile4);

  const content = [
    { font: 'noto-bold', size: 15, text: 'Specification Coverage\n\n' },
    { font: 'noto',      size: 12, text: 'The following tables are implemented: ' },
    { font: 'noto-bolditalic', size: 12, text: 'cmap ' },
    { font: 'noto',      size: 12, text: '(currently only format 4), ' },
    { font: 'noto-bold', size: 12, text: 'glyf ' },
    { font: 'noto',      size: 12, text: '(glyphs are not actually Καλημέρα, only rewritten), ' },
    { font: 'noto-bold', size: 12, text: 'head, hhea, hmtx, loca, maxp, name, os2, post ' },
    { font: 'noto',      size: 12, text: '(currently only format 3).\n\n' },
    { font: 'noto-bold', size: 12, text: 'TrueType Font Specification: ' },
    { font: 'noto-italic',      size: 12, text: 'Apple, Microsoft', color: 'blue' },
  ];

  const lines = delineateText(content);
  console.log(JSON.stringify({ 'delineated': lines }, null, 2));

  let meta = doc.getTextMeta(lines);
  // console.log(JSON.stringify({ meta }, null, 2));

  const wrapped = wrapText({ width: 300, lines, meta });
  console.log(JSON.stringify({ wrapped }, null, 2));

  meta = doc.getTextMeta(wrapped);

  const x = 20;
  const y = 720 - meta.height + meta.lines[0].size + 1;
  const width = meta.width;
  const height = meta.height + meta.lines[meta.lines.length - 1].descent;

  // add a border
  const pad = 5;

  doc.setGraphics({
    paths: [
      {
        color: 'blue',
        fillColor: 'lightgreen',
        parts: [{
          op: 'rectangle',
          x: x - pad,
          y: y - pad,
          width: width + (pad * 2),
          height: height + (pad * 2),
        }],
      },
      {
        color: 'red',
        parts: [{
          op: 'rectangle',
          x: x - (pad + 2),
          y: y - (pad + 2),
          width: width + ((pad + 2) * 2),
          height: height + ((pad + 2) * 2),
        }],
      },
      {
        color: 'green',
        close: true,
        parts: [
          {
            op: 'line',
            x: x - (pad + 5),
            y: y - (pad + 5),
            x2: x + width + ((pad + 5) * 2),
            y2: y + height + ((pad + 5) * 2),
          },
          {
            op: 'line',
            x2: x + width + ((pad + 5) * 2),
            y2: y + ((pad + 5) * 2),
          },
        ],
      },
      {
        color: 'green',
        close: false,
        parts: [
          {
            op: 'line',
            x: x + 10 - (pad + 5),
            y: y + 10 - (pad + 5),
            x2: x + 10 + width + ((pad + 5) * 2),
            y2: y + 10 + height + ((pad + 5) * 2),
          },
          {
            op: 'line',
            x2: x + 10 + width + ((pad + 5) * 2),
            y2: y + 10 + ((pad + 5) * 2),
          },
        ],
      },
    ],
  });

  doc.setText({ lines: wrapped, x: 20, y: 720 });

  doc.setRaw({
    content: `q 0 1 0 RG 1 1 0 rg
      50 400 100 100 re
      150 300 m
      245 295 250 200 v
      245 105 150 100 v
      55 105 50 200 v
      55 295 150 300 v
      B Q`,
  });

  doc.setGraphics({
    paths: [
      {
        color: 'red',
        parts: [
          { op: 'circle', x: 350, y: 350, radius: 100 },
        ],
      },
      {
        color: 'purple',
        parts: [
          { op: 'line', x: 345, y: 350, x2: 355, y2: 350 },
          { op: 'line', x: 350, y: 345, x2: 350, y2: 355 },
        ],
      },
    ],
  });

  // doc.setText({
  //   x: 20, y: 520,
  //   lines: delineateText([
  //     { font: 'noto', size: 12, text: 'Hello World\nor ', color: [0.5, 0.1, 0.1] },
  //     { font: 'noto-bold', size: 15, text: 'Καλημέρα κόσμε', color: 'rgb(50, 44, 199)' },
  //     { font: 'noto', size: 12, text: 'or こんにちは 世界' },
  //   ]),
  // });

  doc.addImages({
    jpeg: 'test/fixtures/images/basic.jpg',
    png1: 'test/fixtures/images/pil123p.png',
  });

  doc.setImage('jpeg', { width: 100, height: 80, x: 50, y: 750 });
  doc.setImage('png1', { width: 100, height: 80, x: 250, y: 750 });

  doc.addImages({
    png2: 'test/fixtures/images/pil123rgba.png',
    png3: 'test/fixtures/images/basic.png',
  });

  doc.setImage('png2', { width: 100, height: 80, x: 50, y: 530 });
  doc.setImage('png3', { width: 100, height: 80, x: 250, y: 500 });

  return doc.done()
  .then(() => {
    t.ok(true, 'completed!');
    t.end();
  });
});

