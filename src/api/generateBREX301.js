import { sendMessageStream } from "./llmAPI.js";
import { extractXML, checkWellFormed } from "./generateBREX.js";

let _schemaSummaryCache301 = null;

async function loadSchemaSummary301() {
  if (_schemaSummaryCache301) return _schemaSummaryCache301;
  const res = await fetch("/brex-schema-summary-3-0-1.json?v=" + Date.now());
  if (!res.ok) throw new Error("Failed to load brex-schema-summary-3-0-1.json");
  _schemaSummaryCache301 = await res.json();
  return _schemaSummaryCache301;
}

export function buildBREXPrompt301(validatedBRDPs, projectConfig, schemaSummary) {
  const { few_shot_examples, ...schemaSummaryWithoutExamples } = schemaSummary;
  const schemaJSON = JSON.stringify(schemaSummaryWithoutExamples, null, 2);

  const fewShotBlock = (schemaSummary.few_shot_examples || []).map((ex, i) => {
    const flag = ex.allowedObjectFlag;
    const labels = [];
    if (flag === "0") labels.push("prohibited");
    else if (flag === "1") labels.push("mandatory");
    else labels.push("no flag");
    if (ex.objectPath && ex.objectPath.includes("[")) labels.push("complex XPath");
    if (ex.objectValues && ex.objectValues.length > 1) labels.push("multi value");

    const objectValLines = (ex.objectValues || [])
      .map(v => `  <objval val1="${v}" valtype="single"/>`)
      .join("\n");

    const flagAttr = ex.allowedObjectFlag != null ? ` objappl="${ex.allowedObjectFlag}"` : "";

    return `### Example ${i + 1} — ${labels.join(", ")}
INPUT id: ${ex.id}
OUTPUT:
<objrule id="${ex.id}">
  <objpath${flagAttr}>${ex.objectPath}</objpath>
  <objuse>${ex.objectUse}</objuse>
${objectValLines}</objrule>`;
  }).join("\n\n");

  const system = `You are an S1000D Issue 3.0.1 expert. Generate a valid BREX Data Module XML.

Follow this schema structure exactly:
${schemaJSON}

STRICT RULES:
1. Output ONLY the XML — no markdown fences, no \`\`\`xml tags, no explanation, no preamble.
2. First character must be: <?xml version="1.0" encoding="UTF-8"?>
3. Use the exact dmodule opening tag from dmodule_opening_tag in the schema.
4. incode is always 022.
5. Structure: content > brex > contextrules > structrules > objrule
6. Each BRDP = one objrule with attribute id equal to the BRDP identifier.
7. There is NO brDecisionRef element in 3.0.1 — the BRDP id goes in objrule @id only.
8. Child order in objrule: objpath → objuse → objval (one per allowed value).
9. Flag attribute is objappl inside objpath: "0"=prohibited, "1"=mandatory.
10. objval format: <objval val1="VALUE" valtype="single"/>
11. objuse = one sentence summarising the decision.
12. Use the todayDate value for issdate attributes. Format: year="YYYY" month="MM" day="DD".
13. techname = project name; infoname = "Business rules".
14. qa: <qa><unverif/></qa>
15. applic: <applic><displaytext><p>All</p></displaytext></applic>
16. brexref/refdm/avee must contain the same child elements as dmc/avee (self-reference).
17. dmaddres child order: dmc → dmtitle → issno → issdate → language
18. issno attributes: issno="001" inwork="00" type="new"
19. status child order: security → rpc → orig → applic → brexref → qa

## Few-shot examples: BRDP id → objrule
Use these real validated examples as reference for structure, XPath patterns and objval formatting.

${fewShotBlock}`;

  const brdpLines = validatedBRDPs
    .map((b, i) =>
      `${i + 1}. ID: ${b.id}\n   Definition: ${b.definition}\n   Proposal: ${b.proposal}\n   Validation: ${b.validation}`
    )
    .join("\n\n");

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const user = `Generate a BREX Data Module XML (S1000D 3.0.1) with this project configuration:

modelIdentCode: ${projectConfig.modelIdentCode || "UNKNOWN"}
systemDiffCode: ${projectConfig.systemDiffCode || "A"}
issueNumber: ${projectConfig.issueNumber || "001"}
inWork: ${projectConfig.inWork || "00"}
languageIsoCode: ${projectConfig.languageIsoCode || "en"}
countryIsoCode: ${projectConfig.countryIsoCode || "US"}
securityClassification: ${projectConfig.securityClassification || "01"}
enterpriseCode: ${projectConfig.enterpriseCode || ""}
projectName: ${projectConfig.projectName || projectConfig.modelIdentCode || "Project"}
todayDate: ${todayStr}

Include these ${validatedBRDPs.length} BRDP rule(s):

${brdpLines}

Output ONLY the XML starting with <?xml`;

  return { system, user };
}

export async function generateBREX301(brdps, projectConfig, options = {}) {
  const {
    apiKey,
    modelName,
    provider = "Anthropic",
    customEndpoint = "",
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

  const schemaSummary = await loadSchemaSummary301();
  const { system, user } = buildBREXPrompt301(targetBRDPs, projectConfig, schemaSummary);
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
      abortController,
      {
        customEndpoint,
      }
    );
  } catch (err) {
    throw new Error(`LLM call failed: ${err.message}`);
  }

  const xml = extractXML(rawResponse);
  if (!xml) throw new Error("The model returned an empty response. Check your API key and model settings.");

  const { valid, error } = checkWellFormed(xml);
  return { xml, valid, error, brdpCount: targetBRDPs.length };
}
