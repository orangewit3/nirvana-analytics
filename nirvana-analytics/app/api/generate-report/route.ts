import { NextRequest } from 'next/server'
import PDFDocument from 'pdfkit'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateReportContent(healthData: any, analysis: any) {
  const prompt = `Generate a comprehensive health report based on the following data:

Patient Information:
- Age: ${healthData.age} years
- Height: ${healthData.height} cm
- Weight: ${healthData.weight} kg
${healthData.bloodReportText ? `\nBlood Report Contents:\n${healthData.bloodReportText}` : ''}

Health Analysis Scores:
${Object.entries(analysis).map(([key, value]: [string, any]) => 
  `- ${key}: ${value.score}/10 - ${value.explanation}`
).join('\n')}

Please provide a detailed report with the following sections:
1. Executive Summary
2. Detailed Health Analysis
3. Risk Factors
4. Lifestyle Recommendations
5. Dietary Recommendations
6. Exercise Recommendations
7. Follow-up Recommendations

Format each section with clear headings and detailed, actionable insights.`

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a medical professional providing comprehensive health analysis and recommendations. Provide detailed, actionable insights while maintaining a professional and encouraging tone."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "gpt-4o",
  })

  return completion.choices[0].message.content || ''
}

export async function POST(req: NextRequest) {
  try {
    const { healthData, analysis } = await req.json()

    // Generate the report content using OpenAI
    const reportContent = await generateReportContent(healthData, analysis)

    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true, // Enable page buffering for page numbers
    })

    // Create a buffer to store the PDF
    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))

    // Add content to the PDF
    // Header
    doc
      .fontSize(24)
      .text('Comprehensive Health Analysis Report', { align: 'center' })
      .moveDown()
      .fontSize(12)
      .text(`Generated on: ${new Date().toLocaleDateString()}`)
      .moveDown()
      .text(`Patient ID: ${healthData.patientId}`)
      .moveDown(2)

    // Patient Information
    doc
      .fontSize(16)
      .text('Patient Information')
      .moveDown()
      .fontSize(12)
      .text(`Age: ${healthData.age} years`)
      .text(`Height: ${healthData.height} cm`)
      .text(`Weight: ${healthData.weight} kg`)
      .text(`BMI: ${(healthData.weight / Math.pow(healthData.height / 100, 2)).toFixed(1)}`)
      .moveDown(2)

    // Health Scores Summary
    doc
      .fontSize(16)
      .text('Health Scores Summary')
      .moveDown()

    const categories = [
      { key: 'overallHealthScore', title: 'Overall Health Score' },
      { key: 'cholesterolLevels', title: 'Cholesterol Levels' },
      { key: 'diabetesRisk', title: 'Diabetes Risk' },
      { key: 'fattyLiverRisk', title: 'Fatty Liver Risk' },
      { key: 'hypertensionRisk', title: 'Hypertension Risk' },
    ]

    categories.forEach(({ key, title }) => {
      const score = analysis[key]
      doc
        .fontSize(14)
        .text(title)
        .fontSize(12)
        .text(`Score: ${score.score}/10`)
        .text(`Analysis: ${score.explanation}`)
        .moveDown()
    })

    // Add the AI-generated comprehensive report
    doc
      .moveDown()
      .fontSize(16)
      .text('Comprehensive Analysis')
      .moveDown()
      .fontSize(12)
      .text(reportContent, {
        align: 'justify',
        columns: 1,
      })

    // Blood Report Analysis (if available)
    if (healthData.bloodReportText) {
      doc
        .addPage()
        .fontSize(16)
        .text('Blood Report Details')
        .moveDown()
        .fontSize(12)
        .text(healthData.bloodReportText)
        .moveDown(2)
    }

    // Add page numbers to all pages
    const range = doc.bufferedPageRange()
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i)
      doc
        .fontSize(10)
        .text(
          `Page ${i + 1} of ${range.count}`,
          0,
          doc.page.height - 50,
          { align: 'center' }
        )
    }

    // Set metadata
    doc.info.Title = 'Comprehensive Health Analysis Report'
    doc.info.Author = 'Health Analysis System'

    // Finalize the PDF
    doc.end()

    // Wait for all chunks to be collected
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      doc.on('data', chunks.push.bind(chunks))
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=health-report.pdf',
          },
        }))
      })
      doc.on('error', reject)
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return Response.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
} 