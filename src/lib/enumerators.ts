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
//#endregion
