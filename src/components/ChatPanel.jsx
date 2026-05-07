import { useState, useRef, useEffect } from 'react';
import { useBRDPContext } from '../context/BRDPContext';
import GenerateModal from './GenerateModal';
import styles from './ChatPanel.module.css';

/**
 * Typing indicator component
 * Shows animated dots while waiting for response
 * @returns {JSX.Element} Typing indicator
 */
function TypingIndicator() {
  return (
    <div className={styles.typingIndicator}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

/**
 * Chat panel component
 * Displays conversation history and input for AI assistant
 * @param {Object} props - Component props
 * @param {Array} props.messages - Message history
 * @param {Function} props.onSendMessage - Callback to send message
 * @param {Function} props.onClearHistory - Callback to clear history
 * @param {boolean} props.isLoading - Whether waiting for response
 * @param {string} props.error - Error message if any
 * @param {boolean} props.isConfigured - Whether API is configured
 * @param {Function} props.onNavigateSettings - Navigate to settings
 * @param {Function} props.onClose - Callback to close panel
 * @param {boolean} props.detailPanelOpen - Whether detail panel is open
 * @returns {JSX.Element} Chat panel
 */
export default function ChatPanel({
  messages,
  onSendMessage,
  onClearHistory,
  isLoading,
  error,
  isConfigured,
  onNavigateSettings,
  onClose,
  detailPanelOpen,
}) {
  const { brdps } = useBRDPContext();
  const [input, setInput] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handle send button click
   */
  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  /**
   * Handle key press in textarea
   * Enter sends, Shift+Enter creates new line
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`${styles.panel} ${detailPanelOpen ? styles.withDetail : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Ask AI</h3>
        <button
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close chat panel"
          title="Close"
        >
          ✕
        </button>
      </div>

      {/* Generate Button */}
      <div className={styles.actionButtons}>
        <button
          className={styles.generateBtn}
          disabled={!isConfigured || brdps.length === 0}
          onClick={() => setShowGenerateModal(true)}
          title={!isConfigured || brdps.length === 0 ? 'Configure your API key and load BRDPs first' : ''}
        >
          Generate Output
        </button>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <GenerateModal
          brdps={brdps}
          onClose={() => setShowGenerateModal(false)}
        />
      )}

      {/* Messages Area */}
      <div className={styles.messagesContainer}>
        {!isConfigured ? (
          <div className={styles.configBanner}>
            <p className={styles.bannerText}>
              Configure your API key in Settings to enable AI features
            </p>
            <button
              onClick={onNavigateSettings}
              className={styles.settingsLink}
            >
              Go to Settings
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>
              Start a conversation about your BRDP records
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`${styles.message} ${styles[message.role]}`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <TypingIndicator />
              </div>
            )}
          </>
        )}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isConfigured && (
        <div className={styles.inputContainer}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about S1000D, DITA, or this BRDP..."
            disabled={isLoading}
            className={styles.textarea}
            rows="3"
          />
          <div className={styles.inputActions}>
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={styles.sendBtn}
            >
              Send
            </button>
            <button
              onClick={onClearHistory}
              disabled={isLoading || messages.length === 0}
              className={styles.clearBtn}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
