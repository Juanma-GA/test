import { useState, useRef, useEffect } from 'react';
import { FileText, Code2, ChevronDown } from 'lucide-react';
import styles from './Header.module.css';

/**
 * Header component with application title and action buttons
 * @param {Object} props - Component props
 * @param {Function} props.onChatClick - Callback when chat button is clicked
 * @param {boolean} props.chatOpen - Whether chat panel is currently open
 * @param {Function} props.onOpenGenerateModal - Callback to open generate modal
 * @param {Function} props.showToast - Callback to show toast notifications
 * @returns {JSX.Element} Header element with title and action buttons
 */
export default function Header({ onChatClick, chatOpen, onOpenGenerateModal, onOpenBREXdocModal, showToast }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAIExtractOption = (option) => {
    setIsDropdownOpen(false);
    if (showToast) {
      showToast('Coming soon', 'info');
    }
  };

  const handleGenerateBREXdoc = () => {
    if (onOpenBREXdocModal) onOpenBREXdocModal();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span>
            <strong>BRDP Manager</strong>
          </span>
        </h1>
        <div className={styles.buttons}>
          {/* AI Extract Dropdown */}
          <div className={styles.dropdownContainer} ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={styles.secondaryBtn}
              title="AI Extract options"
              aria-label="AI Extract options"
              aria-expanded={isDropdownOpen}
            >
              AI Extract <ChevronDown size={16} />
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  onClick={() => handleAIExtractOption('style-guide')}
                  className={styles.dropdownItem}
                >
                  Get BRDPs from Style Guide
                </button>
                <button
                  onClick={() => handleAIExtractOption('brex-doc')}
                  className={styles.dropdownItem}
                >
                  Get BRDPs from BREX Doc
                </button>
              </div>
            )}
          </div>

          {/* Generate BREXdoc Button */}
          <button
            onClick={handleGenerateBREXdoc}
            className={styles.secondaryBtn}
            title="Generate BREXdoc"
            aria-label="Generate BREXdoc"
          >
            <FileText size={16} />
            Generate BREXdoc
          </button>

          {/* Generate BREX / Schematron Button */}
          <button
            onClick={onOpenGenerateModal}
            className={styles.generateBtn}
            title="Generate BREX / Schematron"
            aria-label="Generate BREX / Schematron"
          >
            <Code2 size={16} />
            Generate BREX / Schematron
          </button>

          {/* BRDP Assistant Button */}
          <button
            onClick={onChatClick}
            className={`${styles.chatButton} ${chatOpen ? styles.chatActive : ''}`}
            title={chatOpen ? "Close BRDP Assistant" : "Open BRDP Assistant"}
            aria-label="Open BRDP Assistant"
          >
            ✨ BRDP Assistant
          </button>
        </div>
      </div>
    </header>
  );
}
