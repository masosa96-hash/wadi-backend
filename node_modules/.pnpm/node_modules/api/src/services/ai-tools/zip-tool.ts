import { AITool, ToolParameter, ToolExecutionContext, ToolExecutionResult } from "./framework";
import archiver from "archiver";
import { createWriteStream, mkdirSync, existsSync } from "fs";
import { join } from "path";

export class ZIPGenerationTool extends AITool {
  readonly id = "zip_generator";
  readonly name = "ZIP File Generator";
  readonly description = "Package multiple files into a downloadable ZIP archive";
  readonly category = "utility" as const;

  getParameters(): ToolParameter[] {
    return [
      {
        name: "files",
        type: "array",
        description: "Array of files to include in ZIP (each with 'name' and 'content' properties)",
        required: true,
      },
      {
        name: "archive_name",
        type: "string",
        description: "Name of the output ZIP file (without .zip extension)",
        required: true,
      },
      {
        name: "compression_level",
        type: "number",
        description: "Compression level (0-9, where 9 is maximum compression)",
        required: false,
      },
    ];
  }

  async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const { files, archive_name, compression_level = 6 } = params;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return this.createErrorResult("files parameter must be a non-empty array");
    }

    if (!archive_name) {
      return this.createErrorResult("archive_name parameter is required");
    }

    try {
      // Create temporary directory for ZIP files
      const tempDir = join(process.cwd(), "temp", "zips");
      if (!existsSync(tempDir)) {
        mkdirSync(tempDir, { recursive: true });
      }

      const zipFileName = `${archive_name}.zip`;
      const zipFilePath = join(tempDir, zipFileName);

      // Create write stream
      const output = createWriteStream(zipFilePath);
      const archive = archiver("zip", {
        zlib: { level: compression_level },
      });

      // Promise to track completion
      const compressionComplete = new Promise<void>((resolve, reject) => {
        output.on("close", () => resolve());
        output.on("error", (err) => reject(err));
        archive.on("error", (err) => reject(err));
      });

      // Pipe archive to output
      archive.pipe(output);

      // Add files to archive
      for (const file of files) {
        if (!file.name || file.content === undefined) {
          continue;
        }

        archive.append(file.content, { name: file.name });
      }

      // Finalize the archive
      await archive.finalize();
      await compressionComplete;

      const fileSize = archive.pointer();

      return this.createSuccessResult({
        zipFilePath,
        zipFileName,
        downloadUrl: `/api/downloads/${zipFileName}`,
        filesIncluded: files.length,
        compressedSize: fileSize,
        compressionRatio: this.calculateCompressionRatio(files, fileSize),
      }, {
        compressionLevel: compression_level,
        toolVersion: "1.0.0",
        expiresIn: "24h",
      });

    } catch (error: any) {
      return this.createErrorResult(`ZIP generation failed: ${error.message}`);
    }
  }

  private calculateCompressionRatio(files: any[], compressedSize: number): string {
    const totalUncompressedSize = files.reduce((sum, file) => {
      const content = file.content || "";
      return sum + (typeof content === "string" ? content.length : 0);
    }, 0);

    if (totalUncompressedSize === 0) return "0%";
    
    const ratio = ((totalUncompressedSize - compressedSize) / totalUncompressedSize) * 100;
    return `${ratio.toFixed(2)}%`;
  }
}
