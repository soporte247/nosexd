# Code Analyzer Tool - Development Instructions

## Project Overview
Multi-language code analysis and optimization tool supporting Python, JavaScript, Java, Ruby, Go, and Rust with web interface and CLI.

## Setup Checklist

- [x] Project structure created
- [x] TypeScript server configured
- [x] React client setup
- [x] Language analyzers implemented
- [x] Report generators configured
- [x] CLI interface created
- [x] Web API endpoints created
- [x] Documentation completed

## Architecture
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite
- **Languages Supported**: Python, JavaScript, Java, Ruby, Go, Rust
- **CLI Framework**: Commander.js
- **Report Formats**: HTML, JSON, Markdown, CSV

## Quick Start
1. Install: `npm install && cd client && npm install && cd ..`
2. Develop: `npm run dev`
3. CLI: `npm run cli analyze examples/bad_example.py`
4. Build: `npm run build`
