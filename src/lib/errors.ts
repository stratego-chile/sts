import { ErrorType } from '@/lib/enumerators'

export const getErrorCode = (errorType: ErrorType) => {
  let index = 0

  const errorTypes = Object.values(ErrorType)

  while (errorTypes.at(index) !== errorType) index++

  return index.toString(16)
}

export const EmitError = (errorType: ErrorType, error: unknown) => {
  console.warn(`(Error ${getErrorCode(errorType)}) [${errorType}]:`, error)
}
