import test from 'tape';

import * as action from '../../src/pdf-objects/action';

test('pdf-objects action', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: ['Type', 'S', 'Next', 'URI', 'IsMap'],
      _id: 1,
      type: 'Action',
    };
    const actual = action.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'action object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const actionObj = action.create({ _id: 1, kids: [{ _id: 2 }] });
    const expected = `1 0 obj\n<< /Type /Action >>\nendobj`;
    const actual = action.getPdfObject(actionObj);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
