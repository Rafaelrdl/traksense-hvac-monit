import { HVACAsset, Sensor, TelemetryPoint, Alert, SimulationScenario, SensorReading } from '../types/hvac';

export class SimulationEngine {
  private assets: HVACAsset[] = [];
  private sensors: Sensor[] = [];
  private telemetryData: Map<string, TelemetryPoint[]> = new Map();
  private alerts: Alert[] = [];
  private scenarios: SimulationScenario[] = [];
  private activeScenario: SimulationScenario | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeAssets();
    this.initializeSensors();
    this.initializeScenarios();
    this.generateHistoricalData();
  }

  private initializeAssets() {
    this.assets = [
      {
        id: 'ahu-001',
        tag: 'AHU-001',
        type: 'AHU',
        location: 'North Wing - Level 2',
        healthScore: 87,
        powerConsumption: 245,
        status: 'OK',
        operatingHours: 12450,
        lastMaintenance: new Date('2024-01-15'),
        specifications: { capacity: 50, voltage: 480, maxCurrent: 125 }
      },
      {
        id: 'chill-001',
        tag: 'CHILL-001',
        type: 'Chiller',
        location: 'Mechanical Room A',
        healthScore: 72,
        powerConsumption: 1850,
        status: 'Alert',
        operatingHours: 8765,
        lastMaintenance: new Date('2023-11-20'),
        specifications: { capacity: 500, voltage: 4160, refrigerant: 'R-134a' }
      },
      {
        id: 'vrf-003',
        tag: 'VRF-003',
        type: 'VRF',
        location: 'South Wing - Offices',
        healthScore: 94,
        powerConsumption: 180,
        status: 'OK',
        operatingHours: 5230,
        lastMaintenance: new Date('2024-02-10'),
        specifications: { capacity: 25, voltage: 208, refrigerant: 'R-410A' }
      }
    ];
  }

  private initializeSensors() {
    const sensorConfigs = [
      { type: 'temp_supply', unit: '°C', min: 10, max: 30, setpoint: 16 },
      { type: 'temp_return', unit: '°C', min: 15, max: 35 },
      { type: 'temp_setpoint', unit: '°C', min: 12, max: 28 },
      { type: 'humidity', unit: '%', min: 30, max: 70 },
      { type: 'dp_filter', unit: 'Pa', min: 0, max: 400 },
      { type: 'pressure_suction', unit: 'kPa', min: 200, max: 600 },
      { type: 'pressure_discharge', unit: 'kPa', min: 800, max: 2000 },
      { type: 'power_kw', unit: 'kW', min: 0, max: 500 },
      { type: 'current', unit: 'A', min: 0, max: 200 },
      { type: 'vibration', unit: 'mm/s', min: 0, max: 10 },
      { type: 'airflow', unit: 'm³/h', min: 0, max: 50000 }
    ];

    this.sensors = [];
    this.assets.forEach(asset => {
      sensorConfigs.forEach((config, index) => {
        this.sensors.push({
          id: `${asset.id}-${config.type}`,
          tag: `${asset.tag}_${config.type.toUpperCase()}`,
          assetId: asset.id,
          type: config.type as any,
          unit: config.unit,
          location: asset.location,
          online: Math.random() > 0.02, // 2% chance offline
          lastReading: null,
          availability: 95 + Math.random() * 5,
          min: config.min,
          max: config.max,
          setpoint: config.setpoint
        });
      });
    });
  }

  private initializeScenarios() {
    this.scenarios = [
      {
        id: 'normal',
        name: 'Normal Operation',
        description: 'Standard operating conditions',
        active: true,
        parameters: {}
      },
      {
        id: 'extreme-heat',
        name: 'Extreme Heat',
        description: 'High external temperature stress test',
        active: false,
        parameters: { externalTemp: 10 }
      },
      {
        id: 'clogged-filter',
        name: 'Clogged Filter',
        description: 'Filter requiring maintenance',
        active: false,
        parameters: { filterClogging: 0.8 }
      },
      {
        id: 'refrigerant-leak',
        name: 'Refrigerant Leak',
        description: 'Low refrigerant affecting performance',
        active: false,
        parameters: { refrigerantLeak: true, compressorEfficiency: 0.7 }
      },
      {
        id: 'fan-failure',
        name: 'Fan Failure',
        description: 'Ventilation system malfunction',
        active: false,
        parameters: { fanFailure: true }
      }
    ];
    this.activeScenario = this.scenarios[0];
  }

  private generateHistoricalData() {
    const historyDays = 30;
    const pointsPerHour = 12; // every 5 minutes
    const now = new Date();
    
    this.sensors.forEach(sensor => {
      const data: TelemetryPoint[] = [];
      
      for (let day = historyDays; day >= 0; day--) {
        for (let hour = 0; hour < 24; hour++) {
          for (let point = 0; point < pointsPerHour; point++) {
            const timestamp = new Date(now);
            timestamp.setDate(timestamp.getDate() - day);
            timestamp.setHours(hour, point * 5, 0, 0);
            
            const value = this.generateSensorValue(sensor, timestamp);
            data.push({
              sensorId: sensor.id,
              timestamp,
              value,
              quality: Math.random() > 0.05 ? 'good' : 'uncertain'
            });
          }
        }
      }
      
      this.telemetryData.set(sensor.id, data);
      
      // Update last reading
      const lastData = data[data.length - 1];
      if (lastData) {
        sensor.lastReading = {
          timestamp: lastData.timestamp,
          value: lastData.value,
          quality: lastData.quality
        };
      }
    });
  }

  private generateSensorValue(sensor: Sensor, timestamp: Date): number {
    const hour = timestamp.getHours();
    const dayOfYear = Math.floor((timestamp.getTime() - new Date(timestamp.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Base values and patterns
    let baseValue = 0;
    let dailyCycle = 0;
    let seasonalCycle = 0;
    let noise = (Math.random() - 0.5) * 2;
    
    switch (sensor.type) {
      case 'temp_supply':
        baseValue = sensor.setpoint || 16;
        dailyCycle = Math.sin((hour - 6) / 24 * 2 * Math.PI) * 2;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * 3;
        break;
        
      case 'temp_return':
        baseValue = 24;
        dailyCycle = Math.sin((hour - 8) / 24 * 2 * Math.PI) * 4;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * 4;
        break;
        
      case 'humidity':
        baseValue = 55;
        dailyCycle = Math.sin((hour - 4) / 24 * 2 * Math.PI) * 10;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI + Math.PI) * 15;
        break;
        
      case 'dp_filter':
        const daysSinceStart = Math.floor(dayOfYear / 30) * 30;
        baseValue = 50 + (dayOfYear - daysSinceStart) * 5; // Increases over time
        noise *= 10;
        break;
        
      case 'power_kw':
        const asset = this.assets.find(a => a.id === sensor.assetId);
        baseValue = asset?.type === 'Chiller' ? 200 : asset?.type === 'AHU' ? 45 : 25;
        dailyCycle = Math.sin((hour - 12) / 24 * 2 * Math.PI) * baseValue * 0.3;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * baseValue * 0.2;
        break;
        
      case 'vibration':
        baseValue = 2.5;
        noise *= 0.5;
        break;
        
      case 'airflow':
        baseValue = 25000;
        dailyCycle = Math.sin((hour - 12) / 24 * 2 * Math.PI) * 5000;
        break;
        
      default:
        baseValue = (sensor.min || 0) + ((sensor.max || 100) - (sensor.min || 0)) * 0.5;
    }
    
    // Apply scenario effects
    if (this.activeScenario && this.activeScenario.parameters) {
      const params = this.activeScenario.parameters;
      
      if (params.externalTemp && sensor.type.includes('temp')) {
        baseValue += params.externalTemp * 0.3;
      }
      
      if (params.filterClogging && sensor.type === 'dp_filter') {
        baseValue *= (1 + params.filterClogging);
      }
      
      if (params.fanFailure && sensor.type === 'airflow') {
        baseValue *= 0.3;
      }
      
      if (params.compressorEfficiency && sensor.type === 'power_kw') {
        baseValue /= params.compressorEfficiency;
      }
    }
    
    const finalValue = baseValue + dailyCycle + seasonalCycle + noise;
    
    // Clamp to sensor limits
    return Math.max(sensor.min || -Infinity, Math.min(sensor.max || Infinity, finalValue));
  }

  startRealTimeSimulation(intervalMs: number = 3000) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      const now = new Date();
      
      this.sensors.forEach(sensor => {
        if (!sensor.online) return;
        
        const value = this.generateSensorValue(sensor, now);
        const point: TelemetryPoint = {
          sensorId: sensor.id,
          timestamp: now,
          value,
          quality: Math.random() > 0.02 ? 'good' : 'uncertain'
        };
        
        // Add to telemetry data
        const sensorData = this.telemetryData.get(sensor.id) || [];
        sensorData.push(point);
        
        // Keep only last 24 hours for real-time data
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const filteredData = sensorData.filter(p => p.timestamp > cutoff);
        this.telemetryData.set(sensor.id, filteredData);
        
        // Update last reading
        sensor.lastReading = {
          timestamp: point.timestamp,
          value: point.value,
          quality: point.quality
        };
      });
      
      // Update asset health scores
      this.updateAssetHealth();
      
      // Generate alerts based on current values
      this.checkAlertRules();
      
    }, intervalMs);
  }
  
  private updateAssetHealth() {
    this.assets.forEach(asset => {
      const assetSensors = this.sensors.filter(s => s.assetId === asset.id);
      let healthScore = 100;
      
      assetSensors.forEach(sensor => {
        if (!sensor.lastReading) return;
        
        const value = sensor.lastReading.value;
        let penalty = 0;
        
        switch (sensor.type) {
          case 'dp_filter':
            if (value > 250) penalty = Math.min(20, (value - 250) / 10);
            break;
          case 'vibration':
            if (value > 5) penalty = Math.min(15, (value - 5) * 2);
            break;
          case 'temp_supply':
            if (sensor.setpoint) {
              const deviation = Math.abs(value - sensor.setpoint);
              if (deviation > 3) penalty = Math.min(10, deviation);
            }
            break;
        }
        
        healthScore -= penalty;
      });
      
      asset.healthScore = Math.max(0, Math.min(100, healthScore));
      
      // Update status based on health
      if (asset.healthScore < 60) asset.status = 'Alert';
      else if (asset.healthScore < 80) asset.status = 'Maintenance';
      else asset.status = 'OK';
    });
  }
  
  private checkAlertRules() {
    // Simple rule checking - in a real system this would be more sophisticated
    this.sensors.forEach(sensor => {
      if (!sensor.lastReading) return;
      
      const value = sensor.lastReading.value;
      const asset = this.assets.find(a => a.id === sensor.assetId);
      if (!asset) return;
      
      let shouldAlert = false;
      let severity: Alert['severity'] = 'Low';
      let message = '';
      
      switch (sensor.type) {
        case 'dp_filter':
          if (value > 300) {
            shouldAlert = true;
            severity = 'High';
            message = `Filter pressure drop critically high: ${value.toFixed(1)} Pa`;
          } else if (value > 250) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Filter pressure drop elevated: ${value.toFixed(1)} Pa`;
          }
          break;
          
        case 'temp_supply':
          if (sensor.setpoint && Math.abs(value - sensor.setpoint) > 5) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Supply temperature deviation: ${value.toFixed(1)}°C (setpoint: ${sensor.setpoint}°C)`;
          }
          break;
          
        case 'vibration':
          if (value > 7) {
            shouldAlert = true;
            severity = 'High';
            message = `Excessive vibration detected: ${value.toFixed(2)} mm/s`;
          }
          break;
      }
      
      if (shouldAlert) {
        // Check if alert already exists
        const existingAlert = this.alerts.find(a => 
          a.assetId === asset.id && 
          a.type === sensor.type && 
          !a.resolved
        );
        
        if (!existingAlert) {
          this.alerts.push({
            id: `alert-${Date.now()}-${Math.random()}`,
            assetId: asset.id,
            assetTag: asset.tag,
            severity,
            type: sensor.type,
            message,
            timestamp: new Date(),
            acknowledged: false,
            resolved: false,
            ruleName: `${sensor.type}_threshold`
          });
        }
      }
    });
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  setScenario(scenarioId: string) {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      this.scenarios.forEach(s => s.active = false);
      scenario.active = true;
      this.activeScenario = scenario;
    }
  }
  
  // Public getters
  getAssets() { return this.assets; }
  getSensors() { return this.sensors; }
  getAlerts() { return this.alerts.slice().reverse(); } // Most recent first
  getScenarios() { return this.scenarios; }
  
  getTelemetryData(sensorId: string, timeRange?: { start: Date; end: Date }) {
    try {
      const data = this.telemetryData.get(sensorId) || [];
      
      if (!timeRange) return data;
      
      return data.filter(point => 
        point && 
        point.timestamp && 
        (point.timestamp instanceof Date || !isNaN(Date.parse(point.timestamp))) &&
        new Date(point.timestamp) >= timeRange.start && 
        new Date(point.timestamp) <= timeRange.end
      );
    } catch (error) {
      console.error(`Error getting telemetry data for sensor ${sensorId}:`, error);
      return [];
    }
  }
  
  getAssetTelemetry(assetId: string, sensorTypes?: string[], timeRange?: { start: Date; end: Date }) {
    try {
      const assetSensors = this.sensors.filter(s => 
        s.assetId === assetId && 
        (!sensorTypes || sensorTypes.includes(s.type))
      );
      
      const result: { [sensorType: string]: TelemetryPoint[] } = {};
      
      assetSensors.forEach(sensor => {
        result[sensor.type] = this.getTelemetryData(sensor.id, timeRange);
      });
      
      return result;
    } catch (error) {
      console.error(`Error getting asset telemetry for ${assetId}:`, error);
      return {};
    }
  }
}

// Global simulation instance
export const simEngine = new SimulationEngine();