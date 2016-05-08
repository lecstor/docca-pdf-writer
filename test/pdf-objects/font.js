import test from 'tape';

import * as font from '../../src/pdf-objects/font';

test('pdf-objects font', t => {
  t.test('- create empty', assert => {
    const expected = {
      pdfKeys: [
        'Type', 'Subtype', 'Name', 'BaseFont', 'Encoding',
        'FontDescriptor', 'FirstChar', 'LastChar', 'Widths', 'ToUnicode',
      ],
      _id: 1,
      type: 'Font',
    };
    const actual = font.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'font object created');
    assert.end();
  });

  t.test('- create', assert => {
    const expected = {
      pdfKeys: [
        'Type', 'Subtype', 'Name', 'BaseFont', 'Encoding',
        'FontDescriptor', 'FirstChar', 'LastChar', 'Widths', 'ToUnicode',
      ],
      _id: 1,
      type: 'Font',
      subtype: 'Type1',
      name: 'F1',
      basefont: 'Helvetica',
      encoding: 'MacRomanEncoding',
    };
    const actual = font.create({
      _id: 1, subtype: 'Type1', name: 'F1', basefont: 'Helvetica', encoding: 'MacRomanEncoding',
    });
    assert.deepEqual(actual, expected, 'font object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const fontObj = font.create({
      _id: 1, subtype: 'Type1', name: 'F1', basefont: 'Helvetica', encoding: 'MacRomanEncoding',
    });
    const expected = `1 0 obj
<< /Type /Font/Subtype /Type1/Name /F1/BaseFont /Helvetica/Encoding /MacRomanEncoding >>
endobj`;
    const actual = font.getPdfObject(fontObj);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
