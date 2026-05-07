import { useState } from 'react';
import styles from './AIConfigSection.module.css';

/**
 * AI Configuration section component
 * Handles provider selection, API key input, model selection, and connection testing
 * @param {Object} props - Component props
 * @param {string} props.apiKey - Current API key
 * @param {string} props.modelName - Current model name
 * @param {string} props.provider - Selected provider
 * @param {Function} props.onApiKeyChange - Callback when API key changes
 * @param {Function} props.onModelChange - Callback when model changes
 * @param {Function} props.onProviderChange - Callback when provider changes
 * @param {Function} props.onSave - Callback to save settings
 * @param {boolean} props.isConfigured - Whether API key is configured
 * @returns {JSX.Element} AI configuration section
 */
export default function AIConfigSection({
  apiKey,
  modelName,
  provider,
  onApiKeyChange,
  onModelChange,
  onProviderChange,
  onSave,
  isConfigured,
}) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResult, setTestResult] = useState({ status: 'idle', message: '' });
  const [isTesting, setIsTesting] = useState(false);

  /**
   * Test API key connection
   */
  const handleTestConnection = async () => {
    if (!apiKey.trim() || !modelName.trim()) {
      setTestResult({
        status: 'error',
        message: 'Please enter both API key and model name',
      });
      return;
    }

    setIsTesting(true);
    setTestResult({ status: 'testing', message: 'Testing connection...' });

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'hi' }],
        }),
      });

      if (response.status === 200) {
        setTestResult({
          status: 'verified',
          message: 'Verified ✓',
        });
      } else if (response.status === 401) {
        setTestResult({
          status: 'invalid',
          message: 'Invalid key ✗',
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Connection error',
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Connection error',
      });
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Get status indicator text and color
   */
  const getStatusIndicator = () => {
    if (testResult.status === 'verified') {
      return { text: 'Verified ✓', className: styles.statusVerified };
    }
    if (testResult.status === 'invalid') {
      return { text: 'Invalid key ✗', className: styles.statusInvalid };
    }
    if (testResult.status === 'error') {
      return { text: 'Error', className: styles.statusError };
    }
    if (isConfigured && testResult.status === 'idle') {
      return { text: 'Saved', className: styles.statusSaved };
    }
    return { text: 'Not configured', className: styles.statusIdle };
  };

  const statusIndicator = getStatusIndicator();

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>AI Configuration</h3>

      {/* Warning Banner */}
      <div className={styles.warningBanner}>
        <span className={styles.warningIcon}>ℹ️</span>
        <p className={styles.warningText}>
          Your API key is stored in your browser only. Never share or expose it.
        </p>
      </div>

      {/* Provider Dropdown */}
      <div className={styles.formGroup}>
        <label htmlFor="provider" className={styles.label}>
          Provider
        </label>
        <select
          id="provider"
          value={provider}
          onChange={(e) => onProviderChange(e.target.value)}
          className={styles.input}
        >
          <option value="Anthropic">Anthropic API</option>
          <option value="OpenAI">OpenAI API</option>
          <option value="Custom">Custom</option>
        </select>
        <p className={styles.providerNote}>Compatible with OpenAI-compatible endpoints</p>
      </div>

      {/* API Key Input */}
      <div className={styles.formGroup}>
        <label htmlFor="api-key" className={styles.label}>
          API Key
        </label>
        <div className={styles.apiKeyWrapper}>
          <input
            id="api-key"
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="sk-ant-..."
            className={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className={styles.toggleButton}
            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? '👁️‍🗨️' : '👁️'}
          </button>
        </div>
      </div>

      {/* Model Input */}
      <div className={styles.formGroup}>
        <label htmlFor="model" className={styles.label}>
          Model
        </label>
        <input
          id="model"
          type="text"
          value={modelName}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder="e.g. claude-haiku-4-5-20251001"
          className={styles.input}
        />
      </div>

      {/* Test Result Message */}
      {testResult.status !== 'idle' && (
        <div className={`${styles.testResult} ${styles[testResult.status]}`}>
          {testResult.message}
        </div>
      )}

      {/* Status Indicator */}
      <div className={styles.statusLine}>
        <span className={styles.statusLabel}>Status:</span>
        <span className={statusIndicator.className}>{statusIndicator.text}</span>
      </div>

      {/* Action Buttons */}
      <div className={styles.buttonGroup}>
        <button
          onClick={onSave}
          disabled={!apiKey.trim() || !modelName.trim()}
          className={styles.saveButton}
        >
          Save
        </button>
        <button
          onClick={handleTestConnection}
          disabled={isTesting || !apiKey.trim() || !modelName.trim()}
          className={styles.testButton}
        >
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
      </div>
    </div>
  );
}
