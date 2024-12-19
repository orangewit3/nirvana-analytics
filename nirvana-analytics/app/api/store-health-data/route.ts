import { NextResponse } from 'next/server'
import { storeHealthData } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    // Convert date strings back to Date objects
    const healthData = {
      ...data,
      dateOfBirth: new Date(data.dateOfBirth),
      createdAt: new Date(data.createdAt)
    }
    
    // Store in MongoDB - userId is now part of healthData
    await storeHealthData(healthData.userId, healthData)

    return NextResponse.json({ userId: healthData.userId })
  } catch (error) {
    console.error('Store health data error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to store health data' },
      { status: 500 }
    )
  }
}