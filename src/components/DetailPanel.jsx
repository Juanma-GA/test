import { useState, useEffect } from 'react';
import { useLocalNotes } from '../hooks/useLocalNotes';
import styles from './DetailPanel.module.css';

/**
 * Validation badge component
 * Shows colored badge based on validation status
 * @param {string} status - Validation status: 'Validated', 'Refused', or 'Pending'
 * @returns {JSX.Element} Colored badge
 */
function ValidationBadge({ status }) {
  let badgeClass = styles.badge;

  if (status === 'Validated') {
    badgeClass += ` ${styles.validated}`;
  } else if (status === 'Refused') {
    badgeClass += ` ${styles.refused}`;
  } else if (status === 'Pending') {
    badgeClass += ` ${styles.pending}`;
  }

  return <span className={badgeClass}>{status}</span>;
}

/**
 * Detail panel component
 * Displays full BRDP details with notes and options
 * @param {Object} props - Component props
 * @param {Object} props.brdp - BRDP record to display
 * @param {Function} props.onClose - Callback when panel closes
 * @param {Function} props.onOpenChat - Callback to open chat panel
 * @returns {JSX.Element} Detail panel with full record information
 */
export default function DetailPanel({ brdp, onClose, onOpenChat }) {
  const { getNote, saveNote } = useLocalNotes();
  const [notes, setNotes] = useState('');
  const [notesDirty, setNotesDirty] = useState(false);

  // Load notes on mount or when BRDP changes
  useEffect(() => {
    const savedNotes = getNote(brdp.id);
    setNotes(savedNotes);
    setNotesDirty(false);
  }, [brdp.id, getNote]);

  // Handle escape key to close panel
  useEffect(() => {
    /**
     * Handle keydown event
     * @param {KeyboardEvent} event - Keyboard event
     */
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /**
   * Handle notes change
   * @param {Event} event - Change event from textarea
   */
  const handleNotesChange = (event) => {
    const newNotes = event.target.value;
    setNotes(newNotes);
    setNotesDirty(true);
    // Auto-save on change
    saveNote(brdp.id, newNotes);
    setNotesDirty(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Panel */}
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.heading}>{brdp.id}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.fieldsSection}>
            {/* BRDP Identifier */}
            <div className={styles.field}>
              <label className={styles.label}>BRDP Identifier</label>
              <p className={styles.value}>{brdp.id}</p>
            </div>

            {/* Definition */}
            <div className={styles.field}>
              <label className={styles.label}>Definition</label>
              <p className={styles.value}>{brdp.definition}</p>
            </div>

            {/* Proposal */}
            <div className={styles.field}>
              <label className={styles.label}>ATX Decision Proposal</label>
              <p className={styles.value}>{brdp.proposal}</p>
            </div>

            {/* Validation Status */}
            <div className={styles.field}>
              <label className={styles.label}>Validation Status</label>
              <ValidationBadge status={brdp.validation} />
            </div>

            {/* Comment */}
            <div className={styles.field}>
              <label className={styles.label}>Comment</label>
              <p className={styles.value}>{brdp.comment}</p>
            </div>
          </div>

          {/* Notes Section */}
          <div className={styles.notesSection}>
            <label htmlFor="notes-textarea" className={styles.notesLabel}>
              My Notes
            </label>
            <textarea
              id="notes-textarea"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Add your notes about this BRDP..."
              className={styles.textarea}
            />
            {notesDirty && <p className={styles.savingIndicator}>Saving...</p>}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            className={styles.aiButton}
            onClick={onOpenChat}
            title="Ask AI about this BRDP"
          >
            Ask AI about this BRDP
          </button>
        </div>
      </div>
    </>
  );
}
