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
export type DetailedMedicalAnalysis = z.infer<typeof detailedMedicalAnalysisSchema>;
export type StructuredTest = z.infer<typeof structuredTestSchema>;

function extractJsonObject(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return raw;
  }

  return raw.slice(start, end + 1);
}

function repairJsonString(raw: string) {
  return raw
    .replace(/```json|```/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
}

function needsTrailingComma(line: string) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.endsWith(",") || trimmed.endsWith("{") || trimmed.endsWith("[")) {
    return false;
  }

  return (
    trimmed.endsWith('"') ||
    trimmed.endsWith("}") ||
    trimmed.endsWith("]") ||
    trimmed.endsWith("true") ||
    trimmed.endsWith("false") ||
    trimmed.endsWith("null") ||
    /[:\s-]\d+(\.\d+)?$/.test(trimmed)
  );
}

function repairMissingCommas(raw: string) {
  const lines = raw.split("\n");

  for (let index = 0; index < lines.length - 1; index += 1) {
    const current = lines[index];
    const next = lines[index + 1]?.trim();

    if (!next) {
      continue;
    }

    const nextStartsNewEntry =
      next.startsWith('"') || next.startsWith("{") || next.startsWith("[");

    if (nextStartsNewEntry && needsTrailingComma(current)) {
      lines[index] = `${current.trimEnd()},`;
    }
  }

  return lines.join("\n");
}

export function parseMedicalAnalysis(raw: string): MedicalAnalysis {
  const extracted = extractJsonObject(raw);
  const repaired = repairMissingCommas(repairJsonString(extracted));

  try {
    return medicalAnalysisSchema.parse(JSON.parse(repaired));
  } catch {
    const fallback = repairMissingCommas(repairJsonString(raw));
    return medicalAnalysisSchema.parse(JSON.parse(fallback));
  }
}
