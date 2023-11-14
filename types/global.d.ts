import type { StatFilter } from '@/lib/enumerators'
import type { ProjectStatus } from '@/schemas/project'
import type { TicketStatus } from '@/schemas/ticket'
import type { AccountRole, AccountStatus, IconType } from '@/schemas/user'
import type { MongoClient } from 'mongodb'

export {}

declare global {
  /**
   * @server-side-only
   *
   * @development-only
   *
   * This allows the Mongo client to be reused across API calls.
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
      }

      /**
       * User data cached in LocalStorage
       */
      export interface StoreData {
        icon?: {
          type: IconType
          value: string
        }
      }
    }

    export module Auth {
      export interface HashedPassword extends String {}

      export interface Email extends `${string}@${string}.${string}` {}

      export type Credentials = {
        email: Email
        password: HashedPassword
      }

      export type Login = Credentials & {
        remember?: boolean
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
      export type Type = 'project' | 'ticket' | 'ticketsByProject'

      export type Filters = {
        [StatFilter.ProjectDate]?: [from: number, to: number]
        [StatFilter.TicketDate]?: [from: number, to: number]
      }

      export type Projects = Record<ProjectStatus, number>

      export type Tickets = Record<TicketStatus, number>

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

    export module Utils {
      /**
       * A UUID v4 string
       */
      export type UUID = `${string}-${string}-4${string}-${string}-${string}`
    }
  }
}
