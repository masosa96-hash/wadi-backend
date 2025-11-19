// AI Tools - Main export and registration

import { toolRegistry } from "./framework";
import { PDFAnalysisTool } from "./pdf-tool";
import { ImageAnalysisTool } from "./image-tool";
import { CodeAnalysisTool } from "./code-tool";
import { ZIPGenerationTool } from "./zip-tool";

// Register all tools
export function registerAllTools(): void {
  toolRegistry.register(new PDFAnalysisTool());
  toolRegistry.register(new ImageAnalysisTool());
  toolRegistry.register(new CodeAnalysisTool());
  toolRegistry.register(new ZIPGenerationTool());
}

// Initialize tools on module load
registerAllTools();

// Re-export framework components
export * from "./framework";
export { toolRegistry };
