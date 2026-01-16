# Code Analyzer - Multi-Language Code Quality Analysis Tool

Una herramienta profesional para analizar y optimizar código en múltiples lenguajes de programación. Proporciona análisis estático completo, detección de problemas de rendimiento y recomendaciones de mejora.

## 🌟 Características Principales

### ✅ Soporte Multilenguaje
- **Python** (.py) - PEP 8 compliance, import analysis
- **JavaScript** (.js) - ES6+ best practices, async/await patterns
- **Java** (.java) - Type safety, naming conventions
- **Ruby** (.rb) - Guard clauses, performance patterns
- **Go** (.go) - Error handling, concurrency patterns
- **Rust** (.rs) - Memory safety, panic handling

### 📊 Análisis de Código Completo
- **Detección de Complejidad Algorítmica**: Análisis de complejidad ciclomática y Big O
- **Código Duplicado**: Identificación de fragmentos repetidos
- **Buenas Prácticas**: Recomendaciones específicas del lenguaje
- **Optimización de Dependencias**: Análisis de librerías no utilizadas
- **Refactorización de Funciones**: Detección de métodos demasiado largos
- **Análisis de Bases de Datos**: Detección de consultas SQL ineficientes

### 📈 Métricas y Reportes
- Score de calidad (0-100)
- Estadísticas de líneas de código
- Análisis de complejidad por función
- Reportes en múltiples formatos

## 🚀 Instalación

### Requisitos
- Node.js 18+
- npm o yarn

### Pasos de Instalación

```bash
# Clonar el repositorio
cd code-analyzer

# Instalar dependencias del servidor
npm install

# Instalar dependencias del cliente
cd client
npm install
cd ..
```

## 📖 Uso

### Interfaz Web

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

Accede a `http://localhost:3000`

### Línea de Comandos (CLI)

#### Analizar un archivo
```bash
npm run cli analyze path/to/file.py
npm run cli analyze path/to/file.js -l javascript -f html -o report.html
```

#### Analizar un proyecto completo
```bash
npm run cli project ./my-project
npm run cli project ./my-project -f csv -o report.csv
```

#### Listar lenguajes soportados
```bash
npm run cli languages
```

### Opciones de CLI

#### Comando: analyze
```
Sintaxis: analyze <filePath> [options]

Opciones:
  -l, --language <lang>    Lenguaje de programación (se auto-detecta si no se proporciona)
  -f, --format <format>    Formato de salida: json, html, markdown, csv (default: json)
  -o, --output <path>      Ruta del archivo de salida
```

#### Comando: project
```
Sintaxis: project <dirPath> [options]

Opciones:
  -f, --format <format>    Formato de salida: json, html, csv (default: json)
  -o, --output <path>      Ruta del archivo de salida
  -i, --ignore <patterns>  Patrones a ignorar (separados por coma)
```

## 🔌 API REST

### Endpoints Disponibles

#### Analizar archivo
```http
POST /api/analyze
Content-Type: multipart/form-data

file: <archivo>
language: python|javascript|java|ruby|go|rust (opcional)
```

**Respuesta:**
```json
{
  "language": "python",
  "fileName": "example.py",
  "linesOfCode": 150,
  "issues": [...],
  "complexityAnalysis": [...],
  "bestPractices": {
    "score": 85
  }
}
```

#### Generar Reporte
```http
POST /api/generate-report
Content-Type: application/json

{
  "data": {...},
  "format": "html|json|markdown|csv"
}
```

#### Lenguajes Soportados
```http
GET /api/supported-languages
```

#### Health Check
```http
GET /api/health
```

## 📋 Tipos de Análisis

### 1. Análisis de Estilo de Código
- Indentación inconsistente
- Líneas muy largas
- Espacios en blanco innecesarios
- Convenciones de nombres

### 2. Análisis de Complejidad
- Complejidad ciclomática
- Funciones demasiado largas
- Anidamiento profundo
- Bucles complejos

### 3. Análisis de Seguridad
- Gestión de errores
- Manejo de excepciones
- Acceso a memoria (Rust)
- Operaciones unsafe

### 4. Análisis de Rendimiento
- Clonación innecesaria (Rust)
- Operaciones N+1 en bases de datos
- Consultas ineficientes
- Uso de bucles vs iteradores

### 5. Análisis de Dependencias
- Importaciones no utilizadas
- Librerías obsoletas
- Conflictos de versiones
- Dependencias circulares

## 📊 Formatos de Reporte

### HTML
Reporte interactivo con estilos, tablas y visualizaciones.

```bash
npm run cli analyze file.py -f html -o report.html
```

### JSON
Formato estructurado para integración con otras herramientas.

```bash
npm run cli analyze file.py -f json -o report.json
```

### Markdown
Documento legible con formato markdown.

```bash
npm run cli analyze file.py -f markdown -o report.md
```

### CSV
Tabla de datos para análisis en hojas de cálculo.

```bash
npm run cli project ./src -f csv -o results.csv
```

## 🏗️ Estructura del Proyecto

```
code-analyzer/
├── src/
│   ├── analyzers/
│   │   ├── base.analyzer.ts       # Clase base para analizadores
│   │   ├── python.analyzer.ts     # Analizador de Python
│   │   ├── javascript.analyzer.ts # Analizador de JavaScript
│   │   ├── java.analyzer.ts       # Analizador de Java
│   │   ├── ruby.analyzer.ts       # Analizador de Ruby
│   │   ├── go.analyzer.ts         # Analizador de Go
│   │   ├── rust.analyzer.ts       # Analizador de Rust
│   │   └── factory.ts             # Factory pattern para crear analizadores
│   ├── reporters/
│   │   └── report.generator.ts    # Generador de reportes
│   ├── types.ts                    # Interfaces y tipos TypeScript
│   ├── server.ts                   # Servidor Express
│   └── cli.ts                      # Interfaz de línea de comandos
├── client/
│   ├── src/
│   │   ├── App.tsx                # Componente principal React
│   │   ├── App.css                # Estilos
│   │   └── main.tsx               # Entrada de la aplicación
│   ├── index.html                 # HTML principal
│   ├── vite.config.ts             # Configuración de Vite
│   └── package.json               # Dependencias del cliente
├── package.json                    # Dependencias del servidor
├── tsconfig.json                  # Configuración de TypeScript
└── README.md                      # Este archivo
```

## 🔧 Desarrollo

### Scripts Disponibles

```bash
# Iniciar servidor y cliente en desarrollo
npm run dev

# Compilar TypeScript
npm run build

# Iniciar servidor en producción
npm start

# CLI
npm run cli

# Linting
npm run lint

# Tests
npm run test
```

## 📈 Ejemplos de Uso

### Ejemplo 1: Analizar archivo Python
```bash
npm run cli analyze app.py
```

Salida:
```
🔍 Analyzing app.py...

✅ Analysis Complete!

📊 Summary:
  Language: python
  Lines of Code: 250
  Issues Found: 12
  Quality Score: 78/100

📋 Issues by Severity:
  HIGH: 2
  MEDIUM: 4
  LOW: 6
```

### Ejemplo 2: Generar reporte HTML
```bash
npm run cli analyze src/main.js -f html -o report.html
```

### Ejemplo 3: Analizar proyecto completo
```bash
npm run cli project ./src -f csv -o results.csv -i node_modules,__pycache__
```

## 🎯 Casos de Uso

1. **Revisión de Código Automática**: Integrar en CI/CD pipelines
2. **Enseñanza de Buenas Prácticas**: Educación en programación
3. **Refactorización de Código**: Identificar áreas de mejora
4. **Control de Calidad**: Monitorear calidad del código
5. **Onboarding**: Familiarizar nuevos desarrolladores con estándares

## 🔒 Limitaciones

- Análisis estático (sin ejecución de código)
- Limitado a patrones detectables mediante regex y parsing
- No detecta errores de lógica
- Requiere archivos completos y compilables

## 🛠️ Roadmap Futuro

- [ ] Integración con SonarQube
- [ ] Plugins para IDEs (VSCode, IntelliJ)
- [ ] Machine Learning para detección de anomalías
- [ ] Dashboard de tendencias
- [ ] Integración con GitHub/GitLab
- [ ] Análisis de seguridad avanzado
- [ ] Soporte para más lenguajes (PHP, C#, Kotlin)

## 📝 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

Para reportar bugs o sugerencias, abre un issue en el repositorio.

---

**Code Analyzer v1.0.0** - Herramienta profesional para análisis de código multilenguaje
