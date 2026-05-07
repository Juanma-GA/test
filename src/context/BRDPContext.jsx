import { createContext, useContext, useState, useCallback } from 'react';
import { mockBRDPs } from '../data/mockBRDPs';

const BRDPContext = createContext();

const STORAGE_KEY = 'brdp_data';

export function BRDPProvider({ children }) {
  const [brdps, setBrdpsState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return mockBRDPs;
      }
    }
    return mockBRDPs;
  });

  const [selectedBRDPs, setSelectedBRDPs] = useState([]);

  const setBrdps = useCallback((newBrdps) => {
    setBrdpsState(newBrdps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBrdps));
  }, []);

  const updateBRDP = useCallback((id, changes) => {
    const updated = brdps.map(b => {
      if (b.id !== id) return b;

      // Build history entry for each changed field
      const history = b.history || [];
      const fieldsToTrack = ['proposal', 'comment', 'validation'];

      Object.keys(changes).forEach(field => {
        if (fieldsToTrack.includes(field) && changes[field] !== b[field]) {
          history.push({
            date: new Date().toISOString(),
            field,
            oldValue: b[field] || '',
            newValue: changes[field] || '',
          });
        }
      });

      return { ...b, ...changes, history };
    });
    setBrdps(updated);
  }, [brdps, setBrdps]);

  const resetToMock = useCallback(() => {
    setBrdpsState(mockBRDPs);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const stats = {
    total: brdps.length,
    validated: brdps.filter((brdp) => brdp.validation === 'Validated').length,
    refused: brdps.filter((brdp) => brdp.validation === 'Refused').length,
    pending: brdps.filter((brdp) => brdp.validation === 'Pending').length,
  };

  const value = {
    brdps,
    setBrdps,
    updateBRDP,
    resetToMock,
    stats,
    selectedBRDPs,
    setSelectedBRDPs,
    // Backward compatibility: selectedBRDP is first item in selectedBRDPs array
    get selectedBRDP() {
      return selectedBRDPs.length > 0 ? selectedBRDPs[0] : null;
    },
    // Backward compatibility: setSelectedBRDP sets array with single item or empty
    setSelectedBRDP: (brdp) => {
      setSelectedBRDPs(brdp ? [brdp] : []);
    },
  };

  return (
    <BRDPContext.Provider value={value}>
      {children}
    </BRDPContext.Provider>
  );
}

export function useBRDPContext() {
  const context = useContext(BRDPContext);
  if (!context) {
    throw new Error('useBRDPContext must be used within BRDPProvider');
  }
  return context;
}
