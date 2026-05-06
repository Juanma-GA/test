import { useState, useCallback } from 'react';

const API_KEY_STORAGE = 'brdp_api_key';
const MODEL_STORAGE = 'brdp_model';

/**
 * Custom hook for managing API key and model configuration
 * Persists data to localStorage
 * @returns {Object} API key management object
 * @property {string} apiKey - Stored API key
 * @property {string} modelName - Stored model name
 * @property {Function} saveKey - Save API key and model to localStorage
 * @property {Function} clearKey - Clear API key and model from localStorage
 * @property {boolean} isConfigured - Whether API key is set
 */
export function useAPIKey() {
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE) || '';
    } catch {
      return '';
    }
  });

  const [modelName, setModelName] = useState(() => {
    try {
      return localStorage.getItem(MODEL_STORAGE) || '';
    } catch {
      return '';
    }
  });

  /**
   * Save API key and model name to localStorage
   * @param {string} key - API key to save
   * @param {string} model - Model name to save
   */
  const saveKey = useCallback((key, model) => {
    try {
      localStorage.setItem(API_KEY_STORAGE, key);
      localStorage.setItem(MODEL_STORAGE, model);
      setApiKey(key);
      setModelName(model);
    } catch {
      console.error('Failed to save API key to localStorage');
    }
  }, []);

  /**
   * Clear API key and model from localStorage
   */
  const clearKey = useCallback(() => {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
      localStorage.removeItem(MODEL_STORAGE);
      setApiKey('');
      setModelName('');
    } catch {
      console.error('Failed to clear API key from localStorage');
    }
  }, []);

  const isConfigured = apiKey.trim().length > 0;

  return {
    apiKey,
    modelName,
    setApiKey,
    setModelName,
    saveKey,
    clearKey,
    isConfigured,
  };
}
