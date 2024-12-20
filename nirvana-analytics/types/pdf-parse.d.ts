declare module 'pdf-parse/lib/pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: any;
  }

  function PDFParse(dataBuffer: Buffer): Promise<PDFData>;
  export default PDFParse;
} 