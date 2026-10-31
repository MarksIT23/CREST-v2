const STATUS_STYLES = {
  approved: 'bg-emerald-700 border-emerald-700 text-white',
  pending: 'bg-stamp border-stamp text-white',
  archived: 'bg-neutral-500 border-neutral-500 text-white',
  rejected: 'bg-red-700 border-red-700 text-white',
};

const STATUS_LABELS = {
  approved: 'Approved',
  pending: 'Pending Review',
  archived: 'Archived',
  rejected: 'Rejected',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`stamp text-[12px] ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
