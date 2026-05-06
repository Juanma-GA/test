import { useState } from 'react';
import { mockBRDPs } from '../data/mockBRDPs';

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
 */

/**
 * Custom hook for managing BRDP records and statistics
 * Initializes with mock data and provides state management
 * @returns {UseBRDPsReturn} Object containing BRDPs, setter, and stats
 */
export function useBRDPs() {
  const [brdps, setBrdps] = useState(mockBRDPs);

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
  };
}
