import { ProjectStatus } from '@/lib/enumerators'
import { Projects } from '@/models/projects'

export class Stats {
  static async getAdminStats() {
    const stats: Omit<Stratego.STS.KPI.Full, 'ticketsByProject'> = {
      projects: {
        closed: 0,
        active: 0,
      },
      tickets: {
        closed: 0,
        open: 0,
        resolved: 0,
      },
    }

    const projects = await Projects.getAll()

    projects.forEach(({ tickets, status }) => {
      if (status === 'closed') {
        stats.projects.closed++
      }

      if (status === 'active') {
        stats.projects.active++
      }

      tickets.forEach(({ versions }) => {
        const ticket = versions.at(-1)!

        if (ticket.status === 'closed') stats.tickets.closed++

        if (ticket.status === 'open') stats.tickets.open++

        if (ticket.status === 'resolved') stats.tickets.resolved++
      })
    })

    return stats
  }

  static async getDashboardStats(ownerId: Stratego.STS.Utils.UUID) {
    const stats: Stratego.STS.KPI.Full = {
      projects: {
        closed: 0,
        active: 0,
      },
      tickets: {
        closed: 0,
        open: 0,
        resolved: 0,
      },
      ticketsByProject: [],
    }

    const projects = await Projects.getProjectsByOwnerId(ownerId)

    projects.forEach(({ id, name, tickets, status }) => {
      if (status === 'closed') {
        stats.projects.closed++
      }

      if (status === 'active') {
        stats.projects.active++
      }

      const projectStats: Stratego.STS.KPI.TicketsByProject = {
        id,
        name,
        tickets: {
          closed: 0,
          open: 0,
          resolved: 0,
        },
      }

      tickets.forEach(({ versions }) => {
        const ticket = versions.at(-1)!

        if (ticket.status === 'closed') {
          stats.tickets.closed++
          projectStats.tickets.closed++
        }

        if (ticket.status === 'open') {
          stats.tickets.open++
          projectStats.tickets.open++
        }

        if (ticket.status === 'resolved') {
          stats.tickets.resolved++
          projectStats.tickets.resolved++
        }
      })

      if (status === ProjectStatus.Active)
        stats.ticketsByProject.push(projectStats)
    })

    return stats
  }
}
