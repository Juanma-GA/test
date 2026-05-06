import { useState, useCallback } from 'react';

const API_KEY_STORAGE = 'brdp_api_key';
const MODEL_STORAGE = 'brdp_model';
const PROVIDER_STORAGE = 'brdp_provider';

/**
 * Custom hook for managing API key, model, and provider configuration
 * Persists data to localStorage
 * @returns {Object} API configuration management object
 * @property {string} apiKey - Stored API key
 * @property {string} modelName - Stored model name
 * @property {string} provider - Selected LLM provider ('Anthropic', 'OpenAI', 'Custom')
 * @property {Function} setApiKey - Update API key
 * @property {Function} setModelName - Update model name
 * @property {Function} setProvider - Update provider
 * @property {Function} saveKey - Save all settings to localStorage
 * @property {Function} clearKey - Clear all settings from localStorage
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

  const [provider, setProvider] = useState(() => {
    try {
      return localStorage.getItem(PROVIDER_STORAGE) || 'Anthropic';
    } catch {
      return 'Anthropic';
    }
  });

  /**
   * Save API key, model name, and provider to localStorage
   * @param {string} key - API key to save
   * @param {string} model - Model name to save
   * @param {string} prov - Provider to save
   */
  const saveKey = useCallback((key, model, prov) => {
    try {
      localStorage.setItem(API_KEY_STORAGE, key);
      localStorage.setItem(MODEL_STORAGE, model);
      localStorage.setItem(PROVIDER_STORAGE, prov);
      setApiKey(key);
      setModelName(model);
      setProvider(prov);
    } catch {
      console.error('Failed to save API configuration to localStorage');
    }
  }, []);

  /**
   * Clear all API configuration from localStorage
   */
  const clearKey = useCallback(() => {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
      localStorage.removeItem(MODEL_STORAGE);
      localStorage.removeItem(PROVIDER_STORAGE);
      setApiKey('');
      setModelName('');
      setProvider('Anthropic');
    } catch {
      console.error('Failed to clear API configuration from localStorage');
    }
  }, []);

  const isConfigured = apiKey.trim().length > 0;

  return {
    apiKey,
    modelName,
    provider,
    setApiKey,
    setModelName,
    setProvider,
    saveKey,
    clearKey,
    isConfigured,
  };
}
