import { NextResponse } from 'next/server'
import { getHealthData, getHealthAnalysis } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get both health data and analysis from MongoDB
    const [healthData, analysis] = await Promise.all([
      getHealthData(userId),
      getHealthAnalysis(userId)
    ])

    if (!healthData || !analysis) {
      return NextResponse.json(
        { error: 'Data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      healthData,
      analysis
    })
  } catch (error) {
    console.error('Results error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve results' },
      { status: 500 }
    )
  }
}