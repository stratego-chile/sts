import { mongoConnector } from '@stratego-sts/lib/mongodb'

export class Connector {
  /**
   * @server-side-only
   */
  static async connect() {
    try {
      const mongoClient = await mongoConnector

      return mongoClient.db(process.env.MONGODB_NAME)
    } catch (error) {
      console.error(error)

      return undefined
    }
  }
}
