import zlib from 'zlib'
import _map from 'lodash/map'

import * as objects from './'

const pdfKeys = ['Length', 'Filter', 'Length1']

export function create (props) {
  const defaults = { filter: 'FlateDecode' }
  return objects.init({ type: 'ToUnicode', pdfKeys, props, defaults })
}

export function getPdfObject (object) {
  const cmap = _map(object.data, (uni, code) => {
    const unicode = `0000${uni.toString(16)}`.slice(-4)
    return `<${(+code).toString(16)}><${unicode}>`
  })
  const data = `/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo <<
  /Registry (Adobe)
  /Ordering (UCS)
  /Supplement 0
>> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<00><ff>
endcodespacerange
${cmap.length} beginbfchar\n${cmap.join('\n')}\nendbfchar
endcmap
CMapName currentdict /CMap defineresource pop
end
end
`
  const length1 = data.length
  const buffer = new Buffer(zlib.deflateSync(data), 'binary')
  const length = buffer.length + 1
  return objects.objectToPdfStream({ ...object, length1, data: buffer, length })
}

