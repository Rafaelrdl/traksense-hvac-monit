/**
 * StatusBadge - Badge para exibir status do membro
 * FASE 5 - Team Management
 */

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'suspended';
  className?: string;
}

const STATUS_CONFIG = {
  active: {
    label: 'Ativo',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    dotColor: 'bg-green-500',
  },
  inactive: {
    label: 'Inativo',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    dotColor: 'bg-gray-500',
  },
  suspended: {
    label: 'Suspenso',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
  },
} as const;

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
