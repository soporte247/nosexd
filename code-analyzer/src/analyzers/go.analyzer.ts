import { BaseAnalyzer } from './base.analyzer.js';
import { AnalysisResult, AnalysisIssue, ComplexityAnalysis, DuplicateBlock } from '../types.js';

export class GoAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<AnalysisResult> {
    const issues = await this.detectIssues();
    const complexityAnalysis = await this.analyzeComplexity();
    const duplicates = await this.detectDuplicates();

    return {
      language: 'go',
      fileName: this.fileName,
      fileSize: this.getFileSize(),
      linesOfCode: this.getLinesOfCode(),
      issues,
      complexityAnalysis,
      duplicates,
      bestPractices: {
        score: this.calculateQualityScore(issues),
        violations: issues.filter(i => i.category === 'Best Practice')
      },
      refactoringOpportunities: this.detectRefactoringOpportunities(),
      timestamp: new Date()
    };
  }

  protected async detectIssues(): Promise<AnalysisIssue[]> {
    const issues: AnalysisIssue[] = [];
    const lines = this.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for unused variables
      if (line.match(/\w+\s*:=/) && !this.isVariableUsed(line, i, lines)) {
        issues.push({
          id: `unused-var-${i}`,
          type: 'warning',
          category: 'Code Quality',
          severity: 'medium',
          message: 'Variable declared but not used',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use _ to explicitly ignore the variable or remove the declaration'
        });
      }

      // Check for unhandled errors
      if (line.includes('err !=') && !lines[i + 1]?.includes('return err')) {
        issues.push({
          id: `unhandled-error-${i}`,
          type: 'warning',
          category: 'Error Handling',
          severity: 'high',
          message: 'Error not properly handled',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Handle error appropriately or propagate it'
        });
      }

      // Check for fmt.Print in production
      if (line.includes('fmt.Print')) {
        issues.push({
          id: `fmt-print-${i}`,
          type: 'info',
          category: 'Code Quality',
          severity: 'low',
          message: 'Avoid using fmt.Print for production logging',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use a logging package instead'
        });
      }

      // Check naming conventions (should be camelCase for variables)
      if (line.match(/\w+_\w+\s*:=/)) {
        issues.push({
          id: `snake-case-${i}`,
          type: 'warning',
          category: 'Naming Convention',
          severity: 'low',
          message: 'Go uses camelCase, not snake_case',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use camelCase for variable names'
        });
      }

      // Check for defer without explicit cleanup
      if (line.includes('defer') && !line.includes('.Close()')) {
        issues.push({
          id: `defer-cleanup-${i}`,
          type: 'warning',
          category: 'Best Practice',
          severity: 'medium',
          message: 'Ensure defer properly closes resources',
          line: i + 1,
          column: 0,
          code: line
        });
      }

      // Check line length
      if (line.length > 100) {
        issues.push({
          id: `long-line-${i}`,
          type: 'info',
          category: 'Code Style',
          severity: 'low',
          message: `Line is ${line.length} characters long`,
          line: i + 1,
          column: 100,
          code: line
        });
      }
    }

    issues.push(...this.detectLongFunctions(100));
    issues.push(...this.analyzeCodeStyle());

    return issues;
  }

  protected async analyzeComplexity(): Promise<ComplexityAnalysis[]> {
    return this.detectCyclomaticComplexity();
  }

  protected async detectDuplicates(): Promise<DuplicateBlock[]> {
    const lines = this.content.split('\n');
    const blocks = new Map<string, number[]>();

    for (let i = 0; i < lines.length - 2; i++) {
      const blockKey = [lines[i], lines[i + 1], lines[i + 2]].join('\n');
      if (blockKey.trim().length > 30) {
        if (!blocks.has(blockKey)) {
          blocks.set(blockKey, []);
        }
        blocks.get(blockKey)!.push(i);
      }
    }

    const duplicates: DuplicateBlock[] = [];
    let id = 0;

    for (const [code, lineNumbers] of blocks) {
      if (lineNumbers.length > 1) {
        duplicates.push({
          id: `dup-${id++}`,
          locations: lineNumbers.map(line => ({
            file: this.fileName,
            lines: [line + 1, line + 3]
          })),
          code,
          occurrences: lineNumbers.length
        });
      }
    }

    return duplicates.slice(0, 10);
  }

  private isVariableUsed(line: string, startLine: number, lines: string[]): boolean {
    const match = line.match(/(\w+)\s*:=/);
    if (!match) return true;
    const varName = match[1];
    
    for (let i = startLine + 1; i < Math.min(lines.length, startLine + 10); i++) {
      if (lines[i].includes(varName)) return true;
    }
    return false;
  }

  private detectRefactoringOpportunities() {
    return [
      {
        description: 'Consider extracting error handling logic into separate functions',
        priority: 'high' as const
      },
      {
        description: 'Use interfaces for better abstraction and testing',
        priority: 'medium' as const
      },
      {
        description: 'Consider goroutines with channels for concurrent operations',
        priority: 'medium' as const
      },
      {
        description: 'Use context for request cancellation and timeouts',
        priority: 'medium' as const
      }
    ];
  }

  protected isFunctionDefinition(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('func ');
  }

  protected isBlockEnd(line: string): boolean {
    return line.trim() === '}';
  }
}
