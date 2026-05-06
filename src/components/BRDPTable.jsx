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
 * BRDP Table component
 * Displays BRDP records in a table with selectable rows
 * @param {Object} props - Component props
 * @param {Array} props.brdps - Array of BRDP records
 * @param {Function} props.onSelect - Callback when row is clicked
 * @param {string} [props.selectedId] - ID of currently selected row
 * @returns {JSX.Element} Table displaying BRDP records
 */
export default function BRDPTable({ brdps, onSelect, selectedId }) {
  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>BRDP Identifier</th>
            <th>Definition</th>
            <th>Proposal</th>
            <th>Validation</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {brdps.map((brdp) => (
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
        {brdps.length} {brdps.length === 1 ? 'record' : 'records'}
      </div>
    </div>
  );
}
