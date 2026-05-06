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
        <h1 className={styles.title}>BRDP Manager</h1>
        <button
          onClick={onChatClick}
          className={`${styles.chatButton} ${chatOpen ? styles.chatActive : ''}`}
          title={chatOpen ? "Close AI Assistant" : "Open AI Assistant"}
          aria-label="Open AI Assistant"
        >
          💬
        </button>
        <div className={styles.badges}>
          <div className={`${styles.badge} ${styles.total}`}>
            <span className={styles.label}>Total</span>
            <span className={styles.value}>{stats.total}</span>
          </div>
          <div className={`${styles.badge} ${styles.validated}`}>
            <span className={styles.label}>Validated</span>
            <span className={styles.value}>{stats.validated}</span>
          </div>
          <div className={`${styles.badge} ${styles.refused}`}>
            <span className={styles.label}>Refused</span>
            <span className={styles.value}>{stats.refused}</span>
          </div>
          <div className={`${styles.badge} ${styles.pending}`}>
            <span className={styles.label}>Pending</span>
            <span className={styles.value}>{stats.pending}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
