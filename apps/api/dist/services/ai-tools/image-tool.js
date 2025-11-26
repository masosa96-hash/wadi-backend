"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageAnalysisTool = void 0;
const framework_1 = require("./framework");
const openai_1 = require("../openai");
if (!openai_1.openaiClient) {
    console.warn("OpenAI client not available. Image analysis requires OPENAI_API_KEY.");
}
class ImageAnalysisTool extends framework_1.AITool {
    constructor() {
        super(...arguments);
        this.id = "image_analyzer";
        this.name = "Image Analysis";
        this.description = "Analyze images, extract text (OCR), identify objects, and describe visual content using AI vision";
        this.category = "analysis";
    }
    getParameters() {
        return [
            {
                name: "image_url",
                type: "string",
                description: "URL or base64-encoded image data",
                required: true,
            },
            {
                name: "analysis_type",
                type: "string",
                description: "Type of analysis to perform",
                required: false,
                enum: ["describe", "ocr", "objects", "detailed"],
            },
            {
                name: "detail_level",
                type: "string",
                description: "Level of detail for vision analysis",
                required: false,
                enum: ["low", "high", "auto"],
            },
        ];
    }
    async execute(params, context) {
        const { image_url, analysis_type = "detailed", detail_level = "auto" } = params;
        if (!image_url) {
            return this.createErrorResult("image_url parameter is required");
        }
        if (!openai_1.openaiClient) {
            return this.createErrorResult("OpenAI client not available. OPENAI_API_KEY is required for image analysis.");
        }
        try {
            const prompt = this.getPromptForAnalysisType(analysis_type);
            const response = await openai_1.openaiClient.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: image_url,
                                    detail: detail_level,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 1000,
            });
            const analysisResult = response.choices[0]?.message?.content || "";
            return this.createSuccessResult({
                description: analysisResult,
                analysisType: analysis_type,
                model: "gpt-4o",
                tokens: response.usage?.total_tokens || 0,
            }, {
                detailLevel: detail_level,
                toolVersion: "1.0.0",
            });
        }
        catch (error) {
            return this.createErrorResult(`Image analysis failed: ${error.message}`);
        }
    }
    getPromptForAnalysisType(analysisType) {
        switch (analysisType) {
            case "describe":
                return "Describe this image in detail, including the main subjects, colors, composition, and overall scene.";
            case "ocr":
                return "Extract and transcribe all visible text from this image. List the text in the order it appears.";
            case "objects":
                return "Identify and list all objects, people, and significant elements visible in this image. Provide a structured list.";
            case "detailed":
            default:
                return "Provide a comprehensive analysis of this image including: 1) Main subjects and scene description, 2) Visible text (if any), 3) Objects and elements, 4) Colors and composition, 5) Notable details or patterns.";
        }
    }
}
exports.ImageAnalysisTool = ImageAnalysisTool;
