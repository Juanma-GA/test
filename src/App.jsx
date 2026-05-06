import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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

  /**
   * Handle opening chat from header
   */
  const handleHeaderChatClick = () => {
    if (currentPage === 'brdp') {
      setChatOpen(!chatOpen);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onChatClick={handleHeaderChatClick} chatOpen={chatOpen && currentPage === 'brdp'} />
      <div className="flex flex-1">
        <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
        <main className="flex-1 bg-gray-50">
          {currentPage === 'brdp' && <BRDPPage chatOpen={chatOpen} onSetChatOpen={setChatOpen} />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
