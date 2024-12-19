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

    // Get both health data and the most recent analysis from MongoDB
    const [healthData, analysis] = await Promise.all([
      getHealthData(userId),
      getHealthAnalysis(userId)
    ])

    if (!healthData || !analysis) {
      return NextResponse.json(
        { error: 'No analysis found' },
        { status: 404 }
      )
    }

    // Add timestamp to the response
    return NextResponse.json({
      healthData,
      analysis,
      timestamp: analysis.createdAt
    })
  } catch (error) {
    console.error('Results error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve results' },
      { status: 500 }
    )
  }
}