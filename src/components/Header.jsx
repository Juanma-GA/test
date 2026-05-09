import { FileText, Code2 } from 'lucide-react';
import styles from './Header.module.css';

/**
 * Header component with application title and action buttons
 * @param {Object} props - Component props
 * @param {Function} props.onChatClick - Callback when chat button is clicked
 * @param {boolean} props.chatOpen - Whether chat panel is currently open
 * @param {Function} props.onOpenGenerateModal - Callback to open generate modal
 * @param {Function} props.showToast - Callback to show toast notifications
 * @returns {JSX.Element} Header element with title and action buttons
 */
export default function Header({ onChatClick, chatOpen, onOpenGenerateModal, onOpenBREXdocModal, onOpenAIExtractModal, showToast }) {
  const handleGenerateBREXdoc = () => {
    if (onOpenBREXdocModal) onOpenBREXdocModal();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span>
            <strong>BRDP Manager</strong>
          </span>
        </h1>
        <div className={styles.buttons}>
          {/* AI Extract Button */}
          <button
            onClick={() => onOpenAIExtractModal()}
            className={styles.secondaryBtn}
            title="Extract BRDPs from a document"
          >
            AI Extract
          </button>

          {/* Generate BREXdoc Button */}
          <button
            onClick={handleGenerateBREXdoc}
            className={styles.secondaryBtn}
            title="Generate BREXdoc"
            aria-label="Generate BREXdoc"
          >
            <FileText size={16} />
            Generate BREXdoc
          </button>

          {/* Generate BREX / Schematron Button */}
          <button
            onClick={onOpenGenerateModal}
            className={styles.generateBtn}
            title="Generate BREX / Schematron"
            aria-label="Generate BREX / Schematron"
          >
            <Code2 size={16} />
            Generate BREX / Schematron
          </button>

          {/* BRDP Assistant Button */}
          <button
            onClick={onChatClick}
            className={`${styles.chatButton} ${chatOpen ? styles.chatActive : ''}`}
            title={chatOpen ? "Close BRDP Assistant" : "Open BRDP Assistant"}
            aria-label="Open BRDP Assistant"
          >
            ✨ BRDP Assistant
          </button>
        </div>
      </div>
    </header>
  );
}
