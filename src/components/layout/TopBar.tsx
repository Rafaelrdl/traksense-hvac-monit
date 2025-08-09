import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/app';
import { Bell, ExternalLink, Clock, Building } from 'lucide-react';

export const TopBar: React.FC = () => {
  const alerts = useAppStore(state => state.alerts);
  const lastUpdateTime = useAppStore(state => state.lastUpdateTime);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const activeAlerts = alerts.filter(alert => !alert.resolved && !alert.acknowledged);

  return (
    <div className="h-16 bg-primary text-primary-foreground px-6 flex items-center justify-between border-b">
      {/* Logo and Brand */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">TrakSense</h1>
        </div>
        
        {/* Tenant/Site Selector */}
        <div className="hidden md:flex items-center space-x-2 text-sm opacity-90">
          <span>|</span>
          <select className="bg-transparent border-none text-primary-foreground focus:outline-none">
            <option value="hospital-central">Hospital Central</option>
            <option value="datacenter-01">Datacenter 01</option>
            <option value="shopping-plaza">Shopping Plaza</option>
          </select>
        </div>
      </div>

      {/* Center Info */}
      <div className="hidden lg:flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 opacity-75" />
          <span>
            {currentTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
        
        {lastUpdateTime && (
          <div className="text-xs opacity-75">
            Última atualização: {lastUpdateTime.toLocaleTimeString('pt-BR')}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        {/* Alert Bell */}
        <div className="relative">
          <Bell className="w-5 h-5 opacity-90" />
          {activeAlerts.length > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-destructive-foreground">
                {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
              </span>
            </div>
          )}
        </div>

        {/* TrakNor Integration Button */}
        <a 
          href="#" 
          className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors text-sm"
          title="Abrir no TrakNor"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="hidden sm:inline">TrakNor</span>
        </a>
      </div>
    </div>
  );
};