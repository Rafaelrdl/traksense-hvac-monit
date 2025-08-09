import React from 'react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeLabel?: string;
  status?: 'good' | 'warning' | 'critical';
  icon?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  unit,
  change,
  changeLabel,
  status = 'good',
  icon
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getChangeColor = () => {
    if (change === undefined) return '';
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
  };

  return (
    <div className="bg-card rounded-xl p-6 border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
        {icon && (
          <div className={`p-2 rounded-lg ${getStatusColor()}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline space-x-2 mb-2">
        <span className="text-2xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
      
      {change !== undefined && (
        <div className={`text-xs ${getChangeColor()} flex items-center space-x-1`}>
          <span>{change > 0 ? '+' : ''}{change}%</span>
          {changeLabel && (
            <>
              <span>•</span>
              <span>{changeLabel}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};