export type SensorStatus = "online" | "offline";

export interface EnhancedSensor {
  id: string;
  name: string;
  tag: string;
  status: SensorStatus;
  equipmentId: string;
  equipmentName: string;
  type: string;
  unit: string;
  lastReading?: {
    value: number;
    timestamp: Date;
  } | null;
  availability: number;
  lastSeenAt?: number;
}

export interface SensorsPagination {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export type SensorStatusFilter = "all" | "online" | "offline";

export interface SensorsState {
  items: EnhancedSensor[];
  filter: {
    status: SensorStatusFilter;
    page: number;
    size: number;
  };
  setFilter: (filter: Partial<SensorsState['filter']>) => void;
  getFilteredSensors: () => EnhancedSensor[];
  getPaginatedSensors: () => {
    sensors: EnhancedSensor[];
    pagination: SensorsPagination;
  };
}