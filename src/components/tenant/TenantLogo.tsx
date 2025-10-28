/**
 * Tenant Logo Component
 * 
 * Exibe o logo do tenant atual.
 * Fallback para logo padrão se tenant não tiver logo customizado.
 */

import React from 'react';
import { useTenantBranding } from '@/hooks/useTenantBranding';

interface TenantLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export const TenantLogo: React.FC<TenantLogoProps> = ({ 
  className = '', 
  size = 'md',
  showName = false 
}) => {
  const branding = useTenantBranding();
  
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {branding.logo ? (
        <img 
          src={branding.logo} 
          alt={branding.name}
          className={sizeClasses[size]}
        />
      ) : (
        <div 
          className={`${sizeClasses[size]} rounded-lg flex items-center justify-center text-white font-bold`}
          style={{ backgroundColor: branding.primaryColor }}
        >
          {branding.shortName?.[0] || 'T'}
        </div>
      )}
      
      {showName && (
        <span className={`font-semibold ${textSizeClasses[size]}`}>
          {branding.shortName || branding.name}
        </span>
      )}
    </div>
  );
};
