"use strict";
// AI Tools Framework - Standardized interface for AI tool integration
Object.defineProperty(exports, "__esModule", { value: true });
exports.toolRegistry = exports.AITool = void 0;
exports.executeToolFromFunctionCall = executeToolFromFunctionCall;
class AITool {
    getDefinition() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            parameters: this.getParameters(),
            category: this.category,
        };
    }
    // Convert tool definition to OpenAI function calling format
    toOpenAIFunction() {
        return {
            name: this.id,
            description: this.description,
            parameters: {
                type: "object",
                properties: this.convertParametersToSchema(this.getParameters()),
                required: this.getParameters()
                    .filter(p => p.required)
                    .map(p => p.name),
            },
        };
    }
    convertParametersToSchema(params) {
        const schema = {};
        params.forEach(param => {
            schema[param.name] = {
                type: param.type,
                description: param.description,
            };
            if (param.enum) {
                schema[param.name].enum = param.enum;
            }
            if (param.properties) {
                schema[param.name].properties = this.convertParametersToSchema(Object.values(param.properties));
            }
        });
        return schema;
    }
    createSuccessResult(data, metadata) {
        return {
            success: true,
            data,
            metadata,
        };
    }
    createErrorResult(error) {
        return {
            success: false,
            error,
        };
    }
}
exports.AITool = AITool;
// Tool Registry
class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }
    register(tool) {
        this.tools.set(tool.id, tool);
    }
    unregister(toolId) {
        this.tools.delete(toolId);
    }
    getTool(toolId) {
        return this.tools.get(toolId);
    }
    getAllTools() {
        return Array.from(this.tools.values());
    }
    getToolsByCategory(category) {
        return Array.from(this.tools.values()).filter(tool => tool.category === category);
    }
    getToolDefinitions() {
        return this.getAllTools().map(tool => tool.getDefinition());
    }
    getOpenAIFunctions() {
        return this.getAllTools().map(tool => tool.toOpenAIFunction());
    }
    async executeTool(toolId, params, context) {
        const tool = this.getTool(toolId);
        if (!tool) {
            return {
                success: false,
                error: `Tool '${toolId}' not found`,
            };
        }
        try {
            return await tool.execute(params, context);
        }
        catch (error) {
            return {
                success: false,
                error: error.message || "Tool execution failed",
            };
        }
    }
}
// Export singleton instance
exports.toolRegistry = new ToolRegistry();
// Helper function to execute tool from OpenAI function call
async function executeToolFromFunctionCall(functionCall, context) {
    let params;
    try {
        params = JSON.parse(functionCall.arguments);
    }
    catch (error) {
        return {
            success: false,
            error: "Invalid function arguments JSON",
        };
    }
    return await exports.toolRegistry.executeTool(functionCall.name, params, context);
}
