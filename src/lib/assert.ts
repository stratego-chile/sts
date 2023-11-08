import fromUnixTime from 'date-fns/fromUnixTime'
import isDate from 'date-fns/isDate'
import isNumber from 'lodash.isnumber'
import isPlainObject from 'lodash.isplainobject'

export function isSerializable<T extends object | Primitive>(
  item: any,
): item is Stringified<T> {
  let isNestedSerializable = false

  const isPlain = (value: any) => {
    return (
      typeof value === 'undefined' ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      Array.isArray(value) ||
      isPlainObject(value)
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

export function isTimestamp(sample: any): sample is number {
  return isDate(sample) || (isNumber(sample) && isDate(fromUnixTime(sample)))
}
