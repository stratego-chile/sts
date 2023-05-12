import { mongoConnector } from '@stratego-sts/lib/mongodb'

export class Connector {
  static async connect() {
    try {
      const mongoClient = await mongoConnector

      return mongoClient.db(process.env.MONGODB_NAME)
    } catch {
      return undefined
    }
  }
}
