/**
 * extractBRDPs.js
 * Extracts BRDPs from Style Guide or BREXDoc documents
 * Supports DOCX and PDF input via text extraction in the browser
 */

import { sendMessageStream } from "./llmAPI.js";

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
// ID generation
// ─────────────────────────────────────────────

/**
 * Generate sequential IDs continuing from existing BRDPs
 * @param {Array} existingBRDPs
 * @param {number} count
 * @returns {string[]}
 */
export function generateIds(existingBRDPs, count) {
  // Find highest existing numeric suffix
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

function buildExtractionPrompt(documentText, sourceType) {
  const system = `You are an S1000D BRDP expert. Extract all Business Rules Decision Points from the provided document.

The document may be in English or Spanish. Extract rules in the original language of the document.

Identify rules by these patterns:
- Sentences containing: shall, must, must not, should not, is required, is mandatory
- Paragraphs prefixed with: "Regla SOPTE:", "Decisión específica", "Regla de edición", or equivalent rule markers in any language
- Any statement that defines how something must or must not be done

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

  const user = `Extract all BRDPs from this ${sourceType} document:

${documentText}`;

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
 * @param {Function} options.onChunk     — streaming callback
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
    onChunk,
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

  // Step 2 — Build prompt
  const { system, user } = buildExtractionPrompt(documentText, sourceType);
  const messages = [{ role: "user", content: user }];

  // Step 3 — Call LLM
  let rawResponse;
  try {
    rawResponse = await sendMessageStream(
      messages,
      apiKey,
      modelName,
      provider,
      system,
      onChunk,
      abortController
    );
  } catch (err) {
    throw new Error(`LLM call failed: ${err.message}`);
  }

  // Step 4 — Parse response
  const extracted = parseJSONResponse(rawResponse);

  if (!Array.isArray(extracted) || extracted.length === 0) {
    throw new Error("No BRDPs were found in the document.");
  }

  // Step 5 — Assign IDs
  const ids = generateIds(existingBRDPs, extracted.length);
  const brdps = extracted.map((b, i) => ({
    id: ids[i],
    title: b.title || "",
    definition: b.definition || "",
    proposal: b.proposal || "",
    validation: "Pending",
    comment: b.comment || "",
    history: [],
  }));

  return { brdps, rawCount: extracted.length };
}
