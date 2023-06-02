//#region Statuses
export enum AccountStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export enum ProjectStatus {
  Draft = 'draft',
  Active = 'active',
  Closed = 'closed',
}

export enum TicketStatus {
  Draft = 'draft',
  Open = 'open',
  Closed = 'closed',
  Resolved = 'resolved',
}
//#endregion

//#region misc
export enum AccountRole {
  /**
   * STS admin role. No suitable for public use
   */
  Admin = 'admin',
  /**
   * A read only user
   */
  Auditor = 'auditor',
  /**
   * A basic client account
   */
  Client = 'client',
  /**
   * A client sub-account or role. LImited to a single parent (client) account
   */
  ClientPeer = 'clientPeer',
}

export enum IconType {
  None = 'none',
  Color = 'color',
  Image = 'url',
}

export enum SettingId {
  Profile = 'profile',
  Notifications = 'notifications',
  Security = 'security',
}

export enum StatFilter {
  Date = 'date',
  Category = 'category',
}
//#endregion

//#region Errors
export enum ErrorType {
  // Data errors
  DATA_FETCH_ERROR = 'DATA_FETCH_ERROR',
  DATA_SAVE_ERROR = 'DATA_SAVE_ERROR',
  DATA_DELETE_ERROR = 'DATA_DELETE_ERROR',
  DATA_UPDATE_ERROR = 'DATA_UPDATE_ERROR',
  DATA_NOT_FOUND_ERROR = 'DATA_NOT_FOUND_ERROR',
  DATA_ALREADY_EXISTS_ERROR = 'DATA_ALREADY_EXISTS_ERROR',
  DATA_VALIDATION_ERROR = 'DATA_VALIDATION_ERROR',

  // Authentication errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',

  // Service errors
  SERVICE_ERROR = 'SERVICE_ERROR',
  SERVICE_UNAVAILABLE_ERROR = 'SERVICE_UNAVAILABLE_ERROR',
  SERVICE_TIMEOUT_ERROR = 'SERVICE_TIMEOUT_ERROR',
  SERVICE_NOT_FOUND_ERROR = 'SERVICE_NOT_FOUND_ERROR',
  SERVICE_UNAUTHORIZED_ERROR = 'SERVICE_UNAUTHORIZED_ERROR',

  // System errors
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_UNAVAILABLE_ERROR = 'SYSTEM_UNAVAILABLE_ERROR',
  SYSTEM_TIMEOUT_ERROR = 'SYSTEM_TIMEOUT_ERROR',
  SYSTEM_NOT_FOUND_ERROR = 'SYSTEM_NOT_FOUND_ERROR',
  SYSTEM_UNAUTHORIZED_ERROR = 'SYSTEM_UNAUTHORIZED_ERROR',

  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
//#endregion
