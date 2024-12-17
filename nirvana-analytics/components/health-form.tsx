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

export function HealthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [parsedPdfText, setParsedPdfText] = useState<string>('')
  const [error, setError] = useState<string>('')

  const form = useForm<HealthFormValues>({
    resolver: zodResolver(healthFormSchema),
    defaultValues: {
      age: 0,
      height: 0,
      weight: 0,
      weightUnit: 'kg',
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

      // Validate that we have PDF text if a file was uploaded
      if (data.bloodReport && !parsedPdfText) {
        throw new Error('Please wait for PDF processing to complete or try uploading again')
      }

      // Convert form data to HealthDataInput
      const healthData: HealthDataInput = {
        patientId: nanoid(),
        age: data.age,
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