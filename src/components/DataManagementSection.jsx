import { useState, useRef } from 'react';
import { mockBRDPs } from '../data/mockBRDPs';
import { generateTemplate, importFromExcel, exportToExcel, exportToCSV } from '../utils/excelUtils';
import styles from './DataManagementSection.module.css';

/**
 * Data Management section component
 * Handles Excel import/export and data management
 * @param {Object} props - Component props
 * @param {Array} props.brdps - Current BRDP records
 * @param {Function} props.onSetBrdps - Callback to update BRDPs
 * @param {Function} props.showToast - Callback to show toast notifications
 * @returns {JSX.Element} Data management section
 */
export default function DataManagementSection({ brdps, onSetBrdps, showToast }) {
  const [importedRows, setImportedRows] = useState([]);
  const [importErrors, setImportErrors] = useState([]);
  const [importMode, setImportMode] = useState(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const fileInputRef = useRef(null);

  /**
   * Handle download template
   */
  const handleDownloadTemplate = () => {
    const blob = new Blob([generateTemplate()], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brdp-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Handle file selection for import
   */
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportErrors([]);
    setImportedRows([]);

    const { rows, errors } = await importFromExcel(file);

    if (errors.length > 0) {
      setImportErrors(errors);
      setImportedRows([]);
      setImportMode(null);
    } else if (rows.length === 0) {
      setImportErrors(['No valid data found in file']);
      setImportMode(null);
    } else {
      setImportedRows(rows);
      setImportMode('preview');
      setImportErrors([]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Handle replace all BRDPs
   */
  const handleReplaceAll = () => {
    onSetBrdps(importedRows);
    setImportedRows([]);
    setImportMode(null);
    if (showToast) {
      showToast(`${importedRows.length} BRDPs imported successfully`, 'success');
    }
  };

  /**
   * Handle merge with existing BRDPs
   */
  const handleMerge = () => {
    const existingIds = new Set(brdps.map((b) => b.id));
    const newRows = importedRows.filter((row) => !existingIds.has(row.id));
    onSetBrdps([...brdps, ...newRows]);
    setImportedRows([]);
    setImportMode(null);
    if (showToast) {
      showToast(`${newRows.length} new BRDPs imported successfully`, 'success');
    }
  };

  /**
   * Handle cancel import
   */
  const handleCancelImport = () => {
    setImportedRows([]);
    setImportMode(null);
    setImportErrors([]);
  };

  /**
   * Handle export to Excel
   */
  const handleExportExcel = () => {
    exportToExcel(brdps);
    if (showToast) {
      showToast('File downloaded successfully', 'success');
    }
  };

  /**
   * Handle export to CSV
   */
  const handleExportCSV = () => {
    exportToCSV(brdps);
    if (showToast) {
      showToast('File downloaded successfully', 'success');
    }
  };

  /**
   * Handle reset to demo data
   */
  const handleResetConfirm = () => {
    onSetBrdps(mockBRDPs);
    setShowResetDialog(false);
    if (showToast) {
      showToast('Reset to demo data successfully', 'success');
    }
  };

  return (
    <div className={styles.section}>
      <h3 className={styles.title}>Data Management</h3>

      {/* Subsection A: Download Template */}
      <div className={styles.subsection}>
        <h4 className={styles.subtitle}>Download template</h4>
        <button onClick={handleDownloadTemplate} className={styles.primaryButton}>
          Download Excel template (.xlsx)
        </button>
      </div>

      {/* Subsection B: Import from Excel */}
      <div className={styles.subsection}>
        <h4 className={styles.subtitle}>Import BRDPs from Excel</h4>

        {importMode === null && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className={styles.fileInput}
            />
            <p className={styles.helpText}>
              Select an Excel file with columns: BRDP Identifier, BRDP Definition,
              ATX Decision Proposal, Validation Status, Comment
            </p>
          </>
        )}

        {/* Import Errors */}
        {importErrors.length > 0 && (
          <div className={styles.errorContainer}>
            <h5 className={styles.errorTitle}>Import errors:</h5>
            <ul className={styles.errorList}>
              {importErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Import Preview */}
        {importMode === 'preview' && importedRows.length > 0 && (
          <div className={styles.previewContainer}>
            <p className={styles.previewInfo}>
              {importedRows.length} rows found (showing first 5)
            </p>
            <div className={styles.previewTable}>
              <table>
                <thead>
                  <tr>
                    <th>BRDP Identifier</th>
                    <th>Definition</th>
                    <th>Proposal</th>
                    <th>Status</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {importedRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.id}</td>
                      <td className={styles.truncate}>{row.definition}</td>
                      <td className={styles.truncate}>{row.proposal}</td>
                      <td>{row.validation}</td>
                      <td className={styles.truncate}>{row.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.previewActions}>
              <button onClick={handleReplaceAll} className={styles.primaryButton}>
                Replace all BRDPs
              </button>
              <button onClick={handleMerge} className={styles.secondaryButton}>
                Merge
              </button>
              <button onClick={handleCancelImport} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subsection C: Export */}
      <div className={styles.subsection}>
        <h4 className={styles.subtitle}>Export current BRDPs</h4>
        <div className={styles.exportButtonsGroup}>
          <button onClick={handleExportExcel} className={styles.primaryButton}>
            Export to Excel (.xlsx)
          </button>
          <button onClick={handleExportCSV} className={styles.secondaryButton}>
            Export to CSV
          </button>
        </div>
        <p className={styles.helpText}>
          {brdps.length} BRDP record{brdps.length !== 1 ? 's' : ''} available for export
        </p>
      </div>

      {/* Subsection D: Reset to demo data */}
      <div className={styles.subsection}>
        <h4 className={styles.subtitle}>Reset data</h4>
        <button onClick={() => setShowResetDialog(true)} className={styles.resetButton}>
          Reset to demo data
        </button>
        <p className={styles.helpText}>
          Replace all current BRDPs with the original demo data
        </p>
      </div>

      {/* Reset confirmation dialog */}
      {showResetDialog && (
        <div className={styles.dialogOverlay} onClick={() => setShowResetDialog(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.dialogTitle}>Reset to demo data</h3>
            <p className={styles.dialogMessage}>
              This will replace all current BRDPs with demo data. Are you sure?
            </p>
            <div className={styles.dialogActions}>
              <button onClick={handleResetConfirm} className={styles.primaryButton}>
                Reset
              </button>
              <button onClick={() => setShowResetDialog(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
