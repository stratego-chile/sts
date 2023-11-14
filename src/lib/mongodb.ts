import { MongoClient, type MongoClientOptions } from 'mongodb'

let mongoClient!: MongoClient

let clientPromise!: Promise<MongoClient>

function getConnection() {
  const uri = process.env.MONGODB_URI

  const options: Readonly<MongoClientOptions> = Object.freeze({
    rejectUnauthorized: true,
  })

  return new MongoClient(uri, options)
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    mongoClient = getConnection()
    global._mongoClientPromise = mongoClient.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  mongoClient = getConnection()
  clientPromise = mongoClient.connect()
}

export { clientPromise as mongoConnector }
