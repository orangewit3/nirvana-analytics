import { NextRequest } from 'next/server'
import pdf from 'pdf-parse/lib/pdf-parse'

export async function POST(req: NextRequest) {
    console.log('PDF route reached')
  try {
    const formData = await req.formData()
    const file = formData.get('file')
    
    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF
    const data = await pdf(buffer)

    return Response.json({
      text: data.text || '',
      numPages: data.numpages || 1
    })

  } catch (error) {
    console.error('PDF parsing error:', error)
    return Response.json(
      { error: 'Failed to parse PDF file' },
      { status: 500 }
    )
  }
} 