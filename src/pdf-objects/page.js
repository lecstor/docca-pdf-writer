
import {
  init, pdfReference, toPdf, getPdfHeadReference,
  Resources
} from './'

const pdfKeys = [
  'Type', 'Parent', 'Contents', 'Resources', 'MetaData',
  'MediaBox', 'CropBox', 'BleedBox', 'TrimBox', 'ArtBox', 'BoxColorInfo',
  'PieceInfo', 'LastModified',
  'StructParents', 'Rotate', 'Group', 'Thumb', 'B', 'Dur', 'Trans',
  'AA', 'ID', 'PZ', 'SeparationInfo',
  'Annots'
]

export function create (props) {
  const defaults = { contents: [], mediabox: [], annots: [], resources: {} }
  return init({ type: 'Page', pdfKeys, props, defaults })
}

export function addContent (object, stream) {
  return { ...object, contents: [...object.contents, stream] }
}

export function replaceLastContent (object, stream) {
  return { ...object, contents: [...object.contents.slice(0, -1), stream] }
}

export function addAnnotation (object, annot) {
  return { ...object, annots: [...object.annots, annot] }
}

// OSX Preview respects BS, but draws a full border rather than underline.
// TODO: turn off link border completely and use graphics to underline text
export function addUriLink (
  object, { uri, x, y, x2, y2, color = [0, 0, 1], highlight = 'i', borderWidth = 1 }
) {
  const hlight = { n: '/N', i: '/I', o: '/O', p: '/P' }[highlight]
  const decColor = color.join(' ')
  const rect = ['[', x, y, x2, y2, ']'].join(' ')
  const target = /^#/.test(uri)
    ? `/Dest /${uri.replace(/^#/, '')}`
    : `/A << /Type /Action /S /URI /URI (${uri}) >>`
  const annot = `<<
/Type /Annot /Subtype /Link /Rect ${rect}
/H ${hlight}
/C [${decColor}]
${target}
/BS << /Type /Border/W ${borderWidth}/S /U >>
/Border [0 0 ${borderWidth}]
>>`
  return addAnnotation(object, annot)
}

export function setResources (object, resources) {
  return { ...object, resources }
}

export function addFont (object, font) {
  const resources = Resources.addFont(object.resources, font)
  return { ...object, resources }
}

export function addImage (object, handle, image) {
  const resources = Resources.addImage(object.resources, handle, image)
  return { ...object, resources }
}

export function getPdfObject (object) {
  const inflated = {
    ...object,
    resources: Resources.getPdfObject(object.resources),
    parent: pdfReference(object.parent)
  }
  const pdfString = toPdf(inflated)
  return `${getPdfHeadReference(object)}\n${pdfString}\nendobj\n`
}

