import type { MongoClient } from 'mongodb'

export {}

declare global {
  /**
   * @server-side-only
   * This allows the client to be reused across calls to the function.
   */
  var _mongoClientPromise: Promise<MongoClient> | undefined
}
