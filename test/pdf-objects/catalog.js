import test from 'tape';

import * as catalog from '../../src/pdf-objects/catalog';

test('pdf-objects catalog', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: [
        'Type', 'Pages', 'Marked', 'Metadata',
        // optional
        'Version', 'MarkInfo', 'PageLabels', 'Names', 'Dests', 'PageLayout', 'PageMode',
        'Outlines', 'Threads', 'OpenAction', 'AA', 'URI', 'AcroForm', 'StructTreeRoot',
        'Lang', 'SpiderInfo', 'OutputIntents',
      ],
      _id: 1,
      type: 'Catalog',
      marked: false,
      markinfo: false,
    };
    const actual = catalog.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'catalog object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const expected = '1 0 obj\n<< /Type /Catalog/Pages 2 0 R/Marked false/MarkInfo false >>\nendobj\n';
    const cat = catalog.create({ _id: 1, pages: { _id: 2 } });
    const actual = catalog.getPdfObject(cat);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
