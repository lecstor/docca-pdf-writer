import test from 'tape';

import * as FontFile from '../../src/pdf-objects/font-file';

test('pdf-objects font-file', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: ['Length', 'Filter', 'Length1'],
      _id: 1,
      type: 'FontFile',
      filter: 'FlateDecode',
    };
    const actual = FontFile.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'FontFile created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const fontD = FontFile.create({ _id: 1, data: '<Buffer>' });
    const actual = FontFile.getPdfObject(fontD);

    const startsWith = /^1 0 obj\n<< \/Length 17\/Filter \/FlateDecode\/Length1 8 >>\nstream\n/;
    assert.ok(startsWith.test(actual), 'starts with');

    const endsWith = /\n\nendstream\nendobj\n$/;
    assert.ok(endsWith.test(actual), 'ends with');

    assert.end();
  });

  t.end();
});
