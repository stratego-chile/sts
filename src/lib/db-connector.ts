import { mongoConnector } from '@stratego-sts/lib/mongodb'

export class Connector {
  /**
   * @server-side-only
   */
  static async connect() {
    const client = (await mongoConnector).db(process.env.MONGODB_NAME)

    return client
  }
}
