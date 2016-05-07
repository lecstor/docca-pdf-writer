import test from 'tape';

import * as resources from '../../src/pdf-objects/resources';
import * as font from '../../src/pdf-objects/font';

test('pdf-objects resources', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: [
        'ProcSet', 'Font', 'XObject',
        'ExtGState', 'ColorSpace', 'Pattern', 'Shading', 'Properties',
      ],
    };
    const actual = resources.create();
    assert.deepEqual(actual, expected, 'resources object created');
    assert.end();
  });

  t.test('- addFont', assert => {
    const resourcesObj = resources.create();
    const expected = {
      pdfKeys: [
        'ProcSet', 'Font', 'XObject',
        'ExtGState', 'ColorSpace', 'Pattern', 'Shading', 'Properties',
      ],
      font: {
        F1: '1 0 R',
      },
    };
    const font1 = font.create({ _id: 1, subtype: 'Type1', name: 'F1', basefont: 'Helvetica', encoding: 'MacRomanEncoding' });
    const actual = resources.addFont(resourcesObj, font1);
    assert.deepEqual(actual, expected, 'font added to resources object');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    // const resourcesObj = resources.create({ font: { pdfKeys: ['Fred'], fred: '2 0 R' } });
    const font1 = font.create({ _id: 1, subtype: 'Type1', name: 'F1', basefont: 'Helvetica', encoding: 'MacRomanEncoding' });
    const resourcesObj = resources.addFont(resources.create(), font1);
    const expected = `<< /Font << /F1 1 0 R >> >>`;
    const actual = resources.getPdfObject(resourcesObj);
    assert.equal(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});


// << /Type /Page/Parent 1 0 R/Contents [5 0 R]/Resources << /ProcSet 3 0 R/Font << /F1 8 0 R >> >>/MediaBox [0 0 595.28 841.89] >>
