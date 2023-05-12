declare namespace Stratego.STS {
  export namespace User {
    /**
     * User data cached in session cookie
     */
    export interface CookieData {
      id: string
      email: string
      role: 'admin' | 'auditor' | 'client' | 'clientPeer'
      status: 'active' | 'inactive'
      iconType: 'url' | 'color' | 'none'
      alias?: string
    }

    /**
     * User data cached in LocalStorage
     */
    export interface StoreData {
      icon?: string
    }
  }

  export namespace Auth {
    export interface HashedPassword extends String {}

    export interface Email extends `${string}@${string}.${string}` {}

    export type Credentials = {
      email: Email
      password: HashedPassword
    }

    export type Response<T extends boolean> = {
      authorized: T
    } & (T extends true ? {
      storeData: User.StoreData
    } : {
      storeData?: never
    })
  }

  export namespace KPI {
    export type Type = 'project' | 'ticket'

    export type Projects = {
      active: number
      closed: number
    }

    export type Tickets = {
      open: number
      closed: number
      resolved: number
    }

    export type TicketsByProject = {
      id: string
      name: string
      tickets: Tickets
    }

    export type Full = {
      projects: Projects
      tickets: Tickets
      ticketsByProject: Array<TicketsByProject>
    }
  }

  export namespace Utils {
    export type UUID = `${string}-${string}-${string}-${string}-${string}`
  }
}
