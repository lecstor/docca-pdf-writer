import fs from 'fs';
import tape from 'tape';

import Document from '../src';

tape('doc-image-text', t => {
  const file = fs.createWriteStream('test/output/doc-image-text.pdf');

  const doc = Document({ file });

  const fontFile = fs.readFileSync('./test/fixtures/fonts/NotoSans-Regular.ttf');
  doc.addTTFFont({ name: 'notosans', file: fontFile });

  doc.addText({
    font: 'notosans', x: 20, y: 720, size: 15,
    text: 'NotoSans: Hello World or Καλημέρα κόσμε or こんにちは 世界',
  });

  const fontFile2 = fs.readFileSync('./test/fixtures/fonts/Cousine-Regular.ttf');
  doc.addTTFFont({ name: 'cousine', file: fontFile2 });

  doc.addText({
    font: 'cousine', x: 20, y: 450, size: 15,
    text: 'Cousine: Hello World or Καλημέρα κόσμε or こんにちは 世界',
  });

  doc.addImages({
    jpeg: 'test/fixtures/images/basic.jpg',
    png1: 'test/fixtures/images/pil123p.png',
  });

  doc.placeImage({ name: 'jpeg', width: 100, height: 80, x: 50, y: 750 });
  doc.placeImage({ name: 'png1', width: 100, height: 80, x: 250, y: 750 });

  doc.addText({
    font: 'notosans', x: 20, y: 550, size: 20,
    text: 'Hello Again',
  });

  doc.addImages({
    png2: 'test/fixtures/images/pil123rgba.png',
    png3: 'test/fixtures/images/basic.png',
  });

  doc.placeImage({ name: 'png2', width: 100, height: 80, x: 50, y: 600 });
  doc.placeImage({ name: 'png3', width: 100, height: 80, x: 250, y: 600 });

  return doc.done()
  .then(() => {
    t.ok(true, 'completed!');
    t.end();
  });
});

