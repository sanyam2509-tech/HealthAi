import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export async function extractText(buffer: Buffer) {
  const { PDFParse } = require("pdf-parse") as {
    PDFParse: new (options: { data: Buffer }) => {
      getText: () => Promise<{ text: string }>;
      destroy: () => Promise<void>;
    };
  };

  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}
