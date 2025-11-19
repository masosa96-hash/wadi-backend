import { AITool, ToolParameter, ToolExecutionContext, ToolExecutionResult } from "./framework";

export class CodeAnalysisTool extends AITool {
  readonly id = "code_analyzer";
  readonly name = "Code Analysis";
  readonly description = "Analyze code structure, complexity, and provide insights without execution";
  readonly category = "analysis" as const;

  getParameters(): ToolParameter[] {
    return [
      {
        name: "code",
        type: "string",
        description: "Code snippet to analyze",
        required: true,
      },
      {
        name: "language",
        type: "string",
        description: "Programming language of the code",
        required: true,
        enum: ["javascript", "typescript", "python", "java", "csharp", "go", "rust", "php", "ruby"],
      },
      {
        name: "analysis_type",
        type: "string",
        description: "Type of analysis to perform",
        required: false,
        enum: ["complexity", "structure", "security", "full"],
      },
    ];
  }

  async execute(params: any, context: ToolExecutionContext): Promise<ToolExecutionResult> {
    const { code, language, analysis_type = "full" } = params;

    if (!code) {
      return this.createErrorResult("code parameter is required");
    }

    if (!language) {
      return this.createErrorResult("language parameter is required");
    }

    try {
      const result: any = {
        language,
        linesOfCode: code.split("\n").length,
      };

      if (analysis_type === "complexity" || analysis_type === "full") {
        result.complexity = this.analyzeComplexity(code);
      }

      if (analysis_type === "structure" || analysis_type === "full") {
        result.structure = this.analyzeStructure(code, language);
      }

      if (analysis_type === "security" || analysis_type === "full") {
        result.security = this.analyzeSecurityConcerns(code, language);
      }

      if (analysis_type === "full") {
        result.codeQuality = this.assessCodeQuality(code);
      }

      return this.createSuccessResult(result, {
        analysisType: analysis_type,
        toolVersion: "1.0.0",
      });

    } catch (error: any) {
      return this.createErrorResult(`Code analysis failed: ${error.message}`);
    }
  }

  private analyzeComplexity(code: string): any {
    const lines = code.split("\n");
    const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
    
    // Simple metrics
    const controlFlowKeywords = ["if", "else", "for", "while", "switch", "case"];
    let cyclomaticComplexity = 1; // Base complexity

    controlFlowKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      const matches = code.match(regex);
      if (matches) {
        cyclomaticComplexity += matches.length;
      }
    });

    return {
      cyclomaticComplexity,
      linesOfCode: lines.length,
      nonEmptyLines,
      commentLines: lines.filter(line => line.trim().startsWith("//") || line.trim().startsWith("#")).length,
      estimatedFunctions: (code.match(/function\s+\w+|def\s+\w+|func\s+\w+/g) || []).length,
    };
  }

  private analyzeStructure(code: string, language: string): any {
    const structure: any = {
      functions: [],
      classes: [],
      imports: [],
    };

    // Detect functions (simplified)
    const functionPatterns: Record<string, RegExp> = {
      javascript: /function\s+(\w+)/g,
      typescript: /function\s+(\w+)|(\w+)\s*\(/g,
      python: /def\s+(\w+)/g,
      java: /(public|private|protected)?\s+\w+\s+(\w+)\s*\(/g,
    };

    const pattern = functionPatterns[language];
    if (pattern) {
      const matches = code.matchAll(pattern);
      for (const match of matches) {
        structure.functions.push(match[1] || match[2]);
      }
    }

    // Detect classes
    const classPattern = /class\s+(\w+)/g;
    const classMatches = code.matchAll(classPattern);
    for (const match of classMatches) {
      structure.classes.push(match[1]);
    }

    // Detect imports
    const importPatterns = /import\s+.*?from|from\s+\w+\s+import|#include|using\s+\w+/g;
    const importMatches = code.match(importPatterns);
    structure.imports = importMatches || [];

    return structure;
  }

  private analyzeSecurityConcerns(code: string, language: string): any {
    const concerns: string[] = [];

    // Common security issues to check
    const securityPatterns = [
      { pattern: /eval\s*\(/, concern: "Use of eval() can lead to code injection vulnerabilities" },
      { pattern: /exec\s*\(/, concern: "Use of exec() can be dangerous if not properly sanitized" },
      { pattern: /innerHTML\s*=/, concern: "Direct innerHTML assignment can lead to XSS vulnerabilities" },
      { pattern: /password\s*=\s*['"]\w+['"]/, concern: "Hardcoded password detected" },
      { pattern: /api[_-]?key\s*=\s*['"]\w+['"]/, concern: "Hardcoded API key detected" },
      { pattern: /console\.log\s*\(/, concern: "Console.log statements should be removed in production" },
    ];

    securityPatterns.forEach(({ pattern, concern }) => {
      if (pattern.test(code)) {
        concerns.push(concern);
      }
    });

    return {
      concernsFound: concerns.length,
      concerns,
      riskLevel: concerns.length === 0 ? "low" : concerns.length < 3 ? "medium" : "high",
    };
  }

  private assessCodeQuality(code: string): any {
    const lines = code.split("\n");
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);
    const avgLineLength = nonEmptyLines.reduce((sum, line) => sum + line.length, 0) / nonEmptyLines.length;

    return {
      readability: avgLineLength < 80 ? "good" : avgLineLength < 120 ? "fair" : "poor",
      avgLineLength: Math.round(avgLineLength),
      hasComments: lines.some(line => line.trim().startsWith("//") || line.trim().startsWith("#")),
    };
  }
}
