import { NextResponse } from 'next/server'
import { getHealthData, getHealthAnalysis } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get('userId')

    // Ensure the requested userId matches the authenticated user's id
    if (requestedUserId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get both health data and analysis from MongoDB
    const [healthData, analysis] = await Promise.all([
      getHealthData(session.user.id),
      getHealthAnalysis(session.user.id)
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