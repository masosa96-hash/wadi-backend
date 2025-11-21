"use strict";
// AI Tools - Main export and registration
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolRegistry = void 0;
exports.registerAllTools = registerAllTools;
const framework_1 = require("./framework");
Object.defineProperty(exports, "toolRegistry", { enumerable: true, get: function () { return framework_1.toolRegistry; } });
const pdf_tool_1 = require("./pdf-tool");
const image_tool_1 = require("./image-tool");
const code_tool_1 = require("./code-tool");
const zip_tool_1 = require("./zip-tool");
// Register all tools
function registerAllTools() {
    framework_1.toolRegistry.register(new pdf_tool_1.PDFAnalysisTool());
    framework_1.toolRegistry.register(new image_tool_1.ImageAnalysisTool());
    framework_1.toolRegistry.register(new code_tool_1.CodeAnalysisTool());
    framework_1.toolRegistry.register(new zip_tool_1.ZIPGenerationTool());
}
// Initialize tools on module load
registerAllTools();
// Re-export framework components
__exportStar(require("./framework"), exports);
