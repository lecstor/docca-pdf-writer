import test from 'tape';

import * as pages from '../../src/pdf-objects/pages';

test('pdf-objects pages', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: [ 'Type', 'Kids', 'Count' ],
      _id: 1,
      type: 'Pages',
      count: 0,
      kids: [],
    };
    const actual = pages.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'pages object created');
    assert.end();
  });

  t.test('- addPage', assert => {
    const pagesObj = pages.create({ _id: 1 });
    const expected = {
      pdfKeys: [ 'Type', 'Kids', 'Count' ],
      _id: 1,
      type: 'Pages',
      count: 1,
      kids: [ { _id: 2 } ],
    };
    const actual = pages.addPage(pagesObj, { _id: 2 });
    assert.deepEqual(actual, expected, 'page added to pages object');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const pagesObj = pages.create({ _id: 1, kids: [{ _id: 2 }] });
    const expected = `1 0 obj\n<< /Type /Pages/Kids [2 0 R]/Count 1 >>\nendobj`;
    const actual = pages.getPdfObject(pagesObj);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
