import type { MongoClient } from 'mongodb'
import type { AccountRole, AccountStatus, IconType } from '@/lib/enumerators'

export {}

declare global {
  /**
   * @server-side-only
   * This allows the client to be reused across calls to the function.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined

  declare module Stratego.STS {
    declare module User {
      /**
       * User data cached in session cookie
       */
      export interface CookieData {
        id: Utils.UUID
        parentId?: Utils.UUID
        email: Auth.Email
        role: AccountRole
        status: AccountStatus
        iconType: IconType
        alias?: string
      }

      /**
       * User data cached in LocalStorage
       */
      export interface StoreData {
        icon?: string
      }
    }

    export module Auth {
      export interface HashedPassword extends String {}

      export interface Email extends `${string}@${string}.${string}` {}

      export type Credentials = {
        email: Email
        password: HashedPassword
      }

      export type Response<T extends boolean> = Extend<
        {
          authorized: T
        },
        T extends true
          ? {
              storeData: User.StoreData
            }
          : {
              storeData?: never
            }
      >
    }

    export module KPI {
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
}
