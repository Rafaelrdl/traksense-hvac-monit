/**
 * Utility functions for generating routes in the application
 */

export const getEquipmentPath = (equipmentId: string): string => {
  return `/assets/${equipmentId}`;
};

export const getSensorPath = (sensorId: string): string => {
  return `/sensors/${sensorId}`;
};

export const getAssetDetailPath = (assetId: string): string => {
  return `/assets/${assetId}`;
};

/**
 * Navigate to equipment details by setting the app state
 * This works with the app's internal routing system
 */
export const navigateToEquipment = (equipmentId: string, setCurrentPage: (page: string) => void, setSelectedAsset: (assetId: string | null) => void) => {
  setSelectedAsset(equipmentId);
  setCurrentPage('assets');
};