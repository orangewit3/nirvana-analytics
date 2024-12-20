import { NextResponse } from 'next/server'
import { storeHealthData, storeHealthAnalysis, getHealthData, getHealthAnalysis } from '@/lib/db'
import { CHRONIC_CONDITIONS } from '@/lib/utils'

export async function GET() {
  try {
    const userId = 'test-user-123'
    
    // Create dummy health data matching HealthDataInput schema
    const dummyHealthData = {
      userId,
      name: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      sex: 'M' as const,
      height: 175,
      weight: 70,
      address: {
        area: 'Menteng' as const,
        otherArea: undefined,
      },
      bloodPressure: {
        systolic: 120,
        diastolic: 80,
      },
      // Use array instead of readonly tuple
      chronicConditions: ['None'] as Array<typeof CHRONIC_CONDITIONS[number]>,
      otherChronicCondition: undefined,
      allergies: undefined,
      bloodReportText: 'Test blood report content',
      createdAt: new Date()
    }

    // Create dummy analysis matching HealthAnalysis schema
    const dummyAnalysis = {
      userId,
      overallHealthScore: {
        score: 8,
        scoringSystem: 'systemA' as const,
        explanation: 'Good overall health'
      },
      cholesterolLevels: {
        score: 2,
        scoringSystem: 'systemB' as const,
        explanation: 'Normal cholesterol levels'
      },
      diabetesRisk: {
        score: 1,
        scoringSystem: 'systemB' as const,
        explanation: 'Low diabetes risk'
      },
      fattyLiverRisk: {
        score: 2,
        scoringSystem: 'systemB' as const,
        explanation: 'Low fatty liver risk'
      },
      hypertensionRisk: {
        score: 3,
        scoringSystem: 'systemB' as const,
        explanation: 'Moderate hypertension risk'
      },
      createdAt: new Date()
    }

    // Store both using our helper functions
    const healthDataResult = await storeHealthData(userId, dummyHealthData)
    const analysisResult = await storeHealthAnalysis(userId, dummyAnalysis)

    // Test retrieving the stored data
    const retrievedHealthData = await getHealthData(userId)
    const retrievedAnalysis = await getHealthAnalysis(userId)

    return NextResponse.json({
      success: true,
      message: 'Test data stored and retrieved successfully',
      results: {
        stored: {
          healthData: healthDataResult,
          analysis: analysisResult
        },
        retrieved: {
          healthData: retrievedHealthData,
          analysis: retrievedAnalysis
        }
      }
    })

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to store test data'
      },
      { status: 500 }
    )
  }
} 