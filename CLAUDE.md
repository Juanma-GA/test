# CLAUDE.md — Contexto para Claude Code

Este fichero describe la arquitectura y patrones del proyecto para que Claude Code tenga contexto completo antes de hacer cualquier cambio.

## Qué es esta app

BRDP Manager es una app React + Express para gestionar Business Rules Decision Points (BRDPs) de proyectos S1000D/DITA. Sus funciones principales son:
- CRUD de BRDPs con persistencia en SQLite
- Generación de BREX DM (S1000D 4.2 y 3.0.1) y Schematron via LLM
- Asistente AI con contexto del dataset de BRDPs

## Arquitectura

```
Browser (React) → Express server.js (puerto 3000)
├── GET /* → sirve dist/ (Vite build)
├── POST /api/proxy → LLM externo (Mistral/Anthropic/OpenAI)
├── /api/brdps → SQLite (better-sqlite3)
├── /api/config → SQLite
├── /api/settings → SQLite
└── /api/notes/:id → SQLite
```

### Modos de ejecución
- **Desarrollo**: `npm run dev` → Vite dev server en puerto 5173, proxy Vite para Mistral
- **Producción**: `npm run build && npm start` → Express en puerto 3000

### Detección de entorno en frontend

```javascript
if (import.meta.env.PROD) {
  // llama a /api/proxy (Express)
} else if (import.meta.env.DEV) {
  // llama a /mistral-proxy (Vite proxy)
}
```

## Ficheros clave

| Fichero | Responsabilidad |
|---|---|
| `server.js` | Express: static files + proxy LLM + REST API SQLite |
| `src/db/database.js` | Conexión SQLite con better-sqlite3, WAL mode |
| `src/db/schema.sql` | Definición de tablas: brdps, config, settings, notes |
| `src/services/api.js` | Capa de servicio frontend: fetch a endpoints REST |
| `src/api/generateBREX.js` | Generador BREX S1000D 4.2 + helpers compartidos |
| `src/api/generateBREX301.js` | Generador BREX S1000D 3.0.1 |
| `src/api/generateBREXSch.js` | Generador Schematron 1.0 |
| `src/api/llmAPI.js` | Cliente LLM agnóstico (Anthropic/OpenAI/Mistral/Custom) |
| `src/context/BRDPContext.jsx` | Estado global de BRDPs + carga desde API |
| `src/hooks/useBRDPs.js` | Hook de BRDPs (usa BRDPContext internamente) |
| `src/hooks/useAPIKey.js` | Hook de configuración AI (lee/escribe settings API) |
| `src/hooks/useProjectConfig.js` | Hook de configuración del proyecto (lee/escribe config API) |
| `src/hooks/useLocalNotes.js` | Hook de notas (sync con API, fallback localStorage) |
| `src/components/GenerateModal.jsx` | Modal de generación: selector de formato + llamada al generador |

## Schema JSON (few-shot para LLM)

Cada generador tiene su propio schema JSON en `public/`:
- `brex-schema-summary-4-2.json` — estructura 4.2 + 37 ejemplos few-shot
- `brex-schema-summary-3-0-1.json` — estructura 3.0.1 + 37 ejemplos few-shot
- `brex-schema-summary-sch.json` — estructura Schematron + 37 ejemplos few-shot

Los ejemplos few-shot están en el campo `few_shot_examples` como array de objetos. Se inyectan en el system prompt via `buildBREXPrompt*()`. El schema JSON completo se serializa con `JSON.stringify` pero SIN el array few-shot (para evitar duplicación de tokens) — los ejemplos van formateados en un bloque separado.

## Patrones a seguir

### Generadores LLM

Los tres generadores (`generateBREX`, `generateBREX301`, `generateBREXSch`) siguen el mismo patrón:
1. `loadSchemaSummary*()` — fetch del JSON con cache en memoria
2. `buildBREXPrompt*()` — construye system + user prompt con few-shot
3. `generate*()` — orquesta la llamada LLM
4. `extractXML()` y `checkWellFormed()` — helpers compartidos, importados desde `generateBREX.js`

**NUNCA duplicar `extractXML` o `checkWellFormed`** — siempre importar desde `./generateBREX.js`.

### Hooks de datos

Todos los hooks siguen este patrón:
1. Estado inicial desde localStorage (carga instantánea)
2. `useEffect` que hace fetch a la API al montar (fuente de verdad)
3. Saves van a la API + localStorage en paralelo
4. La interfaz pública del hook no cambia aunque cambie el backend

**NUNCA acceder a localStorage directamente desde componentes** — siempre usar los hooks.

### Proxy LLM

El frontend siempre manda a `/api/proxy` en producción. El body tiene esta forma:

```javascript
{ targetEndpoint, apiKey, provider, payload }
```

donde `payload` es el body ya construido por `buildRequestBody()`. El servidor Express solo añade headers de autenticación y reenvía.

## Base de datos

- Motor: SQLite via `better-sqlite3` (síncrono)
- Fichero: `data/brdp.db` (ignorado en git)
- WAL mode activado para mejor rendimiento
- Tablas: `brdps`, `config`, `settings`, `notes`
- Campo `comments` en DB = campo `comment` en frontend (compatibilidad legacy)
- El GET `/api/brdps` devuelve ambos: `comments` y `comment` (mismo valor)

## Selectores de versión en GenerateModal

```javascript
const isBREX42 = format === 'BREX — S1000D 4.2';
const isBREX301 = format === 'BREX — S1000D 3.0.1';
const isSch = format === 'Schematron 1.0';
```

Añadir nuevos formatos requiere: nuevo generador + nuevo schema JSON + nueva rama en el if/else de `handleGenerate()` + actualizar condiciones de `disabled` y "Coming soon".

## Lo que NO está implementado todavía

- S1000D 4.1, 5.0, 6.0 (selector existe, botón deshabilitado con "Coming soon")
- Migración automática de localStorage a SQLite en primera ejecución
- Autenticación (no necesaria para uso local single-user)
- Docker con SQLite (el docker-compose actual usa nginx sin backend)

## Arquitectura de generación BREX 4.2 — Chunking

### Problema resuelto
Con datasets grandes (+100 BRDPs) el LLM truncaba el XML, inventaba IDs o saltaba BRDPs. Se implementó una estrategia de chunking con verificación y reintento.

### Estrategia actual (generateBREX.js)
- `CHUNK_SIZE = 10` — 10 BRDPs por llamada LLM
- `MAX_RETRIES = 2` — reintentos individuales para BRDPs faltantes
- Chunk 1: genera el DM completo (header + reglas del chunk)
- Chunks 2..N: genera solo `structureObjectRule` elements
- Ensamblaje via `assembleChunks()` — inserta antes de `</structureObjectRuleGroup>`
- Footer fijo `XML_FOOTER` garantiza cierre correcto del XML

### Funciones clave
| Función | Responsabilidad |
|---|---|
| `buildBREXPrompt()` | Prompt para chunk 1 (DM completo) |
| `buildBREXPromptChunk()` | Prompt para chunks 2..N (solo reglas) |
| `verifyChunkRules()` | Detecta reglas faltantes e inventadas |
| `generateSingleRule()` | Reintenta un BRDP individual hasta MAX_RETRIES |
| `assembleChunks()` | Inserta reglas en el XML, elimina truncadas, garantiza footer |
| `escapeXMLContent()` | Escapa `<`, `>`, `&` en objectUse, objectPath, objectValue |

### Flujo completo
```
targetBRDPs → chunks de 10 → Chunk 1: buildBREXPrompt → LLM → extractXML → escapeXMLContent → verifyChunkRules → removeInvented → retry missing individually → Chunks 2..N: buildBREXPromptChunk → LLM → escapeXMLContent → verifyChunkRules → removeInvented → assembleChunks → retry missing individually → assembleChunks → ensure </dmodule> footer → checkWellFormed → return
```

### Pendiente
- Replicar chunking en `generateBREX301.js` y `generateBREXSch.js`
- Errores de validación contra XSD schema (pendiente de analizar)
- `generateBREX301.js` y `generateBREXSch.js` no tienen chunking todavía

### Proxy LLM — fix importante
`AIConfigSection.jsx` y `llmAPI.js` modificados para que en producción (`import.meta.env.PROD`) todas las llamadas vayan a `/api/proxy` (Express) en lugar de al endpoint externo directamente. El body enviado al proxy tiene esta forma:
```javascript
{ targetEndpoint, apiKey, provider, payload }
```

### Guardia de validación en el chat
`useChat.js` tiene una guardia en `sendUserMessage()` que intercepta mensajes antes de llamar al LLM. Si el mensaje contiene triggers de cambio de estado (lista en `validationTriggers`), responde directamente sin llamar al LLM. También hay una restricción en el `basePrompt` como segunda capa.

