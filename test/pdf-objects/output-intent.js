import test from 'tape';

import * as outputIntent from '../../src/pdf-objects/output-intent';

test('pdf-objects output-intent', t => {
  t.test('- create', assert => {
    const expected = { s: '/GTS_PDFA1',
      outputcondition: '(sRGB_IEC61966-2.1)',
      outputconditionidentifier: '(Custom)',
      info: '(sRGB IEC61966 v2.1)',
      type: 'OutputIntent',
      _id: 1,
      pdfKeys: [ 'Type', 'S', 'OutputCondition', 'OutputConditionIdentifier', 'Info', 'DestOutputProfile' ],
      destoutputprofile: 'mock color profile',
    };
    const actual = outputIntent.create({ _id: 1, destoutputprofile: 'mock color profile' });
    assert.deepEqual(actual, expected, 'output-intent object created');
    assert.end();
  });

  t.test('- getPdfObject', assert => {
    const outputIntentObj = outputIntent.create({ _id: 1, destoutputprofile: 'mock color profile' });
    const expected = `1 0 obj
<< /Type /OutputIntent/S /GTS_PDFA1/OutputCondition (sRGB_IEC61966-2.1)/OutputConditionIdentifier (Custom)/Info (sRGB IEC61966 v2.1)/DestOutputProfile mock color profile >>
endobj`;
    const actual = outputIntent.getPdfObject(outputIntentObj);
    assert.deepEqual(actual, expected, 'object serialized');
    assert.end();
  });

  t.end();
});
