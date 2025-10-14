import React, { useEffect } from 'react';
import { useAppStore } from '../../store/app';
import { useSensorsStore } from '../../store/sensors';
import { useSensorsURLParams } from '../../hooks/useSensorsURLParams';
import { SensorsHeaderControls } from '../../modules/sensors/SensorsHeaderControls';
import { SensorsGrid } from '../../modules/sensors/SensorsGrid';

export const SensorsPage: React.FC = () => {
  const { setSelectedAsset } = useAppStore();
  const { setFilter, getPaginatedSensors, initializeFromAppStore } = useSensorsStore();
  const { params } = useSensorsURLParams();

  // Initialize sensors from app store when component mounts
  useEffect(() => {
    initializeFromAppStore();
  }, [initializeFromAppStore]);

  // Sync URL params with store when URL changes
  useEffect(() => {
    setFilter(params);
  }, [params, setFilter]);

  // Get paginated sensors and pagination info
  const { sensors: pageItems, pagination } = getPaginatedSensors();

  // Handle navigation to equipment details
  const handleNavigateToEquipment = (equipmentId: string) => {
    setSelectedAsset(equipmentId);
    
    // Dispatch custom event to trigger navigation in App.tsx
    window.dispatchEvent(new CustomEvent('navigate-to-page', { 
      detail: { page: 'assets' } 
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sensores & Telemetria</h1>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da rede de sensores IoT
          </p>
        </div>
      </div>

      {/* Header Controls with Filters and Pagination */}
      <SensorsHeaderControls 
        onNavigateToEquipment={handleNavigateToEquipment}
      />

      {/* Sensors Grid/Table */}
      <SensorsGrid 
        sensors={pageItems} 
        onNavigateToEquipment={handleNavigateToEquipment}
      />
    </div>
  );
};