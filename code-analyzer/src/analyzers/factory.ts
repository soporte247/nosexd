import { Language, AnalysisResult } from '../types.js';
import { PythonAnalyzer } from './python.analyzer.js';
import { JavaScriptAnalyzer } from './javascript.analyzer.js';
import { JavaAnalyzer } from './java.analyzer.js';
import { RubyAnalyzer } from './ruby.analyzer.js';
import { GoAnalyzer } from './go.analyzer.js';
import { RustAnalyzer } from './rust.analyzer.js';
import { BaseAnalyzer } from './base.analyzer.js';

export class AnalyzerFactory {
  static getAnalyzer(language: Language, filePath: string): BaseAnalyzer {
    switch (language) {
      case 'python':
        return new PythonAnalyzer(language, filePath);
      case 'javascript':
        return new JavaScriptAnalyzer(language, filePath);
      case 'java':
        return new JavaAnalyzer(language, filePath);
      case 'ruby':
        return new RubyAnalyzer(language, filePath);
      case 'go':
        return new GoAnalyzer(language, filePath);
      case 'rust':
        return new RustAnalyzer(language, filePath);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  static detectLanguage(filePath: string): Language | null {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const extensionMap: Record<string, Language> = {
      'py': 'python',
      'js': 'javascript',
      'java': 'java',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust'
    };
    return extensionMap[extension || ''] || null;
  }

  static async analyzeFile(filePath: string): Promise<AnalysisResult> {
    const language = this.detectLanguage(filePath);
    if (!language) {
      throw new Error(`Cannot determine language for file: ${filePath}`);
    }

    const analyzer = this.getAnalyzer(language, filePath);
    return analyzer.analyze();
  }
}
