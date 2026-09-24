/* ─────────────────────────────────────────────────────────────────
   Account and verification presentation, shared by the people list
   and person detail so the two can't drift.

   verification_status is null for artists — only organisations carry
   one — so callers must treat null as "not applicable", not "pending".
   ───────────────────────────────────────────────────────────────── */

export const VERIFICATION = {
  pending:      { label: 'Pending',      bg: '#F6EBD4', fg: '#8A6100' },
  under_review: { label: 'Under review', bg: '#E7EEF6', fg: '#1F4E79' },
  verified:     { label: 'Verified',     bg: '#DDEDE5', fg: '#146B47' },
  rejected:     { label: 'Rejected',     bg: '#F7E2DE', fg: '#A32B1C' },
};

export const verificationOf = (s) =>
  s ? (VERIFICATION[s] || { label: String(s).replace(/_/g, ' '), bg: '#EEF1F4', fg: '#667382' }) : null;

export const ROLE_FILTERS = [
  { value: '',             label: 'All roles' },
  { value: 'artist',       label: 'Artists' },
  { value: 'organization', label: 'Organisations' },
];

export const STATUS_FILTERS = [
  { value: '',         label: 'Active and suspended' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Suspended' },
];

export const VERIFICATION_FILTERS = [
  { value: '',             label: 'Any verification' },
  { value: 'pending',      label: 'Pending' },
  { value: 'under_review', label: 'Under review' },
  { value: 'verified',     label: 'Verified' },
  { value: 'rejected',     label: 'Rejected' },
];

export default VERIFICATION;
