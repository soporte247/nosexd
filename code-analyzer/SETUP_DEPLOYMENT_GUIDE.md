# Code Analyzer v1.1.0 - Setup & Deployment Guide

**Last Updated**: December 2024  
**Version**: 1.1.0  

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Setup](#development-setup)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Database Management](#database-management)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **RAM**: 512 MB minimum
- **Disk**: 1 GB minimum
- **OS**: Windows, macOS, Linux

### Recommended Requirements
- **Node.js**: 20.0.0 LTS or higher
- **RAM**: 2-4 GB
- **Disk**: 10+ GB
- **CPU**: Multi-core processor
- **Network**: 10 Mbps or faster

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Android Chrome)

---

## Development Setup

### Step 1: Install Node.js

**Windows**:
```bash
# Option A: Using installer from nodejs.org
# Download from https://nodejs.org/en/download/

# Option B: Using Chocolatey
choco install nodejs

# Verify installation
node --version    # v18.0.0 or higher
npm --version     # 9.0.0 or higher
```

**macOS**:
```bash
# Option A: Using Homebrew
brew install node

# Option B: Using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

**Linux** (Ubuntu/Debian):
```bash
# Using apt
sudo apt update
sudo apt install nodejs npm

# Or using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Clone Project

```bash
# Clone repository (or navigate to existing folder)
cd /path/to/code-analyzer

# Or initialize if new project
mkdir code-analyzer
cd code-analyzer
npm init -y
```

### Step 3: Install Dependencies

```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 4: Setup Environment Variables

Create `.env` file in project root:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./.data/analyzer.db

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production-12345!
JWT_EXPIRATION=24h

# File Upload
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_URL=http://localhost:5000
```

### Step 5: Build Backend

```bash
# Compile TypeScript to JavaScript
npm run build

# Check output
ls -la dist/
```

### Step 6: Start Development Server

**Terminal 1** (Backend):
```bash
npm run dev:server
# Output: Server running on http://localhost:5000
```

**Terminal 2** (Frontend):
```bash
npm run dev:client
# Output: Local: http://localhost:5173
```

Or start both together:
```bash
npm run dev
# Runs both server and client concurrently
```

### Step 7: Access Application

Open browser: `http://localhost:5173`

**Demo Credentials** (for testing):
```
Email: test@example.com
Password: test123456
```

To create new account: Use Register tab on login page

---

## Production Deployment

### Option 1: Traditional Linux Server

#### Prerequisites
- Ubuntu 20.04 or higher
- SSH access
- Sudo privileges

#### Deployment Steps

**1. Connect to Server**
```bash
ssh user@your-server.com
```

**2. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Verify
```

**3. Clone Application**
```bash
cd /var/www
sudo git clone https://github.com/yourusername/code-analyzer.git
cd code-analyzer
sudo chown -R $USER:$USER .
```

**4. Install Dependencies**
```bash
npm install --production
npm run build
```

**5. Create Environment File**
```bash
cat > .env << EOF
PORT=5000
NODE_ENV=production
DATABASE_PATH=/var/data/code-analyzer.db
JWT_SECRET=$(openssl rand -base64 32)
CORS_ORIGIN=https://your-domain.com
EOF

chmod 600 .env
```

**6. Create Data Directory**
```bash
sudo mkdir -p /var/data
sudo chown -R node:node /var/data
```

**7. Setup as Systemd Service**
```bash
# Create service file
sudo cat > /etc/systemd/system/code-analyzer.service << EOF
[Unit]
Description=Code Analyzer Application
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=/var/www/code-analyzer
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/code-analyzer.log
StandardError=append:/var/log/code-analyzer.log

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable code-analyzer
sudo systemctl start code-analyzer
sudo systemctl status code-analyzer
```

**8. Setup Nginx Reverse Proxy**
```bash
# Install Nginx
sudo apt install nginx

# Create config
sudo cat > /etc/nginx/sites-available/code-analyzer << EOF
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/code-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**9. Setup SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com
```

**10. Setup Log Rotation**
```bash
sudo cat > /etc/logrotate.d/code-analyzer << EOF
/var/log/code-analyzer.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 node node
    sharedscripts
    postrotate
        systemctl restart code-analyzer > /dev/null 2>&1 || true
    endscript
}
EOF
```

---

### Option 2: Heroku Deployment

**1. Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

**2. Login to Heroku**
```bash
heroku login
```

**3. Create Procfile**
```bash
cat > Procfile << EOF
web: npm run start
EOF
```

**4. Create app.json**
```bash
cat > app.json << EOF
{
  "name": "code-analyzer",
  "description": "Multi-language code quality analysis tool",
  "buildpacks": [
    {
      "url": "heroku/nodejs"
    }
  ],
  "env": {
    "NODE_ENV": {
      "value": "production"
    },
    "JWT_SECRET": {
      "description": "JWT secret key",
      "generator": "secret"
    }
  }
}
EOF
```

**5. Create Heroku App**
```bash
heroku create your-app-name
```

**6. Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
```

**7. Deploy**
```bash
git push heroku main
```

**8. Monitor**
```bash
heroku logs --tail
heroku open
```

---

### Option 3: DigitalOcean App Platform

**1. Prepare Project**
```bash
# Ensure Procfile exists
echo "web: npm run start" > Procfile

# Add to git
git add Procfile
git commit -m "Add Procfile for deployment"
git push
```

**2. Create DigitalOcean Account**
- Visit https://digitalocean.com
- Create new App Platform project

**3. Connect GitHub**
- Link your GitHub repository
- Select `code-analyzer` repository

**4. Configure**
- Set Node environment variables
- Set PORT to 5000
- Configure database (use managed PostgreSQL or SQLite)

**5. Deploy**
- Click Deploy
- Monitor via DigitalOcean dashboard

---

## Docker Deployment

### Create Docker Image

**1. Create Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production
RUN npm run build

# Copy application
COPY . .

# Create data directory
RUN mkdir -p .data

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
```

**2. Create .dockerignore**
```
node_modules
.git
.env.local
dist
.data
.DS_Store
*.log
```

**3. Build Image**
```bash
docker build -t code-analyzer:1.1.0 .
docker tag code-analyzer:1.1.0 code-analyzer:latest
```

**4. Run Container**
```bash
docker run -d \
  --name code-analyzer \
  -p 5000:5000 \
  -v code-analyzer-data:/app/.data \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret-key \
  code-analyzer:latest
```

### Docker Compose Deployment

**Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  code-analyzer:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      JWT_SECRET: ${JWT_SECRET}
      DATABASE_PATH: /data/analyzer.db
      CORS_ORIGIN: http://localhost:5000
    volumes:
      - code-analyzer-data:/data
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - code-analyzer
    restart: always

volumes:
  code-analyzer-data:
```

**Deploy**:
```bash
docker-compose up -d
docker-compose logs -f
```

---

## Environment Configuration

### Development Environment

```env
NODE_ENV=development
PORT=5000
DATABASE_PATH=./.data/analyzer.db
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRATION=24h
MAX_FILE_SIZE=10485760
CORS_ORIGIN=http://localhost:5173
DEBUG=true
LOG_LEVEL=debug
```

### Production Environment

```env
NODE_ENV=production
PORT=5000
DATABASE_PATH=/var/data/analyzer.db
JWT_SECRET=$(openssl rand -base64 32)  # Generate secure secret
JWT_EXPIRATION=24h
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://your-domain.com
DEBUG=false
LOG_LEVEL=warn
# Optional: Email configuration
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=your-email@provider.com
SMTP_PASS=your-app-password
# Optional: Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/analyzer
```

### Environment Variables Reference

| Variable | Purpose | Development | Production |
|----------|---------|-------------|------------|
| `NODE_ENV` | Environment type | `development` | `production` |
| `PORT` | Server port | `5000` | `5000` |
| `JWT_SECRET` | Token signing key | Simple key | Random 32+ char |
| `JWT_EXPIRATION` | Token lifetime | `24h` | `24h` |
| `DATABASE_PATH` | SQLite location | `./.data/analyzer.db` | `/var/data/analyzer.db` |
| `CORS_ORIGIN` | Allowed origins | `http://localhost:5173` | `https://domain.com` |
| `MAX_FILE_SIZE` | Upload limit | `10485760` (10MB) | `10485760` |
| `DEBUG` | Debug logging | `true` | `false` |

---

## Database Management

### SQLite Database

**Backup**:
```bash
# Manual backup
cp .data/analyzer.db .data/analyzer.db.backup

# Automated backup (Linux)
0 2 * * * cp /var/data/analyzer.db /backups/analyzer.db.$(date +\%Y\%m\%d)
```

**Restore**:
```bash
cp .data/analyzer.db.backup .data/analyzer.db
```

**Optimize**:
```bash
sqlite3 .data/analyzer.db "VACUUM;"
sqlite3 .data/analyzer.db "ANALYZE;"
```

**Reset** (Development):
```bash
rm .data/analyzer.db
npm start  # Database recreated automatically
```

### Database Maintenance

**Check Integrity**:
```bash
sqlite3 .data/analyzer.db "PRAGMA integrity_check;"
```

**View Tables**:
```bash
sqlite3 .data/analyzer.db ".tables"
sqlite3 .data/analyzer.db ".schema"
```

**Query Counts**:
```bash
sqlite3 .data/analyzer.db \
  "SELECT 'users' as table, COUNT(*) as count FROM users
   UNION ALL
   SELECT 'projects', COUNT(*) FROM projects
   UNION ALL
   SELECT 'analysis_results', COUNT(*) FROM analysis_results;"
```

---

## Monitoring & Maintenance

### Health Check

```bash
# Check server health
curl http://localhost:5000/health

# Check API
curl http://localhost:5000/api/auth/login -X POST
```

### Log Monitoring

```bash
# View logs
tail -f /var/log/code-analyzer.log

# Filter errors
grep ERROR /var/log/code-analyzer.log

# Count by level
grep -c "ERROR" /var/log/code-analyzer.log
grep -c "WARN" /var/log/code-analyzer.log
```

### Performance Monitoring

```bash
# Monitor CPU and Memory
top -p $(pgrep -f "node dist/server.js")

# Monitor disk usage
du -sh .data/

# Monitor network (if using reverse proxy)
netstat -an | grep ESTABLISHED | wc -l
```

### Update Procedures

```bash
# Update dependencies
npm update

# Update specific package
npm install package-name@latest

# Rebuild
npm run build

# Restart service
sudo systemctl restart code-analyzer
```

---

## Troubleshooting

### Port Already in Use

**Windows**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000
# Kill process
taskkill /PID [PID] /F
```

**Linux/macOS**:
```bash
# Find process
lsof -i :5000
# Kill process
kill -9 [PID]
```

### Database Lock Error

```bash
# Close all instances
pkill -f "node dist/server.js"

# Check for locks
lsof .data/analyzer.db

# Remove lock file if exists
rm .data/analyzer.db-shm
rm .data/analyzer.db-wal

# Restart
npm start
```

### Authentication Issues

```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Check token in storage (browser console)
localStorage.getItem('authToken')

# Clear and re-login
localStorage.clear()
```

### File Upload Issues

```bash
# Check temp directory exists
ls -la /tmp/

# Check disk space
df -h

# Check file permissions
ls -la .data/
chmod 755 .data/
```

### Nginx Proxy Issues

```bash
# Test configuration
sudo nginx -t

# Check logs
tail -f /var/log/nginx/error.log

# Reload configuration
sudo systemctl reload nginx
```

---

## Maintenance Checklist

**Daily**:
- [ ] Monitor error logs
- [ ] Check disk space
- [ ] Verify service running

**Weekly**:
- [ ] Backup database
- [ ] Update npm packages
- [ ] Review user activity

**Monthly**:
- [ ] Update Node.js version
- [ ] Update SSL certificates
- [ ] Analyze performance metrics
- [ ] Security audit

**Quarterly**:
- [ ] Load testing
- [ ] Database optimization
- [ ] Dependency updates
- [ ] Disaster recovery test

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Status**: Production Ready
