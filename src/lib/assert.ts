import isPlainObject from 'lodash.isplainobject'

export const isSerializable = (item: any) => {
  let isNestedSerializable = false

  const isPlain = (val: any) => {
    return (
      typeof val === 'undefined' ||
      typeof val === 'string' ||
      typeof val === 'boolean' ||
      typeof val === 'number' ||
      Array.isArray(val) ||
      isPlainObject(val)
    )
  }

  if (!isPlain(item)) return false

  for (const property in item) {
    if (item.hasOwnProperty(property)) {
      if (!isPlain(item[property])) return false

      if (typeof item[property] == 'object') {
        isNestedSerializable = isSerializable(item[property])

        if (!isNestedSerializable) return false
      }
    }
  }

  return true
}
