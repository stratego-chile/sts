import { isTimestamp } from '@/lib/assert'
import { StatFilter } from '@/lib/enumerators'
import { Projects } from '@/models/projects'
import { ProjectStatus } from '@/schemas/project'
import { TicketStatus } from '@/schemas/ticket'

type StatOptions = {
  ownerId?: Stratego.STS.Utils.UUID
  filters?: Stratego.STS.KPI.Filters
}

enum GetterMode {
  Maintainer = 'maintainer',
  User = 'user',
}

export class Stats {
  private readonly projectStats = Object.values(ProjectStatus).reduce(
    (schema, key) => {
      schema[key] = 0
      return schema
    },
    {} as Stratego.STS.KPI.Projects,
  )

  private readonly ticketStats = Object.values(TicketStatus).reduce(
    (schema, key) => {
      schema[key] = 0
      return schema
    },
    {} as Stratego.STS.KPI.Tickets,
  )

  private readonly stats: Stratego.STS.KPI.Full = {
    projects: { ...this.projectStats },

    tickets: { ...this.ticketStats },

    ticketsByProject: [],
  }

  static async getAll<
    Mode extends GetterMode,
    Stat extends Mode extends GetterMode.Maintainer
      ? OmittedRequired<Stratego.STS.KPI.Full, 'ticketsByProject'>
      : Stratego.STS.KPI.Full,
  >(mode: Mode, options?: StatOptions): Promise<Stat> {
    const statsInstance = new Stats()

    const stats = statsInstance.stats as Stat

    let projects = options?.ownerId
      ? await Projects.getProjectsByOwnerId(options?.ownerId)
      : await Projects.getAll()

    if (
      options?.filters?.[StatFilter.ProjectDate] &&
      options.filters![StatFilter.ProjectDate].length >= 2
    ) {
      const [from, to] = options.filters[StatFilter.ProjectDate]!

      if (isTimestamp(from) && isTimestamp(to)) {
        projects = projects.filter(({ createdAt }) => {
          return createdAt >= from && createdAt <= to
        })
      }
    }

    projects.forEach(({ id, name, tickets, status }) => {
      Object.values(ProjectStatus).forEach(($status) => {
        if (status === $status) stats.projects[$status]++
      })

      const projectStats =
        mode === GetterMode.User
          ? ({
              id,
              name,
              tickets: {
                ...statsInstance.ticketStats, // Spread to avoid mutation
              },
            } as Stratego.STS.KPI.TicketsByProject)
          : undefined

      tickets.forEach(({ versions }) => {
        const ticket = versions.at(-1)!

        if (
          options?.filters?.[StatFilter.TicketDate] &&
          options.filters![StatFilter.TicketDate].length >= 2
        ) {
          const [from, to] = options.filters[StatFilter.TicketDate]!

          if (isTimestamp(from) && isTimestamp(to)) {
            if (ticket.createdAt >= from && ticket.createdAt <= to) {
              Object.values(TicketStatus).forEach(($status) => {
                if (ticket.status === $status) {
                  stats.tickets[ticket.status]++

                  if (projectStats) projectStats.tickets[ticket.status]++
                }
              })
            }
          }
        } else {
          Object.values(TicketStatus).forEach(($status) => {
            if (ticket.status === $status) {
              stats.tickets[ticket.status]++

              if (projectStats) projectStats.tickets[ticket.status]++
            }
          })
        }
      })

      if (projectStats && status === ProjectStatus.Active)
        if (stats.ticketsByProject instanceof Array)
          stats.ticketsByProject.push(projectStats)
        else stats.ticketsByProject = [projectStats]
    })

    if (mode === GetterMode.Maintainer) {
      delete stats.ticketsByProject
    }

    return stats
  }

  static async getAdminStats(filters?: Stratego.STS.KPI.Filters) {
    return Stats.getAll(GetterMode.Maintainer, {
      filters,
    })
  }

  static async getDashboardStats(
    ownerId: Stratego.STS.Utils.UUID,
    filters?: Stratego.STS.KPI.Filters,
  ) {
    return Stats.getAll(GetterMode.User, {
      ownerId,
      filters,
    })
  }
}
