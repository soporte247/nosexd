import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AnalyzerFactory } from './analyzers/factory.js';
import { ReportGenerator } from './reporters/report.generator.js';
import { ProjectAnalysisReport, AnalysisResult, Language } from './types.js';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database initialization
const db = new sqlite3.Database('./data/analyzer.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Database connected');
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Projects table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Analysis results table
    db.run(`CREATE TABLE IF NOT EXISTS analysis_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      projectId INTEGER NOT NULL,
      fileName TEXT NOT NULL,
      language TEXT NOT NULL,
      linesOfCode INTEGER,
      qualityScore INTEGER,
      issuesCount INTEGER,
      result TEXT NOT NULL,
      analyzedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    )`);
  });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('client/dist'));

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Auth middleware
interface AuthRequest extends Request {
  userId?: number;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.userId = user.id;
    next();
  });
}

// Multer configuration for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ============ AUTH ROUTES ============

/**
 * POST /api/auth/register
 * Register new user
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }

        const token = jwt.sign({ id: this.lastID }, JWT_SECRET);
        res.json({ 
          id: this.lastID, 
          username, 
          email, 
          token 
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: any) => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id }, JWT_SECRET);
      res.json({ 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        token 
      });
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============ PROJECT ROUTES ============

/**
 * GET /api/projects
 * Get user's projects
 */
app.get('/api/projects', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    db.all(
      'SELECT * FROM projects WHERE userId = ? ORDER BY createdAt DESC',
      [req.userId],
      (err, projects) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch projects' });
        res.json(projects || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * POST /api/projects
 * Create new project
 */
app.post('/api/projects', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name required' });
    }

    db.run(
      'INSERT INTO projects (userId, name, description) VALUES (?, ?, ?)',
      [req.userId, name, description || ''],
      function(err) {
        if (err) return res.status(500).json({ error: 'Failed to create project' });
        res.json({ id: this.lastID, userId: req.userId, name, description });
      }
    );
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete project
 */
app.delete('/api/projects/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;

    db.run(
      'DELETE FROM projects WHERE id = ? AND userId = ?',
      [projectId, req.userId],
      function(err) {
        if (err) return res.status(500).json({ error: 'Failed to delete project' });
        res.json({ success: true });
      }
    );
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============ ANALYSIS ROUTES ============

/**
 * POST /api/analyze
 * Analyze a single file
 */
app.post('/api/analyze', upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { language, projectId } = req.body;
    const fileName = req.file.originalname;

    // Validate file
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }
    
    // Save file temporarily
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, `${Date.now()}_${fileName}`);
    fs.writeFileSync(filePath, req.file.buffer);

    // Analyze
    let detectedLanguage = language;
    if (!detectedLanguage) {
      detectedLanguage = AnalyzerFactory.detectLanguage(fileName);
    }

    if (!detectedLanguage) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ error: 'Unable to detect file language' });
    }

    const result = await AnalyzerFactory.analyzeFile(filePath);

    // Store result if projectId provided and user authenticated
    if (projectId && req.userId) {
      db.run(
        `INSERT INTO analysis_results 
        (projectId, fileName, language, linesOfCode, qualityScore, issuesCount, result) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          projectId,
          fileName,
          result.language,
          result.linesOfCode,
          result.bestPractices.score,
          result.issues.length,
          JSON.stringify(result)
        ]
      );
    }

    // Cleanup
    fs.unlinkSync(filePath);

    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

/**
 * GET /api/projects/:id/analysis
 * Get analysis results for a project
 */
app.get('/api/projects/:id/analysis', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const projectId = req.params.id;

    db.all(
      `SELECT id, fileName, language, linesOfCode, qualityScore, issuesCount, analyzedAt 
       FROM analysis_results WHERE projectId = ? ORDER BY analyzedAt DESC`,
      [projectId],
      (err, results) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch analysis' });
        res.json(results || []);
      }
    );
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * GET /api/analysis/:id
 * Get specific analysis result
 */
app.get('/api/analysis/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    db.get(
      'SELECT result FROM analysis_results WHERE id = ?',
      [req.params.id],
      (err, row: any) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch analysis' });
        if (!row) return res.status(404).json({ error: 'Analysis not found' });
        res.json(JSON.parse(row.result));
      }
    );
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ============ REPORT ROUTES ============

/**
 * POST /api/generate-report
 * Generate a formatted report
 */
app.post('/api/generate-report', (req: Request, res: Response) => {
  try {
    const { data, format } = req.body;
    
    if (!data || !format) {
      return res.status(400).json({ error: 'Missing data or format' });
    }

    let reportContent: string;
    const validFormats = ['html', 'json', 'markdown', 'csv'];

    if (!validFormats.includes(format)) {
      return res.status(400).json({ error: 'Invalid format' });
    }

    switch (format) {
      case 'html':
        reportContent = ReportGenerator.generateHTML(data);
        res.setHeader('Content-Type', 'text/html');
        break;
      case 'json':
        reportContent = ReportGenerator.generateJSON(data);
        res.setHeader('Content-Type', 'application/json');
        break;
      case 'markdown':
        if ('results' in data) {
          return res.status(400).json({ error: 'Markdown format only supports single file analysis' });
        }
        reportContent = ReportGenerator.generateMarkdown(data);
        res.setHeader('Content-Type', 'text/markdown');
        break;
      case 'csv':
        if (!('results' in data)) {
          return res.status(400).json({ error: 'CSV format only supports project analysis' });
        }
        reportContent = ReportGenerator.generateCSV(data.results);
        res.setHeader('Content-Type', 'text/csv');
        break;
      default:
        return res.status(400).json({ error: 'Unsupported format' });
    }

    res.send(reportContent);
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({ error: 'Report generation failed' });
  }
});

/**
 * GET /api/supported-languages
 * Get list of supported languages
 */
app.get('/api/supported-languages', (req: Request, res: Response) => {
  const languages: Language[] = ['python', 'javascript', 'java', 'ruby', 'go', 'rust'];
  res.json({
    languages,
    fileExtensions: {
      python: '.py',
      javascript: '.js',
      java: '.java',
      ruby: '.rb',
      go: '.go',
      rust: '.rs'
    }
  });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Code Analyzer API is running' });
});

// Serve React app for all other routes
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'client/dist/index.html'));
});

// Initialize database and start server
initializeDatabase();

app.listen(PORT, () => {
  console.log(`\n🚀 Code Analyzer Server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api/health\n`);
});

export default app;
