import { useState } from 'react';
import { useBRDPs } from '../hooks/useBRDPs';
import { useTableLogic } from '../hooks/useTableLogic';
import SearchBar from '../components/SearchBar';
import FilterPills from '../components/FilterPills';
import BRDPTable from '../components/BRDPTable';
import styles from './BRDPPage.module.css';

/**
 * BRDP Page component
 * Main page with search, filter, sort, pagination, and record details
 * Chain: filter → search → sort → paginate
 * @returns {JSX.Element} Page with full table controls and details panel
 */
export default function BRDPPage() {
  const { brdps } = useBRDPs();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('');
  const [page, setPage] = useState(1);
  const [selectedBrdp, setSelectedBrdp] = useState(null);

  // Reset to page 1 when search or filter changes
  const handleSearchChange = (newSearch) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  /**
   * Handle sort change
   * @param {string} field - Field to sort by
   * @param {string} dir - Sort direction ('asc', 'desc', or '')
   */
  const handleSort = (field, dir) => {
    setSortField(field);
    setSortDir(dir);
  };

  /**
   * Handle page change
   * @param {number} newPage - New page number
   */
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Use table logic with all parameters
  const { rows, totalPages, total } = useTableLogic({
    brdps,
    search,
    filter,
    sortField,
    sortDir,
    page,
  });

  const noResults = total === 0;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>BRDP Records</h2>

      <div className={styles.controls}>
        <SearchBar value={search} onChange={handleSearchChange} />
        <FilterPills activeFilter={filter} onFilterChange={handleFilterChange} />
      </div>

      <BRDPTable
        rows={rows}
        onSelect={setSelectedBrdp}
        selectedId={selectedBrdp?.id}
        onSort={handleSort}
        sortField={sortField}
        sortDir={sortDir}
        currentPage={page}
        totalPages={totalPages || 1}
        total={total}
        onPageChange={handlePageChange}
        noResults={noResults}
      />

      {selectedBrdp && (
        <div className={styles.details}>
          <h3 className={styles.detailsTitle}>Record Details</h3>
          <div className={styles.detailsContent}>
            <div className={styles.field}>
              <label>BRDP Identifier:</label>
              <p>{selectedBrdp.id}</p>
            </div>
            <div className={styles.field}>
              <label>Definition:</label>
              <p>{selectedBrdp.definition}</p>
            </div>
            <div className={styles.field}>
              <label>Proposal:</label>
              <p>{selectedBrdp.proposal}</p>
            </div>
            <div className={styles.field}>
              <label>Validation Status:</label>
              <p>{selectedBrdp.validation}</p>
            </div>
            <div className={styles.field}>
              <label>Comment:</label>
              <p>{selectedBrdp.comment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
