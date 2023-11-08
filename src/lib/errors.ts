export enum ErrorType {
  // Data errors
  DataFetchError = 'DATA_FETCH_ERROR',
  DataSaveError = 'DATA_SAVE_ERROR',
  DataDeleteError = 'DATA_DELETE_ERROR',
  DataUpdateError = 'DATA_UPDATE_ERROR',
  DataNotFoundError = 'DATA_NOT_FOUND_ERROR',
  DataAlreadyExistsError = 'DATA_ALREADY_EXISTS_ERROR',
  DataValidationError = 'DATA_VALIDATION_ERROR',

  // Authentication errors
  AuthenticationError = 'AUTHENTICATION_ERROR',

  // Service errors
  ServiceError = 'SERVICE_ERROR',
  ServiceUnavailableError = 'SERVICE_UNAVAILABLE_ERROR',
  ServiceTimeoutError = 'SERVICE_TIMEOUT_ERROR',
  ServiceNotFoundError = 'SERVICE_NOT_FOUND_ERROR',
  ServiceUnauthorizedError = 'SERVICE_UNAUTHORIZED_ERROR',

  // System errors
  SystemError = 'SYSTEM_ERROR',
  SystemUnavailableError = 'SYSTEM_UNAVAILABLE_ERROR',
  SystemTimeoutError = 'SYSTEM_TIMEOUT_ERROR',
  SystemNotFoundError = 'SYSTEM_NOT_FOUND_ERROR',
  SystemUnauthorizedError = 'SYSTEM_UNAUTHORIZED_ERROR',

  // Unknown errors
  UnknownError = 'UNKNOWN_ERROR',
}

export function getErrorCode(errorType: ErrorType) {
  let index = 0

  const errorTypes = Object.values(ErrorType)

  while (errorTypes.at(index) !== errorType) index++

  return index.toString(16)
}

export function EmitError(errorType: ErrorType, error: unknown) {
  console.warn(`(Error ${getErrorCode(errorType)}) [${errorType}]:`, error)
}
