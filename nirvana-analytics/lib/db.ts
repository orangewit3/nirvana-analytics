import { MongoClient } from 'mongodb'
import { HealthDataInput, HealthAnalysis, HealthDataInputSchema, healthAnalysisSchema } from '@/lib/utils'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

const uri = process.env.MONGODB_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
      .catch(err => {
        console.error('MongoDB connection error:', err)
        throw err
      })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
    .catch(err => {
      console.error('MongoDB connection error:', err)
      throw err
    })
}

// Helper functions to get database instance
export async function getDb() {
  const client = await clientPromise
  return client.db('nirvanaAnalytics')
}

// Helper functions for healthDataInputs collection
export async function storeHealthData(userId: string, data: HealthDataInput) {
  const db = await getDb()
  const collection = db.collection<HealthDataInput>('healthDataInputs')
  
  // Validate data against schema before storing
  const validatedData = HealthDataInputSchema.parse({
    ...data,
    userId // Ensure userId is included
  })
  return await collection.insertOne(validatedData)
}

export async function getHealthData(userId: string) {
  const db = await getDb()
  const collection = db.collection<HealthDataInput>('healthDataInputs')
  
  // Log the query for debugging
  
  const result = await collection.findOne({ userId })
  
  return result
}

// Helper functions for healthAnalyses collection
export async function storeHealthAnalysis(userId: string, analysis: HealthAnalysis) {
  const db = await getDb()
  const collection = db.collection<HealthAnalysis>('healthAnalyses')
  
  // Validate analysis against schema before storing
  const validatedAnalysis = healthAnalysisSchema.parse(analysis)
  
  return await collection.insertOne({
    ...validatedAnalysis,
    createdAt: new Date()
  })
}

export async function getHealthAnalysis(userId: string) {
  const db = await getDb()
  const collection = db.collection<HealthAnalysis>('healthAnalyses')
  
  // Log the query for debugging
  
  const result = await collection.findOne(
    { userId },
    { sort: { createdAt: -1 } }
  )
  
  return result
}

// Export a module-scoped MongoClient promise
export default clientPromise 