export type Language = 'python' | 'javascript' | 'java' | 'ruby' | 'go' | 'rust';

export interface AnalysisIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  line: number;
  column: number;
  code: string;
  suggestion?: string;
}

export interface ComplexityAnalysis {
  functionName: string;
  complexity: string;
  lines: number;
  cyclomaticComplexity: number;
  recommendation?: string;
}

export interface DuplicateBlock {
  id: string;
  locations: {
    file: string;
    lines: number[];
  }[];
  code: string;
  occurrences: number;
}

export interface Dependency {
  name: string;
  version: string;
  used: boolean;
  location?: string;
}

export interface AnalysisResult {
  language: Language;
  fileName: string;
  fileSize: number;
  linesOfCode: number;
  issues: AnalysisIssue[];
  complexityAnalysis: ComplexityAnalysis[];
  duplicates: DuplicateBlock[];
  bestPractices: {
    score: number;
    violations: AnalysisIssue[];
  };
  dependencies?: Dependency[];
  databaseQueries?: {
    inefficient: AnalysisIssue[];
  };
  refactoringOpportunities: {
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  timestamp: Date;
}

export interface ProjectAnalysisReport {
  projectName: string;
  totalFiles: number;
  filesAnalyzed: number;
  languages: Language[];
  results: AnalysisResult[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    averageComplexity: number;
    qualityScore: number;
  };
}
