import { NextRequest, NextResponse } from 'next/server'
import { healthAnalysisSchema } from '@/lib/utils'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const healthData = await req.json()
    
    // Calculate BMI
    const bmi = healthData.weight / Math.pow(healthData.height / 100, 2)
    
    // Prepare the prompt for OpenAI
    const prompt = `Analyze the following health data and provide a structured analysis:
    
Patient Information:
- Age: ${healthData.age} years
- Sex: ${healthData.sex}
- Height: ${healthData.height} cm
- Weight: ${healthData.weight} kg
- BMI: ${bmi.toFixed(1)}
- Location: ${healthData.area} 
${healthData.bloodPressure?.systolic ? `- Blood Pressure: ${healthData.bloodPressure.systolic}/${healthData.bloodPressure.diastolic} mmHg` : ''}
${healthData.chronicConditions?.length > 0 ? `- Chronic Conditions: ${healthData.chronicConditions.join(', ')}` : '- No Chronic Conditions'}
${healthData.otherChronicCondition ? `- Other Condition: ${healthData.otherChronicCondition}` : ''}
${healthData.allergies ? `- Allergies: ${healthData.allergies}` : '- No Known Allergies'}
${healthData.bloodReportText ? `\nBlood Report Analysis:\n${healthData.bloodReportText}` : ''}

Based on the comprehensive patient data above, provide a JSON response with the following structure for each health category:
- score: for the overall health score, a number from 0-10 (0 being worst, 10 being best), for other categories, a number from 0-10 (0 being best, 10 being worst)
    - there are 2 scoring systems:
        - systemA: a number from 0-10 (0 being worst, 10 being best)
        - systemB: a number from 0-10 (0 being best, 10 being worst)
- explanation: detailed explanation considering all available patient data including:
  * Age and sex-specific factors
  * BMI implications
  * Blood pressure readings (if available)
  * Chronic conditions and their impact
  * Allergies and their significance
  * Blood report markers
  * Location-based health considerations

Categories to analyze:
- overallHealthScore (considering all factors holistically) - systemA
- cholesterolLevels (based on blood report and risk factors) - systemB
- diabetesRisk (considering family history, BMI, and blood markers) - systemB
- fattyLiverRisk (based on BMI, lifestyle indicators, and blood markers) - systemB
- hypertensionRisk (considering blood pressure, age, and other risk factors) - systemB
Example response format:
{
  "overallHealthScore": {
    "score": 8,
    "scoringSystem": "systemA",
    "explanation": "Patient shows good overall health indicators considering age and sex..."
  },
  "cholesterolLevels": {
    "score": 4,
    "scoringSystem": "systemB",
    "explanation": "Moderate risk based on blood markers and existing conditions..."
  }
    "diabetesRisk": {
    "score": 7,
    "scoringSystem": "systemB",
    "explanation": "High risk based on blood markers and existing conditions..."
  }
  // ... other categories
}`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a medical analysis AI that provides structured health score analysis based on comprehensive patient data. Consider all provided information including demographics, vital signs, chronic conditions, allergies, and blood report values. Provide evidence-based assessments while accounting for individual patient characteristics and risk factors. The response must strictly follow the given JSON schema.",
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