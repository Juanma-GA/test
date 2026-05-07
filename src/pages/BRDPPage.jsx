import { useState, useEffect } from 'react';
import { useBRDPContext } from '../context/BRDPContext';
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
 * @param {Object} props - Component props
 * @param {Object} props.selectedBrdp - Currently selected BRDP for detail panel
 * @param {Function} props.onSelectBrdp - Callback to select/deselect BRDP
 * @param {Function} props.showToast - Callback to show toast notifications
 * @param {Function} props.onNavigate - Callback to navigate to different page
 * @returns {JSX.Element} Page with table and detail panel
 */
export default function BRDPPage({ selectedBrdp, onSelectBrdp, showToast, onNavigate }) {
  const { brdps } = useBRDPContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('');
  const [page, setPage] = useState(1);

  // Reset to page 1 when brdps array changes (new import)
  useEffect(() => {
    setPage(1);
  }, [brdps]);

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
   * Handle opening the detail panel
   */
  const handleSelectBrdp = (brdp) => {
    onSelectBrdp(brdp);
  };

  /**
   * Handle closing the detail panel
   */
  const handleClosePanel = () => {
    onSelectBrdp(null);
  };

  /**
   * Handle BRDP updated in DetailPanel
   */
  const handleBrdpUpdate = (updatedBrdp) => {
    onSelectBrdp(updatedBrdp);
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

        <div
          className={styles.tableWrapper}
          style={{
            height: 'calc(100vh - 240px)',
            overflowY: 'auto'
          }}
        >
          <BRDPTable
            rows={rows}
            onSelect={handleSelectBrdp}
            selectedId={selectedBrdp?.id}
            onSort={handleSort}
            sortField={sortField}
            sortDir={sortDir}
            currentPage={page}
            totalPages={totalPages || 1}
            total={total}
            onPageChange={handlePageChange}
            noResults={noResults}
            noBrdps={brdps.length === 0}
            onGoToSettings={() => onNavigate('settings')}
          />
        </div>
      </div>

      {/* Detail Panel */}
      {selectedBrdp && (
        <DetailPanel
          brdp={selectedBrdp}
          onClose={handleClosePanel}
          onOpenChat={() => {}}
          showToast={showToast}
          onUpdate={handleBrdpUpdate}
        />
      )}
    </div>
  );
}
