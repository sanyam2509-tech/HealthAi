import { z } from "zod";

export const severitySchema = z.enum(["mild", "moderate", "high"]);
export const overallStatusSchema = z.enum([
  "normal",
  "mostly_normal",
  "needs_attention",
  "urgent_review"
]);

export const reportMetadataSchema = z.object({
  report_type: z.string(),
  report_date: z.string(),
  patient_name: z.string(),
  lab_name: z.string()
});

export const healthCardSchema = z.object({
  headline: z.string(),
  overall_status: overallStatusSchema,
  abnormal_count: z.number().int().nonnegative(),
  key_points: z.array(z.string()),
  next_step: z.string()
});

export const structuredTestSchema = z.object({
  test: z.string(),
  value: z.string(),
  numeric_value: z.number().nullable(),
  unit: z.string(),
  status: z.string(),
  reference_range: z.string()
});

export const abnormalValueSchema = z.object({
  test: z.string(),
  value: z.string(),
  status: z.string(),
  severity: severitySchema,
  simple_explanation: z.string(),
  why_it_matters: z.string(),
  possible_causes: z.array(z.string()),
  what_may_help: z.array(z.string()),
  when_to_follow_up: z.string()
});

export const detailedMedicalAnalysisSchema = z.object({
  summary: z.string(),
  overall_status: overallStatusSchema,
  abnormal_values: z.array(abnormalValueSchema),
  key_takeaways: z.array(z.string()),
  general_next_steps: z.array(z.string()),
  urgent_flags: z.array(z.string()),
  disclaimer: z.string()
});

export const medicalAnalysisSchema = z.object({
  metadata: reportMetadataSchema,
  health_card: healthCardSchema,
  analysis: detailedMedicalAnalysisSchema,
  structured_tests: z.array(structuredTestSchema)
});

export type MedicalAnalysis = z.infer<typeof medicalAnalysisSchema>;

export function buildMockAnalysis(fileName: string): MedicalAnalysis {
  const today = new Date().toISOString().slice(0, 10);

  return {
    metadata: {
      report_type: "General Lab Report",
      report_date: today,
      patient_name: "Not clearly found",
      lab_name: "Demo Lab"
    },
    health_card: {
      headline: `${fileName} was analyzed successfully`,
      overall_status: "mostly_normal",
      abnormal_count: 1,
      key_points: ["One value looks mildly outside the range", "Most of the report looks stable"],
      next_step: "Review this summary with a doctor if you want medical advice."
    },
    analysis: {
      summary: "This mock summary is here so the plain React app works before the Firebase analysis endpoint is connected.",
      overall_status: "mostly_normal",
      abnormal_values: [
        {
          test: "Sample marker",
          value: "110",
          status: "High",
          severity: "mild",
          simple_explanation: "This value is a little above the usual range.",
          why_it_matters: "It may be worth comparing with past reports.",
          possible_causes: ["Temporary variation", "Lifestyle factors"],
          what_may_help: ["Track future reports", "Discuss with your doctor if needed"],
          when_to_follow_up: "Bring it up at your next routine visit."
        }
      ],
      key_takeaways: [
        "The React conversion is working.",
        "Connect a real analysis endpoint for production use."
      ],
      general_next_steps: [
        "Upload a real report after Firebase is configured.",
        "Replace the mock analysis with your Cloud Function."
      ],
      urgent_flags: [],
      disclaimer: "This is a demo summary for development. It is not a diagnosis."
    },
    structured_tests: [
      {
        test: "Sample marker",
        value: "110",
        numeric_value: 110,
        unit: "units",
        status: "High",
        reference_range: "< 100"
      }
    ]
  };
}
