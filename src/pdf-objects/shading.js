
import * as objects from './'

const pdfKeys = [
  'ShadingType', // integer
    // 1 Function-based shading
    // 2 Axial shading             ** this is the only one implemented so far
    // 3 Radial shading
    // 4 Free-form Gouraud-shaded triangle mesh
    // 5 Lattice-form Gouraud-shaded triangle mesh
    // 6 Coons patch mesh
    // 7 Tensor-product patch mesh

  'ColorSpace', // name or array
  'Background', // array
  'BBox', // rectangle (left, bottom, right, top)
  'AntiAlias', // boolean

  // type 2 specifics
  'Coords',
  'Domain',
  'Function',
  'Extend'
]

export function create (props) {
  return objects.init({ type: 'Pattern', shadingtype: 2, pdfKeys, props })
}

export function getPdfObject (object) {
  const pdf = objects.toPdf(object)
  return `${objects.getPdfHeadReference(object)}
${pdf}
endobj`
}
