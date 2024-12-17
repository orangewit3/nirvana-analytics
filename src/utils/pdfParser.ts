import pdf from 'pdf-parse';
import fs from 'fs';
import path from 'path';

interface PdfParseOptions {
  maxPages?: number;
}

interface HealthReportData {
  text: string;
  numPages: number;
  metadata: {
    title?: string;
    author?: string;
    creationDate?: string;
  };
}

/**
 * Extracts text content from a PDF health report buffer
 * @param input - PDF file as Buffer
 * @param options - Parsing options
 * @returns Promise containing the extracted text and metadata
 */
export async function parseHealthReport(
  input: Buffer,
  options: PdfParseOptions = {}
): Promise<HealthReportData> {
  try {
    const parseOptions = {
      max: options.maxPages || 0,
    };

    const data = await pdf(input, parseOptions);

    return {
      text: data.text,
      numPages: data.numpages,
      metadata: {
        title: data.metadata?.title || "N/A",
        author: data.metadata?.author || "N/A",
        creationDate: data.metadata?.creationDate || "N/A",
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${(error as Error).message}`);
  }
}

// Test function for parseHealthReport
async function main() {
  try {
    const filePath = '/Users/shreerithseshadri/blood_reports/CBC-test-report-format-example-sample-template-Drlogy-lab-report.pdf'

    // Read the PDF file into a buffer
    const buffer = fs.readFileSync(filePath);

    console.log('Buffer:', buffer);

    // Parse the PDF
    const result = await parseHealthReport(buffer);

    console.log('Successfully parsed PDF:');
    console.log('Text content:', result.text);
    console.log('Number of pages:', result.numPages);
    console.log('Metadata:', result.metadata);
  } catch (error) {
    console.error('Error testing PDF parser:', error.message);
  }
}

// Run the test
main();