import test from 'tape';
// import cloneDeep from 'lodash/cloneDeep';

import * as page from '../../src/pdf-objects/page';
import * as resources from '../../src/pdf-objects/resources';
import * as procset from '../../src/pdf-objects/proc-set';

const basePage = {
  pdfKeys: [
    'Type', 'Parent', 'Contents', 'Resources', 'MetaData',
    'MediaBox', 'CropBox', 'BleedBox', 'TrimBox', 'ArtBox', 'BoxColorInfo',
    'PieceInfo', 'LastModified',
    'StructParents', 'Rotate', 'Group', 'Thumb', 'B', 'Dur', 'Trans',
    'AA', 'ID', 'PZ', 'SeparationInfo',
    'Annots',
  ],
  _id: 1,
  type: 'Page',
  contents: [],
  mediabox: [],
  resources: [],
  annots: [],
};

test('pdf-objects page', t => {
  t.test('- create', assert => {
    const expected = basePage;
    const actual = page.create({ _id: 1 });
    assert.deepEqual(actual, expected, 'page created');
    assert.end();
  });

  t.test('- parent', assert => {
    let expected = {
      ...basePage,
      parent: { _id: 2 },
    };
    const pageObj = page.create({ _id: 1, parent: { _id: 2 } });
    assert.deepEqual(pageObj, expected, 'page created');

    expected = '1 0 obj\n<< /Type /Page/Parent 2 0 R >>\nendobj\n';
    const pdfString = page.getPdfObject(pageObj);
    assert.deepEqual(pdfString, expected, 'pdf page string');

    assert.end();
  });

  t.test('- setResources', assert => {
    let pageObj = page.create({ _id: 1 });
    let expected = {
      ...basePage,
      resources: {
        procset: {
          _id: 2,
          data: ['/PDF', '/Text', '/ImageB', '/ImageC', '/ImageI'],
          type: 'ProcSet',
        },
        pdfKeys: ['ProcSet', 'Font', 'XObject', 'ExtGState', 'ColorSpace', 'Pattern', 'Shading', 'Properties'],
      },
    };
    const procSet = procset.create({ _id: 2, data: ['/PDF', '/Text', '/ImageB', '/ImageC', '/ImageI'] });
    pageObj = page.setResources(pageObj, resources.create({ procset: procSet }));
    assert.deepEqual(pageObj, expected, 'resources added to page');

    expected = '1 0 obj\n<< /Type /Page/Resources << /ProcSet 2 0 R >> >>\nendobj\n';
    const pdfString = page.getPdfObject(pageObj);
    assert.deepEqual(pdfString, expected, 'pdf page string');
    assert.end();
  });

  t.test('- addContent', assert => {
    const pageObj = page.create({ _id: 1 });
    const expected = {
      ...basePage,
      contents: ['hrmmm'],
    };
    const actual = page.addContent(pageObj, 'hrmmm');
    assert.deepEqual(actual, expected, 'content added to page');
    assert.end();
  });

  t.test('- addUriLink (annotation)', assert => {
    const pageObj = page.create({ _id: 1 });
    const expected = {
      ...basePage,
      annots: [`<<
/Type /Annot /Subtype /Link /Rect [ 2 3 4 5 ] /H /P /C [0 0 1]
/A << /Type /Action /S /URI /URI (http://docca.io) >>
/BS << /Type /Border/W 1/S /U >>
>>`],
    };
    const actual = page.addUriLink(pageObj, { uri: 'http://docca.io', x: 2, y: 3, x2: 4, y2: 5 });
    assert.deepEqual(actual, expected, 'uriLink added to page');
    assert.end();
  });

//   t.test('- getPdfObject', assert => {
//     let pageObj = page.create({ _id: 1, contents: ['hrmmm'], resources: { font: 'hello' } });
//     pageObj = page.addUriLink(pageObj, { uri: 'http://docca.io', x: 2, y: 3, x2: 4, y2: 5 });
//     pageObj = page.setResources(pageObj, { pdfKeys: ['Test'], test: 'hello' });
//     const expected = `1 0 obj\n<< /Type /Page/Contents [hrmmm]/Resources << /Test hello >>/Annots [<<
// /Type /Annot /Subtype /Link /Rect [ 2 3 4 5 ] /H /P /C [0 0 1]\n/A << /Type /Action /S /URI /URI (http://docca.io) >>
// /BS << /Type /Border/W 1/S /U >>\n>>] >>\nendobj\n`;
//     const actual = page.getPdfObject(pageObj);
//     assert.deepEqual(actual, expected, 'object serialized');
//     assert.end();
//   });

  t.end();
});
