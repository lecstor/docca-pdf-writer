import test from 'tape';

import * as Stream from '../../src/pdf-objects/stream';

test('pdf-objects stream', t => {
  t.test('- create', assert => {
    const expected = {
      pdfKeys: ['Length', 'Filter', 'Length1'],
      _id: 1,
      type: 'Stream',
    };
    const actual = Stream.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'Stream created');
    assert.end();
  });

  t.test('- addContent - string', assert => {
    const expected = {
      pdfKeys: ['Length', 'Filter', 'Length1'],
      _id: 1,
      type: 'Stream',
      data: 'some content ops',
    };
    const stream = Stream.create({ _id: 1 });
    let actual = Stream.addContent(stream, 'some content ops');
    assert.deepEqual(actual, expected, 'Stream created');

    expected.data = 'some content opsmore content ops';
    actual = Stream.addContent(actual, 'more content ops');
    assert.deepEqual(actual, expected, 'Stream created');
    assert.end();
  });

  t.test('- addContent - buffer', assert => {
    const expected = {
      pdfKeys: ['Length', 'Filter', 'Length1'],
      _id: 1,
      type: 'Stream',
      data: 'some content ops',
    };
    const stream = Stream.create({ _id: 1 });
    let actual = Stream.addContent(stream, new Buffer('some content ops'));
    assert.deepEqual(actual, expected, 'Stream created');

    expected.data = 'some content opsmore content ops';
    actual = Stream.addContent(actual, new Buffer('more content ops'));
    assert.deepEqual(actual, expected, 'Stream created');
    assert.end();
  });

  t.test('- getPdfObject - deflate', assert => {
    const stream = Stream.create({ _id: 1, data: '<Buffer>' });
    const actual = Stream.getPdfObject(stream, { noDeflate: false });

    const startsWith = /^1 0 obj\n<< \/Length 17\/Filter \/FlateDecode >>\nstream\n/;
    assert.ok(startsWith.test(actual), 'starts with');

    const endsWith = /\n\nendstream\nendobj\n$/;
    assert.ok(endsWith.test(actual), 'ends with');

    assert.end();
  });

  t.test('- getPdfObject - no deflate', assert => {
    const stream = Stream.create({ _id: 1, data: '<Buffer>' });
    const actual = Stream.getPdfObject(stream, { noDeflate: true });

    const startsWith = /^1 0 obj\n<< \/Length 9 >>\nstream\n/;
    assert.ok(startsWith.test(actual), 'starts with');

    const endsWith = /\n\nendstream\nendobj\n$/;
    assert.ok(endsWith.test(actual), 'ends with');

    assert.end();
  });

  t.end();
});
