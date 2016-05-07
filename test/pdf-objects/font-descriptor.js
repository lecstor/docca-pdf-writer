import test from 'tape';

import * as FontDescriptor from '../../src/pdf-objects/font-descriptor';

test('pdf-objects font-descriptor', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: [
        'Type', 'FontName', 'FontFile2', 'FontBBox', 'Flags', 'StemV', 'ItalicAngle',
        'Ascent', 'Descent', 'CapHeight', 'XHeight',
      ],
      _id: 1,
      type: 'FontDescriptor',
    };
    const actual = FontDescriptor.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'FontDescriptor created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const expected = '1 0 obj\n<< /Type /FontDescriptor/FontName /DOCCAB+NotoSans-Bold/FontFile2 2 0 R/FontBBox [-619 -293 1441 1069]/Flags 32/StemV 0/ItalicAngle 0/Ascent 1069/Descent -293/CapHeight 1462/XHeight 0 >>\nendobj';
    const fontD = FontDescriptor.create({
      _id: 1,
      fontname: '/DOCCAB+NotoSans-Bold',
      fontfile2: { _id: 2 },
      fontbbox: '[-619 -293 1441 1069]',
      flags: 32,
      stemv: 0,
      italicangle: 0,
      ascent: 1069,
      descent: -293,
      capheight: 1462,
      xheight: 0,
    });
    const actual = FontDescriptor.getPdfObject(fontD);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
