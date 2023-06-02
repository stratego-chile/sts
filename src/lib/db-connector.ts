import { mongoConnector } from '@/lib/mongodb'

export class Connector {
  /**
   * @server-side-only
   */
  static async connect() {
    const connector = await mongoConnector

    const client = connector.db(process.env.MONGODB_NAME)

    return client
  }
}
