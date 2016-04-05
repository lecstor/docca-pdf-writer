import fs from 'fs';
import tape from 'tape';

import Document from '../src';

tape('doc-image-text', t => {
  const file = fs.createWriteStream('test/output/doc-image-text.pdf');

  const doc = Document({ file });

  const fontFile = fs.readFileSync('./test/fixtures/fonts/NotoSans-Regular.ttf');
  doc.addTTFFont('regular', fontFile);

  doc.setText(
    'NotoSans: Hello World or Καλημέρα κόσμε or こんにちは 世界',
    { font: 'regular', x: 20, y: 720, size: 15 }
  );

  const fontFile2 = fs.readFileSync('./test/fixtures/fonts/NotoSans-Bold.ttf');
  doc.addTTFFont('bold', fontFile2);

  doc.setText(
    'NotoSans-Bold: Hello World or Καλημέρα κόσμε or こんにちは 世界',
    { font: 'bold', x: 20, y: 450, size: 15 }
  );

  doc.addImages({
    jpeg: 'test/fixtures/images/basic.jpg',
    png1: 'test/fixtures/images/pil123p.png',
  });

  doc.setImage('jpeg', { width: 100, height: 80, x: 50, y: 750 });
  doc.setImage('png1', { width: 100, height: 80, x: 250, y: 750 });

  doc.setText('Hello Again', { font: 'regular', x: 20, y: 550, size: 20 });

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

