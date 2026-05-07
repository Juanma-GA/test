import { FileText } from 'lucide-react';
import { useBRDPContext } from '../context/BRDPContext';
import styles from './Header.module.css';

/**
 * Header component with application title and statistics badges
 * Displays real-time counts of BRDP records by validation status
 * @param {Object} props - Component props
 * @param {Function} props.onChatClick - Callback when chat button is clicked
 * @param {boolean} props.chatOpen - Whether chat panel is currently open
 * @param {Function} props.onOpenGenerateModal - Callback to open generate modal
 * @returns {JSX.Element} Header element with title, stat badges, and chat button
 */
export default function Header({ onChatClick, chatOpen, onOpenGenerateModal }) {
  const { stats } = useBRDPContext();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span>
            <strong>BRDP Manager</strong>
          </span>
        </h1>
        <div className={styles.badges}>
          <div className={`${styles.badge} ${styles.total}`}>
            <span className={styles.value}>{stats.total}</span>
            <span className={styles.label}>Total</span>
          </div>
          <div className={`${styles.badge} ${styles.validated}`}>
            <span className={styles.value}>{stats.validated}</span>
            <span className={styles.label}>Validated</span>
          </div>
          <div className={`${styles.badge} ${styles.refused}`}>
            <span className={styles.value}>{stats.refused}</span>
            <span className={styles.label}>Refused</span>
          </div>
          <div className={`${styles.badge} ${styles.pending}`}>
            <span className={styles.value}>{stats.pending}</span>
            <span className={styles.label}>Pending</span>
          </div>
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
