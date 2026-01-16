import { BaseAnalyzer } from './base.analyzer.js';
import { AnalysisResult, AnalysisIssue, ComplexityAnalysis, DuplicateBlock } from '../types.js';

export class RubyAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<AnalysisResult> {
    const issues = await this.detectIssues();
    const complexityAnalysis = await this.analyzeComplexity();
    const duplicates = await this.detectDuplicates();

    return {
      language: 'ruby',
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

      // Check for puts in production code
      if (line.match(/^\s*puts\s+/)) {
        issues.push({
          id: `puts-${i}`,
          type: 'info',
          category: 'Code Quality',
          severity: 'low',
          message: 'Use Rails logger instead of puts',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Replace with Rails.logger.info or logger.info'
        });
      }

      // Detect unused variables (Ruby convention: _)
      if (line.match(/\|\s*\w+(?!_)\s*\|/) && !line.includes('_')) {
        issues.push({
          id: `unused-var-${i}`,
          type: 'warning',
          category: 'Best Practice',
          severity: 'low',
          message: 'Prefix unused variables with underscore (_)',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use _variable_name for intentionally unused variables'
        });
      }

      // Detect trailing commas in method calls
      if (line.match(/,\s*\)/)) {
        issues.push({
          id: `trailing-comma-${i}`,
          type: 'info',
          category: 'Code Style',
          severity: 'low',
          message: 'Remove trailing comma',
          line: i + 1,
          column: 0,
          code: line
        });
      }

      // Check for hardcoded magic numbers
      if (line.match(/[=:]\s*\d{3,}/) && !line.includes('HTTP') && !line.includes('DATE')) {
        issues.push({
          id: `magic-number-${i}`,
          type: 'warning',
          category: 'Best Practice',
          severity: 'medium',
          message: 'Magic number detected - consider extracting to a constant',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Define a constant for this value'
        });
      }

      // Check for attr_accessor usage
      if (line.includes('attr_accessor')) {
        issues.push({
          id: `attr-accessor-${i}`,
          type: 'warning',
          category: 'Best Practice',
          severity: 'medium',
          message: 'Consider if all attributes should be publicly writable',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use attr_reader or attr_writer for more controlled access'
        });
      }

      // Check line length (Ruby convention: 80-120 chars)
      if (line.length > 120) {
        issues.push({
          id: `long-line-${i}`,
          type: 'info',
          category: 'Code Style',
          severity: 'low',
          message: `Line is ${line.length} characters long`,
          line: i + 1,
          column: 120,
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
    const lines = this.content.split('\n');
    const blocks = new Map<string, number[]>();

    for (let i = 0; i < lines.length - 3; i++) {
      const blockKey = [lines[i], lines[i + 1], lines[i + 2], lines[i + 3]].join('\n');
      if (blockKey.trim().length > 40) {
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
            lines: [line + 1, line + 4]
          })),
          code,
          occurrences: lineNumbers.length
        });
      }
    }

    return duplicates.slice(0, 10);
  }

  private detectRefactoringOpportunities() {
    return [
      {
        description: 'Use guard clauses instead of nested if conditions',
        priority: 'high' as const
      },
      {
        description: 'Consider using Ruby blocks and yield for cleaner code',
        priority: 'medium' as const
      },
      {
        description: 'Extract complex conditions into named methods',
        priority: 'medium' as const
      },
      {
        description: 'Use string interpolation instead of concatenation',
        priority: 'low' as const
      }
    ];
  }

  protected isFunctionDefinition(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('def ');
  }

  protected isBlockEnd(line: string): boolean {
    const trimmed = line.trim();
    return trimmed === 'end';
  }
}
