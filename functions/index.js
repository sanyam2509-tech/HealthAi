import { GoogleGenAI } from "@google/genai";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { z } from "zod";

const geminiApiKey = defineSecret("GEMINI_API_KEY");

const severitySchema = z.enum(["mild", "moderate", "high"]);
const overallStatusSchema = z.enum([
  "normal",
  "mostly_normal",
  "needs_attention",
  "urgent_review"
]);

const medicalAnalysisSchema = z.object({
  metadata: z.object({
    report_type: z.string(),
    report_date: z.string(),
    patient_name: z.string(),
    lab_name: z.string()
  }),
  health_card: z.object({
    headline: z.string(),
    overall_status: overallStatusSchema,
    abnormal_count: z.number().int().nonnegative(),
    key_points: z.array(z.string()),
    next_step: z.string()
  }),
  analysis: z.object({
    summary: z.string(),
    overall_status: overallStatusSchema,
    abnormal_values: z.array(
      z.object({
        test: z.string(),
        value: z.string(),
        status: z.string(),
        severity: severitySchema,
        simple_explanation: z.string(),
        why_it_matters: z.string(),
        possible_causes: z.array(z.string()),
        what_may_help: z.array(z.string()),
        when_to_follow_up: z.string()
      })
    ),
    key_takeaways: z.array(z.string()),
    general_next_steps: z.array(z.string()),
    urgent_flags: z.array(z.string()),
    disclaimer: z.string()
  }),
  structured_tests: z.array(
    z.object({
      test: z.string(),
      value: z.string(),
      numeric_value: z.number().nullable(),
      unit: z.string(),
      status: z.string(),
      reference_range: z.string()
    })
  )
});

const OUTPUT_EXAMPLES = `
Example 1:
If the report shows high triglycerides and high LDL, return JSON like:
{
  "metadata": {
    "report_type": "Lipid Profile",
    "report_date": "2026-03-10",
    "patient_name": "Not clearly found",
    "lab_name": "Not clearly found"
  },
  "health_card": {
    "headline": "Cholesterol values need attention",
    "overall_status": "needs_attention",
    "abnormal_count": 2,
    "key_points": ["Triglycerides are high", "LDL is high"],
    "next_step": "Discuss this report with your doctor soon."
  },
  "analysis": {
    "summary": "A few blood fat values are higher than the normal range. This may increase heart risk over time.",
    "overall_status": "needs_attention",
    "abnormal_values": [
      {
        "test": "Triglycerides",
        "value": "240 mg/dL",
        "status": "High",
        "severity": "moderate",
        "simple_explanation": "Your triglycerides are higher than normal.",
        "why_it_matters": "If this stays high, it can raise heart risk over time.",
        "possible_causes": ["Too much sugary food", "Low physical activity"],
        "what_may_help": ["Eat less sugary and processed food", "Talk to your doctor about follow-up testing"],
        "when_to_follow_up": "Discuss this at your next routine doctor visit."
      }
    ],
    "key_takeaways": [
      "Some values are outside the normal range.",
      "This report should be reviewed with a doctor."
    ],
    "general_next_steps": [
      "Keep this report for your next doctor visit.",
      "Compare it with older reports if you have them."
    ],
    "urgent_flags": [
      "Get urgent medical help if you have chest pain, severe breathing trouble, or fainting."
    ],
    "disclaimer": "This is only an informational AI summary. It is not a diagnosis or a prescription."
  },
  "structured_tests": [
    {
      "test": "Triglycerides",
      "value": "240 mg/dL",
      "numeric_value": 240,
      "unit": "mg/dL",
      "status": "High",
      "reference_range": "< 150"
    }
  ]
}
`;

function buildPrompt(fileName, mimeType) {
  return `
You are a medical report analysis assistant.

Analyze the uploaded medical report and return strictly valid JSON only.
Do not use markdown fences. Do not add any prose before or after JSON.
Use extremely simple English.
Do not diagnose diseases.
Do not prescribe medicines or dosages.
Use only these overall_status values: normal, mostly_normal, needs_attention, urgent_review.
Use only these severity values: mild, moderate, high.
If metadata is unclear, use "Not clearly found".
If there are no clear abnormal values, return an empty abnormal_values array.
Return a short dashboard-friendly health_card.
Also return structured_tests for machine comparison across reports.
The uploaded file name is ${fileName} and mime type is ${mimeType}.

JSON shape:
{
  "metadata": {
    "report_type": "",
    "report_date": "",
    "patient_name": "",
    "lab_name": ""
  },
  "health_card": {
    "headline": "",
    "overall_status": "normal or mostly_normal or needs_attention or urgent_review",
    "abnormal_count": 0,
    "key_points": ["", ""],
    "next_step": ""
  },
  "analysis": {
    "summary": "",
    "overall_status": "normal or mostly_normal or needs_attention or urgent_review",
    "abnormal_values": [
      {
        "test": "",
        "value": "",
        "status": "",
        "severity": "mild or moderate or high",
        "simple_explanation": "",
        "why_it_matters": "",
        "possible_causes": ["", ""],
        "what_may_help": ["", ""],
        "when_to_follow_up": ""
      }
    ],
    "key_takeaways": ["", ""],
    "general_next_steps": ["", ""],
    "urgent_flags": [""],
    "disclaimer": "This is only an informational AI summary. It is not a diagnosis or a prescription."
  },
  "structured_tests": [
    {
      "test": "",
      "value": "",
      "numeric_value": 0,
      "unit": "",
      "status": "",
      "reference_range": ""
    }
  ]
}

Follow the style of this example:
${OUTPUT_EXAMPLES}
  `.trim();
}

function extractJsonObject(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return raw;
  }

  return raw.slice(start, end + 1);
}

function repairJsonString(raw) {
  return raw
    .replace(/```json|```/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\r\n/g, "\n")
    .replace(/,\s*([}\]])/g, "$1")
    .trim();
}

function needsTrailingComma(line) {
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

function repairMissingCommas(raw) {
  const lines = raw.split("\n");

  for (let index = 0; index < lines.length - 1; index += 1) {
    const current = lines[index];
    const next = lines[index + 1]?.trim();

    if (!next) {
      continue;
    }

    const nextStartsNewEntry = next.startsWith('"') || next.startsWith("{") || next.startsWith("[");

    if (nextStartsNewEntry && needsTrailingComma(current)) {
      lines[index] = `${current.trimEnd()},`;
    }
  }

  return lines.join("\n");
}

function parseMedicalAnalysis(raw) {
  const extracted = extractJsonObject(raw);
  const repaired = repairMissingCommas(repairJsonString(extracted));

  try {
    return medicalAnalysisSchema.parse(JSON.parse(repaired));
  } catch {
    const fallback = repairMissingCommas(repairJsonString(raw));
    return medicalAnalysisSchema.parse(JSON.parse(fallback));
  }
}

function getMimeType(mimeType, fileName) {
  if (mimeType) {
    return mimeType;
  }

  if (fileName.toLowerCase().endsWith(".pdf")) {
    return "application/pdf";
  }

  return "image/jpeg";
}

export const analyzeReport = onRequest(
  {
    cors: true,
    region: "us-central1",
    timeoutSeconds: 120,
    memory: "1GiB",
    secrets: [geminiApiKey]
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed." });
      return;
    }

    try {
      const { fileName, mimeType, data } = req.body ?? {};

      if (!fileName || !data) {
        res.status(400).json({ error: "fileName and data are required." });
        return;
      }

      const resolvedMimeType = getMimeType(mimeType, fileName);
      const decoded = Buffer.from(data, "base64");

      if (decoded.byteLength > 20 * 1024 * 1024) {
        res.status(413).json({ error: "File is too large. Keep PDFs under 20MB for this setup." });
        return;
      }

      const ai = new GoogleGenAI({ apiKey: geminiApiKey.value() });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: resolvedMimeType,
              data
            }
          },
          {
            text: buildPrompt(fileName, resolvedMimeType)
          }
        ]
      });

      const text = response.text ?? "";
      const analysis = parseMedicalAnalysis(text);
      res.status(200).json({ analysis });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to analyze report.";
      res.status(500).json({ error: message });
    }
  }
);
