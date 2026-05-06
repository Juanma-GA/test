const STORAGE_KEY = 'brdp_notes';

/**
 * Get notes for a BRDP from localStorage
 * @param {string} id - BRDP identifier
 * @returns {string} Saved notes or empty string if none
 */
function getNote(id) {
  try {
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return notes[id] || '';
  } catch {
    return '';
  }
}

/**
 * Save notes for a BRDP to localStorage
 * @param {string} id - BRDP identifier
 * @param {string} text - Notes text to save
 */
function saveNote(id, text) {
  try {
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    notes[id] = text;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    console.error('Failed to save note to localStorage');
  }
}

/**
 * Custom hook for managing BRDP notes in localStorage
 * @returns {Object} Object with getNote and saveNote functions
 */
export function useLocalNotes() {
  return {
    getNote,
    saveNote,
  };
}
