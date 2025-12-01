import { AITool, ToolParameter, ToolExecutionContext, ToolExecutionResult } from "./framework";
import { readFileSync } from "fs";
import { join } from "path";

// pdf-parse is a CommonJS module
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export class PDFAnalysisTool extends AITool {
  readonly id = "pdf_analyzer";
  readonly name = "PDF Analysis";
  readonly description = "Extract text, structure, and metadata from PDF documents for analysis";
  readonly category = "analysis" as const;

  getParameters(): ToolParameter[] {
    return [
      {
        name: "file_path",
        type: "string",
        description: "Path to the PDF file or base64 encoded PDF content",
        required: true,
      },
      {
        name: "extraction_mode",
        type: "string",
        description: "Type of extraction to perform",
        required: false,
        enum: ["text", "metadata", "full"],
      },
      {
        name: "page_range",
        type: "string",
        description: "Page range to extract (e.g., '1-5', 'all')",
        required: false,
      },
    ];
  }

  async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const { file_path, extraction_mode = "full", page_range = "all" } = params;

    if (!file_path) {
      return this.createErrorResult("file_path parameter is required");
    }

    try {
      // Handle base64 encoded PDF or file path
      let pdfBuffer: Buffer;

      if (file_path.startsWith("data:application/pdf;base64,")) {
        // Base64 encoded PDF
        const base64Data = file_path.replace("data:application/pdf;base64,", "");
        pdfBuffer = Buffer.from(base64Data, "base64");
      } else if (file_path.startsWith("http://") || file_path.startsWith("https://")) {
        // URL - fetch the PDF
        const response = await fetch(file_path);
        const arrayBuffer = await response.arrayBuffer();
        pdfBuffer = Buffer.from(arrayBuffer);
      } else {
        // Local file path
        pdfBuffer = readFileSync(file_path);
      }

      // Parse PDF
      const pdfData = await pdfParse(pdfBuffer);

      // Extract based on mode
      const result: any = {};

      if (extraction_mode === "text" || extraction_mode === "full") {
        result.text = pdfData.text;
        result.numPages = pdfData.numpages;

        // Handle page range if specified
        if (page_range !== "all") {
          const [start, end] = page_range.split("-").map(Number);
          // Note: pdf-parse doesn't support page-specific extraction easily
          // This is a simplified implementation
          result.requestedRange = page_range;
        }
      }

      if (extraction_mode === "metadata" || extraction_mode === "full") {
        result.metadata = pdfData.info;
        result.version = pdfData.version;
      }

      if (extraction_mode === "full") {
        // Additional analysis
        result.statistics = {
          totalPages: pdfData.numpages,
          estimatedWords: pdfData.text.split(/\s+/).length,
          estimatedCharacters: pdfData.text.length,
        };
      }

      return this.createSuccessResult(result, {
        extractionMode: extraction_mode,
        pageRange: page_range,
        toolVersion: "1.0.0",
      });

    } catch (error: any) {
      return this.createErrorResult(`PDF analysis failed: ${error.message}`);
    }
  }
}
