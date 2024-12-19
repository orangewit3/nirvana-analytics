'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { HealthFormFields } from './health-form-fields'
import { PdfUpload } from './pdf-upload'
import { healthFormSchema, type HealthFormValues, type HealthDataInput } from '@/lib/utils'
import { nanoid } from 'nanoid'

function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export function HealthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [parsedPdfText, setParsedPdfText] = useState<string>('')
  const [error, setError] = useState<string>('')

  const form = useForm<HealthFormValues>({
    resolver: zodResolver(healthFormSchema),
    defaultValues: {
      name: '',
      height: 0,
      weight: 0,
      weightUnit: 'kg',
      chronicConditions: [],
      bloodPressure: {
        systolic: undefined,
        diastolic: undefined,
      },
    },
  })

  async function handlePdfUpload(file: File) {
    try {
      setError('')
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/pdf', {
        method: 'POST',
        body: formData,
      })

      // Debug logging
      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))
      const responseText = await response.text()
      console.log('Response text:', responseText)

      // Try to parse as JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        console.error('JSON parse error:', e)
        throw new Error('Server response was not valid JSON')
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse PDF')
      }

      if (!result.text) {
        throw new Error('No text content found in PDF')
      }

      setParsedPdfText(result.text)
    } catch (error) {
      console.error('PDF upload error:', error)
      setError(error.message || 'Failed to process PDF file. Please try again.')
      // Reset the file input
      form.setValue('bloodReport', undefined)
    }
  }

  const onSubmit = async (data: HealthFormValues) => {
    console.log("Form submitted with data:", data)
    try {
      setError('')
      setIsLoading(true)

      // Calculate age from date of birth
      const age = calculateAge(data.dateOfBirth)

      // Convert form data to HealthDataInput
      const healthData: HealthDataInput = {
        patientId: nanoid(),
        name: data.name,
        dateOfBirth: data.dateOfBirth,
        age,
        height: data.height,
        weight: data.weight,
        bloodReportText: parsedPdfText || '',
        createdAt: new Date(),
      }

      console.log('Sending health data:', healthData)

      // Send data for analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(healthData),
      })

      console.log('Analysis response status:', response.status)
      const responseText = await response.text()
      console.log('Analysis response text:', responseText)

      if (!response.ok) {
        throw new Error(`Analysis failed: ${responseText}`)
      }

      const analysis = JSON.parse(responseText)
      
      // Store both the input data and analysis results
      localStorage.setItem('healthData', JSON.stringify(healthData))
      localStorage.setItem('healthAnalysis', JSON.stringify(analysis))
      
      console.log('Stored data:', {
        healthData: JSON.parse(localStorage.getItem('healthData') || '{}'),
        analysis: JSON.parse(localStorage.getItem('healthAnalysis') || '{}')
      })

      // Use Next.js router for navigation
      window.location.href = '/results'
    } catch (error) {
      console.error('Submit error:', error)
      setError(error.message || 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6"
        noValidate
      >
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        <HealthFormFields form={form} />
        <PdfUpload 
          form={form} 
          onFileSelect={handlePdfUpload}
        />
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'What\'s my health score?'}
        </Button>
      </form>
    </Form>
  )
} 