import test from 'tape';

import * as annotation from '../../src/pdf-objects/annotation';

test('pdf-objects annotation', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: [
        'Type', 'Subtype', 'Contents', 'Rect', 'Border', 'BS',
        'Dest', 'H', 'PA', // Link
      ],
      _id: 1,
      type: 'Annot',
    };
    const actual = annotation.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'annotation object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const annotationObj = annotation.create({ _id: 1, kids: [{ _id: 2 }] });
    const expected = `1 0 obj\n<< /Type /Annot >>\nendobj`;
    const actual = annotation.getPdfObject(annotationObj);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
