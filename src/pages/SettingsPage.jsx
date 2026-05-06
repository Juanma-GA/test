import { useAPIKey } from '../hooks/useAPIKey';
import AIConfigSection from '../components/AIConfigSection';
import AboutSection from '../components/AboutSection';
import styles from './SettingsPage.module.css';

/**
 * Settings Page component
 * Manages AI configuration and displays app information
 * @returns {JSX.Element} Settings page with configuration sections
 */
export default function SettingsPage() {
  const { apiKey, modelName, setApiKey, setModelName, saveKey, isConfigured } =
    useAPIKey();

  /**
   * Handle save button click
   */
  const handleSave = () => {
    saveKey(apiKey, modelName);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Settings</h2>

      <div className={styles.sectionsContainer}>
        <AIConfigSection
          apiKey={apiKey}
          modelName={modelName}
          onApiKeyChange={setApiKey}
          onModelChange={setModelName}
          onSave={handleSave}
          isConfigured={isConfigured}
        />

        <AboutSection />
      </div>
    </div>
  );
}
