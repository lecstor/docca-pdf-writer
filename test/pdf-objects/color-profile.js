import test from 'tape';

import * as colorProfile from '../../src/pdf-objects/color-profile';

test('pdf-objects color-profile', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: ['Filter', 'N', 'Length', 'Range'],
      Filter: 'FlateDecode', N: 3, Range: [ 0, 1, 0, 1, 0, 1 ],
      _id: 1,
    };
    const actual = colorProfile.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'colorProfile object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const colorProfileObj = colorProfile.create({ _id: 1 });
    const expected = `1 0 obj\n<<  >>\nendobj`;
    const actual = colorProfile.getPdfObject(colorProfileObj);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
