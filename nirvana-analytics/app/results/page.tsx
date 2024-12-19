'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { HealthScoreWidget } from '@/components/health-score-widget'
import { Button } from '@/components/ui/button'
import type { HealthAnalysis, HealthDataInput } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null)
  const [healthData, setHealthData] = useState<HealthDataInput | null>(null)
  const [error, setError] = useState<string>('')
  const [analysisDate, setAnalysisDate] = useState<Date | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = searchParams.get('userId')
        if (!userId) {
          throw new Error('No userId provided')
        }

        const response = await fetch(`/api/results?userId=${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch results')
        }

        const data = await response.json()
        setHealthData(data.healthData)
        setAnalysis(data.analysis)
        setAnalysisDate(new Date(data.timestamp))
      } catch (error) {
        console.error('Results page error:', error)
        setError(error.message || 'Failed to load analysis results')
        setTimeout(() => router.push('/'), 2000)
      }
    }

    fetchData()
  }, [searchParams, router])

  const handleDownloadReport = async () => {
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          healthData,
          analysis,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      // Get the blob from the response
      const blob = await response.blob()
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob)
      
      // Create a temporary link and click it to download
      const a = document.createElement('a')
      a.href = url
      a.download = 'health-report.pdf'
      document.body.appendChild(a)
      a.click()
      
      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      // You might want to show an error toast here
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateBMI = (weight: number, height: number) => {
    return (weight / Math.pow(height / 100, 2)).toFixed(1)
  }

  const handleNewAnalysis = () => {
    window.location.href = '/?new=true'
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-red-500">{error}</p>
        <p className="text-sm text-muted-foreground mt-2">Redirecting back to form...</p>
      </div>
    )
  }

  if (!analysis || !healthData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Loading analysis results...</p>
      </div>
    )
  }

  const categories = [
    { key: 'overallHealthScore', title: 'Overall Health Score', system: 'systemA' },
    { key: 'cholesterolLevels', title: 'Cholesterol Levels', system: 'systemB' },
    { key: 'diabetesRisk', title: 'Diabetes Risk', system: 'systemB' },
    { key: 'fattyLiverRisk', title: 'Fatty Liver Risk', system: 'systemB' },
    { key: 'hypertensionRisk', title: 'Hypertension Risk', system: 'systemB' },
  ] as const

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-end mb-6">
        <Button 
          onClick={handleNewAnalysis}
          variant="outline"
        >
          Start New Analysis
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Health Analysis</h1>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Analysis based on your health data and blood report
          </p>
          {analysisDate && (
            <p className="text-sm text-muted-foreground">
              Analyzed on: {formatDate(analysisDate)}
            </p>
          )}
        </div>
      </div>

      {/* Enhanced Patient Info Summary */}
      <div className="mb-8 p-6 bg-muted/50 rounded-lg">
        <h2 className="font-semibold mb-4 text-lg">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>{' '}
            {healthData.name}
          </div>
          <div>
            <span className="text-muted-foreground">Date of Birth:</span>{' '}
            {formatDate(new Date(healthData.dateOfBirth))}
          </div>
          <div>
            <span className="text-muted-foreground">Age:</span>{' '}
            {healthData.age} years
          </div>
          <div>
            <span className="text-muted-foreground">Sex:</span>{' '}
            {healthData.sex === 'M' ? 'Male' : 'Female'}
          </div>
          <div>
            <span className="text-muted-foreground">Height:</span>{' '}
            {healthData.height} cm
          </div>
          <div>
            <span className="text-muted-foreground">Weight:</span>{' '}
            {healthData.weight} kg
          </div>
          <div>
            <span className="text-muted-foreground">BMI:</span>{' '}
            {calculateBMI(healthData.weight, healthData.height)}
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>{' '}
            {healthData.area}{healthData.otherArea ? ` - ${healthData.otherArea}` : ''}
          </div>
          {healthData.bloodPressure?.systolic && (
            <div>
              <span className="text-muted-foreground">Blood Pressure:</span>{' '}
              {healthData.bloodPressure.systolic}/{healthData.bloodPressure.diastolic} mmHg
            </div>
          )}
          {healthData.chronicConditions?.length > 0 && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Chronic Conditions:</span>{' '}
              {healthData.chronicConditions.join(', ')}
              {healthData.otherChronicCondition && ` - ${healthData.otherChronicCondition}`}
            </div>
          )}
          {healthData.allergies && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Allergies:</span>{' '}
              {healthData.allergies}
            </div>
          )}
        </div>
      </div>

      {/* Health Score Widgets Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {categories.map(({ key, title, system }) => (
          <HealthScoreWidget
            key={key}
            title={title}
            score={analysis[key].score}
            scoringSystem={system}
            explanation={analysis[key].explanation}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <Button 
          variant="outline"
          onClick={() => router.push('/')}
        >
          Start New Analysis
        </Button>
        <Button
          onClick={handleDownloadReport}
        >
          Download Full Report
        </Button>
      </div>
    </main>
  )
} 