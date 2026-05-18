import { useState } from 'react';
import { mockBRDPs } from '../data/mockBRDPs';
import styles from './ResetDataSection.module.css';

export default function ResetDataSection({ onSetBrdps, showToast }) {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleResetConfirm = () => {
    onSetBrdps(mockBRDPs);
    setShowResetDialog(false);
    if (showToast) {
      showToast('Reset to demo data successfully', 'success');
    }
  };

  return (
    <>
      <div className={styles.dangerZone}>
        <h3 className={styles.dangerTitle}>Reset data</h3>
        <p className={styles.dangerText}>
          Replace all current BRDPs with the original demo data
        </p>
        <button
          onClick={() => setShowResetDialog(true)}
          className={styles.dangerButton}
        >
          Reset to demo data
        </button>
      </div>

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
    </>
  );
}
