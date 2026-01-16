#!/usr/bin/env node

import { Command } from 'commander';
import * as colors from 'colors';
import * as fs from 'fs';
import * as path from 'path';
import { AnalyzerFactory } from './analyzers/factory.js';
import { ReportGenerator } from './reporters/report.generator.js';
import { AnalysisResult, ProjectAnalysisReport } from './types.js';

const program = new Command();

program
  .name('code-analyzer')
  .description('Multi-language code analysis and optimization tool')
  .version('1.0.0');

/**
 * Analyze a single file
 */
program
  .command('analyze <filePath>')
  .option('-l, --language <lang>', 'Programming language (auto-detected if not provided)')
  .option('-f, --format <format>', 'Output format: json, html, markdown, csv', 'json')
  .option('-o, --output <path>', 'Output file path')
  .description('Analyze a single code file')
  .action(async (filePath, options) => {
    try {
      if (!fs.existsSync(filePath)) {
        console.error(colors.red(`❌ File not found: ${filePath}`));
        process.exit(1);
      }

      console.log(colors.blue(`\n🔍 Analyzing ${filePath}...`));

      const absolutePath = path.resolve(filePath);
      const result = await AnalyzerFactory.analyzeFile(absolutePath);

      // Display summary
      console.log(colors.green(`\n✅ Analysis Complete!\n`));
      console.log(colors.cyan(`📊 Summary:`));
      console.log(`  Language: ${result.language}`);
      console.log(`  Lines of Code: ${result.linesOfCode}`);
      console.log(`  Issues Found: ${colors.red(String(result.issues.length))}`);
      console.log(`  Quality Score: ${colors.yellow(`${result.bestPractices.score}/100`)}`);

      // Display issues by severity
      const severityGroups = result.issues.reduce((acc, issue) => {
        if (!acc[issue.severity]) acc[issue.severity] = [];
        acc[issue.severity].push(issue);
        return acc;
      }, {} as Record<string, typeof result.issues>);

      if (Object.keys(severityGroups).length > 0) {
        console.log(colors.cyan(`\n📋 Issues by Severity:`));
        for (const [severity, issues] of Object.entries(severityGroups)) {
          const color = severity === 'critical' ? 'red' : severity === 'high' ? 'yellow' : 'cyan';
          console.log(colors[color as keyof typeof colors](`  ${severity.toUpperCase()}: ${issues.length}`));
        }
      }

      // Generate report if output requested
      if (options.output) {
        const reportContent = this.generateReport(result, options.format);
        const outputPath = path.resolve(options.output);
        
        const directory = path.dirname(outputPath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

        fs.writeFileSync(outputPath, reportContent);
        console.log(colors.green(`\n✅ Report saved to: ${outputPath}\n`));
      } else if (options.format === 'json') {
        console.log(colors.cyan('\n📄 Full Report (JSON):\n'));
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.error(colors.red(`❌ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

/**
 * Analyze entire project directory
 */
program
  .command('project <dirPath>')
  .option('-f, --format <format>', 'Output format: json, html, csv', 'json')
  .option('-o, --output <path>', 'Output file path')
  .option('-i, --ignore <patterns>', 'Ignore patterns (comma-separated)')
  .description('Analyze an entire project directory')
  .action(async (dirPath, options) => {
    try {
      if (!fs.existsSync(dirPath)) {
        console.error(colors.red(`❌ Directory not found: ${dirPath}`));
        process.exit(1);
      }

      console.log(colors.blue(`\n🔍 Analyzing project: ${dirPath}...`));

      const results: AnalysisResult[] = [];
      const supportedExtensions = new Set(['py', 'js', 'java', 'rb', 'go', 'rs']);

      // Recursively find and analyze files
      const analyzeDirectory = async (currentPath: string) => {
        const files = fs.readdirSync(currentPath);
        
        for (const file of files) {
          const filePath = path.join(currentPath, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            if (!this.shouldIgnore(file, options.ignore)) {
              await analyzeDirectory(filePath);
            }
          } else {
            const ext = path.extname(file).substring(1);
            if (supportedExtensions.has(ext)) {
              try {
                console.log(`  Analyzing: ${filePath}`);
                const result = await AnalyzerFactory.analyzeFile(filePath);
                results.push(result);
              } catch (err) {
                console.warn(colors.yellow(`  ⚠️ Skipped: ${file}`));
              }
            }
          }
        }
      };

      await analyzeDirectory(path.resolve(dirPath));

      // Generate report
      const report: ProjectAnalysisReport = {
        projectName: path.basename(path.resolve(dirPath)),
        totalFiles: results.length,
        filesAnalyzed: results.length,
        languages: [...new Set(results.map(r => r.language))],
        results,
        summary: {
          totalIssues: results.reduce((sum, r) => sum + r.issues.length, 0),
          criticalIssues: results.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0),
          averageComplexity: results.reduce((sum, r) => sum + r.complexityAnalysis.reduce((s, c) => s + c.cyclomaticComplexity, 0) / (r.complexityAnalysis.length || 1), 0) / (results.length || 1),
          qualityScore: Math.round(results.reduce((sum, r) => sum + r.bestPractices.score, 0) / (results.length || 1))
        }
      };

      // Display summary
      console.log(colors.green(`\n✅ Project Analysis Complete!\n`));
      console.log(colors.cyan(`📊 Summary:`));
      console.log(`  Files Analyzed: ${report.filesAnalyzed}`);
      console.log(`  Languages: ${report.languages.join(', ')}`);
      console.log(`  Total Issues: ${colors.red(String(report.summary.totalIssues))}`);
      console.log(`  Critical Issues: ${colors.red(String(report.summary.criticalIssues))}`);
      console.log(`  Average Complexity: ${report.summary.averageComplexity.toFixed(2)}`);
      console.log(`  Overall Quality Score: ${colors.yellow(`${report.summary.qualityScore}/100`)}\n`);

      // Save report
      if (options.output) {
        const reportContent = this.generateReport(report, options.format);
        const outputPath = path.resolve(options.output);
        
        const directory = path.dirname(outputPath);
        if (!fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
        }

        fs.writeFileSync(outputPath, reportContent);
        console.log(colors.green(`✅ Report saved to: ${outputPath}\n`));
      }
    } catch (error) {
      console.error(colors.red(`❌ Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

/**
 * List supported languages
 */
program
  .command('languages')
  .description('List supported programming languages')
  .action(() => {
    const languages = [
      { lang: 'Python', ext: '.py' },
      { lang: 'JavaScript', ext: '.js' },
      { lang: 'Java', ext: '.java' },
      { lang: 'Ruby', ext: '.rb' },
      { lang: 'Go', ext: '.go' },
      { lang: 'Rust', ext: '.rs' }
    ];

    console.log(colors.cyan('\n📚 Supported Languages:\n'));
    languages.forEach(({ lang, ext }) => {
      console.log(`  ${colors.green(lang.padEnd(15))} (${ext})`);
    });
    console.log();
  });

/**
 * Helper methods
 */
function generateReport(data: AnalysisResult | ProjectAnalysisReport, format: string): string {
  switch (format) {
    case 'html':
      return ReportGenerator.generateHTML(data);
    case 'json':
      return ReportGenerator.generateJSON(data);
    case 'markdown':
      if ('results' in data) {
        throw new Error('Markdown format only supports single file analysis');
      }
      return ReportGenerator.generateMarkdown(data);
    case 'csv':
      if (!('results' in data)) {
        throw new Error('CSV format only supports project analysis');
      }
      return ReportGenerator.generateCSV(data.results);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function shouldIgnore(fileName: string, patterns?: string): boolean {
  const defaultIgnore = ['node_modules', '.git', '.vscode', 'dist', 'build', '__pycache__'];
  const allPatterns = defaultIgnore.concat((patterns || '').split(',').map(p => p.trim()).filter(Boolean));
  return allPatterns.some(pattern => fileName.includes(pattern));
}

program.parse();
