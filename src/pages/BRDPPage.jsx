import { useState } from 'react';
import { useBRDPs } from '../hooks/useBRDPs';
import BRDPTable from '../components/BRDPTable';
import styles from './BRDPPage.module.css';

/**
 * BRDP Page component
 * Main page displaying BRDP records in a table with selection capability
 * @returns {JSX.Element} Page containing BRDP table and details
 */
export default function BRDPPage() {
  const { brdps } = useBRDPs();
  const [selectedBrdp, setSelectedBrdp] = useState(null);

  /**
   * Handle row selection
   * @param {Object} brdp - Selected BRDP record
   */
  const handleSelectBrdp = (brdp) => {
    setSelectedBrdp(brdp);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>BRDP Records</h2>
      <BRDPTable
        brdps={brdps}
        onSelect={handleSelectBrdp}
        selectedId={selectedBrdp?.id}
      />

      {selectedBrdp && (
        <div className={styles.details}>
          <h3 className={styles.detailsTitle}>Record Details</h3>
          <div className={styles.detailsContent}>
            <div className={styles.field}>
              <label>BRDP Identifier:</label>
              <p>{selectedBrdp.id}</p>
            </div>
            <div className={styles.field}>
              <label>Definition:</label>
              <p>{selectedBrdp.definition}</p>
            </div>
            <div className={styles.field}>
              <label>Proposal:</label>
              <p>{selectedBrdp.proposal}</p>
            </div>
            <div className={styles.field}>
              <label>Validation Status:</label>
              <p>{selectedBrdp.validation}</p>
            </div>
            <div className={styles.field}>
              <label>Comment:</label>
              <p>{selectedBrdp.comment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
