import { useState, useEffect } from 'react';
import { useBRDPContext } from '../context/BRDPContext';
import { useLocalNotes } from '../hooks/useLocalNotes';
import styles from './DetailPanel.module.css';

/**
 * Lock icon component for read-only fields
 * @returns {JSX.Element} Lock icon with tooltip
 */
function LockIcon() {
  return (
    <span className={styles.lockIcon} title="This field cannot be edited">
      🔒
    </span>
  );
}

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
 * Displays full BRDP details with notes and edit mode
 * @param {Object} props - Component props
 * @param {Object} props.brdp - BRDP record to display
 * @param {Function} props.onClose - Callback when panel closes
 * @param {Function} props.onOpenChat - Callback to open chat panel
 * @param {Function} props.showToast - Callback to show toast notifications
 * @param {Function} props.onUpdate - Callback when BRDP is updated
 * @returns {JSX.Element} Detail panel with full record information
 */
export default function DetailPanel({ brdp, onClose, onOpenChat, showToast, onUpdate }) {
  const { updateBRDP } = useBRDPContext();
  const { getNote, saveNote } = useLocalNotes();
  const [notes, setNotes] = useState('');
  const [notesDirty, setNotesDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    proposal: brdp.proposal,
    validation: brdp.validation,
    comment: brdp.comment,
  });

  // Load notes on mount or when BRDP changes
  useEffect(() => {
    const savedNotes = getNote(brdp.id);
    setNotes(savedNotes);
    setNotesDirty(false);
    setIsEditing(false);
    setEditData({
      proposal: brdp.proposal,
      validation: brdp.validation,
      comment: brdp.comment,
    });
  }, [brdp.id, brdp.proposal, brdp.validation, brdp.comment, getNote]);

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

  /**
   * Handle edit field change
   * @param {string} field - Field name to update
   * @param {string} value - New value
   */
  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handle save changes
   */
  const handleSaveChanges = () => {
    updateBRDP(brdp.id, editData);
    setIsEditing(false);
    if (onUpdate) {
      onUpdate({ ...brdp, ...editData });
    }
    if (showToast) {
      showToast('BRDP updated', 'success');
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditData({
      proposal: brdp.proposal,
      validation: brdp.validation,
      comment: brdp.comment,
    });
    setIsEditing(false);
  };

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Panel */}
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.heading}>
            {isEditing ? `Editing: ${brdp.id}` : brdp.id}
          </h2>
          <div className={styles.headerButtons}>
            {!isEditing && (
              <button
                className={styles.editBtn}
                onClick={() => setIsEditing(true)}
                aria-label="Edit BRDP"
                title="Edit BRDP"
              >
                ✏️
              </button>
            )}
            <button
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Close panel"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <div className={styles.fieldsSection}>
            {/* BRDP Identifier */}
            <div className={styles.field}>
              <label className={styles.label}>
                BRDP Identifier <LockIcon />
              </label>
              <p className={styles.value}>{brdp.id}</p>
            </div>

            {/* Definition */}
            <div className={styles.field}>
              <label className={styles.label}>
                Definition <LockIcon />
              </label>
              <p className={styles.value}>{brdp.definition}</p>
            </div>

            {/* Proposal */}
            <div className={styles.field}>
              <label className={styles.label}>ATX Decision Proposal</label>
              {isEditing ? (
                <textarea
                  value={editData.proposal}
                  onChange={(e) => handleEditChange('proposal', e.target.value)}
                  className={styles.editTextarea}
                  rows="4"
                />
              ) : (
                <p className={styles.value}>{brdp.proposal}</p>
              )}
            </div>

            {/* Validation Status */}
            <div className={styles.field}>
              <label className={styles.label}>Validation Status</label>
              {isEditing ? (
                <select
                  value={editData.validation}
                  onChange={(e) => handleEditChange('validation', e.target.value)}
                  className={styles.editSelect}
                >
                  <option>Validated</option>
                  <option>Refused</option>
                  <option>Pending</option>
                </select>
              ) : (
                <ValidationBadge status={brdp.validation} />
              )}
            </div>

            {/* Comment */}
            <div className={styles.field}>
              <label className={styles.label}>Comment</label>
              {isEditing ? (
                <textarea
                  value={editData.comment}
                  onChange={(e) => handleEditChange('comment', e.target.value)}
                  className={styles.editTextarea}
                  rows="3"
                />
              ) : (
                <p className={styles.value}>{brdp.comment}</p>
              )}
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
          {isEditing ? (
            <div className={styles.editActions}>
              <button
                className={styles.saveBtn}
                onClick={handleSaveChanges}
                title="Save changes"
              >
                Save changes
              </button>
              <button
                className={styles.cancelBtn}
                onClick={handleCancelEdit}
                title="Cancel editing"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className={styles.aiButton}
              onClick={onOpenChat}
              title="Ask AI about this BRDP"
            >
              Ask AI about this BRDP
            </button>
          )}
        </div>
      </div>
    </>
  );
}
