import { BaseAnalyzer } from './base.analyzer.js';
import { AnalysisResult, AnalysisIssue, ComplexityAnalysis, DuplicateBlock } from '../types.js';

export class JavaScriptAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<AnalysisResult> {
    const issues = await this.detectIssues();
    const complexityAnalysis = await this.analyzeComplexity();
    const duplicates = await this.detectDuplicates();
    const dependencies = this.analyzeDependencies();

    return {
      language: 'javascript',
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
      dependencies,
      refactoringOpportunities: this.detectRefactoringOpportunities(),
      timestamp: new Date()
    };
  }

  protected async detectIssues(): Promise<AnalysisIssue[]> {
    const issues: AnalysisIssue[] = [];
    const lines = this.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect var usage
      if (line.match(/^\s*var\s+/)) {
        issues.push({
          id: `var-usage-${i}`,
          type: 'warning',
          category: 'Best Practice',
          severity: 'medium',
          message: 'Use let or const instead of var',
          line: i + 1,
          column: line.indexOf('var'),
          code: line,
          suggestion: 'Replace var with const (preferred) or let'
        });
      }

      // Detect console.log in production
      if (line.match(/console\.(log|debug|info)\s*\(/)) {
        issues.push({
          id: `console-log-${i}`,
          type: 'info',
          category: 'Code Quality',
          severity: 'low',
          message: 'Remove console logs from production code',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use a logging library instead'
        });
      }

      // Detect async/await without error handling
      if (line.match(/await\s+/)) {
        let hasErrorHandling = false;
        for (let j = Math.max(0, i - 5); j < Math.min(lines.length, i + 5); j++) {
          if (lines[j].includes('try') || lines[j].includes('catch')) {
            hasErrorHandling = true;
            break;
          }
        }
        if (!hasErrorHandling) {
          issues.push({
            id: `await-no-error-handling-${i}`,
            type: 'warning',
            category: 'Error Handling',
            severity: 'high',
            message: 'await without try-catch error handling',
            line: i + 1,
            column: 0,
            code: line,
            suggestion: 'Wrap await in try-catch block or add .catch() handler'
          });
        }
      }

      // Detect callback hell (nested callbacks)
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      if (openBraces > 3) {
        issues.push({
          id: `deep-nesting-${i}`,
          type: 'warning',
          category: 'Code Style',
          severity: 'medium',
          message: 'Deep nesting detected - consider using async/await or promises',
          line: i + 1,
          column: 0,
          code: line
        });
      }

      // Detect suspicious equality
      if (line.match(/==\s*(?!null|undefined)/) && !line.includes('===')) {
        issues.push({
          id: `loose-equality-${i}`,
          type: 'warning',
          category: 'Best Practice',
          severity: 'medium',
          message: 'Use strict equality (===) instead of loose equality (==)',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Replace == with ==='
        });
      }

      // Check line length
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
      if (blockKey.trim().length > 20) {
        if (!blocks.has(blockKey)) {
          blocks.set(blockKey, []);
        }
        blocks.get(blockKey)!.push(i);
      }
    }

    const duplicates: DuplicateBlock[] = [];
    let id = 0;

    for (const [code, lineNumbers] of blocks) {
      if (lineNumbers.length > 1 && code.trim().length > 50) {
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

  private analyzeDependencies() {
    const dependencies = [];
    const importRegex = /(?:import|require)\s*\(?\s*['"]([^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(this.content)) !== null) {
      dependencies.push({
        name: match[1],
        version: 'unknown',
        used: true,
        location: this.fileName
      });
    }

    return dependencies;
  }

  private detectRefactoringOpportunities() {
    return [
      {
        description: 'Use async/await instead of callback functions for better readability',
        priority: 'high' as const
      },
      {
        description: 'Consider extracting complex logic into separate utility functions',
        priority: 'medium' as const
      },
      {
        description: 'Use arrow functions for callbacks instead of function expressions',
        priority: 'low' as const
      },
      {
        description: 'Consider using optional chaining (?.) for safer property access',
        priority: 'medium' as const
      }
    ];
  }

  protected isFunctionDefinition(line: string): boolean {
    const trimmed = line.trim();
    return /^(async\s+)?function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=/.test(trimmed);
  }

  protected isBlockEnd(line: string): boolean {
    return line.trim().endsWith('}') && !line.includes('else');
  }
}
