import { BaseAnalyzer } from './base.analyzer.js';
import { AnalysisResult, AnalysisIssue, ComplexityAnalysis, DuplicateBlock } from '../types.js';

export class JavaAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<AnalysisResult> {
    const issues = await this.detectIssues();
    const complexityAnalysis = await this.analyzeComplexity();
    const duplicates = await this.detectDuplicates();

    return {
      language: 'java',
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

      // Check naming conventions
      if (line.match(/class\s+[a-z]/)) {
        issues.push({
          id: `class-naming-${i}`,
          type: 'warning',
          category: 'Naming Convention',
          severity: 'medium',
          message: 'Class names should start with uppercase letter (PascalCase)',
          line: i + 1,
          column: 0,
          code: line
        });
      }

      // Detect raw types usage
      if (line.match(/List\s*<|Map\s*<|Set\s*</)) {
        if (!line.includes('<') || line.includes('<?')) {
          issues.push({
            id: `raw-type-${i}`,
            type: 'warning',
            category: 'Type Safety',
            severity: 'high',
            message: 'Use type parameters with generic types',
            line: i + 1,
            column: 0,
            code: line,
            suggestion: 'Add type parameters: List<String> instead of List'
          });
        }
      }

      // Detect System.out.println in production
      if (line.includes('System.out.println')) {
        issues.push({
          id: `sysout-${i}`,
          type: 'warning',
          category: 'Code Quality',
          severity: 'low',
          message: 'Use logging framework instead of System.out.println',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use SLF4J or Log4j for logging'
        });
      }

      // Detect mutable static fields
      if (line.match(/public\s+static\s+[^final]/)) {
        issues.push({
          id: `mutable-static-${i}`,
          type: 'warning',
          category: 'Best Practice',
          severity: 'high',
          message: 'Mutable static fields are a threading hazard',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Make field final or provide synchronized access'
        });
      }

      // Detect catching Exception
      if (line.includes('catch (Exception')) {
        issues.push({
          id: `catch-exception-${i}`,
          type: 'warning',
          category: 'Error Handling',
          severity: 'medium',
          message: 'Catching Exception is too broad',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Catch specific exceptions'
        });
      }

      // Check indentation (should be 4 spaces or 1 tab)
      const indentation = line.match(/^[\s]*/)?.[0].length || 0;
      if (indentation > 0 && indentation % 4 !== 0 && !line.startsWith('\t')) {
        if (indentation % 2 === 1) {
          issues.push({
            id: `bad-indentation-${i}`,
            type: 'info',
            category: 'Code Style',
            severity: 'low',
            message: 'Inconsistent indentation',
            line: i + 1,
            column: 0,
            code: line
          });
        }
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

  private detectRefactoringOpportunities() {
    return [
      {
        description: 'Consider using try-with-resources for managing closeable resources',
        priority: 'high' as const
      },
      {
        description: 'Use generics to provide type safety and avoid casting',
        priority: 'high' as const
      },
      {
        description: 'Consider using functional interfaces and lambda expressions',
        priority: 'medium' as const
      },
      {
        description: 'Extract repeated code patterns into reusable methods',
        priority: 'medium' as const
      }
    ];
  }

  protected isFunctionDefinition(line: string): boolean {
    const trimmed = line.trim();
    return /(?:public|private|protected)?\s*(?:static)?\s*(?:synchronized)?\s*\w+\s+\w+\s*\(/.test(trimmed);
  }

  protected isBlockEnd(line: string): boolean {
    return line.trim() === '}';
  }
}
