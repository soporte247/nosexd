import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Analysis.css';

interface AnalysisPageProps {
  project: any;
  user: any;
  onBack: () => void;
}

interface AnalysisResult {
  language: string;
  fileName: string;
  fileSize: number;
  linesOfCode: number;
  issues: any[];
  complexityAnalysis: any[];
  bestPractices: {
    score: number;
  };
  refactoringOpportunities: any[];
}

function AnalysisPage({ project, user, onBack }: AnalysisPageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reportFormat, setReportFormat] = useState('html');
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  const fetchAnalysisHistory = async () => {
    try {
      const response = await axios.get(`/api/projects/${project.id}/analysis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyses(response.data);
    } catch (err) {
      console.error('Failed to fetch analysis history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validExtensions = ['.py', '.js', '.java', '.rb', '.go', '.rs'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setError('Invalid file type. Supported: Python, JavaScript, Java, Ruby, Go, Rust');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File too large (max 10MB)');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', String(project.id));

      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });

      setResult(response.data);
      setFile(null);
      
      // Refresh analysis history
      await fetchAnalysisHistory();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!result) return;

    try {
      const response = await axios.post(
        '/api/generate-report',
        {
          data: result,
          format: reportFormat,
        },
        {
          responseType: reportFormat === 'html' ? 'blob' : 'text',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const blob = new Blob([response.data], {
        type: reportFormat === 'html' ? 'text/html' : 'text/plain',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().getTime()}.${reportFormat === 'markdown' ? 'md' : reportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to generate report');
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      critical: '#e74c3c',
      high: '#f39c12',
      medium: '#3498db',
      low: '#95a5a6',
    };
    return colors[severity] || '#95a5a6';
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="analysis-page">
      <header className="analysis-header">
        <div>
          <button onClick={onBack} className="back-btn">← Back</button>
          <h1>📂 {project.name}</h1>
        </div>
        <div className="header-user">
          <span>{user.username || user.email}</span>
        </div>
      </header>

      <main className="analysis-main">
        <section className="upload-section">
          <div className="upload-box">
            <h2>Upload File to Analyze</h2>
            <p>Supported: Python (.py), JavaScript (.js), Java (.java), Ruby (.rb), Go (.go), Rust (.rs)</p>
            
            <div className="file-input-wrapper">
              <input
                type="file"
                onChange={handleFileChange}
                className="file-input"
                accept=".py,.js,.java,.rb,.go,.rs"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="file-label">
                {file ? file.name : 'Click to select file'}
              </label>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="analyze-btn"
            >
              {loading ? '⏳ Analyzing...' : '🔍 Analyze Code'}
            </button>

            {error && <div className="error">{error}</div>}
          </div>
        </section>

        {result && (
          <section className="results-section">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <div className="report-controls">
                <select
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value)}
                  className="format-select"
                >
                  <option value="html">📄 HTML Report</option>
                  <option value="json">📊 JSON Report</option>
                  <option value="markdown">📝 Markdown Report</option>
                </select>
                <button onClick={handleGenerateReport} className="report-btn">
                  ⬇️ Download Report
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>Language</h3>
                <p className="stat-value">{result.language.toUpperCase()}</p>
              </div>
              <div className="stat-card">
                <h3>Lines of Code</h3>
                <p className="stat-value">{result.linesOfCode}</p>
              </div>
              <div className="stat-card">
                <h3>Total Issues</h3>
                <p className="stat-value issues">{result.issues.length}</p>
              </div>
              <div className="stat-card">
                <h3>Quality Score</h3>
                <p className="stat-value quality" style={{ color: getQualityColor(result.bestPractices.score) }}>
                  {result.bestPractices.score}/100
                </p>
              </div>
              <div className="stat-card">
                <h3>File Size</h3>
                <p className="stat-value">{(result.fileSize / 1024).toFixed(2)} KB</p>
              </div>
            </div>

            {result.issues.length > 0 && (
              <div className="issues-section">
                <h3>🚨 Issues Found ({result.issues.length})</h3>
                <div className="issues-list">
                  {result.issues.slice(0, 15).map((issue: any, idx: number) => (
                    <div
                      key={idx}
                      className="issue-item"
                      style={{ borderLeft: `4px solid ${getSeverityColor(issue.severity)}` }}
                    >
                      <div className="issue-header">
                        <span className="severity" style={{ color: getSeverityColor(issue.severity) }}>
                          {issue.severity.toUpperCase()}
                        </span>
                        <span className="category">{issue.category}</span>
                        <span className="line">Line {issue.line}:{issue.column}</span>
                      </div>
                      <p className="issue-message">{issue.message}</p>
                      {issue.code && (
                        <code className="issue-code">{issue.code.substring(0, 100)}...</code>
                      )}
                      {issue.suggestion && (
                        <p className="suggestion">💡 <strong>Suggestion:</strong> {issue.suggestion}</p>
                      )}
                    </div>
                  ))}
                  {result.issues.length > 15 && (
                    <p className="more-issues">+{result.issues.length - 15} more issues</p>
                  )}
                </div>
              </div>
            )}

            {result.complexityAnalysis.length > 0 && (
              <div className="complexity-section">
                <h3>📈 Complexity Analysis</h3>
                <table className="complexity-table">
                  <thead>
                    <tr>
                      <th>Function</th>
                      <th>Complexity</th>
                      <th>Cyclomatic</th>
                      <th>Lines</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.complexityAnalysis.map((c: any, idx: number) => (
                      <tr key={idx}>
                        <td>{c.functionName}</td>
                        <td>
                          <span className={`complexity-badge ${c.complexity.toLowerCase()}`}>
                            {c.complexity}
                          </span>
                        </td>
                        <td>{c.cyclomaticComplexity}</td>
                        <td>{c.lines}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.refactoringOpportunities.length > 0 && (
              <div className="refactoring-section">
                <h3>🔧 Refactoring Opportunities</h3>
                <div className="refactoring-list">
                  {result.refactoringOpportunities.map((op: any, idx: number) => (
                    <div key={idx} className={`refactoring-item priority-${op.priority}`}>
                      <span className="priority-badge">{op.priority.toUpperCase()}</span>
                      <p>{op.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {!historyLoading && analyses.length > 0 && !result && (
          <section className="history-section">
            <h3>📋 Recent Analysis</h3>
            <div className="analysis-history">
              {analyses.slice(0, 10).map((analysis: any) => (
                <div key={analysis.id} className="history-item">
                  <div className="history-info">
                    <strong>{analysis.fileName}</strong>
                    <span className="language-badge">{analysis.language}</span>
                  </div>
                  <div className="history-stats">
                    <small>Quality: {analysis.qualityScore}/100</small>
                    <small>Issues: {analysis.issuesCount}</small>
                    <small>LOC: {analysis.linesOfCode}</small>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="analysis-footer">
        <p>Code Analyzer v1.1.0 | Analyze • Optimize • Improve</p>
      </footer>
    </div>
  );
}

export default AnalysisPage;
