/**
 * RoleBadge - Badge para exibir role do usuário
 * FASE 5 - Team Management
 */

import { Crown, Key, Wrench, Eye } from 'lucide-react';

interface RoleBadgeProps {
  role: 'owner' | 'admin' | 'operator' | 'viewer';
  className?: string;
}

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    icon: Crown,
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300',
  },
  admin: {
    label: 'Admin',
    icon: Key,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  operator: {
    label: 'Operator',
    icon: Wrench,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
  viewer: {
    label: 'Viewer',
    icon: Eye,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
} as const;

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
