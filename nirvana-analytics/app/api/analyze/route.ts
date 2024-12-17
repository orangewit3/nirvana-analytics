import { NextRequest, NextResponse } from 'next/server'
import { healthAnalysisSchema } from '@/lib/utils'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const healthData = await req.json()
    
    // Prepare the prompt for OpenAI
    const prompt = `Analyze the following health data and provide a structured analysis:
    
Patient Data:
- Age: ${healthData.age} years
- Height: ${healthData.height} cm
- Weight: ${healthData.weight} kg
${healthData.bloodReportText ? `\nBlood Report Contents:\n${healthData.bloodReportText}` : ''}

Provide a JSON response with the following structure for each health category:
- score: number from 0-10 (0 being worst, 10 being best)
- explanation: brief explanation of the score

Categories to analyze:
- overallHealthScore
- cholesterolLevels
- diabetesRisk
- fattyLiverRisk
- hypertensionRisk

Example response format:
{
  "overallHealthScore": {
    "score": 8,
    "explanation": "Patient shows good overall health indicators..."
  },
  "cholesterolLevels": {
    "score": 7,
    "explanation": "Cholesterol levels are within normal range..."
  }
  // ... other categories
}`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical analysis AI that provides structured health score analysis based on health data and blood report parameters. Provide accurate, evidence-based assessments that take into account all patient data including age, BMI, and blood report values. The response must strictly follow the given JSON schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    })

    const analysis = completion.choices[0].message.content
    if (!analysis) {
      throw new Error('No analysis received from OpenAI')
    }

    // Parse and validate the response
    const parsedAnalysis = JSON.parse(analysis)
    const validatedAnalysis = healthAnalysisSchema.parse(parsedAnalysis)
    console.log(validatedAnalysis)

    return NextResponse.json(validatedAnalysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze health data' },
      { status: 500 }
    )
  }
} 