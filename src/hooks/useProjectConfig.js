import { useState, useCallback } from 'react';

const STORAGE_KEY = 'brdp_project_config';

const DEFAULT_CONFIG = {
  projectName: '',
  modelIdentCode: '',
  systemDiffCode: 'A',
  issueNumber: '001',
  inWork: '00',
  languageIsoCode: 'en',
  countryIsoCode: 'US',
  securityClassification: '01',
  enterpriseCode: '',
};

/**
 * Custom hook for managing project configuration
 * Persists to localStorage under "brdp_project_config" key
 * @returns {Object} Configuration management object
 * @property {Object} projectConfig - Current project configuration
 * @property {Function} saveProjectConfig - Save configuration to localStorage
 */
export function useProjectConfig() {
  const [projectConfig, setProjectConfig] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  /**
   * Save project configuration to localStorage
   * @param {Object} config - Configuration object to save
   */
  const saveProjectConfig = useCallback((config) => {
    setProjectConfig(config);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, []);

  return {
    projectConfig,
    saveProjectConfig,
  };
}
