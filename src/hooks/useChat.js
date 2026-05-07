import { useState, useCallback } from 'react';
import { sendMessage } from '../api/llmAPI';
import { useBRDPContext } from '../context/BRDPContext';

/**
 * Build a compact summary of the BRDP dataset
 * @param {Array} brdps - Array of BRDP records
 * @returns {string} Summary with total, breakdown, and compact JSON index
 */
function buildDatasetSummary(brdps) {
  if (!brdps || brdps.length === 0) {
    return 'No hay datos BRDP disponibles.';
  }

  // Calculate total and breakdown by validation status
  const breakdown = {
    Validated: 0,
    Refused: 0,
    Pending: 0,
  };

  brdps.forEach((brdp) => {
    if (breakdown.hasOwnProperty(brdp.validation)) {
      breakdown[brdp.validation]++;
    }
  });

  // Build compact JSON index with only: id, validation, and definition
  const compactIndex = brdps.map((brdp) => ({
    id: brdp.id,
    status: brdp.validation,
    rule: brdp.definition,
  }));

  // Format the summary string
  const breakdownStr = Object.entries(breakdown)
    .map(([status, count]) => `${status}: ${count}`)
    .join(', ');

  return `Total de BRDPs: ${brdps.length}
Desglose: ${breakdownStr}

Índice compacto:
${JSON.stringify(compactIndex, null, 0)}`;
}

/**
 * Build enhanced system prompt with dataset context
 * @param {Array} brdps - All BRDP records from context
 * @param {Object} [selectedBrdp] - Currently selected BRDP
 * @returns {string} Enhanced system prompt with dataset and optional BRDP context
 */
function buildEnhancedSystemPrompt(brdps, selectedBrdp) {
  const basePrompt = `You are an S1000D / DITA and BRDP expert assistant.
You help users understand business rules, validate decisions,
and answer questions about S1000D, DITA, and technical publications.`;

  const datasetSummary = buildDatasetSummary(brdps);

  if (!selectedBrdp) {
    return `${basePrompt}

BRDP Dataset Context:
${datasetSummary}

Use the complete dataset above to answer questions about business rules, validate proposals, and provide insights across all BRDP records.`;
  }

  // If a specific BRDP is selected, include its full details
  return `${basePrompt}

BRDP Dataset Context:
${datasetSummary}

Current BRDP Focus (selected for detailed analysis):
${JSON.stringify(selectedBrdp, null, 2)}

Provide answers focusing on the selected BRDP while leveraging the complete dataset for comparison and validation.`;
}


/**
 * Custom hook for managing chat conversation
 * Handles message history and LLM communication
 * @param {Object} options - Hook options
 * @param {Object} options.apiKey - API key from useAPIKey
 * @param {string} options.modelName - Model name from useAPIKey
 * @param {string} options.provider - Provider from useAPIKey
 * @param {Object} [options.selectedBrdp] - Currently selected BRDP
 * @returns {Object} Chat management object
 * @property {Array} messages - Conversation history
 * @property {Function} sendUserMessage - Send a message and get response
 * @property {Function} clearHistory - Clear conversation
 * @property {boolean} isLoading - Whether waiting for response
 * @property {string|null} error - Error message if any
 */
export function useChat({ apiKey, modelName, provider, selectedBrdp }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { brdps } = useBRDPContext();

  /**
   * Send a user message and get AI response
   * @param {string} content - User message content
   */
  const sendUserMessage = useCallback(
    async (content) => {
      if (!content.trim()) return;

      // Add user message to history
      const userMessage = { role: 'user', content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);
      setError(null);

      try {
        // Build system prompt with dataset and BRDP context
        const systemPrompt = buildEnhancedSystemPrompt(brdps, selectedBrdp);

        // Send to LLM
        const response = await sendMessage(
          updatedMessages,
          apiKey,
          modelName,
          provider,
          systemPrompt
        );

        // Add assistant response to history
        setMessages([...updatedMessages, response]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, apiKey, modelName, provider, selectedBrdp, brdps]
  );

  /**
   * Clear conversation history
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    sendUserMessage,
    clearHistory,
    isLoading,
    error,
  };
}
