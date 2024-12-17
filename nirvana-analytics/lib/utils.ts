import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// As per instructions.md
export const HealthDataInputSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  age: z.number().min(0, 'Age must be a positive number'),
  height: z.number().min(0, 'Height must be a positive number'),
  weight: z.number().min(0, 'Weight must be a positive number'),
  bloodReportText: z.string().min(1, 'Blood report text is required'),
  createdAt: z.date().default(() => new Date()),
})

export type HealthDataInput = z.infer<typeof HealthDataInputSchema>

export const healthFormSchema = z.object({
  age: z.number().min(0, 'Age must be a positive number'),
  height: z.number().min(0, 'Height must be a positive number'),
  weight: z.number().min(0, 'Weight must be a positive number'),
  weightUnit: z.enum(['kg', 'lbs']),
  bloodReport: z.instanceof(File).optional(),
})

export type HealthFormValues = z.infer<typeof healthFormSchema>

export const healthScoreCategorySchema = z.object({
  score: z.number().min(0).max(10),
  explanation: z.string(),
})

export const healthAnalysisSchema = z.object({
  overallHealthScore: healthScoreCategorySchema,
  cholesterolLevels: healthScoreCategorySchema,
  diabetesRisk: healthScoreCategorySchema,
  fattyLiverRisk: healthScoreCategorySchema,
  hypertensionRisk: healthScoreCategorySchema,
})

export type HealthAnalysis = z.infer<typeof healthAnalysisSchema>
