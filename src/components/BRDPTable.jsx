import styles from './BRDPTable.module.css';

/**
 * Utility function to truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated text with ellipsis if needed
 */
function truncate(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
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
 * Sort indicator component
 * Shows arrow icon for sort direction
 * @param {string} sortDir - Sort direction ('asc', 'desc', or '')
 * @returns {JSX.Element|null} Sort arrow icon or null
 */
function SortIndicator({ sortDir }) {
  if (!sortDir) return null;
  return <span className={styles.sortArrow}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

/**
 * BRDP Table component
 * Displays BRDP records with sorting and pagination
 * @param {Object} props - Component props
 * @param {Array} props.rows - Array of BRDP records to display (already paginated)
 * @param {Function} props.onSelect - Callback when row is clicked
 * @param {string} [props.selectedId] - ID of currently selected row
 * @param {Function} props.onSort - Callback when column header is clicked
 * @param {string} props.sortField - Current sort field
 * @param {string} props.sortDir - Current sort direction
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.total - Total records matching filter/search
 * @param {Function} props.onPageChange - Callback to change page
 * @param {boolean} props.noResults - Whether there are no results to display
 * @returns {JSX.Element} Table displaying BRDP records with pagination
 */
export default function BRDPTable({
  rows,
  onSelect,
  selectedId,
  onSort,
  sortField,
  sortDir,
  currentPage,
  totalPages,
  total,
  onPageChange,
  noResults,
}) {
  /**
   * Get sort direction for a column
   * Cycles: none → asc → desc → none
   * @param {string} field - Column field name
   * @returns {string} Next sort direction
   */
  const getNextSortDir = (field) => {
    if (sortField !== field) return 'asc';
    if (sortDir === 'asc') return 'desc';
    if (sortDir === 'desc') return '';
    return 'asc';
  };

  /**
   * Handle sort header click
   * @param {string} field - Column field to sort by
   */
  const handleSort = (field) => {
    const nextDir = getNextSortDir(field);
    onSort(field, nextDir);
  };

  /**
   * Get class for sortable header
   * @param {string} field - Column field name
   * @returns {string} Combined class name
   */
  const getHeaderClass = (field) => {
    if (field !== 'id' && field !== 'validation') return '';
    let cls = styles.sortableHeader;
    if (sortField === field) {
      cls += ` ${styles.sorted}`;
    }
    return cls;
  };

  if (noResults) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>No results found</p>
          <p className={styles.emptyHint}>Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th
              className={getHeaderClass('id')}
              onClick={() => handleSort('id')}
            >
              BRDP Identifier
              {sortField === 'id' && <SortIndicator sortDir={sortDir} />}
            </th>
            <th>Definition</th>
            <th>Proposal</th>
            <th
              className={getHeaderClass('validation')}
              onClick={() => handleSort('validation')}
            >
              Validation
              {sortField === 'validation' && <SortIndicator sortDir={sortDir} />}
            </th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((brdp) => (
            <tr
              key={brdp.id}
              className={selectedId === brdp.id ? styles.selected : ''}
              onClick={() => onSelect(brdp)}
            >
              <td className={styles.id}>{brdp.id}</td>
              <td className={styles.definition} title={brdp.definition}>
                {truncate(brdp.definition, 60)}
              </td>
              <td className={styles.proposal} title={brdp.proposal}>
                {truncate(brdp.proposal, 60)}
              </td>
              <td className={styles.validation}>
                <ValidationBadge status={brdp.validation} />
              </td>
              <td className={styles.comment} title={brdp.comment}>
                {truncate(brdp.comment, 40)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.footer}>
        <div className={styles.footerInfo}>
          {total} {total === 1 ? 'record' : 'records'} | Page {currentPage} of{' '}
          {totalPages}
        </div>
        <div className={styles.pagination}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.paginationBtn}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.paginationBtn}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

