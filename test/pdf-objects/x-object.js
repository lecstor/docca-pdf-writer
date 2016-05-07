import test from 'tape';

import * as XObject from '../../src/pdf-objects/x-object';

test('pdf-objects XObject', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: [
        'Type', 'Subtype', 'Length', 'BitsPerComponent', 'ColorSpace',
        'Width', 'Height', 'Filter', 'DecodeParms', 'Mask', 'SMask',
      ],
      type: 'XObject',
    };
    const actual = XObject.create({ size: 3, root: '1 0 R' });
    assert.deepEqual(actual, expected, 'XObject object created');
    assert.end();
  });

  t.end();
});
