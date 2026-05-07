import { useBRDPs } from '../hooks/useBRDPs';
import styles from './Header.module.css';

/**
 * Header component with application title and statistics badges
 * Displays real-time counts of BRDP records by validation status
 * @param {Object} props - Component props
 * @param {Function} props.onChatClick - Callback when chat button is clicked
 * @param {boolean} props.chatOpen - Whether chat panel is currently open
 * @returns {JSX.Element} Header element with title, stat badges, and chat button
 */
export default function Header({ onChatClick, chatOpen }) {
  const { stats } = useBRDPs();

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
            className={styles.generateBtn}
            title="Generate Output"
            aria-label="Generate Output"
          >
            Generate
          </button>
        </div>
      </div>
    </header>
  );
}
