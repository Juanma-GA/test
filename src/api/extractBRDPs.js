/**
 * extractBRDPs.js
 * Extracts BRDPs from Style Guide or BREXDoc documents
 * Supports DOCX and PDF input via text extraction in the browser
 */

import { sendMessage } from "./llmAPI.js";

// ─────────────────────────────────────────────
// Text extraction
// ─────────────────────────────────────────────

/**
 * Extract text from a DOCX file using mammoth
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromDOCX(file) {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extract text from a PDF file using pdf.js
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromPDF(file) {
  const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

/**
 * Extract text from a File — auto-detects DOCX or PDF
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) return extractTextFromDOCX(file);
  if (name.endsWith(".pdf")) return extractTextFromPDF(file);
  throw new Error("Unsupported file type. Please upload a .docx or .pdf file.");
}

// ─────────────────────────────────────────────
// Chunking strategy
// ─────────────────────────────────────────────

const CHUNK_SIZE = 6000;
const OVERLAP = 600;

function splitIntoChunks(text) {
  const chunks = [];
  let start = 0;
  const maxIterations = Math.ceil(text.length / (CHUNK_SIZE - OVERLAP)) + 10;
  let iterations = 0;

  while (start < text.length && iterations < maxIterations) {
    iterations++;
    let end = Math.min(start + CHUNK_SIZE, text.length);

    if (end < text.length) {
      const lastNewline = text.lastIndexOf('\n', end);
      if (lastNewline > start + CHUNK_SIZE * 0.5) {
        end = lastNewline;
      }
    }

    const chunk = text.slice(start, end).trim();
    if (chunk.length > 50) {
      chunks.push(chunk);
    }

    const nextStart = end - OVERLAP;
    if (nextStart <= start) {
      start = end + 1;
    } else {
      start = nextStart;
    }
  }

  return chunks;
}

function deduplicateBRDPs(allBRDPs) {
  if (allBRDPs.length === 0) return [];

  const unique = [allBRDPs[0]];

  for (let i = 1; i < allBRDPs.length; i++) {
    const current = allBRDPs[i];
    const isDuplicate = unique.some(u => {
      const proposalSimilarity = calculateSimilarity(u.proposal, current.proposal);
      return proposalSimilarity > 0.8;
    });

    if (!isDuplicate) {
      unique.push(current);
    }
  }

  return unique;
}

function calculateSimilarity(str1, str2) {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;

  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  let matches = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }

  return matches / longer.length;
}

// ─────────────────────────────────────────────
// ID generation
// ─────────────────────────────────────────────

/**
 * Generate sequential IDs continuing from existing BRDPs
 * @param {Array} existingBRDPs
 * @param {number} count
 * @returns {string[]}
 */
export function generateIds(existingBRDPs, count) {
  if (!count || count <= 0) return [];
  let maxNum = 0;
  existingBRDPs.forEach((b) => {
    const match = b.id?.match(/(\d+)$/);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  });

  return Array.from({ length: count }, (_, i) => {
    const num = maxNum + i + 1;
    return `BRDP-EXT-${String(num).padStart(5, "0")}`;
  });
}

// ─────────────────────────────────────────────
// Prompt builder
// ─────────────────────────────────────────────

function buildExtractionPrompt(chunkText, sourceType) {
  let baseSystem = `You are an S1000D BRDP expert. Extract all Business Rules Decision Points from the provided document section.

The document may be in English or Spanish. Extract rules in the original language of the document.

Identify rules by these patterns:
- Sentences containing: shall, must, must not, should not, is required, is mandatory
- Paragraphs prefixed with: "Regla SOPTE:", "Decisión específica", "Regla de edición", or equivalent rule markers in any language
- Any statement that defines how something must or must not be done`;

  if (sourceType === 'Others') {
    baseSystem += `
- The document may be any type of technical or procedural document. Extract any statement that defines a rule, decision, requirement, constraint, or recommendation.`;
  }

  const system = `${baseSystem}

For each rule generate exactly this JSON object:
{
  "title": "Short title max 8 words summarising the rule",
  "definition": "The topic area or section this rule belongs to",
  "proposal": "The exact rule text — do not paraphrase or shorten",
  "validation": "Pending",
  "comment": "Source: [chapter or section reference if available]"
}

STRICT OUTPUT RULES:
1. Return ONLY a valid JSON array
2. Start your response with [ and end with ]
3. No explanation, no markdown fences, no preamble, no trailing text
4. Do not skip any rules — extract ALL of them
5. If a paragraph contains multiple rules, create one BRDP per rule
6. proposal must be the exact original text`;

  const user = `Extract all BRDPs from this ${sourceType} section:

${chunkText}`;

  return { system, user };
}

// ─────────────────────────────────────────────
// JSON parser
// ─────────────────────────────────────────────

function parseJSONResponse(raw) {
  if (!raw) throw new Error("Empty response from LLM");

  let text = raw.trim();

  // Strip markdown fences if present
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");

  // Find array bounds
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("Response does not contain a JSON array");
  }
  text = text.slice(start, end + 1);

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`Failed to parse JSON response: ${err.message}`);
  }
}

// ─────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────

/**
 * Extract BRDPs from a document file
 *
 * @param {File}     file            — uploaded File object
 * @param {Array}    existingBRDPs   — current BRDPs (for ID generation)
 * @param {Object}   options
 * @param {string}   options.apiKey
 * @param {string}   options.modelName
 * @param {string}   options.provider
 * @param {string}   options.sourceType  — 'Style Guide' | 'BREX Doc'
 * @param {Function} options.onProgress  — progress callback: (current, total, foundCount)
 * @param {Object}   options.abortController
 *
 * @returns {Promise<{ brdps: Array, rawCount: number }>}
 */
export async function extractBRDPs(file, existingBRDPs, options = {}) {
  const {
    apiKey,
    modelName,
    provider = "Anthropic",
    sourceType = "document",
    onProgress,
    abortController,
  } = options;

  if (!apiKey) throw new Error("API key is required. Please configure it in Settings.");

  // Step 1 — Extract text from file
  let documentText;
  try {
    documentText = await extractTextFromFile(file);
  } catch (err) {
    throw new Error(`Could not read file: ${err.message}`);
  }

  if (!documentText || documentText.trim().length < 100) {
    throw new Error("The document appears to be empty or could not be read.");
  }

  // Step 2 — Split into chunks
  const chunks = splitIntoChunks(documentText);
  const allExtracted = [];

  // Step 3 — Process each chunk
  for (let i = 0; i < chunks.length; i++) {
    if (abortController?.signal.aborted) {
      throw new Error("Extraction cancelled by user.");
    }

    try {
      const { system, user } = buildExtractionPrompt(chunks[i], sourceType);
      const messages = [{ role: "user", content: user }];

      const response = await sendMessage(
        messages,
        apiKey,
        modelName,
        provider,
        system
      );

      const extracted = parseJSONResponse(response.content);
      if (Array.isArray(extracted)) {
        allExtracted.push(...extracted);
      }
    } catch (err) {
      // Silently skip failed chunks
    }

    if (onProgress) {
      onProgress(i + 1, chunks.length, allExtracted.length);
    }
  }

  if (allExtracted.length === 0) {
    throw new Error("No BRDPs were found in the document.");
  }

  // Step 4 — Deduplicate overlapping results
  const deduplicated = deduplicateBRDPs(allExtracted);

  // Step 5 — Assign IDs
  const ids = generateIds(existingBRDPs, deduplicated.length);
  const brdps = deduplicated.map((b, i) => ({
    id: ids[i],
    title: b.title || '',
    definition: b.title || '',
    proposal: b.proposal || '',
    validation: 'Pending',
    comment: b.comment || '',
    history: [],
  }));

  return { brdps, rawCount: deduplicated.length };
}
