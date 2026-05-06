import { useState, useCallback } from 'react';
import { sendMessage, buildSystemPrompt } from '../api/llmAPI';

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
        // Build system prompt with BRDP context if available
        const systemPrompt = buildSystemPrompt(selectedBrdp);

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
    [messages, apiKey, modelName, provider, selectedBrdp]
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
