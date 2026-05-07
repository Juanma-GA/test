import { useState, useCallback, useRef } from 'react';
import { sendMessage, sendMessageStream } from '../api/llmAPI';
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

  // Build compact JSON index with only: id, title (max 40 chars), and status
  const compactIndex = brdps.map((brdp) => ({
    id: brdp.id,
    title: (brdp.title || '').slice(0, 40),
    status: brdp.validation,
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
  const abortControllerRef = useRef(null);

  /**
   * Send a user message and get AI response with streaming
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

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Build system prompt with dataset and BRDP context
        const systemPrompt = buildEnhancedSystemPrompt(brdps, selectedBrdp);

        // Initialize assistant message with empty content
        let assistantMessage = { role: 'assistant', content: '' };
        setMessages([...updatedMessages, assistantMessage]);

        // Stream the response
        const completeContent = await sendMessageStream(
          updatedMessages,
          apiKey,
          modelName,
          provider,
          systemPrompt,
          (chunk) => {
            // Update assistant message with partial content
            assistantMessage.content += chunk;
            setMessages([...updatedMessages, { ...assistantMessage }]);
          },
          abortControllerRef.current
        );

        // Final update with complete content
        assistantMessage.content = completeContent;
        setMessages([...updatedMessages, { ...assistantMessage }]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [messages, apiKey, modelName, provider, selectedBrdp, brdps]
  );

  /**
   * Stop the current streaming request
   */
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

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
    stopStreaming,
    isLoading,
    error,
  };
}
