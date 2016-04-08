import fs from 'fs';
import tape from 'tape';

import Document, { delineateText } from '../src';


tape('doc-image-text', t => {
  const file = fs.createWriteStream('test/output/doc-image-text.pdf');

  const doc = Document({ file });

  const fontFile = fs.readFileSync('./test/fixtures/fonts/NotoSans-Regular.ttf');
  doc.addTTFFont('noto', fontFile);

  const fontFile2 = fs.readFileSync('./test/fixtures/fonts/NotoSans-Bold.ttf');
  doc.addTTFFont('noto-bold', fontFile2);

  const lines = delineateText([
    { font: 'noto', size: 12, text: 'Hello World\n\nor ' },
    { font: 'noto-bold', size: 15, text: 'Καλημέρα κόσμε\n', color: '#008000' },
    { font: 'noto', size: 12, text: 'or こんにちは 世界' },
  ]);

  // const meta = doc.getTextMeta(lines, { leading: 18 });
  const meta = doc.getTextMeta(lines);
  console.log(JSON.stringify({ meta }, null, 2));


  doc.setText({ lines, x: 20, y: 720 });

  doc.setText({
    x: 20, y: 520,
    lines: delineateText([
      { font: 'noto', size: 12, text: 'Hello World\nor ', color: [0.5, 0.1, 0.1] },
      { font: 'noto-bold', size: 15, text: 'Καλημέρα κόσμε', color: 'rgb(50, 44, 199)' },
      { font: 'noto', size: 12, text: 'or こんにちは 世界' },
    ]),
  });

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

  doc.setImage('png2', { width: 100, height: 80, x: 50, y: 600 });
  doc.setImage('png3', { width: 100, height: 80, x: 250, y: 600 });

  return doc.done()
  .then(() => {
    t.ok(true, 'completed!');
    t.end();
  });
});

