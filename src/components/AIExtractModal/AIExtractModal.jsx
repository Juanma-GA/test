import { useState, useRef, useCallback, useEffect } from 'react';
import { extractBRDPs } from '../../api/extractBRDPs';
import styles from './AIExtractModal.module.css';

export default function AIExtractModal({ onClose, existingBRDPs, onImport, sourceType = 'Style Guide' }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, foundCount: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [mergeMode, setMergeMode] = useState('add');
  const abortRef = useRef(null);
  const inputRef = useRef(null);

  const getSettings = () => ({
    apiKey: localStorage.getItem('brdp_api_key') || '',
    modelName: localStorage.getItem('brdp_model') || '',
    provider: localStorage.getItem('brdp_provider') || 'Anthropic',
  });

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleFile = (f) => {
    if (!f) return;
    const name = f.name.toLowerCase();
    if (!name.endsWith('.docx') && !name.endsWith('.pdf')) {
      setError('Only .docx and .pdf files are supported.');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleExtract = async () => {
    const { apiKey, modelName, provider } = getSettings();
    if (!apiKey) {
      setError('API key not configured. Go to Settings.');
      return;
    }
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setProgress({ current: 0, total: 0, foundCount: 0 });
    abortRef.current = new AbortController();

    try {
      const res = await extractBRDPs(file, existingBRDPs, {
        apiKey,
        modelName,
        provider,
        sourceType,
        onProgress: (current, total, foundCount) => setProgress({ current, total, foundCount }),
        abortController: abortRef.current,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const handleImport = () => {
    if (!result?.brdps) return;
    onImport(result.brdps, mergeMode);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>AI Extract — {sourceType}</h2>
            <span className={styles.subtitle}>Extract BRDPs from a document using AI</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>

          {/* Drop zone */}
          <div
            className={`${styles.dropZone} ${dragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".docx,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <div className={styles.fileInfo}>
                <span className={styles.fileIcon}>📄</span>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>({(file.size / 1024).toFixed(0)} KB)</span>
                <button
                  className={styles.removeFile}
                  onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                >✕</button>
              </div>
            ) : (
              <div className={styles.dropPrompt}>
                <span className={styles.dropIcon}>⬆</span>
                <span>Drop a <strong>.docx</strong> or <strong>.pdf</strong> file here</span>
                <span className={styles.dropSub}>or click to browse</span>
              </div>
            )}
          </div>

          {/* Error */}
          {error && <div className={styles.errorBox}>{error}</div>}

          {/* Extract button / loading */}
          {!loading ? (
            <button
              className={styles.extractBtn}
              onClick={handleExtract}
              disabled={!file}
            >
              {result ? 'Re-extract' : 'Extract BRDPs'}
            </button>
          ) : (
            <div className={styles.loadingRow}>
              <span className={styles.spinner} />
              <div className={styles.progressInfo}>
                <span>Processing section {progress.current} of {progress.total}</span>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : '0%'
                    }}
                  />
                </div>
                <span className={styles.progressCount}>
                  {progress.foundCount} BRDP{progress.foundCount !== 1 ? 's' : ''} found
                </span>
              </div>
              <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className={styles.results}>
              <div className={styles.resultsMeta}>
                <span className={styles.badgeOk}>✓ {result.rawCount} BRDPs extracted</span>
              </div>

              {/* Preview table */}
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Proposal</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.brdps.map((b) => (
                      <tr key={b.id}>
                        <td className={styles.tdId}>{b.id}</td>
                        <td className={styles.tdTitle}>{b.title}</td>
                        <td className={styles.tdProposal}>{b.proposal}</td>
                        <td className={styles.tdComment}>{b.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Merge mode */}
              <div className={styles.mergeSection}>
                <label className={styles.mergeLabel}>Import mode</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      value="add"
                      checked={mergeMode === 'add'}
                      onChange={() => setMergeMode('add')}
                    />
                    Add to existing BRDPs
                    <span className={styles.hint}> — keeps current {existingBRDPs.length} records</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      value="replace"
                      checked={mergeMode === 'replace'}
                      onChange={() => setMergeMode('replace')}
                    />
                    Replace all BRDPs
                    <span className={styles.hintWarn}> — current records will be lost</span>
                  </label>
                </div>
              </div>

              {/* Import button */}
              <button className={styles.importBtn} onClick={handleImport}>
                Import {result.rawCount} BRDPs
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
