/**
 * BRDP Field Schema Definition
 * Defines the structure and validation rules for BRDP records
 */

/**
 * @typedef {Object} BRDPField
 * @property {string} key - Field identifier
 * @property {string} label - Human-readable label for display
 * @property {string} type - Data type: 'string', 'enum'
 * @property {string[]} [validValues] - Valid enum values (required if type is 'enum')
 */

/**
 * BRDP field definitions matching Excel column names
 * @type {BRDPField[]}
 */
export const BRDP_FIELDS = [
  {
    key: 'id',
    label: 'BRDP Identifier',
    type: 'string',
  },
  {
    key: 'definition',
    label: 'BRDP Definition',
    type: 'string',
  },
  {
    key: 'proposal',
    label: 'ATX Decision Proposal',
    type: 'string',
  },
  {
    key: 'validation',
    label: 'Validation Status',
    type: 'enum',
    validValues: ['Validated', 'Refused', 'Pending'],
  },
  {
    key: 'comment',
    label: 'Comment',
    type: 'string',
  },
];
