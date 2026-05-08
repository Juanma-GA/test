import { sendMessageStream } from "./llmAPI.js";

let _schemaSummaryCache = null;

async function loadSchemaSummary() {
  if (_schemaSummaryCache) return _schemaSummaryCache;
  const res = await fetch("/brex-schema-summary-4-2.json?v=" + Date.now());
  if (!res.ok) throw new Error("Could not load brex-schema-summary-4-2.json");
  _schemaSummaryCache = await res.json();
  return _schemaSummaryCache;
}

export function buildBREXPrompt(validatedBRDPs, projectConfig, schemaSummary) {
  const schemaJSON = JSON.stringify(schemaSummary, null, 2);

  const system = `You are an S1000D Issue 4.2 expert. Generate a valid BREX Data Module XML.

Follow this schema structure exactly:
${schemaJSON}

STRICT RULES:
1. Output ONLY the XML — no markdown fences, no \`\`\`xml tags, no explanation, no preamble.
2. First character must be: <?xml version="1.0" encoding="UTF-8"?>
3. Use the exact dmodule opening tag from dmodule_opening_tag in the schema.
4. infoCode is always 022.
5. Structure: content > brex > brexDoc > brexDmRules. The <brex> wrapper IS required. <brexDoc> must be inside <brex>.
6. brexDmRef is a SELF-REFERENCE — same dmCode attributes as the document. dmRefIdent must include BOTH dmCode AND issueInfo.
7. Each BRDP = one structureObjectRule inside contextRules > structureObjectRuleGroup.
8. Child order in structureObjectRule: brDecisionRef → objectPath → objectUse → objectValue.
9. brDecisionRef uses ATTRIBUTE: <brDecisionRef brDecisionIdentNumber="BRDP-001"/> — NOT text content.
10. allowedObjectFlag: "0"=prohibited, "1"=mandatory (must/shall/required), "2"=optional.
11. objectUse = one sentence summarising the decision.
12. Use today's date for issueDate.
13. techName = project name; infoName = "Business Rules Exchange".
14. qualityAssurance: <qualityAssurance><unverified/></qualityAssurance>
15. applic: <applic><displayText><simplePara>All</simplePara></displayText></applic>`;

  const brdpLines = validatedBRDPs
    .map((b, i) =>
      `${i + 1}. ID: ${b.id}\n   Definition: ${b.definition}\n   Proposal: ${b.proposal}\n   Validation: ${b.validation}`
    )
    .join("\n\n");

  const user = `Generate a BREX Data Module XML with this project configuration:

modelIdentCode: ${projectConfig.modelIdentCode || "UNKNOWN"}
systemDiffCode: ${projectConfig.systemDiffCode || "A"}
issueNumber: ${projectConfig.issueNumber || "001"}
inWork: ${projectConfig.inWork || "00"}
languageIsoCode: ${projectConfig.languageIsoCode || "en"}
countryIsoCode: ${projectConfig.countryIsoCode || "US"}
securityClassification: ${projectConfig.securityClassification || "01"}
enterpriseCode: ${projectConfig.enterpriseCode || ""}
projectName: ${projectConfig.projectName || projectConfig.modelIdentCode || "Project"}

Include these ${validatedBRDPs.length} BRDP rule(s):

${brdpLines}

Output ONLY the XML starting with <?xml`;

  return { system, user };
}

export function extractXML(rawResponse) {
  if (!rawResponse) return "";
  let text = rawResponse.trim();
  text = text.replace(/^```(?:xml)?\s*/i, "").replace(/\s*```\s*$/, "");
  const xmlStart = text.indexOf("<?xml");
  if (xmlStart > 0) text = text.slice(xmlStart);
  const lastClose = text.lastIndexOf(">");
  if (lastClose !== -1 && lastClose < text.length - 1) {
    text = text.slice(0, lastClose + 1);
  }
  return text.trim();
}

export function checkWellFormed(xmlString) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");
    const parserError = doc.querySelector("parsererror");
    if (parserError) {
      const msg = parserError.textContent || "XML is not well-formed";
      const lineMatch = msg.match(/line[:\s]+(\d+)/i);
      const lineHint = lineMatch ? ` (line ${lineMatch[1]})` : "";
      return { valid: false, error: msg.split("\n")[0].trim() + lineHint };
    }
    return { valid: true, error: null };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

export async function generateBREX(brdps, projectConfig, options = {}) {
  const {
    apiKey,
    modelName,
    provider = "Anthropic",
    onlyValidated = true,
    onChunk,
    abortController,
  } = options;

  if (!apiKey) throw new Error("API key is required. Please configure it in Settings.");
  if (!projectConfig?.modelIdentCode) {
    throw new Error("Project configuration is incomplete. Please fill in Settings.");
  }

  const targetBRDPs = onlyValidated
    ? brdps.filter((b) => b.validation?.toLowerCase().trim() === "validated")
    : brdps;

  if (targetBRDPs.length === 0) {
    throw new Error(
      onlyValidated
        ? "No validated BRDPs found. Validate at least one BRDP before generating."
        : "No BRDPs available to generate from."
    );
  }

  const schemaSummary = await loadSchemaSummary();
  const { system, user } = buildBREXPrompt(targetBRDPs, projectConfig, schemaSummary);
  const messages = [{ role: "user", content: user }];

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

  const xml = extractXML(rawResponse);
  if (!xml) throw new Error("The model returned an empty response. Check your API key and model settings.");

  const { valid, error } = checkWellFormed(xml);
  return { xml, valid, error, brdpCount: targetBRDPs.length };
}
