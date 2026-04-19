import { GoogleGenerativeAI } from "@google/generative-ai";

import { parseMedicalAnalysis } from "@/lib/analysis";

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "replace-with-rotated-key") {
    throw new Error("Set a valid GEMINI_API_KEY before analyzing reports.");
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function getModel() {
  return getGeminiClient().getGenerativeModel({
    model: "gemini-3-flash-preview"
  });
}

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
    },
    {
      "test": "LDL",
      "value": "160 mg/dL",
      "numeric_value": 160,
      "unit": "mg/dL",
      "status": "High",
      "reference_range": "< 100"
    }
  ]
}

Example 2:
If the report is mostly normal with one mildly low vitamin value, return:
{
  "metadata": {
    "report_type": "Vitamin Report",
    "report_date": "Not clearly found",
    "patient_name": "Not clearly found",
    "lab_name": "Not clearly found"
  },
  "health_card": {
    "headline": "Most values look normal",
    "overall_status": "mostly_normal",
    "abnormal_count": 1,
    "key_points": ["Vitamin D is a little low", "Most other values look normal"],
    "next_step": "Review this at your next routine doctor visit."
  },
  "analysis": {
    "summary": "Most values look normal. One value is a little outside the normal range.",
    "overall_status": "mostly_normal",
    "abnormal_values": [
      {
        "test": "Vitamin D",
        "value": "22 ng/mL",
        "status": "Low",
        "severity": "mild",
        "simple_explanation": "Your vitamin D is a little low.",
        "why_it_matters": "Low vitamin D may affect bone and muscle health over time.",
        "possible_causes": ["Not enough sunlight", "Low vitamin D intake"],
        "what_may_help": ["Talk to your doctor about the result", "Ask if repeat testing is needed"],
        "when_to_follow_up": "Discuss this at a routine doctor visit."
      }
    ],
    "key_takeaways": [
      "Most of the report looks normal.",
      "One value needs routine follow-up."
    ],
    "general_next_steps": [
      "Keep a copy of this report.",
      "Review it at your next routine health visit."
    ],
    "urgent_flags": [
      "Get urgent medical help if you feel very unwell or have sudden serious symptoms."
    ],
    "disclaimer": "This is only an informational AI summary. It is not a diagnosis or a prescription."
  },
  "structured_tests": [
    {
      "test": "Vitamin D",
      "value": "22 ng/mL",
      "numeric_value": 22,
      "unit": "ng/mL",
      "status": "Low",
      "reference_range": "30 - 100"
    }
  ]
}

Example 3:
If no clear abnormal values are present, return:
{
  "metadata": {
    "report_type": "General Lab Report",
    "report_date": "Not clearly found",
    "patient_name": "Not clearly found",
    "lab_name": "Not clearly found"
  },
  "health_card": {
    "headline": "No clear abnormal values found",
    "overall_status": "normal",
    "abnormal_count": 0,
    "key_points": ["No clear abnormal values were seen", "Keep this report for future comparison"],
    "next_step": "Store this report safely and share it with your doctor if needed."
  },
  "analysis": {
    "summary": "No clear abnormal values were found in this report.",
    "overall_status": "normal",
    "abnormal_values": [],
    "key_takeaways": [
      "No clear abnormal values were seen.",
      "Keep the report for future comparison."
    ],
    "general_next_steps": [
      "Store this report safely.",
      "Share it with your doctor if needed."
    ],
    "urgent_flags": [
      "Get urgent medical help if you have severe symptoms, even if a report looks normal."
    ],
    "disclaimer": "This is only an informational AI summary. It is not a diagnosis or a prescription."
  },
  "structured_tests": []
}
`;

function buildAnalysisPrompt(contentLabel: string, content: string) {
  return `
You are a medical report analysis assistant.

Analyze the medical report content below.

Tasks:
1. Identify abnormal values.
2. Explain everything in very simple English that people of any age can understand.
3. Use short sentences and avoid medical jargon whenever possible.
4. Return the result strictly in valid JSON.
5. Do not use markdown fences or extra prose.
6. If no abnormal values are clearly present, return an empty abnormal_values array.
7. Do not diagnose diseases.
8. Do not prescribe medicines or give medicine doses.
9. Give only safe, general lifestyle or follow-up suggestions.
10. Always keep the language extremely simple and easy for families, older adults, and non-medical users.
11. Keep each sentence short.
12. Never use scary wording unless the report clearly suggests urgent review.
13. If you use a medical word like cholesterol, triglycerides, or hemoglobin, explain it in simple words.
14. Use only these overall_status values: normal, mostly_normal, needs_attention, urgent_review.
15. Use only these severity values: mild, moderate, high.
16. Every array must contain short, useful items. Do not return empty strings.
17. Extract basic report metadata if visible. If not clearly visible, use "Not clearly found".
18. Create a short dashboard-friendly health_card.
19. The health card must be brief and easy to scan in a report list.
20. Also return structured_tests for machine comparison across reports.
21. Include only tests that are clearly visible in the report.
22. For structured_tests, use numeric_value only when a real number is clearly present. Otherwise use null.
23. If no clear unit is visible, use "Not clearly found".
24. If no clear reference range is visible, use "Not clearly found".

JSON format:
{
"metadata":{
  "report_type":"",
  "report_date":"",
  "patient_name":"",
  "lab_name":""
},
"health_card":{
  "headline":"",
  "overall_status":"normal or mostly_normal or needs_attention or urgent_review",
  "abnormal_count":0,
  "key_points":["", ""],
  "next_step":""
},
"analysis":{
  "summary":"Short overall explanation in very simple language.",
  "overall_status":"normal or mostly_normal or needs_attention or urgent_review",
  "abnormal_values":[
    {
     "test":"",
     "value":"",
     "status":"",
     "severity":"mild or moderate or high",
     "simple_explanation":"",
     "why_it_matters":"",
     "possible_causes":["", ""],
     "what_may_help":["", ""],
     "when_to_follow_up":""
    }
  ],
  "key_takeaways":["", ""],
  "general_next_steps":["", ""],
  "urgent_flags":[""],
  "disclaimer":"This is only an informational AI summary. It is not a diagnosis or a prescription."
},
"structured_tests":[
  {
    "test":"",
    "value":"",
    "numeric_value":0,
    "unit":"",
    "status":"",
    "reference_range":""
  }
]
}

Follow the style of these examples:
${OUTPUT_EXAMPLES}

${contentLabel}:
${content}
`;
}

function buildExtractionPrompt(contentLabel: string, contentHint: string) {
  return `
You are reading a medical report and preparing a clean extraction for a second analysis step.

Tasks:
1. Read the attached ${contentLabel}.
2. Extract the medically useful content as clearly as possible.
3. Keep the wording faithful to the report.
4. Preserve important numbers, units, ranges, patient details, dates, section names, and test names.
5. Mark anything unclear as "Not clearly readable".
6. Do not explain or diagnose anything yet.
7. Do not summarize yet.
8. Return plain text only.

Output format:
- Report type
- Report date
- Patient name
- Lab name
- Sections
- Test values with units
- Reference ranges
- Notes from report

If handwriting or image quality is poor, still extract the clearest possible text and label uncertain parts.

Context:
${contentHint}
`;
}

async function extractReportContentFromInlineAsset(
  buffer: Buffer,
  mimeType: string,
  contentLabel: string,
  contentHint: string
) {
  const model = getModel();
  const result = await model.generateContent([
    buildExtractionPrompt(contentLabel, contentHint),
    {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType
      }
    }
  ]);

  const response = await result.response;
  return response.text().trim();
}

async function analyzeExtractedReport(extractedContent: string) {
  const model = getModel();
  const result = await model.generateContent(
    buildAnalysisPrompt("Cleaned medical report content", extractedContent)
  );
  const response = await result.response;
  const text = response.text();

  return parseMedicalAnalysis(text);
}

export async function analyzeMedicalReportFromText(reportText: string) {
  return analyzeExtractedReport(reportText);
}

export async function analyzeMedicalReportFromImage(buffer: Buffer, mimeType: string) {
  const extractedContent = await extractReportContentFromInlineAsset(
    buffer,
    mimeType,
    "medical report image",
    "The attached image is a lab report or medical report. It may include handwriting, dense tables, stamps, or unclear text."
  );

  return analyzeExtractedReport(extractedContent);
}

export async function analyzeMedicalReportFromFile(buffer: Buffer, mimeType: string) {
  const extractedContent = await extractReportContentFromInlineAsset(
    buffer,
    mimeType,
    "medical report file",
    "The attached file is a medical report. It may contain multiple sections, tables, typed text, or scanned pages."
  );

  return analyzeExtractedReport(extractedContent);
}
