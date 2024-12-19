import { NextRequest } from 'next/server'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/\u0000/g, '') // Remove null characters
    .replace(/[μ]/g, 'u')
    .replace(/[^\x20-\x7E]/g, '') // Only keep printable ASCII characters
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();
}

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
    const doc = await PDFDocument.create()
    
    // Add a new page
    const page = doc.addPage()
    const { width, height } = page.getSize()
    
    // Embed the standard font
    const font = await doc.embedFont(StandardFonts.TimesRoman)
    const boldFont = await doc.embedFont(StandardFonts.TimesRomanBold)
    
    // Define text settings
    const fontSize = 12
    const titleSize = 24
    const headerSize = 16
    const margin = 50
    let currentY = height - margin

    // Helper function to add text and return new Y position
    const addText = (text: string, options: { 
      fontSize?: number, 
      font?: typeof font,
      indent?: number 
    } = {}) => {
      if (!text) return currentY;
      
      const actualFont = options.font || font;
      const actualSize = options.fontSize || fontSize;
      const indent = options.indent || 0;
      
      const sanitizedText = sanitizeText(text);
      
      if (sanitizedText && sanitizedText.length > 0) {
        page.drawText(sanitizedText, {
          x: margin + indent,
          y: currentY,
          size: actualSize,
          font: actualFont,
          color: rgb(0, 0, 0),
        });
      }
      
      currentY -= actualSize * 1.5;
      return currentY;
    };

    // Add title
    addText('Comprehensive Health Analysis Report', { 
      fontSize: titleSize, 
      font: boldFont 
    })
    
    // Add date and patient ID
    currentY -= 20
    addText(`Generated on: ${new Date().toLocaleDateString()}`)
    addText(`Patient ID: ${healthData.patientId}`)
    
    // Add patient information
    currentY -= 20
    addText('Patient Information', { fontSize: headerSize, font: boldFont })
    addText(`Age: ${healthData.age} years`)
    addText(`Height: ${healthData.height} cm`)
    addText(`Weight: ${healthData.weight} kg`)
    addText(`BMI: ${(healthData.weight / Math.pow(healthData.height / 100, 2)).toFixed(1)}`)
    
    // Add health scores
    currentY -= 20
    addText('Health Scores Summary', { fontSize: headerSize, font: boldFont })
    
    const categories = [
      { key: 'overallHealthScore', title: 'Overall Health Score' },
      { key: 'cholesterolLevels', title: 'Cholesterol Levels' },
      { key: 'diabetesRisk', title: 'Diabetes Risk' },
      { key: 'fattyLiverRisk', title: 'Fatty Liver Risk' },
      { key: 'hypertensionRisk', title: 'Hypertension Risk' },
    ]

    categories.forEach(({ key, title }) => {
      const score = analysis[key]
      currentY -= 10
      addText(sanitizeText(title), { fontSize: 14, font: boldFont })
      addText(sanitizeText(`Score: ${score.score}/10`), { indent: 10 })
      addText(sanitizeText(`Analysis: ${score.explanation}`), { indent: 10 })
    })

    // Add the comprehensive report
    currentY -= 20
    addText('Comprehensive Analysis', { fontSize: headerSize, font: boldFont })
    
    // Split report content into paragraphs and add them
    const paragraphs = reportContent.split('\n\n')
    paragraphs.forEach(paragraph => {
      // Check if we need a new page
      if (currentY < margin) {
        const newPage = doc.addPage()
        currentY = height - margin
      }
      addText(sanitizeText(paragraph))
      currentY -= 10
    })

    // Serialize the PDF to bytes
    const pdfBytes = await doc.save()

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=health-report.pdf',
      },
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return Response.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
} 