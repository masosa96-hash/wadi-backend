// AI Tools Framework - Standardized interface for AI tool integration

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required: boolean;
  enum?: string[];
  properties?: Record<string, ToolParameter>;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: "analysis" | "generation" | "transformation" | "utility";
}

export interface ToolExecutionContext {
  userId: string;
  projectId: string;
  sessionId?: string;
}

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class AITool {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly category: "analysis" | "generation" | "transformation" | "utility";
  
  abstract getParameters(): ToolParameter[];
  abstract execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult>;
  
  getDefinition(): ToolDefinition {
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

  private convertParametersToSchema(params: ToolParameter[]): Record<string, any> {
    const schema: Record<string, any> = {};
    
    params.forEach(param => {
      schema[param.name] = {
        type: param.type,
        description: param.description,
      };
      
      if (param.enum) {
        schema[param.name].enum = param.enum;
      }
      
      if (param.properties) {
        schema[param.name].properties = this.convertParametersToSchema(
          Object.values(param.properties)
        );
      }
    });
    
    return schema;
  }

  protected createSuccessResult(data: any, metadata?: Record<string, any>): ToolExecutionResult {
    return {
      success: true,
      data,
      metadata,
    };
  }

  protected createErrorResult(error: string): ToolExecutionResult {
    return {
      success: false,
      error,
    };
  }
}

// Tool Registry
class ToolRegistry {
  private tools: Map<string, AITool> = new Map();

  register(tool: AITool): void {
    this.tools.set(tool.id, tool);
  }

  unregister(toolId: string): void {
    this.tools.delete(toolId);
  }

  getTool(toolId: string): AITool | undefined {
    return this.tools.get(toolId);
  }

  getAllTools(): AITool[] {
    return Array.from(this.tools.values());
  }

  getToolsByCategory(category: string): AITool[] {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  getToolDefinitions(): ToolDefinition[] {
    return this.getAllTools().map(tool => tool.getDefinition());
  }

  getOpenAIFunctions(): any[] {
    return this.getAllTools().map(tool => tool.toOpenAIFunction());
  }

  async executeTool(
    toolId: string,
    params: any,
    context: ToolExecutionContext
  ): Promise<ToolExecutionResult> {
    const tool = this.getTool(toolId);
    
    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolId}' not found`,
      };
    }

    try {
      return await tool.execute(params, context);
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Tool execution failed",
      };
    }
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();

// Helper function to execute tool from OpenAI function call
export async function executeToolFromFunctionCall(
  functionCall: { name: string; arguments: string },
  context: ToolExecutionContext
): Promise<ToolExecutionResult> {
  let params: any;
  
  try {
    params = JSON.parse(functionCall.arguments);
  } catch (error) {
    return {
      success: false,
      error: "Invalid function arguments JSON",
    };
  }

  return await toolRegistry.executeTool(functionCall.name, params, context);
}
