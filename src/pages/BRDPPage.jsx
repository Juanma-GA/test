import { useState } from 'react';
import { useBRDPs } from '../hooks/useBRDPs';
import { useTableLogic } from '../hooks/useTableLogic';
import { useAPIKey } from '../hooks/useAPIKey';
import { useChat } from '../hooks/useChat';
import SearchBar from '../components/SearchBar';
import FilterPills from '../components/FilterPills';
import BRDPTable from '../components/BRDPTable';
import DetailPanel from '../components/DetailPanel';
import ChatPanel from '../components/ChatPanel';
import styles from './BRDPPage.module.css';

/**
 * BRDP Page component
 * Main page with search, filter, sort, pagination, detail panel, and chat
 * Chain: filter → search → sort → paginate
 * Layout: Flexible based on open panels
 * @returns {JSX.Element} Page with table, detail panel, and chat
 */
export default function BRDPPage() {
  const { brdps } = useBRDPs();
  const { apiKey, modelName, provider, isConfigured } = useAPIKey();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortField, setSortField] = useState('');
  const [sortDir, setSortDir] = useState('');
  const [page, setPage] = useState(1);
  const [selectedBrdp, setSelectedBrdp] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Chat hook with selected BRDP context
  const { messages, sendUserMessage, clearHistory, isLoading, error } = useChat({
    apiKey,
    modelName,
    provider,
    selectedBrdp,
  });

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
    setSelectedBrdp(brdp);
  };

  /**
   * Handle closing the detail panel
   */
  const handleClosePanel = () => {
    setSelectedBrdp(null);
  };

  /**
   * Handle opening the chat panel
   */
  const handleOpenChat = () => {
    setChatOpen(true);
  };

  /**
   * Handle closing the chat panel
   */
  const handleCloseChat = () => {
    setChatOpen(false);
  };

  /**
   * Handle navigating to settings
   */
  const handleNavigateSettings = () => {
    // This would typically navigate, but for now we'll just close the chat
    handleCloseChat();
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

  // Determine layout class based on open panels
  const getLayoutClass = () => {
    if (selectedBrdp && chatOpen) {
      return styles.layoutThreePanel;
    }
    if (chatOpen) {
      return styles.layoutChatOnly;
    }
    return styles.layoutDefault;
  };

  return (
    <div className={`${styles.pageContainer} ${getLayoutClass()}`}>
      <div className={styles.container}>
        <h2 className={styles.title}>BRDP Records</h2>

        <div className={styles.controls}>
          <SearchBar value={search} onChange={handleSearchChange} />
          <FilterPills activeFilter={filter} onFilterChange={handleFilterChange} />
        </div>

        <div className={styles.tableWrapper}>
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
          />
        </div>
      </div>

      {/* Detail Panel */}
      {selectedBrdp && (
        <DetailPanel
          brdp={selectedBrdp}
          onClose={handleClosePanel}
          onOpenChat={handleOpenChat}
        />
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <ChatPanel
          messages={messages}
          onSendMessage={sendUserMessage}
          onClearHistory={clearHistory}
          isLoading={isLoading}
          error={error}
          isConfigured={isConfigured}
          onNavigateSettings={handleNavigateSettings}
          onClose={handleCloseChat}
          detailPanelOpen={!!selectedBrdp}
        />
      )}
    </div>
  );
}
