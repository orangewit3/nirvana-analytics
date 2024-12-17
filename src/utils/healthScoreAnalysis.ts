import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// Zod schema for health score category
const HealthScoreCategory = z.object({
  score: z.number().min(0).max(10),
  explanation: z.string()
});

// Zod schema for health analysis
const HealthAnalysisSchema = z.object({
  overallHealthScore: HealthScoreCategory,
  cholesterolLevels: HealthScoreCategory,
  diabetesRisk: HealthScoreCategory,
  fattyLiverRisk: HealthScoreCategory,
  hypertensionRisk: HealthScoreCategory,
});

// Define the schema for health data input
export const HealthDataInputSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  age: z.number().min(0, "Age cannot be negative"),
  height: z.number().min(0, "Height cannot be negative"), // in cm
  weight: z.number().min(0, "Weight cannot be negative"), // in kg
  bloodReportText: z.string().min(1, "Blood report text is required"),
  createdAt: z.date().default(() => new Date()),
});

// Export types derived from the Zod schemas
export type HealthScoreAnalysis = z.infer<typeof HealthAnalysisSchema>;
export type HealthDataInput = z.infer<typeof HealthDataInputSchema>;

// Generate analysis prompt
function generateAnalysisPrompt(params: HealthDataInput): string {
    return `
  Analyze the following health data and blood report to provide a detailed health score analysis. Score each category from 0 to 10 (where 0 is extremely bad and 10 is the best possible score) and provide explanations for each score.
  
  Patient Information:
  - Age: ${params.age} years
  - Height: ${params.height} cm
  - Weight: ${params.weight} kg
  - BMI: ${(params.weight / Math.pow(params.height / 100, 2)).toFixed(1)}
  
  Blood Report Data:
  ${params.bloodReportText}
  
  ### Instructions:
  1. Respond **strictly in JSON format**. Do not include any extra text or commentary outside the JSON.
  2. All scores must be numbers between 0 and 10.
  3. Each explanation should be a brief sentence (1-2 lines) summarizing the reasoning behind the score.
  
  ### JSON Response Example:
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
  `;
  }

// Updated analysis function using OpenAI API format
export async function analyzeHealthData(
  healthData: HealthDataInput,
  openaiApiKey: string
): Promise<HealthScoreAnalysis> {
  // Validate input data using the schema
  const validatedData = HealthDataInputSchema.parse(healthData);
  
  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical analysis AI that provides structured health score analysis based on health data and blood report parameters. Provide accurate, evidence-based assessments that take into account all patient data including age, BMI, and blood report values. The response must strictly follow the given JSON schema",
        },
        {
          role: "user",
          content: generateAnalysisPrompt(validatedData),
        },
      ],
      response_format:  { type: "json_object" },
      temperature: 0.5,
    });
    
    // Parse the JSON response
    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("Empty response received from OpenAI.");
    }

    const parsedResponse = JSON.parse(responseText);

    // Validate the response against the Zod schema
    const validatedResponse = HealthAnalysisSchema.parse(parsedResponse);
    return validatedResponse;

  } catch (error) {
    console.error('Error in health data analysis:', error);
    throw error;
  }
} 

// Test function for health score analysis
async function main() {
  try {
    // Create sample health data input
    const sampleHealthData: HealthDataInput = {
      patientId: "TEST123",
      age: 35,
      height: 175, // cm
      weight: 70, // kg
      bloodReportText: `
        Blood Test Results:
        Total Cholesterol: 180 mg/dL
        HDL: 55 mg/dL
        LDL: 110 mg/dL
        Triglycerides: 150 mg/dL
        Fasting Blood Glucose: 95 mg/dL
        HbA1c: 5.5%
        ALT: 25 U/L
        AST: 28 U/L
        GGT: 30 U/L
        Sodium: 140 mEq/L
        Creatinine: 0.9 mg/dL
      `,
      createdAt: new Date()
    };

    // Get API key from environment variable
    const apiKey = "enter api key";
    if (!apiKey) {
      throw new Error("OpenAI API key not found in environment variables");
    }

    // Run analysis
    console.log("Running health analysis with sample data...");
    const result = await analyzeHealthData(sampleHealthData, apiKey);

    console.log("\nHealth Analysis Results:");
    console.log("Overall Health Score:", result.overallHealthScore);
    console.log("Cholesterol Levels:", result.cholesterolLevels);
    console.log("Diabetes Risk:", result.diabetesRisk);
    console.log("Fatty Liver Risk:", result.fattyLiverRisk);
    console.log("Hypertension Risk:", result.hypertensionRisk);

  } catch (error) {
    console.error("Error in test health analysis:", error);
  }
}

main();

// Uncomment to run the test
// testHealthAnalysis();

