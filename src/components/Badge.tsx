import type { TaskStatus } from '../types';
import { statusColors, statusLabels } from '../utils';

interface BadgeProps {
  status: TaskStatus;
}

export default function Badge({ status }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
