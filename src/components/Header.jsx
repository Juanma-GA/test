import { FileText } from 'lucide-react';
import styles from './Header.module.css';

/**
 * Header component with application title and action buttons
 * @param {Object} props - Component props
 * @param {Function} props.onChatClick - Callback when chat button is clicked
 * @param {boolean} props.chatOpen - Whether chat panel is currently open
 * @param {Function} props.onOpenGenerateModal - Callback to open generate modal
 * @returns {JSX.Element} Header element with title and action buttons
 */
export default function Header({ onChatClick, chatOpen, onOpenGenerateModal }) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span>
            <strong>BRDP Manager</strong>
          </span>
        </h1>
        <div className={styles.buttons}>
          <button
            onClick={onChatClick}
            className={`${styles.chatButton} ${chatOpen ? styles.chatActive : ''}`}
            title={chatOpen ? "Close AI Assistant" : "Open AI Assistant"}
            aria-label="Open AI Assistant"
          >
            ✨ AI Assistant
          </button>
          <button
            onClick={onOpenGenerateModal}
            className={styles.generateBtn}
            title="Generate BREX / Schematron"
            aria-label="Generate BREX / Schematron"
          >
            <FileText size={16} /> Generate BREX / Schematron
          </button>
        </div>
      </div>
    </header>
  );
}
