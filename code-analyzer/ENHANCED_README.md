# Code Analyzer v1.1.0 - Enhanced Multi-User Web Platform

## 🎯 Overview

Code Analyzer is a comprehensive, web-based code quality analysis tool supporting **6 programming languages** with multi-user authentication, project management, and persistent result storage.

### Key Features ✨

✅ **Multi-User Support** - Create accounts, manage projects, track analysis history  
✅ **6 Language Support** - Python, JavaScript, Java, Ruby, Go, Rust  
✅ **Zero Installation** - Pure web application, accessible from any browser  
✅ **Advanced Analysis** - Static analysis, complexity detection, code duplication, best practices  
✅ **Project Management** - Organize files into projects, persistent storage  
✅ **Beautiful Reports** - HTML, JSON, Markdown, CSV export formats  
✅ **Responsive Design** - Mobile-friendly interface with accessibility support  
✅ **Secure Authentication** - JWT tokens with bcrypt password hashing  

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript 5.3
- **Web Framework**: Express.js 4.18
- **Database**: SQLite3 5.1.6
- **Authentication**: JWT (jsonwebtoken 9.1.2) + bcrypt 5.1.1
- **File Upload**: Multer 1.4 (10MB limit)

### Frontend  
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **HTTP Client**: Axios 1.6
- **Styling**: CSS3 with responsive design

### Database Schema

```sql
-- Users Table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Analysis Results Table
CREATE TABLE analysis_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projectId INTEGER NOT NULL,
  fileName TEXT NOT NULL,
  language TEXT NOT NULL,
  fileSize INTEGER,
  linesOfCode INTEGER,
  issues JSON,
  complexityAnalysis JSON,
  bestPractices JSON,
  refactoringOpportunities JSON,
  qualityScore INTEGER,
  issuesCount INTEGER,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);
```

---

## 📁 Project Structure

```
code-analyzer/
├── src/                          # Backend source
│   ├── analyzers/                # Language-specific analyzers
│   │   ├── base.analyzer.ts      # Abstract base class
│   │   ├── python.analyzer.ts    # Python analysis
│   │   ├── javascript.analyzer.ts # JS/TS analysis
│   │   ├── java.analyzer.ts      # Java analysis
│   │   ├── ruby.analyzer.ts      # Ruby analysis
│   │   ├── go.analyzer.ts        # Go analysis
│   │   └── rust.analyzer.ts      # Rust analysis
│   ├── reporters/                # Report generation
│   │   ├── report.generator.ts   # Main report generator
│   │   └── formats/              # Format-specific reporters
│   ├── server.ts                 # Express server with auth & DB
│   ├── cli.ts                    # Command-line interface
│   └── config.ts                 # Configuration
├── client/                       # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/               # Page components
│   │   │   ├── LoginPage.tsx    # Auth page (login/register)
│   │   │   ├── Dashboard.tsx    # Projects management
│   │   │   └── AnalysisPage.tsx # File analysis interface
│   │   ├── styles/              # CSS stylesheets
│   │   │   ├── Auth.css         # Login page styling
│   │   │   ├── Dashboard.css    # Dashboard styling
│   │   │   ├── Analysis.css     # Analysis page styling
│   │   │   └── App.css          # Global styles
│   │   ├── App.tsx              # Main app router
│   │   └── main.tsx             # Entry point
│   ├── index.html               # HTML template
│   └── vite.config.ts           # Vite configuration
├── .data/                        # SQLite database directory
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone and Install**
```bash
cd code-analyzer
npm install
```

2. **Build Backend**
```bash
npm run build
```

3. **Start Development Server**
```bash
npm run dev
```

This starts both backend (port 5000) and frontend (port 5173)

### First Use

1. Open browser: `http://localhost:5173`
2. **Register**: Create account with username, email, password
3. **Login**: Use credentials to authenticate
4. **Create Project**: Click "+ New Project" on dashboard
5. **Analyze Code**: Upload file and run analysis
6. **View Results**: See detailed report with issues, complexity, refactoring suggestions
7. **Export**: Download report in HTML, JSON, Markdown, or CSV format

---

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Stateless authentication using signed tokens
- **Password Security**: bcrypt hashing with salt rounds (10)
- **Token Expiration**: 24-hour token validity
- **Protected Routes**: All analysis endpoints require valid JWT

### Input Validation
- **File Size**: 10MB maximum (prevents DoS)
- **File Type**: Language-specific extensions only
- **SQL Injection**: Parameterized queries prevent injection
- **XSS Protection**: HTML escaping in reports

### Data Privacy
- **User Isolation**: Each user only sees their own projects
- **Foreign Keys**: Database enforces referential integrity
- **Password Reset**: Secure password hashing, no plain text storage

---

## 📊 Analysis Capabilities

### What Gets Analyzed

#### 1. **Code Quality Metrics**
- Cyclomatic complexity (function complexity)
- Cognitive complexity (code difficulty)
- Lines of code (LOC) and function length
- Code duplication detection
- Maintainability index

#### 2. **Code Issues**
- **Code Style**: Naming conventions, formatting, whitespace
- **Best Practices**: Anti-patterns, performance issues, security risks
- **Error Handling**: Missing error handling, exception handling
- **Documentation**: Missing docstrings/comments
- **Complexity**: Over-complex functions, deep nesting

#### 3. **Language-Specific Analysis**

**Python**
- PEP 8 style compliance
- Type annotation coverage
- Exception handling patterns
- Import organization

**JavaScript/TypeScript**
- ES6+ best practices
- Async/await patterns
- Null/undefined checks
- Function parameter validation

**Java**
- Naming conventions (camelCase, PascalCase)
- Exception handling (checked vs unchecked)
- Method length and class complexity
- Resource management (try-with-resources)

**Ruby**
- Ruby idioms and conventions
- Block usage patterns
- Method naming standards
- Documentation coverage

**Go**
- Error handling patterns
- Interface design
- Goroutine safety
- Package organization

**Rust**
- Ownership and borrowing patterns
- Unsafe code usage
- Error handling (Result/Option)
- Performance patterns

#### 4. **Refactoring Suggestions**
- Extract Method: Long functions that can be split
- Simplify Logic: Overly complex conditions
- Remove Duplication: Repeated code patterns
- Optimize Imports: Unused or redundant imports

### Example Report

```
╔══════════════════════════════════════════════════════════╗
║         CODE ANALYZER REPORT - example.py               ║
╚══════════════════════════════════════════════════════════╝

📊 METRICS
├─ Lines of Code: 342
├─ Functions: 8
├─ Classes: 2
├─ Complexity: HIGH
└─ Quality Score: 62/100

🚨 CRITICAL ISSUES (1)
├─ Line 45: Function 'process_data' has cyclomatic complexity of 12
│  Suggestion: Extract sub-functions for different code paths

⚠️  HIGH SEVERITY (3)
├─ Line 23: Missing docstring for function 'helper'
├─ Line 67: Bare except clause found
└─ Line 89: Variable 'temp' is shadowing built-in

📈 COMPLEXITY BREAKDOWN
├─ process_data: 12 (HIGH)
├─ validate_input: 5 (MEDIUM)
└─ format_output: 2 (LOW)

💡 REFACTORING OPPORTUNITIES
├─ Extract 'validate_input' from 'process_data'
├─ Remove variable shadowing on line 89
└─ Add type hints for better code clarity

✅ Best Practices Score: 62/100
```

---

## 🌐 API Endpoints

### Authentication

```http
POST /api/auth/register
Content-Type: application/json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
Response: { "token": "jwt...", "userId": 1, "username": "john_doe" }
```

```http
POST /api/auth/login
Content-Type: application/json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
Response: { "token": "jwt...", "userId": 1, "username": "john_doe" }
```

### Projects (Requires Authentication)

```http
GET /api/projects
Authorization: Bearer {token}
Response: [{ "id": 1, "name": "My Project", "description": "...", "createdAt": "..." }]
```

```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json
{
  "name": "New Project",
  "description": "Optional description"
}
Response: { "id": 1, "name": "New Project", ... }
```

```http
DELETE /api/projects/{id}
Authorization: Bearer {token}
Response: { "success": true }
```

### Analysis

```http
POST /api/analyze
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [binary file data]
projectId: 1

Response: {
  "language": "python",
  "fileName": "example.py",
  "linesOfCode": 342,
  "issues": [...],
  "complexityAnalysis": [...],
  "bestPractices": { "score": 62 },
  "refactoringOpportunities": [...]
}
```

```http
GET /api/projects/{projectId}/analysis
Authorization: Bearer {token}
Response: [{ "id": 1, "fileName": "...", "language": "...", ... }]
```

```http
POST /api/generate-report
Authorization: Bearer {token}
Content-Type: application/json
{
  "data": { /* analysis result */ },
  "format": "html"  // or "json", "markdown", "csv"
}
Response: [binary report data]
```

---

## ⚙️ Configuration

### Environment Variables (Optional)

Create `.env` file in project root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./.data/analyzer.db

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes

# CORS
CORS_ORIGIN=http://localhost:5173
```

### TypeScript Configuration

`tsconfig.json` specifies:
- Target: ES2020
- Module: CommonJS
- Strict mode: enabled
- Source maps: enabled for debugging

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- src/analyzers/python.analyzer.test.ts
```

### Test Files

Located in `src/**/__tests__/`:
- `analyzers/test/` - Analyzer unit tests
- `reporters/test/` - Report generation tests
- `server.test.ts` - API integration tests

---

## 📈 Performance Considerations

### Scalability Features

1. **Database Indexing**
   - userId indexes on projects and analysis_results tables
   - Composite indexes for common queries

2. **File Upload Handling**
   - 10MB size limit prevents memory exhaustion
   - Streaming file processing
   - Automatic cleanup of temporary files

3. **API Rate Limiting** (Future)
   ```javascript
   // Can be added with express-rate-limit
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100 // 100 requests per 15 minutes
   });
   ```

4. **Caching Strategy** (Future)
   - Cache analysis results for identical files
   - User project list caching
   - Client-side localStorage for tokens

### Optimization Tips

**For Large Codebases**:
1. Analyze files separately, not entire projects
2. Use CLI for batch processing
3. Database indexes improve query speed
4. Consider pagination for large result sets

---

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Mac/Linux
lsof -i :5000
kill -9 [PID]
```

**Database Lock Error**
- Close all instances of the application
- Delete `.data/analyzer.db` to reset
- Restart server

**CORS Errors**
- Check that backend server is running on port 5000
- Verify frontend is on `http://localhost:5173`
- Check CORS_ORIGIN environment variable

**Authentication Failures**
- Verify JWT_SECRET is set and consistent
- Check token expiration (24 hours default)
- Clear browser localStorage and re-login

**File Upload Fails**
- Verify file is < 10MB
- Check file extension is supported (.py, .js, .java, .rb, .go, .rs)
- Ensure disk space is available

---

## 🔧 CLI Usage (Backend Only)

```bash
# Analyze single file
npm run cli -- analyze ./example.py

# Analyze with report
npm run cli -- analyze ./example.py --report html --output report.html

# Analyze entire directory
npm run cli -- analyze ./src --recursive

# Generate report
npm run cli -- report ./analysis.json --format markdown
```

---

## 📚 Code Examples

### Using the Web Application

**1. Register & Login**
```typescript
// Automatically handled by LoginPage component
// Calls POST /api/auth/register or /api/auth/login
// Stores JWT token in localStorage
```

**2. Create and Manage Projects**
```typescript
// Dashboard component handles:
// - Listing user's projects (GET /api/projects)
// - Creating new project (POST /api/projects)
// - Deleting project (DELETE /api/projects/:id)
```

**3. Analyze Code Files**
```typescript
// AnalysisPage component:
const handleAnalyze = async () => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('projectId', project.id);
  
  const response = await axios.post('/api/analyze', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  
  setResult(response.data); // Display results
};
```

**4. Export Reports**
```typescript
const handleGenerateReport = async () => {
  const response = await axios.post(
    '/api/generate-report',
    { data: result, format: 'html' },
    { responseType: 'blob' }
  );
  
  // Download file
  const url = window.URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = `report.html`;
  a.click();
};
```

---

## 🎨 UI/UX Features

### Accessibility
- ✅ WCAG 2.1 AA compliant color contrasts
- ✅ Semantic HTML5 elements
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Focus indicators visible

### Responsive Design
- ✅ Mobile-first CSS approach
- ✅ Fluid typography
- ✅ Flexible grid layouts
- ✅ Touch-friendly button sizes (44px minimum)
- ✅ Optimized for screens 320px - 4K

### Visual Feedback
- ✅ Loading spinners for async operations
- ✅ Success/error notifications
- ✅ Progress indicators
- ✅ Hover effects on interactive elements
- ✅ Color-coded severity levels

---

## 🐛 Known Limitations

1. **File Size**: Maximum 10MB per file (can be increased in config)
2. **Concurrent Uploads**: Single file at a time (can be enhanced with queue)
3. **Real-time Collaboration**: Not supported (single-user per session)
4. **Advanced Metrics**: Some languages have limited metrics (especially Go, Rust)
5. **Custom Rules**: Cannot create custom analysis rules (frontend)

---

## 🚀 Future Enhancements

- [ ] Real-time collaboration (WebSockets)
- [ ] GitHub/GitLab integration for auto-analysis
- [ ] Custom rule creation
- [ ] Team workspaces and permissions
- [ ] Advanced analytics and trends
- [ ] Code metrics dashboard
- [ ] Plugin system for custom analyzers
- [ ] Machine learning-based issue detection
- [ ] Community code sharing/benchmarking
- [ ] CI/CD pipeline integration

---

## 📄 License

MIT License - Feel free to use for personal and commercial projects

---

## 👥 Contributing

Contributions welcome! Areas to improve:

1. **More Languages**: C++, C#, PHP, Go improvements
2. **Better Metrics**: More sophisticated complexity calculations
3. **Performance**: Optimize large file analysis
4. **UI**: Enhanced visualization of metrics
5. **Tests**: Increase test coverage to 100%

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review API documentation above
3. Check console errors (F12 in browser)
4. Review server logs (terminal output)

---

## 🎉 Version History

### v1.1.0 (Current)
- ✨ Multi-user authentication with JWT
- ✨ Project management and organization
- ✨ Persistent result storage with SQLite
- ✨ Enhanced web UI with 3-page workflow
- ✨ CSS improvements for accessibility
- 🐛 Fixed file naming collision issues
- 🐛 Added proper error handling middleware
- 🐛 Improved file upload validation

### v1.0.0 (Initial Release)
- Single-file analysis
- 6 language support
- Report generation (HTML, JSON, MD, CSV)
- CLI tool

---

**Code Analyzer v1.1.0** - Making code better, one analysis at a time! 🚀
