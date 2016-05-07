import test from 'tape';

import * as procSet from '../../src/pdf-objects/proc-set';

test('pdf-objects proc-set', t => {
  t.test('- create', assert => {
    const expected = { _id: 1, type: 'ProcSet' };
    const actual = procSet.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'procSet object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const procSetObj = procSet.create({ _id: 1, data: ['/PDF', '/Text', '/ImageB', '/ImageC', '/ImageI'] });
    const expected = `1 0 obj
[/PDF /Text /ImageB /ImageC /ImageI]
endobj`;
    const actual = procSet.getPdfObject(procSetObj);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
