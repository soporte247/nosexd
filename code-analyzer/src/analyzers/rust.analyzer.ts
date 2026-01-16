import { BaseAnalyzer } from './base.analyzer.js';
import { AnalysisResult, AnalysisIssue, ComplexityAnalysis, DuplicateBlock } from '../types.js';

export class RustAnalyzer extends BaseAnalyzer {
  async analyze(): Promise<AnalysisResult> {
    const issues = await this.detectIssues();
    const complexityAnalysis = await this.analyzeComplexity();
    const duplicates = await this.detectDuplicates();

    return {
      language: 'rust',
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

      // Check for unsafe blocks
      if (line.includes('unsafe')) {
        issues.push({
          id: `unsafe-${i}`,
          type: 'warning',
          category: 'Safety',
          severity: 'high',
          message: 'unsafe block detected - ensure memory safety is maintained',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Document why unsafe is needed and ensure proper bounds checking'
        });
      }

      // Check for unwrap() calls
      if (line.includes('.unwrap()')) {
        issues.push({
          id: `unwrap-${i}`,
          type: 'warning',
          category: 'Error Handling',
          severity: 'high',
          message: 'unwrap() can panic - consider using ? operator or match',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use ? operator in functions or match/unwrap_or for fallback handling'
        });
      }

      // Check for expect() calls
      if (line.includes('.expect(')) {
        issues.push({
          id: `expect-${i}`,
          type: 'warning',
          category: 'Error Handling',
          severity: 'medium',
          message: 'expect() can panic - prefer error propagation with ?',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use the ? operator to propagate the error instead'
        });
      }

      // Check for clone() usage (performance concern)
      if (line.includes('.clone()')) {
        issues.push({
          id: `clone-${i}`,
          type: 'info',
          category: 'Performance',
          severity: 'low',
          message: 'clone() creates expensive copies - consider using references',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use references (&T) or move semantics instead of cloning'
        });
      }

      // Check for mutable global state
      if (line.match(/^static\s+mut\s+/)) {
        issues.push({
          id: `mutable-static-${i}`,
          type: 'warning',
          category: 'Safety',
          severity: 'high',
          message: 'Mutable static variables require unsafe access',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Consider using thread-local storage or Mutex for thread-safe access'
        });
      }

      // Check for panic! calls
      if (line.includes('panic!')) {
        issues.push({
          id: `panic-${i}`,
          type: 'warning',
          category: 'Error Handling',
          severity: 'high',
          message: 'panic! terminates the program - use Result for error handling',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Return Result<T, E> instead of panicking'
        });
      }

      // Check for println! in library code
      if (line.includes('println!')) {
        issues.push({
          id: `println-${i}`,
          type: 'info',
          category: 'Code Quality',
          severity: 'low',
          message: 'Avoid println! in library code',
          line: i + 1,
          column: 0,
          code: line,
          suggestion: 'Use proper logging frameworks or return data for printing'
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

  private detectRefactoringOpportunities() {
    return [
      {
        description: 'Use proper error handling with Result type instead of unwrap',
        priority: 'high' as const
      },
      {
        description: 'Consider using iterators instead of manual loops',
        priority: 'medium' as const
      },
      {
        description: 'Use trait objects or generics for polymorphism',
        priority: 'medium' as const
      },
      {
        description: 'Leverage Rust\'s type system for compile-time correctness',
        priority: 'high' as const
      }
    ];
  }

  protected isFunctionDefinition(line: string): boolean {
    const trimmed = line.trim();
    return trimmed.startsWith('fn ') || trimmed.match(/^pub\s+fn\s/);
  }

  protected isBlockEnd(line: string): boolean {
    return line.trim() === '}';
  }
}
