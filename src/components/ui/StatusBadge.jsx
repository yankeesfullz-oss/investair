import { formatStatusLabel, getStatusBadgeClasses } from '@/lib/dashboardFormatting';

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(status)}`}>
      {formatStatusLabel(status)}
    </span>
  );
}