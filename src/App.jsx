import { useState } from 'react';
import { useToast } from './hooks/useToast';
import { BRDPProvider } from './context/BRDPContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import BRDPPage from './pages/BRDPPage';
import SettingsPage from './pages/SettingsPage';
import './index.css';

/**
 * Main App component
 * Manages page routing between BRDP and Settings pages
 * @returns {JSX.Element} Application layout with header, sidebar, and main content
 */
function App() {
  const [currentPage, setCurrentPage] = useState('brdp');
  const [chatOpen, setChatOpen] = useState(false);
  const { toasts, showToast } = useToast();

  /**
   * Handle opening chat from header
   */
  const handleHeaderChatClick = () => {
    if (currentPage === 'brdp') {
      setChatOpen(!chatOpen);
    }
  };

  return (
    <BRDPProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header onChatClick={handleHeaderChatClick} chatOpen={chatOpen && currentPage === 'brdp'} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
          <main className="flex-1 overflow-hidden bg-gray-50">
            {currentPage === 'brdp' && <BRDPPage chatOpen={chatOpen} onSetChatOpen={setChatOpen} showToast={showToast} onNavigate={setCurrentPage} />}
            {currentPage === 'settings' && <SettingsPage showToast={showToast} />}
          </main>
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    </BRDPProvider>
  );
}

export default App;
