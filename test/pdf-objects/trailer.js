import test from 'tape';

import * as trailer from '../../src/pdf-objects/trailer';

test('pdf-objects trailer', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: ['Size', 'Root', 'Info', 'ID'],
      root: '1 0 R',
      size: 3,
    };
    const actual = trailer.create({ size: 3, root: '1 0 R' });
    assert.deepEqual(actual, expected, 'trailer object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const trailerObj = trailer.create({ size: 3, root: '1 0 R' });
    const expected = `<< /Size 3/Root 1 0 R >>`;
    const actual = trailer.getPdfObject(trailerObj);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
