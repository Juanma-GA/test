import { useBRDPs } from '../hooks/useBRDPs';
import styles from './Header.module.css';

/**
 * Header component with application title and statistics badges
 * Displays real-time counts of BRDP records by validation status
 * @returns {JSX.Element} Header element with title, stat badges, and chat button
 */
export default function Header() {
  const { stats } = useBRDPs();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>BRDP Manager</h1>
        <button
          className={styles.chatButton}
          title="Open AI Assistant (click on a record to ask AI)"
          aria-label="Open AI Assistant"
          disabled
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
