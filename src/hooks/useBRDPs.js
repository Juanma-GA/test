import { useState, useCallback } from 'react';
import { mockBRDPs } from '../data/mockBRDPs';

const STORAGE_KEY = 'brdp_data';

/**
 * @typedef {Object} BRDPStats
 * @property {number} total - Total number of BRDPs
 * @property {number} validated - Count of validated BRDPs
 * @property {number} refused - Count of refused BRDPs
 * @property {number} pending - Count of pending BRDPs
 */

/**
 * @typedef {Object} UseBRDPsReturn
 * @property {Array} brdps - Array of BRDP records
 * @property {Function} setBrdps - Function to update BRDPs
 * @property {BRDPStats} stats - Statistics object with counts
 * @property {Function} resetToMock - Reset BRDPs to mock data
 */

/**
 * Custom hook for managing BRDP records and statistics
 * Persists BRDPs to localStorage and provides state management
 * @returns {UseBRDPsReturn} Object containing BRDPs, setter, stats, and reset
 */
export function useBRDPs() {
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

  /**
   * Wrapper for setBrdps that also saves to localStorage
   */
  const setBrdps = useCallback((newBrdps) => {
    setBrdpsState(newBrdps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBrdps));
  }, []);

  /**
   * Reset BRDPs to mock data and clear localStorage
   */
  const resetToMock = useCallback(() => {
    setBrdpsState(mockBRDPs);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Calculate statistics from current BRDP array
   * Counts records by validation status
   */
  const stats = {
    total: brdps.length,
    validated: brdps.filter((brdp) => brdp.validation === 'Validated').length,
    refused: brdps.filter((brdp) => brdp.validation === 'Refused').length,
    pending: brdps.filter((brdp) => brdp.validation === 'Pending').length,
  };

  return {
    brdps,
    setBrdps,
    stats,
    resetToMock,
  };
}
