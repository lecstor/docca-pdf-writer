import test from 'tape';

import * as metadata from '../../src/pdf-objects/metadata';

test('pdf-objects metadata', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: ['Type', 'Subtype', 'Length'],
      _id: 1,
      type: 'Metadata',
      subtype: 'XML',
      data: '<mock>binary meta</mock>',
    };
    const actual = metadata.create({ _id: 1, data: '<mock>binary meta</mock>' });
    assert.deepEqual(actual, expected, 'metadata object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const metadataObj = metadata.create({ _id: 1, data: '<mock>binary meta</mock>' });
    const expected = `1 0 obj
<< /Type /Metadata/Subtype /XML/Length 25 >>
stream
<mock>binary meta</mock>

endstream
endobj
`;
    const actual = metadata.getPdfObject(metadataObj, { noDeflate: true });
    assert.deepEqual(actual.toString(), expected, 'object serialized');
    assert.end();
  });

  t.end();
});
