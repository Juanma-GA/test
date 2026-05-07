import styles from './Sidebar.module.css';

/**
 * Sidebar component with navigation
 * Displays navigation buttons for different pages
 * @param {Object} props - Component props
 * @param {string} props.currentPage - Currently active page
 * @param {Function} props.onNavigate - Callback when navigation button is clicked
 * @returns {JSX.Element} Sidebar element with navigation buttons
 */
export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sectionLabel}>Navigation</div>
      <nav className={styles.nav}>
        <button
          onClick={() => onNavigate('brdp')}
          className={`${styles.navItem} ${currentPage === 'brdp' ? styles.active : ''}`}
        >
          <span className={styles.navIcon}>📋</span>
          <span className={styles.navLabel}>BRDP Records</span>
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`${styles.navItem} ${currentPage === 'settings' ? styles.active : ''}`}
        >
          <span className={styles.navIcon}>⚙️</span>
          <span className={styles.navLabel}>Settings</span>
        </button>
      </nav>

      <div className={styles.footer}>
        <div>
          <span className={styles.footerIcon}>ℹ️</span>
          BRDP Manager v1.0
        </div>
      </div>
    </aside>
  );
}
