import { NextResponse } from 'next/server'
import { storeHealthData, storeHealthAnalysis, getHealthData, getHealthAnalysis } from '@/lib/db'

export async function GET() {
  try {
    // Create dummy health data
    const dummyHealthData = {
      patientId: 'test123',
      name: 'Test User',
      dateOfBirth: new Date('1990-01-01'),
      age: 33,
      sex: 'M' as const,
      height: 175,
      weight: 70,
      address: {
        area: 'Menteng' as const,
      },
      bloodPressure: {
        systolic: 120,
        diastolic: 80,
      },
      chronicConditions: ['None'],
      bloodReportText: 'Test blood report content',
      createdAt: new Date()
    }

    // Create dummy analysis
    const dummyAnalysis = {
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
      }
    }

    // Store both using our helper functions
    const userId = 'test-user-123'
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
        error: error.message || 'Failed to store test data'
      },
      { status: 500 }
    )
  }
} 