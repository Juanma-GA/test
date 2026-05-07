import { useState, useEffect } from 'react';
import { useProjectConfig } from '../hooks/useProjectConfig';
import styles from './GenerateModal.module.css';

/**
 * Generate Output modal component
 * Allows users to configure and generate BREX or Schematron output
 * @param {Object} props - Component props
 * @param {Array} props.brdps - BRDP records
 * @param {Function} props.onClose - Callback when modal closes
 * @returns {JSX.Element} Modal for output generation
 */
export default function GenerateModal({ brdps, onClose }) {
  const { projectConfig } = useProjectConfig();
  const [format, setFormat] = useState('BREX — S1000D 4.2');
  const [onlyValidated, setOnlyValidated] = useState(true);
  const [includedCount, setIncludedCount] = useState(0);

  // Update included count when BRDPs or filter changes
  useEffect(() => {
    if (onlyValidated) {
      const count = brdps.filter(b => b.validation === 'Validated').length;
      setIncludedCount(count);
    } else {
      setIncludedCount(brdps.length);
    }
  }, [brdps, onlyValidated]);

  /**
   * Handle overlay click to close modal
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /**
   * Handle escape key to close modal
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Generate Output</h2>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Format Selection */}
          <div className={styles.formGroup}>
            <label htmlFor="format" className={styles.label}>
              Format & Standard
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className={styles.select}
            >
              <option>BREX — S1000D 3.0.1</option>
              <option>BREX — S1000D 4.1</option>
              <option>BREX — S1000D 4.2</option>
              <option>BREX — S1000D 5.0</option>
              <option>BREX — S1000D 6.0</option>
              <option>Schematron 1.0</option>
            </select>
          </div>

          {/* Validated Only Checkbox */}
          <div className={styles.checkboxGroup}>
            <label htmlFor="onlyValidated" className={styles.checkboxLabel}>
              <input
                id="onlyValidated"
                type="checkbox"
                checked={onlyValidated}
                onChange={(e) => setOnlyValidated(e.target.checked)}
                className={styles.checkbox}
              />
              Only include Validated BRDPs
            </label>
          </div>

          {/* Summary */}
          <div className={styles.summary}>
            <p className={styles.summaryText}>
              {includedCount} {includedCount === 1 ? 'BRDP' : 'BRDPs'} will be included
            </p>
          </div>

          {/* Project Config Summary */}
          <div className={styles.projectSummary}>
            <p className={styles.projectText}>
              Project: <strong>{projectConfig.projectName || 'Not configured'}</strong> |{' '}
              Model: <strong>{projectConfig.modelIdentCode || 'Not configured'}</strong>
            </p>
            <a href="#settings" className={styles.settingsLink}>
              Edit project config in Settings
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            disabled
            className={styles.generateBtn}
            title="Coming soon"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
