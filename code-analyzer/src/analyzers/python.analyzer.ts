import { BaseAnalyzer } from './base.analyzer.js';
import { AnalysisResult, AnalysisIssue, ComplexityAnalysis, DuplicateBlock } from '../types.js';

export class PythonAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<AnalysisResult> {
    const issues = await this.detectIssues();
    const complexityAnalysis = await this.analyzeComplexity();
    const duplicates = await this.detectDuplicates();

    return {
      language: 'python',
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

      // Detect PEP 8 violations
      if (line.match(/^\t/)) {
        issues.push({
          id: `tabs-${i}`,
          type: 'warning',
          category: 'PEP 8',
          severity: 'medium',
          message: 'Use 4 spaces for indentation, not tabs',
          line: i + 1,
          column: 0,
          code: line
        });
      }

      // Detect unused imports
      if (line.match(/^import\s+\w+|^from\s+\w+\s+import/)) {
        const importName = this.extractImportName(line);
        if (!this.isImportUsed(importName)) {
          issues.push({
            id: `unused-import-${i}`,
            type: 'warning',
            category: 'Code Quality',
            severity: 'medium',
            message: `Unused import: ${importName}`,
            line: i + 1,
            column: 0,
            code: line,
            suggestion: `Remove the unused import or use it in the code`
          });
        }
      }

      // Detect print statements in production code
      if (line.match(/^\s*print\s*\(/)) {
        issues.push({
          id: `print-statement-${i}`,
          type: 'warning',
          category: 'Best Practice',
          severity: 'low',
          message: 'Use logging instead of print statements',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Replace with logging.debug() or logging.info()'
        });
      }

      // Detect bare except
      if (line.match(/except\s*:/)) {
        issues.push({
          id: `bare-except-${i}`,
          type: 'warning',
          category: 'Error Handling',
          severity: 'high',
          message: 'Bare except clause catches all exceptions',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Specify the exception type: except Exception: or except SpecificError:'
        });
      }

      // Detect long lines
      if (line.length > 79) {
        issues.push({
          id: `long-line-${i}`,
          type: 'info',
          category: 'Code Style',
          severity: 'low',
          message: `Line is ${line.length} characters long (PEP 8 suggests 79)`,
          line: i + 1,
          column: 79,
          code: line
        });
      }
    }

    issues.push(...this.detectLongFunctions());
    issues.push(...this.analyzeCodeStyle());

    return issues;
  }

  protected async analyzeComplexity(): Promise<ComplexityAnalysis[]> {
    return this.detectCyclomaticComplexity();
  }

  protected async detectDuplicates(): Promise<DuplicateBlock[]> {
    // Simplified duplicate detection
    const lines = this.content.split('\n');
    const blocks = new Map<string, number[]>();

    for (let i = 0; i < lines.length - 2; i++) {
      const blockKey = [lines[i], lines[i + 1], lines[i + 2]].join('\n');
      if (!blocks.has(blockKey)) {
        blocks.set(blockKey, []);
      }
      blocks.get(blockKey)!.push(i);
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

    return duplicates.slice(0, 10); // Return top 10
  }

  private extractImportName(line: string): string {
    const match = line.match(/(?:import|from)\s+(\w+)/);
    return match?.[1] || '';
  }

  private isImportUsed(importName: string): boolean {
    const regex = new RegExp(`\\b${importName}\\b`, 'g');
    const matches = this.content.match(regex) || [];
    return matches.length > 1; // More than just the import statement
  }

  private detectRefactoringOpportunities() {
    return [
      {
        description: 'Consider using f-strings instead of % or .format() for string formatting',
        priority: 'medium' as const
      },
      {
        description: 'Use list comprehensions instead of loops for creating lists',
        priority: 'medium' as const
      },
      {
        description: 'Consider using type hints for better code documentation',
        priority: 'low' as const
      }
    ];
  }

  protected isFunctionDefinition(line: string): boolean {
    return line.trim().startsWith('def ') || line.trim().startsWith('async def ');
  }

  protected isBlockEnd(line: string): boolean {
    const trimmed = line.trim();
    // In Python, check if we're back to the same or lower indentation level
    if (trimmed === '' || trimmed.startsWith('#')) return false;
    return !line.startsWith('    ') && !line.startsWith('\t') && line.trim().length > 0;
  }
}
