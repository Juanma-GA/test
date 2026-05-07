import { useState, useEffect } from 'react';
import { useToast } from './hooks/useToast';
import { useAPIKey } from './hooks/useAPIKey';
import { useChat } from './hooks/useChat';
import { BRDPProvider, useBRDPContext } from './context/BRDPContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import BRDPPage from './pages/BRDPPage';
import SettingsPage from './pages/SettingsPage';
import ChatPanel from './components/ChatPanel';
import GenerateModal from './components/GenerateModal';
import './index.css';
import './App.css';

/**
 * Main App component
 * Manages page routing between BRDP and Settings pages
 * @returns {JSX.Element} Application layout with header, sidebar, and main content
 */
function AppContent() {
  const [currentPage, setCurrentPage] = useState('brdp');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBrdp, setSelectedBrdp] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [chatPanelWidth, setChatPanelWidth] = useState(() => {
    const saved = localStorage.getItem('chatPanelWidth');
    return saved ? parseInt(saved) : 340;
  });
  const { brdps } = useBRDPContext();
  const { toasts, showToast } = useToast();
  const { apiKey, modelName, provider, isConfigured } = useAPIKey();

  const { messages, sendUserMessage, clearHistory, stopStreaming, isLoading, error } = useChat({
    apiKey,
    modelName,
    provider,
    selectedBrdp,
  });

  // Save chat panel width to localStorage
  useEffect(() => {
    localStorage.setItem('chatPanelWidth', chatPanelWidth.toString());
  }, [chatPanelWidth]);

  /**
   * Handle opening generate modal
   */
  const openGenerateModal = () => {
    setShowGenerateModal(true);
  };

  /**
   * Handle opening chat from header
   */
  const handleHeaderChatClick = () => {
    if (currentPage === 'brdp') {
      setChatOpen(!chatOpen);
    }
  };

  const handleCloseChat = () => {
    setChatOpen(false);
  };

  const handleNavigateSettings = () => {
    handleCloseChat();
  };

  return (
    <div className="appContainer">
      <Header onChatClick={handleHeaderChatClick} chatOpen={chatOpen && currentPage === 'brdp'} onOpenGenerateModal={openGenerateModal} />
      <div className="workspaceRow">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="mainContent">
          {currentPage === 'brdp' && <BRDPPage selectedBrdp={selectedBrdp} onSelectBrdp={setSelectedBrdp} showToast={showToast} onNavigate={setCurrentPage} />}
          {currentPage === 'settings' && <SettingsPage showToast={showToast} />}
        </main>
        {currentPage === 'brdp' && chatOpen && (
          <ChatPanel
            messages={messages}
            onSendMessage={sendUserMessage}
            onClearHistory={clearHistory}
            onStopStreaming={stopStreaming}
            isLoading={isLoading}
            error={error}
            isConfigured={isConfigured}
            onNavigateSettings={handleNavigateSettings}
            onClose={handleCloseChat}
            detailPanelOpen={!!selectedBrdp}
            selectedBrdp={selectedBrdp}
            onOpenGenerateModal={openGenerateModal}
            width={chatPanelWidth}
            onWidthChange={setChatPanelWidth}
          />
        )}
      </div>
      {showGenerateModal && (
        <GenerateModal
          brdps={brdps}
          onClose={() => setShowGenerateModal(false)}
        />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}

function App() {
  return (
    <BRDPProvider>
      <AppContent />
    </BRDPProvider>
  );
}

export default App;
