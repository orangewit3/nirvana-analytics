import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Define constants for dropdown options
export const JAKARTA_AREAS = [
  'Menteng',
  'Kebayoran Baru',
  'Kuningan',
  'Sudirman',
  'Thamrin',
  'Kemang',
  'Kelapa Gading',
  'Pluit',
  'Pantai Indah Kapuk',
  'Pondok Indah',
  'Other'
] as const

export const CHRONIC_CONDITIONS = [
  'Hypertension',
  'Diabetes',
  'Heart Disease',
  'Asthma',
  'Arthritis',
  'Chronic Kidney Disease',
  'COPD',
  'Depression',
  'Thyroid Disorder',
  'Obesity',
  'None',
  'Other'
] as const

// Updated schema
export const HealthDataInputSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
    invalid_type_error: "That's not a valid date",
  }),
  sex: z.enum(['M', 'F'], {
    required_error: "Sex is required",
  }),
  height: z.number().min(0, 'Height must be a positive number'),
  weight: z.number().min(0, 'Weight must be a positive number'),
  address: z.object({
    area: z.enum([...JAKARTA_AREAS]),
    otherArea: z.string().optional(),
  }),
  bloodPressure: z.object({
    systolic: z.number().min(0).max(300).optional(),
    diastolic: z.number().min(0).max(200).optional(),
  }).optional(),
  chronicConditions: z.array(z.enum([...CHRONIC_CONDITIONS]))
    .optional()
    .default([]),
  otherChronicCondition: z.string().optional(),
  allergies: z.string().optional(),
  bloodReportText: z.string().min(1, 'Blood report text is required'),
  createdAt: z.date().default(() => new Date()),
})

export type HealthDataInput = z.infer<typeof HealthDataInputSchema>

// Form schema (for react-hook-form)
export const healthFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.date(),
  sex: z.enum(['M', 'F']),
  height: z.number().min(0, 'Height must be a positive number'),
  weight: z.number().min(0, 'Weight must be a positive number'),
  weightUnit: z.enum(['kg', 'lbs']),
  area: z.enum([...JAKARTA_AREAS]),
  otherArea: z.string().optional(),
  bloodPressure: z.object({
    systolic: z.number().min(0).max(300).optional(),
    diastolic: z.number().min(0).max(200).optional(),
  }).optional(),
  chronicConditions: z.array(z.enum([...CHRONIC_CONDITIONS])),
  otherChronicCondition: z.string().optional(),
  allergies: z.string().optional(),
  bloodReport: z.instanceof(File).optional(),
})

export type HealthFormValues = z.infer<typeof healthFormSchema>

export const healthScoreCategorySchema = z.object({
  score: z.number().min(0).max(10),
  scoringSystem: z.enum(['systemA', 'systemB']),
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
