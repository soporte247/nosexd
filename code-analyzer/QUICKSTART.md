# 🚀 GUÍA RÁPIDA DE INICIO - CODE ANALYZER

## 📋 Resumen del Proyecto

Se ha creado una **herramienta profesional de análisis de código** que soporta 6 lenguajes de programación con análisis estático, detección de complejidad algorítmica, y generación de reportes.

### 🌍 Lenguajes Soportados
- Python (.py)
- JavaScript (.js)
- Java (.java)
- Ruby (.rb)
- Go (.go)
- Rust (.rs)

## 📁 Estructura del Proyecto

```
code-analyzer/
├── src/
│   ├── analyzers/           # Analizadores específicos por lenguaje
│   ├── reporters/           # Generadores de reportes
│   ├── server.ts            # API Express
│   └── cli.ts               # Interfaz de línea de comandos
├── client/                  # Frontend React
├── examples/                # Archivos de ejemplo
├── README.md                # Documentación completa
└── package.json             # Dependencias
```

## 🛠️ Instalación y Setup

### 1️⃣ Instalar Dependencias

```bash
# En la carpeta raíz
npm install

# En la carpeta client
cd client
npm install
cd ..
```

### 2️⃣ Configurar Variables de Entorno (Opcional)

```bash
cp .env.example .env
```

## 🎯 Modos de Uso

### Opción 1: Interfaz Web (Recomendado)

```bash
npm run dev
```
Accede a: `http://localhost:3000`

**Características:**
- Interfaz gráfica intuitiva
- Análisis visual en tiempo real
- Descarga de reportes en múltiples formatos

### Opción 2: Línea de Comandos (CLI)

#### Analizar un archivo:
```bash
npm run cli analyze examples/bad_example.py
npm run cli analyze examples/bad_example.py -f html -o report.html
npm run cli analyze src/main.js -l javascript -f json
```

#### Analizar un proyecto completo:
```bash
npm run cli project ./src
npm run cli project ./src -f csv -o project_report.csv
```

#### Ver lenguajes soportados:
```bash
npm run cli languages
```

### Opción 3: API REST

El servidor incluye una API REST completa:

```bash
# Iniciar servidor
npm start

# Analizar archivo (multipart)
curl -X POST http://localhost:3000/api/analyze -F "file=@example.py"

# Obtener lenguajes soportados
curl http://localhost:3000/api/supported-languages

# Health check
curl http://localhost:3000/api/health
```

## 📊 Tipos de Análisis

### ✅ Lo que Detecta:
1. **Complejidad Algorítmica**: O(n), O(n²), etc.
2. **Código Duplicado**: Fragmentos repetidos
3. **Buenas Prácticas**: Recomendaciones del lenguaje
4. **Funciones Largas**: Métodos de más de 50 líneas
5. **Código Ineficiente**: Patrones problemáticos
6. **Problemas de Seguridad**: Gestión de errores, etc.

### Ejemplo: Python
```python
# Detecta:
- PEP 8 violations
- Imports no utilizados
- Print statements (usar logging)
- Bare except clauses
- Funciones demasiado largas
```

## 📈 Formatos de Reporte

### HTML (Interactivo)
```bash
npm run cli analyze file.py -f html -o report.html
# Abre report.html en el navegador
```

### JSON (Para integraciones)
```bash
npm run cli analyze file.py -f json
# Perfecto para CI/CD pipelines
```

### Markdown (Documentación)
```bash
npm run cli analyze file.py -f markdown -o report.md
```

### CSV (Análisis de datos)
```bash
npm run cli project ./src -f csv -o results.csv
```

## 🔍 Ejemplos de Uso

### Ejemplo 1: Analizar archivo Python
```bash
npm run cli analyze examples/bad_example.py
```

**Salida esperada:**
```
🔍 Analyzing examples/bad_example.py...

✅ Analysis Complete!

📊 Summary:
  Language: python
  Lines of Code: 65
  Issues Found: 15
  Quality Score: 62/100

📋 Issues by Severity:
  HIGH: 3
  MEDIUM: 5
  LOW: 7
```

### Ejemplo 2: Generar reporte HTML
```bash
npm run cli analyze examples/bad_example.js -f html -o report.html
```

### Ejemplo 3: Generar reporte de proyecto
```bash
npm run cli project ./examples -f csv -o analysis.csv
```

## 🎨 Interfaz Web

### Características:
✨ Upload de archivos
📊 Análisis en tiempo real
🔍 Visualización de problemas
📥 Descarga de reportes
💾 Soporte para múltiples formatos

### Acceso:
1. Ejecuta: `npm run dev`
2. Abre: `http://localhost:3000`
3. Sube tu archivo
4. ¡Analiza!

## 🏗️ Compilación y Producción

### Build:
```bash
npm run build
```

### Ejecución:
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 🧪 Testing

### Archivos de ejemplo incluidos:
- `examples/bad_example.py` - Código Python con muchos problemas
- `examples/bad_example.js` - Código JavaScript con issues

```bash
npm run cli analyze examples/bad_example.py
npm run cli analyze examples/bad_example.js
```

## 📝 Características Principales

### Análisis Específicos por Lenguaje:

**Python:**
- PEP 8 compliance
- Detección de imports no utilizados
- Advertencias de print statements
- Análisis de funciones

**JavaScript:**
- Detección de `var` (usar let/const)
- Console.log en código producción
- Async/await sin error handling
- Loose equality (== vs ===)

**Java:**
- Convenciones de nombres (PascalCase)
- Raw types vs generics
- System.out.println detection
- Mutable static fields

**Ruby:**
- Guard clauses
- Atributos públicos innecesarios
- Magic numbers
- Convenciones de nombres

**Go:**
- Error handling
- Unused variables
- fmt.Print en producción
- Defer statements

**Rust:**
- Unsafe blocks
- unwrap() calls
- Memory safety
- Panic detection

## 🚨 Resolución de Problemas

### Error: "Cannot find module"
```bash
npm install
cd client && npm install && cd ..
```

### Puerto 3000 ocupado
```bash
# Cambiar en .env
PORT=3001
npm start
```

### TypeScript errors
```bash
npm run build
```

## 📚 Documentación Completa

Ver `README.md` para:
- API REST completa
- Opciones de CLI avanzadas
- Estructura del proyecto detallada
- Roadmap futuro

## 🎓 Casos de Uso

1. **Code Review Automatizado**: Integrar en CI/CD
2. **Educación**: Enseñanza de buenas prácticas
3. **Refactorización**: Identificar áreas de mejora
4. **Control de Calidad**: Monitoreo continuo
5. **Onboarding**: Estándares de proyecto

## 🤝 Próximos Pasos

- [ ] Instala las dependencias: `npm install`
- [ ] Prueba el CLI: `npm run cli analyze examples/bad_example.py`
- [ ] Inicia la web: `npm run dev`
- [ ] Lee la documentación: `README.md`

---

**¡La herramienta está lista para usar!** 🎉

Puedes empezar a analizar código inmediatamente con la CLI o usar la interfaz web para una experiencia visual.
