// Who owns a listing, when somebody has checked. The directory lists
// independents: owner-run Columbus businesses and local multi-location groups.
// A record found to be a national chain or a franchise leaves the directory,
// and the evidence stays here so the reason can be read and re-checked.
//
// Absent means the source listing was taken as independent (see landscape.mjs:
// chains were filtered when it was compiled) and nobody has had cause to look
// again. That is why the site says "we list independents and remove a chain
// when we find one", never "zero chains": a claim of zero is a claim about
// every record, and nobody has verified every record.
//
// Name matching never decides a row. Each entry names its evidence.
//
// type: 'independent' | 'local-group' | 'franchise' | 'national-chain' | 'unknown'

export const OWNERSHIP = {
  jaggers: {
    type: 'national-chain', checked: '2026-10-26', by: 'Claude Code, from the Oct 2026 audit',
    evidence: 'https://www.eatjaggers.com/press-room',
    note: 'Jaggers is a Texas Roadhouse brand and advertises franchising on its own press page.',
  },
  'acceptance-insurance': {
    type: 'national-chain', checked: '2026-10-26', by: 'Claude Code',
    evidence: 'https://locations.acceptanceinsurance.com/indiana/columbus/1800-25th-st/',
    note: "The company's own location page lists this office. Acceptance Insurance is First Acceptance Corporation of Nashville, which runs company-owned retail offices in several states.",
  },
  'sno-biz': {
    type: 'unknown', checked: '2026-10-26', by: 'Claude Code',
    evidence: '',
    note: 'Flagged by the audit on the brand name. Sno Biz names unrelated stands in several states and nothing found ties this one to a franchise. Stays listed until somebody confirms either way.',
  },
  '24-7-dental-emergency-dental-care': {
    type: 'unknown', checked: '2026-10-26', by: 'Claude Code',
    evidence: '',
    note: 'Flagged by the audit on the brand name. No public source found says who owns the Columbus office. Stays listed until somebody confirms either way.',
  },
};

export const EXCLUDED_TYPES = new Set(['national-chain', 'franchise']);
export const excludedForOwnership = (slug) => !!(OWNERSHIP[slug] && EXCLUDED_TYPES.has(OWNERSHIP[slug].type));
