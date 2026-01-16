import { AnalysisResult, AnalysisIssue, ComplexityAnalysis, DuplicateBlock, Language } from '../types.js';
import * as fs from 'fs';

export abstract class BaseAnalyzer {
  protected language: Language;
  protected filePath: string;
  protected content: string;
  protected fileName: string;

  constructor(language: Language, filePath: string) {
    this.language = language;
    this.filePath = filePath;
    this.fileName = filePath.split('/').pop() || '';
    this.content = fs.readFileSync(filePath, 'utf-8');
  }

  abstract analyze(): Promise<AnalysisResult>;
  protected abstract detectIssues(): Promise<AnalysisIssue[]>;
  protected abstract analyzeComplexity(): Promise<ComplexityAnalysis[]>;
  protected abstract detectDuplicates(): Promise<DuplicateBlock[]>;

  protected getLinesOfCode(): number {
    return this.content.split('\n').filter(line => 
      line.trim().length > 0 && !line.trim().startsWith('//')
    ).length;
  }

  protected getFileSize(): number {
    return Buffer.byteLength(this.content, 'utf-8');
  }

  protected detectLongFunctions(maxLines: number = 50): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = this.content.split('\n');
    let functionStart = -1;
    let functionName = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (this.isFunctionDefinition(line)) {
        functionStart = i;
        functionName = this.extractFunctionName(line);
      }

      if (functionStart !== -1 && this.isBlockEnd(line)) {
        const functionLength = i - functionStart;
        if (functionLength > maxLines) {
          issues.push({
            id: `long-function-${functionStart}`,
            type: 'warning',
            category: 'Refactoring',
            severity: 'medium',
            message: `Function "${functionName}" is too long (${functionLength} lines). Consider breaking it into smaller functions.`,
            line: functionStart + 1,
            column: 0,
            code: line.trim(),
            suggestion: `Break this function into multiple smaller functions with single responsibility.`
          });
        }
        functionStart = -1;
      }
    }

    return issues;
  }

  protected detectCyclomaticComplexity(): ComplexityAnalysis[] {
    const complexities: ComplexityAnalysis[] = [];
    const lines = this.content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (this.isFunctionDefinition(line)) {
        const functionName = this.extractFunctionName(line);
        const complexity = this.calculateComplexity(i, lines);
        
        complexities.push({
          functionName,
          complexity: this.getComplexityLabel(complexity),
          lines: this.countFunctionLines(i, lines),
          cyclomaticComplexity: complexity,
          recommendation: complexity > 10 ? 'Consider refactoring this function' : undefined
        });
      }
    }

    return complexities;
  }

  protected calculateComplexity(startLine: number, lines: string[]): number {
    let complexity = 1;
    const keywords = /\b(if|else|else if|switch|case|for|while|catch|&&|\|\|)\b/g;
    
    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      if (this.isBlockEnd(line) && i !== startLine) break;
      
      const matches = line.match(keywords);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  protected countFunctionLines(startLine: number, lines: string[]): number {
    let count = 0;
    for (let i = startLine; i < lines.length; i++) {
      if (this.isBlockEnd(lines[i]) && i !== startLine) {
        return count;
      }
      count++;
    }
    return count;
  }

  protected getComplexityLabel(complexity: number): string {
    if (complexity <= 5) return 'Low';
    if (complexity <= 10) return 'Medium';
    if (complexity <= 15) return 'High';
    return 'Very High';
  }

  protected isFunctionDefinition(line: string): boolean {
    const trimmed = line.trim();
    // Override in subclasses for language-specific patterns
    return trimmed.startsWith('def ') || 
           trimmed.startsWith('function ') ||
           trimmed.match(/^\s*(public|private|protected)?\s*(static)?\s*\w+\s*\(/);
  }

  protected isBlockEnd(line: string): boolean {
    return line.trim() === '}' || line.trim().endsWith('}');
  }

  protected extractFunctionName(line: string): string {
    const match = line.match(/(?:def|function)\s+(\w+)|(\w+)\s*\(/);
    return match?.[1] || match?.[2] || 'anonymous';
  }

  protected analyzeCodeStyle(): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];
    const lines = this.content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for trailing whitespace
      if (line.endsWith(' ') || line.endsWith('\t')) {
        issues.push({
          id: `trailing-whitespace-${i}`,
          type: 'info',
          category: 'Code Style',
          severity: 'low',
          message: 'Line has trailing whitespace',
          line: i + 1,
          column: line.length,
          code: line,
          suggestion: 'Remove trailing whitespace'
        });
      }

      // Check for multiple blank lines
      if (line.trim() === '' && i > 0 && lines[i - 1].trim() === '') {
        issues.push({
          id: `multiple-blank-lines-${i}`,
          type: 'info',
          category: 'Code Style',
          severity: 'low',
          message: 'Multiple consecutive blank lines',
          line: i + 1,
          column: 0,
          code: ''
        });
      }
    }

    return issues;
  }

  protected calculateQualityScore(issues: AnalysisIssue[]): number {
    let score = 100;
    
    for (const issue of issues) {
      const penalty = {
        critical: 10,
        high: 5,
        medium: 2,
        low: 1
      }[issue.severity];
      
      score -= penalty;
    }

    return Math.max(0, score);
  }
}
