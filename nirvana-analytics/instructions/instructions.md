# Product Requirements Document (PRD)

## Overview

This document defines the requirements for a personal health analytics web application. The application will allow users to input their health data (e.g., age, weight, height, temperature) along with a provided PDF blood report. The system will then generate a series of health markers (e.g., overall health score, diabetes risk) and a comprehensive health report for the user to download.

The technologies to be used include **Next.js 14**, **shadcn UI components**, **Tailwind CSS**, **Lucide Icons**, and the **OpenAI API** for health analysis and full health report generation.

## Goals & Objectives

- **User-Friendly Input Form:** A single-page form to gather user health metrics and accept a PDF blood report upload.
- **Automated Health Scoring:** Use the OpenAI API to process the user's input and blood report text to generate various health score parameters.
- **Interactive Visualization:** Display health scores as widgets with horizontal severity scales and explanatory tooltips.
- **Downloadable Health Report:** Provide a button that, when clicked, generates a detailed health report from OpenAI and allows the user to download it as a PDF.

## Key Features

1. **Health Questionnaire Form:**  
   - Input fields for:
     - Age (numeric input, e.g., in years)
     - Body weight (numeric input with unit selection, e.g., kg)
     - Temperature (numeric input with unit selection, e.g., °C or °F)
   - PDF Upload:
     - An upload button that only accepts a PDF file.
     - On file selection, the uploaded PDF content is parsed into text.
   - **Action Button:** A visually distinct button labeled "What's my health score?" that, when clicked, proceeds to analysis. The user's input is saved as a `HealthDataInputSchema` object and cached for further processing.

2. **Health Score Analysis:**
   - The `HealthDataInputSchema` object is passed to an OpenAI endpoint.
   - The OpenAI response is structured as `HealthAnalysisSchema` output, which includes categories like `overallHealthScore`, `cholesterolLevels`, `diabetesRisk`, `fattyLiverRisk`, `hypertensionRisk`.
   - Each category consists of a numerical score (0-10) and a brief explanation.

3. **Health Score Widgets:**
   - Display each of the `HealthAnalysisSchema` parameters as a widget.
   - Each widget:
     - Shows a horizontal scale (e.g., from 0 to 10) indicating severity or health quality.
     - Includes an information (tooltip) icon, which, on hover, provides a short explanatory text (the explanation from the `HealthScoreCategory`).
   
4. **Full Health Report Generation:**
   - A button that, when clicked, calls the OpenAI API to generate a comprehensive report.
   - The full report can be downloaded as a PDF.

## Data Flow

1. **User Input:**  
   User enters age, height, weight, temperature, and uploads blood report PDF.
   
2. **PDF Parsing:**  
   The uploaded PDF is parsed into text (using the documented `parseHealthReport` logic), which is then stored.

3. **OpenAI Health Analysis:**
   The system sends the user data (including text extracted from the blood report) to the OpenAI model with a defined prompt. OpenAI responds with structured JSON following `HealthAnalysisSchema`.
   
4. **Display Results:**
   The UI consumes the `HealthAnalysisSchema` result to display each health metric and its explanation in widgets.

5. **Detailed Report Generation:**
   On user request, a full textual health report is generated via OpenAI and offered to the user as a downloadable file.

## Technical Requirements & Schemas

### Health Data Input Schema

**Purpose:** Validate and structure input data before sending it to the OpenAI API.

**Schema (Zod-based):**

```typescript
// Pseudocode representation from documentation:
HealthDataInputSchema = {
  patientId: string (required, non-empty),
  age: number (>=0),
  height: number (>=0, in cm),
  weight: number (>=0, in kg),
  bloodReportText: string (required, non-empty),
  createdAt: date (defaults to current date),
};
```

### PDF Parsing Logic

**Objective:** Extract text from uploaded PDF files for analysis.

**Approach:**
- Users upload a PDF.
- The `parseHealthReport` function extracts text and metadata.
- Result includes:
  - Extracted text
  - Number of pages
  - Optional metadata (title, author, creation date)

**Sample usage (for reference only, do not implement code here):**

```typescript
// Example from documentation
async function handleBufferUpload(buffer: Buffer) {
  const result = await parseHealthReport(buffer);
  return result; // includes { text: string, numPages: number, metadata: { ... } }
}
```

**Parsing Options:**
- `maxPages` to limit the number of pages parsed.
- On success: returns `HealthReportData`.
- On error: throws an error indicating parsing failure.

### OpenAI Structured Output for Health Score Analysis

**Schema for Health Scores:**

- `HealthScoreCategory`:
  - `score`: number (0 to 10)
  - `explanation`: string
  
- `HealthAnalysisSchema`:
  - `overallHealthScore`: HealthScoreCategory
  - `cholesterolLevels`: HealthScoreCategory
  - `diabetesRisk`: HealthScoreCategory
  - `fattyLiverRisk`: HealthScoreCategory
  - `hypertensionRisk`: HealthScoreCategory

**OpenAI Response Format:**
- Must respond strictly in JSON.
- Each score category includes a numeric score and a short explanation.

**Sample Prompt Logic:**

```typescript
// Example prompt generation (pseudocode):
"Analyze the following health data... Return JSON exactly as shown..."
```

**Sample Example Response (for illustration):**

```json
{
  "overallHealthScore": {
    "score": 8,
    "explanation": "The patient has a healthy BMI and normal blood values, indicating good overall health."
  },
  "cholesterolLevels": {
    "score": 5,
    "explanation": "Total cholesterol is slightly elevated, requiring attention to diet and exercise."
  },
  "diabetesRisk": {
    "score": 6,
    "explanation": "HbA1c levels are borderline, indicating a moderate risk of diabetes."
  },
  "fattyLiverRisk": {
    "score": 3,
    "explanation": "Elevated ALT and AST levels suggest a significant risk of fatty liver disease."
  },
  "hypertensionRisk": {
    "score": 4,
    "explanation": "Sodium and LDL levels are elevated, contributing to a higher risk of hypertension."
  }
}
```

Developers must ensure:
- The response is parsed from JSON.
- Validate against `HealthAnalysisSchema` before rendering.

### Final Health Report Generation

After displaying the scores, the user can request a full report:
- Call OpenAI with a more detailed prompt, including health data and insights.
- The API returns a comprehensive textual report.
- The system formats it and provides a download option (e.g., as a PDF).

## File Structure

The proposed minimal file structure to support the above functionalities is as follows:

```
nirvana-analytics/
├── README.md
├── package.json
├── next.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── app
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx             // Main form page
│   ├── results
│   │   └── page.tsx         // Results display page
│   └── api
│       ├── analyze
│       │   └── route.ts     // API endpoint for OpenAI analysis
│       └── upload-pdf
│           └── route.ts     // API endpoint for PDF uploads & parsing
├── components
│   ├── ui
│   │   ├── input.tsx        // Input fields & dropdown units
│   │   ├── upload-button.tsx// PDF upload button
│   │   ├── analysis-widget.tsx // Widget to show scores
│   │   └── button.tsx       // General button component
│   └── index.ts             // (Optional) central exports
├── lib
│   └── utils.ts             // Contains schemas, prompt generation logic, 
│                            // PDF parsing, and analyzeHealthData function
└── instructions
    └── instructions.md
```

**Rationale for File Structure:**
- **`app` Directory:** Pages and APIs are kept close to their corresponding routes.  
- **`components/ui` Directory:** Encapsulate UI elements.  
- **`lib/utils.ts`:** Contains all core logic (schemas, PDF parse logic, and OpenAI prompt/response handling) for easy reference.  
- **`instructions`:** Stores documentation or any internal instructions for developers.

## Non-Functional Requirements

- **Performance:** Parsing PDF and processing with OpenAI should be efficient and not cause undue latency. Consider adding loading states.
- **Security:** Ensure uploaded PDFs are handled securely and sanitized. No user data should leak.
- **Reliability:** Validate all inputs with schemas. Ensure fallback error messages if external services fail.

## Developer Alignment

- **Clarity of Requirements:**  
  This PRD details each component, data flow, and responsibilities clearly. Developers should have all context needed to implement the solution.
  
- **Reference Materials & Examples:**  
  The provided schemas, code snippets, and example responses ensure consistent implementation. Developers should follow these examples closely.

- **Change Management:**  
  If requirements evolve, this PRD will be updated. Developers should ensure they reference the most current version during implementation.

---

This PRD, along with the included schemas, file structure recommendations, and example code/documentation, should provide clear guidance to developers implementing the personal health analytics web application.