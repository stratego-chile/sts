// General purpose enumerators

export enum CookiesConsenting {
  Necessary = 'necessary',
  Analytics = 'analytics',
  // Performance = 'performance', // TODO: implement performance analytics
}

export enum MFAMode {
  TOTP = 'TOTP',
  Recovery = 'Recovery',
  // SecurityKey = 'SecurityKey', // TODO: integrate hardware-based MFA
}

export enum SettingId {
  Profile = 'profile',
  Notifications = 'notifications',
  Security = 'security',
}

export enum StatFilterType {
  Date = 'date',
}

export enum StatFilter {
  ProjectDate = 'projectDate',
  TicketDate = 'ticketDate',
}

export enum VisibilityMode {
  Columns = 'columns',
  Rows = 'rows',
  Table = 'table',
}

export enum TimeRange {
  Years = 'years',
  Months = 'months',
  Days = 'days',
  Hours = 'hours',
  Minutes = 'minutes',
  Seconds = 'seconds',
}
