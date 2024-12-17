import React from 'react';
import { parseHealthReport } from './utils/pdfParser';

// If you're using it in a React component or similar
async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file) return;
  
  try {
    const result = await parseHealthReport(file, {
      preserveFormatting: true
    });
    console.log('Extracted text:', result.text);
  } catch (error) {
    console.error('Error parsing PDF:', error);
  }
}

// If you're using it with FormData in an API route
async function handleFormSubmission(formData: FormData) {
  const file = formData.get('pdfFile') as File;
  if (!file) return;
  
  const result = await parseHealthReport(file);
  return result;
}

// If you're working directly with a Buffer (e.g., in an API route)
async function handleBufferUpload(buffer: Buffer) {
  const result = await parseHealthReport(buffer);
  return result;
} 