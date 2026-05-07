import { useState } from 'react';
import { useToast } from './hooks/useToast';
import { useAPIKey } from './hooks/useAPIKey';
import { useChat } from './hooks/useChat';
import { BRDPProvider } from './context/BRDPContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import BRDPPage from './pages/BRDPPage';
import SettingsPage from './pages/SettingsPage';
import ChatPanel from './components/ChatPanel';
import './index.css';
import './App.css';

/**
 * Main App component
 * Manages page routing between BRDP and Settings pages
 * @returns {JSX.Element} Application layout with header, sidebar, and main content
 */
function App() {
  const [currentPage, setCurrentPage] = useState('brdp');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedBrdp, setSelectedBrdp] = useState(null);
  const { toasts, showToast } = useToast();
  const { apiKey, modelName, provider, isConfigured } = useAPIKey();

  const { messages, sendUserMessage, clearHistory, isLoading, error } = useChat({
    apiKey,
    modelName,
    provider,
    selectedBrdp,
  });

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
    <BRDPProvider>
      <div className="appContainer">
        <Header onChatClick={handleHeaderChatClick} chatOpen={chatOpen && currentPage === 'brdp'} />
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
              isLoading={isLoading}
              error={error}
              isConfigured={isConfigured}
              onNavigateSettings={handleNavigateSettings}
              onClose={handleCloseChat}
              detailPanelOpen={!!selectedBrdp}
            />
          )}
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    </BRDPProvider>
  );
}

export default App;
