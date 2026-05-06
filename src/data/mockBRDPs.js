/**
 * Mock BRDP Records
 * Contains realistic S1000D Issue 4.2 Business Rules Data Package records
 */

/**
 * @typedef {Object} BRDPRecord
 * @property {string} id - BRDP identifier
 * @property {string} definition - BRDP definition with S1000D terminology
 * @property {string} proposal - ATX decision proposal
 * @property {string} validation - Validation status
 * @property {string} comment - Additional comments
 */

/**
 * Array of 10 realistic S1000D BRDP records
 * Mix of validation statuses: 4 Validated, 3 Refused, 3 Pending
 * @type {BRDPRecord[]}
 */
export const mockBRDPs = [
  {
    id: 'BRDP-2024-001',
    definition: 'DMC 1-00-00-00-00A-040A-D: Establishment of Language Code "en-GB" for all technical publications in CAGE Code 3ABD7.',
    proposal: 'Apply applicability condition ACOND-GBR-001 to all data modules issued after 2024-Q1 for UK-based operations.',
    validation: 'Validated',
    comment: 'Approved by ATX Board. Implementation scheduled for Q2 2024.',
  },
  {
    id: 'BRDP-2024-002',
    definition: 'InfoCode 007: Security Classification Update from U (Unclassified) to U/FOUO (For Official Use Only) for DMC 32-41-19-00-00A-801B-D.',
    proposal: 'Enforce mandatory security marking on all issued revisions; retroactive application to rev 3 and later.',
    validation: 'Refused',
    comment: 'Conflicting with existing security policies. Propose alternative classification scheme.',
  },
  {
    id: 'BRDP-2024-003',
    definition: 'Applicability constraint for Component Breakdowns on aircraft configuration codes BAS-01 through BAS-05 in accordance with ConfigCode DMC 01-10-00-00-00A-020A-D.',
    proposal: 'Implement applicability cross-referencing in all CMM procedures; update schema version to 4.2.1.',
    validation: 'Validated',
    comment: 'Coordinated with Configuration Management. Ready for immediate rollout.',
  },
  {
    id: 'BRDP-2024-004',
    definition: 'Data Module Code structure modification: extend Issue 4.2 infoCode range from 001-999 to 001-9999 for expanded topic numbering.',
    proposal: 'Backward compatibility maintained via mapping table; optional adoption period until 2025-12-31.',
    validation: 'Pending',
    comment: 'Awaiting technical feasibility study from IS Team. Expected completion in 30 days.',
  },
  {
    id: 'BRDP-2024-005',
    definition: 'CAGE Code 5T894: Authorization to publish technical data with language code "fr-CA" (Canadian French) for legacy equipment support.',
    proposal: 'Grant exception to primary language rule; restrict to maintenance manuals only with mandatory English disclaimer.',
    validation: 'Validated',
    comment: 'Approved for 2-year pilot program. Review scheduled for Q4 2025.',
  },
  {
    id: 'BRDP-2024-006',
    definition: 'Procedure for managing unclassified COTS (Commercial Off-The-Shelf) component documentation under CAGE Code 27914 with restricted distribution marking.',
    proposal: 'Establish separate publication stream with modified data management rules; require distribution tracking per DMC specification.',
    validation: 'Refused',
    comment: 'Requires legal review of ITAR implications. Submit revised proposal with compliance documentation.',
  },
  {
    id: 'BRDP-2024-007',
    definition: 'DMC 33-30-00-00-00A-640A-D revision history schema update: Add timestamp field and revision author attribution for improved traceability.',
    proposal: 'Implement metadata enhancement; retroactively update schema for revisions issued after 2023-01-01.',
    validation: 'Pending',
    comment: 'Under review by Data Governance Committee. Technical design review scheduled.',
  },
  {
    id: 'BRDP-2024-008',
    definition: 'Applicability statement standardization for multi-variant equipment: Establish mandatory use of ApplicableFor element with structured config codes (ACOND-***-###).',
    proposal: 'Deprecate free-text applicability entries; enforce structured data entry in all new and revised data modules.',
    validation: 'Validated',
    comment: 'Integrated into updated style guide v2.5. Mandatory implementation effective 2024-03-01.',
  },
  {
    id: 'BRDP-2024-009',
    definition: 'Security Classification escalation: Modify access control for InfoCode 002 data modules to require TOP SECRET clearance verification in CAGE Codes 4K892, 6L445, 8M923.',
    proposal: 'Implement role-based access control layer in repository system; audit trail logging mandatory.',
    validation: 'Pending',
    comment: 'Security classification requires final approval from Defense Counterintelligence and Security Agency.',
  },
  {
    id: 'BRDP-2024-010',
    definition: 'Data Module effective date handling: Clarify Issue 4.2 rules for retroactive applicability of updates to DMCs with applicability conditions across 12+ configuration variants.',
    proposal: 'Establish clear precedence rules: active revisions take precedence; archive older variants with dated remarks.',
    validation: 'Refused',
    comment: 'Proposal conflicts with existing configuration management procedures. Recommend consultation with CMM team.',
  },
];
