import { AnalysisResult, ProjectAnalysisReport, AnalysisIssue } from '../types.js';
import * as fs from 'fs';

export class ReportGenerator {
  static generateHTML(results: AnalysisResult | ProjectAnalysisReport): string {
    if ('results' in results) {
      return this.generateProjectHTML(results as ProjectAnalysisReport);
    }
    return this.generateFileHTML(results as AnalysisResult);
  }

  private static generateProjectHTML(report: ProjectAnalysisReport): string {
    const css = this.getCSS();
    const issuesHTML = report.results
      .map(result => this.generateIssueSection(result))
      .join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Analysis Report - ${report.projectName}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1>Code Analysis Report</h1>
            <h2>${report.projectName}</h2>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
          </header>

          <section class="summary">
            <h3>Project Summary</h3>
            <div class="summary-grid">
              <div class="stat">
                <span class="label">Total Files:</span>
                <span class="value">${report.totalFiles}</span>
              </div>
              <div class="stat">
                <span class="label">Files Analyzed:</span>
                <span class="value">${report.filesAnalyzed}</span>
              </div>
              <div class="stat">
                <span class="label">Total Issues:</span>
                <span class="value critical">${report.summary.totalIssues}</span>
              </div>
              <div class="stat">
                <span class="label">Critical Issues:</span>
                <span class="value high">${report.summary.criticalIssues}</span>
              </div>
              <div class="stat">
                <span class="label">Quality Score:</span>
                <span class="value">${report.summary.qualityScore}/100</span>
              </div>
            </div>
          </section>

          <section class="files">
            <h3>File Analysis</h3>
            ${issuesHTML}
          </section>

          <footer class="footer">
            <p>Code Analyzer v1.0.0 - Multi-language Code Quality Analysis Tool</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }

  private static generateFileHTML(result: AnalysisResult): string {
    const css = this.getCSS();
    const issuesHTML = result.issues.map(issue => `
      <div class="issue severity-${issue.severity}">
        <div class="issue-header">
          <span class="issue-type">${issue.type.toUpperCase()}</span>
          <span class="issue-category">${issue.category}</span>
          <span class="issue-location">Line ${issue.line}:${issue.column}</span>
        </div>
        <div class="issue-body">
          <p class="message">${issue.message}</p>
          <code class="code">${this.escapeHtml(issue.code)}</code>
          ${issue.suggestion ? `<p class="suggestion"><strong>Suggestion:</strong> ${issue.suggestion}</p>` : ''}
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Analysis - ${result.fileName}</title>
        <style>${css}</style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <h1>Code Analysis Report</h1>
            <h2>${result.fileName}</h2>
            <p class="language">Language: ${result.language}</p>
          </header>

          <section class="stats">
            <div class="stat-card">
              <span class="stat-label">Lines of Code</span>
              <span class="stat-value">${result.linesOfCode}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">File Size</span>
              <span class="stat-value">${(result.fileSize / 1024).toFixed(2)} KB</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Issues</span>
              <span class="stat-value">${result.issues.length}</span>
            </div>
            <div class="stat-card">
              <span class="stat-label">Quality Score</span>
              <span class="stat-value">${result.bestPractices.score}/100</span>
            </div>
          </section>

          <section class="issues">
            <h3>Issues Found (${result.issues.length})</h3>
            ${issuesHTML || '<p class="no-issues">No issues found!</p>'}
          </section>

          <section class="complexity">
            <h3>Complexity Analysis</h3>
            <table class="complexity-table">
              <thead>
                <tr>
                  <th>Function</th>
                  <th>Complexity</th>
                  <th>Cyclomatic</th>
                  <th>Lines</th>
                </tr>
              </thead>
              <tbody>
                ${result.complexityAnalysis.map(c => `
                  <tr>
                    <td>${c.functionName}</td>
                    <td>${c.complexity}</td>
                    <td>${c.cyclomaticComplexity}</td>
                    <td>${c.lines}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </section>

          <footer class="footer">
            <p>Code Analyzer v1.0.0</p>
          </footer>
        </div>
      </body>
      </html>
    `;
  }

  private static generateIssueSection(result: AnalysisResult): string {
    const issuesHTML = result.issues
      .slice(0, 5)
      .map(issue => `
        <div class="issue severity-${issue.severity}">
          <span>${issue.message}</span>
          <small>Line ${issue.line}</small>
        </div>
      `).join('');

    return `
      <div class="file-analysis">
        <h4>${result.fileName}</h4>
        <p><small>${result.language} | ${result.linesOfCode} LOC | Quality: ${result.bestPractices.score}/100</small></p>
        <div class="issues">
          ${issuesHTML}
          ${result.issues.length > 5 ? `<p><small>+${result.issues.length - 5} more issues</small></p>` : ''}
        </div>
      </div>
    `;
  }

  static generateJSON(results: AnalysisResult | ProjectAnalysisReport): string {
    return JSON.stringify(results, null, 2);
  }

  static generateMarkdown(result: AnalysisResult): string {
    const issues = result.issues
      .map(issue => `
- **[${issue.severity.toUpperCase()}]** ${issue.message}
  - Line: ${issue.line}:${issue.column}
  - Category: ${issue.category}
  - Suggestion: ${issue.suggestion || 'N/A'}
`)
      .join('');

    return `
# Code Analysis Report: ${result.fileName}

## Overview
- **Language:** ${result.language}
- **Lines of Code:** ${result.linesOfCode}
- **File Size:** ${(result.fileSize / 1024).toFixed(2)} KB
- **Quality Score:** ${result.bestPractices.score}/100

## Issues (${result.issues.length})
${issues || 'No issues found!'}

## Complexity Analysis
${result.complexityAnalysis.map(c => `- **${c.functionName}**: ${c.complexity} complexity (Cyclomatic: ${c.cyclomaticComplexity})`).join('\n')}

## Refactoring Opportunities
${result.refactoringOpportunities.map(op => `- **[${op.priority.toUpperCase()}]** ${op.description}`).join('\n')}
`;
  }

  static generateCSV(results: AnalysisResult[]): string {
    const header = 'File,Language,LOC,Issues,Quality Score,Critical Issues\n';
    const rows = results.map(r => 
      `${r.fileName},${r.language},${r.linesOfCode},${r.issues.length},${r.bestPractices.score},${r.issues.filter(i => i.severity === 'critical').length}`
    ).join('\n');
    return header + rows;
  }

  static saveReport(content: string, format: 'html' | 'json' | 'markdown' | 'csv', outputPath: string): void {
    const extensions = { html: '.html', json: '.json', markdown: '.md', csv: '.csv' };
    const fileName = `report${extensions[format]}`;
    const filePath = `${outputPath}/${fileName}`;
    
    fs.mkdirSync(outputPath, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Report saved to: ${filePath}`);
  }

  private static getCSS(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: #333;
        line-height: 1.6;
        min-height: 100vh;
        padding: 20px;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        overflow: hidden;
      }
      
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      
      .header h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
      }
      
      .header h2 {
        font-size: 1.8em;
        margin-bottom: 10px;
        opacity: 0.9;
      }
      
      .timestamp {
        font-size: 0.9em;
        opacity: 0.8;
      }
      
      .summary, .stats, .issues, .complexity {
        padding: 30px;
        border-bottom: 1px solid #eee;
      }
      
      .summary h3, .stats h3, .issues h3, .complexity h3 {
        font-size: 1.5em;
        margin-bottom: 20px;
        color: #667eea;
      }
      
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }
      
      .stat, .stat-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }
      
      .stat-label {
        display: block;
        font-size: 0.9em;
        color: #666;
        margin-bottom: 8px;
      }
      
      .stat-value, .value {
        font-size: 1.8em;
        font-weight: bold;
        color: #667eea;
      }
      
      .stat-value.critical, .value.critical {
        color: #e74c3c;
      }
      
      .stat-value.high, .value.high {
        color: #f39c12;
      }
      
      .issue {
        background: #f8f9fa;
        border-left: 4px solid #95a5a6;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 4px;
      }
      
      .issue.severity-critical {
        border-left-color: #e74c3c;
        background: #fadbd8;
      }
      
      .issue.severity-high {
        border-left-color: #f39c12;
        background: #fef5e7;
      }
      
      .issue.severity-medium {
        border-left-color: #3498db;
        background: #ebf5fb;
      }
      
      .issue-header {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
        flex-wrap: wrap;
      }
      
      .issue-type, .issue-category, .issue-location {
        font-size: 0.85em;
        padding: 4px 8px;
        background: white;
        border-radius: 4px;
      }
      
      .issue-type {
        background: #667eea;
        color: white;
      }
      
      .message {
        font-weight: 500;
        margin-bottom: 8px;
      }
      
      .code {
        background: #2c3e50;
        color: #ecf0f1;
        padding: 10px;
        border-radius: 4px;
        display: block;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 0.9em;
        margin: 10px 0;
      }
      
      .suggestion {
        margin-top: 10px;
        padding: 10px;
        background: #e8f5e9;
        border-radius: 4px;
        color: #2e7d32;
      }
      
      .complexity-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .complexity-table th {
        background: #667eea;
        color: white;
        padding: 12px;
        text-align: left;
      }
      
      .complexity-table td {
        padding: 12px;
        border-bottom: 1px solid #ddd;
      }
      
      .complexity-table tr:hover {
        background: #f5f5f5;
      }
      
      .file-analysis {
        background: #f8f9fa;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }
      
      .no-issues {
        color: #27ae60;
        font-weight: bold;
        text-align: center;
        padding: 20px;
      }
      
      .footer {
        background: #f8f9fa;
        padding: 20px;
        text-align: center;
        color: #666;
        font-size: 0.9em;
      }
    `;
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
