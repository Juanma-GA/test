import { useState } from 'react';
import { useBRDPs } from '../hooks/useBRDPs';
import { useTableLogic } from '../hooks/useTableLogic';
import SearchBar from '../components/SearchBar';
import FilterPills from '../components/FilterPills';
import BRDPTable from '../components/BRDPTable';
import DetailPanel from '../components/DetailPanel';
import styles from './BRDPPage.module.css';

/**
 * BRDP Page component
 * Main page with search, filter, sort, pagination, and detail panel
 * Chain: filter → search → sort → paginate
 * Layout: Table 60%, Panel 40% on desktop; Full-width drawer on mobile
 * @returns {JSX.Element} Page with table and sliding detail panel
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

  /**
   * Handle closing the detail panel
   */
  const handleClosePanel = () => {
    setSelectedBrdp(null);
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
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h2 className={styles.title}>BRDP Records</h2>

        <div className={styles.controls}>
          <SearchBar value={search} onChange={handleSearchChange} />
          <FilterPills activeFilter={filter} onFilterChange={handleFilterChange} />
        </div>

        <div className={styles.tableWrapper}>
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
        </div>
      </div>

      {/* Detail Panel */}
      {selectedBrdp && <DetailPanel brdp={selectedBrdp} onClose={handleClosePanel} />}
    </div>
  );
}
