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
    this.generateInitialAlerts();
  }

  private initializeAssets() {
    this.assets = [
      {
        id: 'ahu-001',
        tag: 'AHU-001',
        type: 'AHU',
        location: 'North Wing - Level 2',
        healthScore: 87,
        powerConsumption: 47.5,
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
        powerConsumption: 285.7,
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
        powerConsumption: 18.2,
        status: 'OK',
        operatingHours: 5230,
        lastMaintenance: new Date('2024-02-10'),
        specifications: { capacity: 25, voltage: 208, refrigerant: 'R-410A' }
      },
      {
        id: 'ahu-002',
        tag: 'AHU-002',
        type: 'AHU',
        location: 'South Wing - Level 1',
        healthScore: 91,
        powerConsumption: 42.8,
        status: 'OK',
        operatingHours: 9876,
        lastMaintenance: new Date('2024-02-28'),
        specifications: { capacity: 45, voltage: 480, maxCurrent: 110 }
      },
      {
        id: 'chill-002',
        tag: 'CHILL-002',
        type: 'Chiller',
        location: 'Mechanical Room B',
        healthScore: 65,
        powerConsumption: 312.4,
        status: 'Maintenance',
        operatingHours: 15432,
        lastMaintenance: new Date('2023-09-15'),
        specifications: { capacity: 600, voltage: 4160, refrigerant: 'R-134a' }
      },
      {
        id: 'vrf-001',
        tag: 'VRF-001',
        type: 'VRF',
        location: 'East Wing - Conference Rooms',
        healthScore: 89,
        powerConsumption: 22.1,
        status: 'OK',
        operatingHours: 7654,
        lastMaintenance: new Date('2024-01-22'),
        specifications: { capacity: 30, voltage: 208, refrigerant: 'R-410A' }
      },
      {
        id: 'vrf-002',
        tag: 'VRF-002',
        type: 'VRF',
        location: 'West Wing - Executive Offices',
        healthScore: 76,
        powerConsumption: 19.8,
        status: 'Alert',
        operatingHours: 11234,
        lastMaintenance: new Date('2023-12-05'),
        specifications: { capacity: 28, voltage: 208, refrigerant: 'R-410A' }
      },
      {
        id: 'ahu-003',
        tag: 'AHU-003',
        type: 'AHU',
        location: 'Data Center - Level 3',
        healthScore: 83,
        powerConsumption: 78.9,
        status: 'OK',
        operatingHours: 21876,
        lastMaintenance: new Date('2024-03-01'),
        specifications: { capacity: 80, voltage: 480, maxCurrent: 200 }
      }
    ];
  }

  private initializeSensors() {
    this.sensors = [];
    this.assets.forEach(asset => {
      // Different sensor configs based on asset type
      let sensorConfigs: any[] = [];
      
      if (asset.type === 'AHU') {
        sensorConfigs = [
          { type: 'temp_supply', unit: '°C', min: 12, max: 20, setpoint: 16, baseline: 16 },
          { type: 'temp_return', unit: '°C', min: 22, max: 28, baseline: 24 },
          { type: 'temp_setpoint', unit: '°C', min: 14, max: 18, baseline: 16 },
          { type: 'humidity', unit: '%', min: 45, max: 65, baseline: 55 },
          { type: 'dp_filter', unit: 'Pa', min: 50, max: 350, baseline: 120 },
          { type: 'power_kw', unit: 'kW', min: 25, max: 85, baseline: asset.type === 'AHU' ? 50 : 45 },
          { type: 'current', unit: 'A', min: 60, max: 180, baseline: 95 },
          { type: 'vibration', unit: 'mm/s', min: 1.2, max: 8, baseline: 2.5 },
          { type: 'airflow', unit: 'm³/h', min: 15000, max: 35000, baseline: 25000 },
          { type: 'voltage', unit: 'V', min: 460, max: 500, baseline: 480 },
          { type: 'rpm_fan', unit: 'RPM', min: 800, max: 1200, baseline: 1000 }
        ];
      } else if (asset.type === 'Chiller') {
        sensorConfigs = [
          { type: 'temp_supply', unit: '°C', min: 6, max: 12, setpoint: 7, baseline: 7.2 },
          { type: 'temp_return', unit: '°C', min: 12, max: 18, baseline: 14.5 },
          { type: 'pressure_suction', unit: 'kPa', min: 350, max: 550, baseline: 450 },
          { type: 'pressure_discharge', unit: 'kPa', min: 1200, max: 1800, baseline: 1500 },
          { type: 'power_kw', unit: 'kW', min: 180, max: 400, baseline: 290 },
          { type: 'current', unit: 'A', min: 220, max: 480, baseline: 350 },
          { type: 'vibration', unit: 'mm/s', min: 1.8, max: 12, baseline: 3.2 },
          { type: 'superheat', unit: 'K', min: 3, max: 12, baseline: 6.5 },
          { type: 'subcooling', unit: 'K', min: 2, max: 8, baseline: 4.5 },
          { type: 'voltage', unit: 'V', min: 4100, max: 4220, baseline: 4160 },
          { type: 'cop', unit: '', min: 2.8, max: 5.2, baseline: 4.1 }
        ];
      } else if (asset.type === 'VRF') {
        sensorConfigs = [
          { type: 'temp_supply', unit: '°C', min: 14, max: 22, setpoint: 18, baseline: 18 },
          { type: 'temp_return', unit: '°C', min: 20, max: 26, baseline: 23 },
          { type: 'humidity', unit: '%', min: 40, max: 60, baseline: 50 },
          { type: 'power_kw', unit: 'kW', min: 8, max: 35, baseline: 20 },
          { type: 'current', unit: 'A', min: 25, max: 90, baseline: 55 },
          { type: 'vibration', unit: 'mm/s', min: 0.8, max: 6, baseline: 1.8 },
          { type: 'superheat', unit: 'K', min: 4, max: 10, baseline: 7 },
          { type: 'subcooling', unit: 'K', min: 3, max: 7, baseline: 5 },
          { type: 'voltage', unit: 'V', min: 200, max: 216, baseline: 208 },
          { type: 'eer', unit: '', min: 8.5, max: 12.5, baseline: 10.2 }
        ];
      }

      sensorConfigs.forEach(config => {
        this.sensors.push({
          id: `${asset.id}-${config.type}`,
          tag: `${asset.tag}_${config.type.toUpperCase()}`,
          assetId: asset.id,
          type: config.type as any,
          unit: config.unit,
          location: asset.location,
          online: Math.random() > 0.015, // 1.5% chance offline
          lastReading: null,
          availability: 96 + Math.random() * 3.5,
          min: config.min,
          max: config.max,
          setpoint: config.setpoint,
          baseline: config.baseline
        });
      });
    });
  }

  private initializeScenarios() {
    this.scenarios = [
      {
        id: 'normal',
        name: 'Normal Operation',
        description: 'Standard operating conditions with typical load variations',
        active: true,
        parameters: {}
      },
      {
        id: 'extreme-heat',
        name: 'Heat Wave',
        description: 'High external temperature causing increased system load',
        active: false,
        parameters: { 
          externalTemp: 8,
          loadIncrease: 1.25,
          efficiencyDecrease: 0.9
        }
      },
      {
        id: 'clogged-filter',
        name: 'Filter Degradation',
        description: 'Progressive filter clogging affecting system performance',
        active: false,
        parameters: { 
          filterClogging: 0.7,
          airflowReduction: 0.85,
          powerIncrease: 1.15
        }
      },
      {
        id: 'refrigerant-leak',
        name: 'Refrigerant Leak',
        description: 'Minor refrigerant leak affecting cooling efficiency',
        active: false,
        parameters: { 
          refrigerantLeak: true, 
          compressorEfficiency: 0.75,
          superheatIncrease: 1.5,
          subcoolingDecrease: 0.6
        }
      },
      {
        id: 'fan-bearing-wear',
        name: 'Fan Bearing Wear',
        description: 'Degraded fan bearing causing vibration and performance issues',
        active: false,
        parameters: { 
          bearingWear: true,
          vibrationIncrease: 2.2,
          airflowDecrease: 0.92,
          noiseIncrease: 1.3
        }
      },
      {
        id: 'power-quality',
        name: 'Power Quality Issues',
        description: 'Voltage fluctuations affecting system efficiency',
        active: false,
        parameters: { 
          voltageFluctuation: true,
          efficiencyDecrease: 0.93,
          currentIncrease: 1.08
        }
      },
      {
        id: 'maintenance-due',
        name: 'Maintenance Overdue',
        description: 'Multiple systems requiring maintenance attention',
        active: false,
        parameters: {
          maintenanceOverdue: true,
          generalDegradation: 0.95,
          alertFrequencyIncrease: 1.4
        }
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
      
      // Add some randomness to sensor behavior over time
      let trendMultiplier = 1;
      let driftAccumulation = 0;
      
      for (let day = historyDays; day >= 0; day--) {
        // Add weekly and daily patterns
        const isWeekend = (now.getDate() - day) % 7 >= 5;
        const dailyLoadMultiplier = isWeekend ? 0.7 : 1.0;
        
        // Add long-term degradation trends for certain sensors
        if (sensor.type === 'dp_filter') {
          trendMultiplier = 1 + (historyDays - day) * 0.008; // Filter gets worse over time
        } else if (sensor.type === 'vibration') {
          trendMultiplier = 1 + (historyDays - day) * 0.002; // Slight increase in vibration over time
        }
        
        for (let hour = 0; hour < 24; hour++) {
          const hourlyLoadMultiplier = (hour >= 6 && hour <= 22) ? 1.0 : 0.6;
          const finalLoadMultiplier = dailyLoadMultiplier * hourlyLoadMultiplier;
          
          for (let point = 0; point < pointsPerHour; point++) {
            const timestamp = new Date(now);
            timestamp.setDate(timestamp.getDate() - day);
            timestamp.setHours(hour, point * 5, 0, 0);
            
            let value = this.generateSensorValue(sensor, timestamp);
            
            // Apply load multiplier for operational sensors
            if (['power_kw', 'current', 'airflow', 'rpm_fan'].includes(sensor.type)) {
              value *= finalLoadMultiplier;
            }
            
            // Apply trend multiplier
            value *= trendMultiplier;
            
            // Add some drift for realistic behavior
            driftAccumulation += (Math.random() - 0.5) * 0.1;
            value += driftAccumulation;
            
            // Add occasional spikes or dips for interesting data
            if (Math.random() < 0.001) { // 0.1% chance of anomaly
              const spikeMultiplier = 1 + (Math.random() - 0.5) * 0.4; // ±20% spike
              value *= spikeMultiplier;
            }
            
            // Ensure value stays within sensor limits
            value = Math.max(sensor.min || -Infinity, Math.min(sensor.max || Infinity, value));
            
            const quality = Math.random() > 0.02 ? 'good' : (Math.random() > 0.7 ? 'uncertain' : 'bad');
            
            data.push({
              sensorId: sensor.id,
              timestamp,
              value,
              quality
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
    
    // Generate some historical alert patterns
    this.generateHistoricalAlerts();
  }
  
  private generateHistoricalAlerts() {
    const now = new Date();
    
    // Generate some resolved historical alerts
    const historicalAlertTemplates = [
      {
        assetId: 'ahu-001',
        assetTag: 'AHU-001',
        severity: 'Medium' as Alert['severity'],
        type: 'dp_filter',
        message: 'Filter maintenance completed - Pressure drop normalized: 89.2 Pa',
        ruleName: 'dp_filter_monitoring',
        resolved: true
      },
      {
        assetId: 'vrf-001',
        assetTag: 'VRF-001',
        severity: 'Low' as Alert['severity'],
        type: 'temp_supply',
        message: 'Temperature control restored - System rebalanced',
        ruleName: 'temp_supply_monitoring',
        resolved: true
      },
      {
        assetId: 'chill-002',
        assetTag: 'CHILL-002',
        severity: 'High' as Alert['severity'],
        type: 'refrigerant',
        message: 'Refrigerant leak detected and repaired - System recharged',
        ruleName: 'refrigerant_monitoring',
        resolved: true
      },
      {
        assetId: 'ahu-002',
        assetTag: 'AHU-002',
        severity: 'Medium' as Alert['severity'],
        type: 'vibration',
        message: 'Bearing replacement completed - Vibration normalized',
        ruleName: 'vibration_monitoring',
        resolved: true
      }
    ];
    
    historicalAlertTemplates.forEach((template, index) => {
      const alertTime = new Date(now.getTime() - (Math.random() * 14 * 24 * 60 * 60 * 1000)); // Random time in last 2 weeks
      const resolveTime = new Date(alertTime.getTime() + Math.random() * 48 * 60 * 60 * 1000); // Resolved within 48 hours
      
      this.alerts.push({
        id: `historical-alert-${index + 1}`,
        ...template,
        timestamp: alertTime,
        acknowledged: true,
        acknowledgedAt: new Date(alertTime.getTime() + Math.random() * 6 * 60 * 60 * 1000),
        resolvedAt: resolveTime
      });
    });
  }
  
  private generateInitialAlerts() {
    const now = new Date();
    
    // Generate some initial alerts based on current sensor readings
    const alertTemplates = [
      {
        assetId: 'chill-001',
        assetTag: 'CHILL-001',
        severity: 'Medium' as Alert['severity'],
        type: 'dp_filter',
        message: 'Filter maintenance required - Pressure drop elevated: 267.3 Pa (Warning: 250 Pa)',
        ruleName: 'dp_filter_monitoring',
        sensorValue: 267.3,
        sensorUnit: 'Pa'
      },
      {
        assetId: 'chill-002',
        assetTag: 'CHILL-002',
        severity: 'Medium' as Alert['severity'],
        type: 'maintenance',
        message: 'Scheduled maintenance overdue by 27 days',
        ruleName: 'maintenance_schedule'
      },
      {
        assetId: 'vrf-002',
        assetTag: 'VRF-002',
        severity: 'Low' as Alert['severity'],
        type: 'superheat',
        message: 'Superheat monitoring - Slightly elevated: 8.9 K (Normal: 4-8 K)',
        ruleName: 'superheat_monitoring',
        sensorValue: 8.9,
        sensorUnit: 'K'
      },
      {
        assetId: 'ahu-003',
        assetTag: 'AHU-003',
        severity: 'Low' as Alert['severity'],
        type: 'vibration',
        message: 'Vibration monitoring - Trend increasing: 3.8 mm/s RMS',
        ruleName: 'vibration_monitoring',
        sensorValue: 3.8,
        sensorUnit: 'mm/s'
      },
      {
        assetId: 'ahu-001',
        assetTag: 'AHU-001',
        severity: 'Low' as Alert['severity'],
        type: 'maintenance_reminder',
        message: 'Maintenance due in 18 days',
        ruleName: 'maintenance_reminder'
      },
      {
        assetId: 'chill-001',
        assetTag: 'CHILL-001',
        severity: 'Medium' as Alert['severity'],
        type: 'superheat',
        message: 'Superheat abnormal - Check refrigerant charge: 11.2 K (Normal: 4-8 K)',
        ruleName: 'superheat_monitoring',
        sensorValue: 11.2,
        sensorUnit: 'K'
      },
      {
        assetId: 'vrf-001',
        assetTag: 'VRF-001',
        severity: 'Low' as Alert['severity'],
        type: 'power_kw',
        message: 'High power consumption detected: 28.7 kW (22% above baseline)',
        ruleName: 'power_monitoring',
        sensorValue: 28.7,
        sensorUnit: 'kW'
      },
      {
        assetId: 'ahu-002',
        assetTag: 'AHU-002',
        severity: 'Low' as Alert['severity'],
        type: 'temp_supply',
        message: 'Supply temperature deviation: 18.4°C (Setpoint: 16.0°C, Deviation: 2.4°C)',
        ruleName: 'temp_supply_monitoring',
        sensorValue: 18.4,
        sensorUnit: '°C'
      },
      {
        assetId: 'chill-002',
        assetTag: 'CHILL-002',
        severity: 'Medium' as Alert['severity'],
        type: 'vibration',
        message: 'Elevated vibration detected - Schedule maintenance: 5.1 mm/s RMS (Warning: 4.5 mm/s)',
        ruleName: 'vibration_monitoring',
        sensorValue: 5.1,
        sensorUnit: 'mm/s'
      },
      {
        assetId: 'vrf-003',
        assetTag: 'VRF-003',
        severity: 'Low' as Alert['severity'],
        type: 'humidity',
        message: 'High humidity level: 67.2% RH (Comfort limit: 60%)',
        ruleName: 'humidity_monitoring',
        sensorValue: 67.2,
        sensorUnit: '%'
      }
    ];
    
    alertTemplates.forEach((template, index) => {
      const alertTime = new Date(now.getTime() - (Math.random() * 72 * 60 * 60 * 1000)); // Random time in last 72 hours
      
      this.alerts.push({
        id: `initial-alert-${index + 1}`,
        ...template,
        timestamp: alertTime,
        acknowledged: Math.random() > 0.4, // 60% acknowledged
        acknowledgedAt: Math.random() > 0.4 ? new Date(alertTime.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
        resolved: Math.random() > 0.8 // 20% resolved
      });
    });
  }

  private generateSensorValue(sensor: Sensor, timestamp: Date): number {
    const hour = timestamp.getHours();
    const dayOfYear = Math.floor((timestamp.getTime() - new Date(timestamp.getFullYear(), 0, 0).getTime()) / 86400000);
    const asset = this.assets.find(a => a.id === sensor.assetId);
    
    // Use baseline value from sensor config
    let baseValue = (sensor as any).baseline || ((sensor.min || 0) + (sensor.max || 100)) * 0.5;
    let dailyCycle = 0;
    let seasonalCycle = 0;
    let operationalVariance = 0;
    let noise = (Math.random() - 0.5) * 2;
    
    // Common patterns for all HVAC systems
    const isBusinessHours = hour >= 6 && hour <= 22;
    const loadFactor = isBusinessHours ? 1.0 : 0.6; // Lower load at night
    
    switch (sensor.type) {
      case 'temp_supply':
        // Temperature varies based on load and external conditions
        dailyCycle = Math.sin((hour - 14) / 24 * 2 * Math.PI) * 1.2;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * 2;
        operationalVariance = isBusinessHours ? 0.5 : -1.2;
        noise *= 0.3;
        break;
        
      case 'temp_return':
        // Return temperature follows supply but with delay and load influence
        baseValue += isBusinessHours ? 2.5 : -1;
        dailyCycle = Math.sin((hour - 16) / 24 * 2 * Math.PI) * 2.5;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * 3;
        noise *= 0.4;
        break;
        
      case 'humidity':
        // Humidity varies inversely with temperature and has weather patterns
        dailyCycle = Math.sin((hour - 6) / 24 * 2 * Math.PI) * -5;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI + Math.PI) * 8;
        operationalVariance = isBusinessHours ? -3 : 2;
        noise *= 2;
        break;
        
      case 'dp_filter':
        // Filter pressure increases over time and with usage
        const daysSinceLastMaintenance = asset ? 
          Math.floor((timestamp.getTime() - asset.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24)) : 30;
        baseValue += daysSinceLastMaintenance * 1.2;
        operationalVariance = isBusinessHours ? daysSinceLastMaintenance * 0.3 : 0;
        noise *= 5;
        break;
        
      case 'power_kw':
        // Power consumption varies significantly with load
        const basePower = asset?.type === 'Chiller' ? 290 : 
                         asset?.type === 'AHU' ? 50 : 20;
        baseValue = basePower * loadFactor;
        dailyCycle = Math.sin((hour - 14) / 24 * 2 * Math.PI) * basePower * 0.25;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * basePower * 0.15;
        noise *= basePower * 0.02;
        break;
        
      case 'current':
        // Current follows power consumption
        const powerSensor = this.sensors.find(s => s.assetId === sensor.assetId && s.type === 'power_kw');
        if (powerSensor && powerSensor.lastReading) {
          const powerValue = powerSensor.lastReading.value;
          const voltage = asset?.specifications.voltage || 480;
          baseValue = (powerValue * 1000) / (voltage * Math.sqrt(3) * 0.85); // 3-phase, 0.85 PF
        } else {
          baseValue *= loadFactor;
          dailyCycle = Math.sin((hour - 14) / 24 * 2 * Math.PI) * baseValue * 0.25;
        }
        noise *= baseValue * 0.015;
        break;
        
      case 'vibration':
        // Vibration increases with age and operational stress
        const operatingHours = asset?.operatingHours || 10000;
        const ageMultiplier = 1 + (operatingHours / 100000);
        baseValue *= ageMultiplier;
        operationalVariance = isBusinessHours ? 0.3 : -0.2;
        noise *= 0.2;
        break;
        
      case 'airflow':
        // Airflow varies with system demand
        baseValue *= loadFactor;
        dailyCycle = Math.sin((hour - 12) / 24 * 2 * Math.PI) * baseValue * 0.15;
        noise *= baseValue * 0.01;
        break;
        
      case 'pressure_suction':
      case 'pressure_discharge':
        // Pressures vary with system load and ambient conditions
        operationalVariance = isBusinessHours ? baseValue * 0.08 : baseValue * -0.05;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * baseValue * 0.1;
        noise *= baseValue * 0.01;
        break;
        
      case 'superheat':
      case 'subcooling':
        // Refrigeration parameters vary with load and ambient
        operationalVariance = isBusinessHours ? 0.5 : -0.3;
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * 1.2;
        noise *= 0.3;
        break;
        
      case 'voltage':
        // Voltage should be relatively stable with small variations
        noise *= 2;
        break;
        
      case 'rpm_fan':
        // Fan speed varies with demand
        baseValue *= loadFactor;
        dailyCycle = Math.sin((hour - 13) / 24 * 2 * Math.PI) * baseValue * 0.12;
        noise *= baseValue * 0.008;
        break;
        
      case 'cop':
      case 'eer':
        // Efficiency metrics vary with load and conditions
        operationalVariance = isBusinessHours ? -0.3 : 0.2; // Slightly lower efficiency at high load
        seasonalCycle = Math.sin(dayOfYear / 365 * 2 * Math.PI) * -0.5; // Lower in summer
        noise *= 0.15;
        break;
        
      default:
        // Generic sensor behavior
        dailyCycle = Math.sin((hour - 12) / 24 * 2 * Math.PI) * baseValue * 0.1;
        operationalVariance = isBusinessHours ? baseValue * 0.05 : baseValue * -0.03;
    }
    
    // Apply scenario effects
    if (this.activeScenario && this.activeScenario.parameters) {
      const params = this.activeScenario.parameters;
      
      // Heat wave scenario
      if (params.externalTemp) {
        if (sensor.type.includes('temp_supply') || sensor.type.includes('temp_return')) {
          baseValue += params.externalTemp * 0.12;
        }
        if (sensor.type === 'power_kw' && params.loadIncrease) {
          baseValue *= params.loadIncrease;
        }
        if ((sensor.type === 'cop' || sensor.type === 'eer') && params.efficiencyDecrease) {
          baseValue *= params.efficiencyDecrease;
        }
      }
      
      // Filter degradation scenario
      if (params.filterClogging) {
        if (sensor.type === 'dp_filter') {
          baseValue *= (1 + params.filterClogging * 2);
        }
        if (sensor.type === 'airflow' && params.airflowReduction) {
          baseValue *= params.airflowReduction;
        }
        if (sensor.type === 'power_kw' && params.powerIncrease) {
          baseValue *= params.powerIncrease;
        }
      }
      
      // Refrigerant leak scenario
      if (params.refrigerantLeak) {
        if (sensor.type === 'superheat' && params.superheatIncrease) {
          baseValue *= params.superheatIncrease;
        }
        if (sensor.type === 'subcooling' && params.subcoolingDecrease) {
          baseValue *= params.subcoolingDecrease;
        }
        if (sensor.type === 'power_kw') {
          baseValue *= 1.2; // Increased power due to inefficiency
        }
        if (sensor.type === 'cop' || sensor.type === 'eer') {
          baseValue *= (params.compressorEfficiency || 0.75);
        }
      }
      
      // Fan bearing wear scenario
      if (params.bearingWear) {
        if (sensor.type === 'vibration' && params.vibrationIncrease) {
          baseValue *= params.vibrationIncrease;
        }
        if (sensor.type === 'airflow' && params.airflowDecrease) {
          baseValue *= params.airflowDecrease;
        }
        if (sensor.type === 'noise' && params.noiseIncrease) {
          baseValue *= params.noiseIncrease;
        }
        if (sensor.type === 'rpm_fan') {
          baseValue *= 0.95; // Slight reduction in fan speed
        }
      }
      
      // Power quality issues scenario
      if (params.voltageFluctuation) {
        if (sensor.type === 'voltage') {
          baseValue += (Math.random() - 0.5) * 15; // ±15V fluctuation
        }
        if (sensor.type === 'current' && params.currentIncrease) {
          baseValue *= params.currentIncrease;
        }
        if ((sensor.type === 'cop' || sensor.type === 'eer') && params.efficiencyDecrease) {
          baseValue *= params.efficiencyDecrease;
        }
      }
      
      // Maintenance overdue scenario
      if (params.maintenanceOverdue && params.generalDegradation) {
        // General degradation across all parameters
        if (['power_kw', 'vibration', 'dp_filter'].includes(sensor.type)) {
          baseValue /= params.generalDegradation; // Increase these values (degradation)
        }
        if (['cop', 'eer', 'airflow'].includes(sensor.type)) {
          baseValue *= params.generalDegradation; // Decrease these values (degradation)
        }
      }
    }
    
    const finalValue = baseValue + dailyCycle + seasonalCycle + operationalVariance + noise;
    
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
      let totalPowerConsumption = 0;
      
      assetSensors.forEach(sensor => {
        if (!sensor.lastReading) return;
        
        const value = sensor.lastReading.value;
        let penalty = 0;
        
        // Update power consumption based on current power readings
        if (sensor.type === 'power_kw') {
          totalPowerConsumption = value; // Current kW consumption
        }
        
        switch (sensor.type) {
          case 'dp_filter':
            if (value > 300) penalty = Math.min(25, (value - 300) / 5);
            else if (value > 250) penalty = Math.min(15, (value - 250) / 10);
            else if (value > 200) penalty = Math.min(8, (value - 200) / 15);
            break;
            
          case 'vibration':
            if (value > 6.5) penalty = Math.min(20, (value - 6.5) * 3);
            else if (value > 4.5) penalty = Math.min(12, (value - 4.5) * 2);
            else if (value > 3.5) penalty = Math.min(6, (value - 3.5) * 1.5);
            break;
            
          case 'temp_supply':
            if (sensor.setpoint) {
              const deviation = Math.abs(value - sensor.setpoint);
              if (deviation > 4) penalty = Math.min(15, deviation * 2);
              else if (deviation > 2.5) penalty = Math.min(10, deviation * 1.5);
              else if (deviation > 1.5) penalty = Math.min(5, deviation);
            }
            break;
            
          case 'superheat':
            if (value > 10) penalty = Math.min(10, (value - 10));
            else if (value < 3) penalty = Math.min(15, (3 - value) * 2);
            break;
            
          case 'subcooling':
            if (value < 2) penalty = Math.min(10, (2 - value) * 2);
            else if (value > 8) penalty = Math.min(8, (value - 8));
            break;
            
          case 'current':
            if (asset.specifications.maxCurrent) {
              const utilization = value / asset.specifications.maxCurrent;
              if (utilization > 0.95) penalty = Math.min(12, (utilization - 0.95) * 100);
              else if (utilization > 0.85) penalty = Math.min(6, (utilization - 0.85) * 50);
            }
            break;
            
          case 'cop':
          case 'eer':
            const minEfficient = sensor.type === 'cop' ? 3.5 : 9.0;
            if (value < minEfficient) penalty = Math.min(8, (minEfficient - value) * 2);
            break;
        }
        
        // Additional penalty for offline sensors
        if (!sensor.online) penalty += 5;
        
        healthScore -= penalty;
      });
      
      // Update power consumption (convert from kW to daily kWh estimate)
      if (totalPowerConsumption > 0) {
        asset.powerConsumption = totalPowerConsumption;
      }
      
      // Additional health penalty based on maintenance schedule
      if (asset.lastMaintenance) {
        const daysSinceMaintenance = Math.floor((new Date().getTime() - asset.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24));
        const maintenanceInterval = asset.type === 'Chiller' ? 90 : 120;
        
        if (daysSinceMaintenance > maintenanceInterval) {
          healthScore -= Math.min(20, (daysSinceMaintenance - maintenanceInterval) * 0.5);
        } else if (daysSinceMaintenance > maintenanceInterval * 0.8) {
          healthScore -= Math.min(5, (daysSinceMaintenance - maintenanceInterval * 0.8) * 0.2);
        }
      }
      
      asset.healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));
      
      // Update status based on health and alerts
      const activeAlerts = this.alerts.filter(a => a.assetId === asset.id && !a.resolved);
      const criticalAlerts = activeAlerts.filter(a => a.severity === 'Critical' || a.severity === 'High');
      const mediumAlerts = activeAlerts.filter(a => a.severity === 'Medium');
      
      if (asset.healthScore < 50 || criticalAlerts.length > 0) {
        asset.status = 'Alert';
      } else if (asset.healthScore < 70 || mediumAlerts.length > 0) {
        asset.status = 'Maintenance';
      } else if (asset.healthScore < 85 && activeAlerts.length > 0) {
        asset.status = 'Maintenance';
      } else {
        asset.status = 'OK';
      }
    });
  }
  
  private checkAlertRules() {
    const now = new Date();
    
    // Check each sensor for alert conditions
    this.sensors.forEach(sensor => {
      if (!sensor.lastReading || !sensor.online) return;
      
      const value = sensor.lastReading.value;
      const asset = this.assets.find(a => a.id === sensor.assetId);
      if (!asset) return;
      
      let shouldAlert = false;
      let severity: Alert['severity'] = 'Low';
      let message = '';
      const sensorName = sensor.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      switch (sensor.type) {
        case 'dp_filter':
          if (value > 300) {
            shouldAlert = true;
            severity = 'High';
            message = `Filter replacement critical - Pressure drop: ${value.toFixed(1)} Pa (Limit: 300 Pa)`;
          } else if (value > 250) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Filter maintenance required - Pressure drop: ${value.toFixed(1)} Pa (Warning: 250 Pa)`;
          } else if (value > 200) {
            shouldAlert = true;
            severity = 'Low';
            message = `Filter monitoring - Pressure drop elevated: ${value.toFixed(1)} Pa`;
          }
          break;
          
        case 'temp_supply':
          if (sensor.setpoint) {
            const deviation = Math.abs(value - sensor.setpoint);
            if (deviation > 4) {
              shouldAlert = true;
              severity = 'High';
              message = `Supply temperature critically off setpoint: ${value.toFixed(1)}°C (Setpoint: ${sensor.setpoint}°C, Deviation: ${deviation.toFixed(1)}°C)`;
            } else if (deviation > 2.5) {
              shouldAlert = true;
              severity = 'Medium';
              message = `Supply temperature deviation: ${value.toFixed(1)}°C (Setpoint: ${sensor.setpoint}°C, Deviation: ${deviation.toFixed(1)}°C)`;
            }
          }
          break;
          
        case 'vibration':
          if (value > 6.5) {
            shouldAlert = true;
            severity = 'High';
            message = `Critical vibration level - Immediate inspection required: ${value.toFixed(2)} mm/s RMS (Limit: 6.5 mm/s)`;
          } else if (value > 4.5) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Elevated vibration detected - Schedule maintenance: ${value.toFixed(2)} mm/s RMS (Warning: 4.5 mm/s)`;
          }
          break;
          
        case 'power_kw':
          const baseline = (sensor as any).baseline || 50;
          if (value > baseline * 1.3) {
            shouldAlert = true;
            severity = 'Medium';
            message = `High power consumption detected: ${value.toFixed(1)} kW (${(((value/baseline)-1)*100).toFixed(1)}% above baseline)`;
          }
          break;
          
        case 'current':
          if (asset.specifications.maxCurrent && value > asset.specifications.maxCurrent * 0.95) {
            shouldAlert = true;
            severity = 'High';
            message = `Current near maximum rating: ${value.toFixed(1)} A (Max: ${asset.specifications.maxCurrent} A)`;
          } else if (asset.specifications.maxCurrent && value > asset.specifications.maxCurrent * 0.85) {
            shouldAlert = true;
            severity = 'Medium';
            message = `High current consumption: ${value.toFixed(1)} A (${((value/asset.specifications.maxCurrent)*100).toFixed(1)}% of max)`;
          }
          break;
          
        case 'superheat':
          if (value > 10) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Excessive superheat - Check refrigerant charge: ${value.toFixed(1)} K (Normal: 4-8 K)`;
          } else if (value < 3) {
            shouldAlert = true;
            severity = 'High';
            message = `Low superheat - Risk of liquid flood back: ${value.toFixed(1)} K (Minimum: 3 K)`;
          }
          break;
          
        case 'subcooling':
          if (value < 2) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Low subcooling - Possible refrigerant leak: ${value.toFixed(1)} K (Normal: 3-7 K)`;
          } else if (value > 8) {
            shouldAlert = true;
            severity = 'Medium';
            message = `High subcooling - Check system charge: ${value.toFixed(1)} K (Normal: 3-7 K)`;
          }
          break;
          
        case 'humidity':
          if (value > 65) {
            shouldAlert = true;
            severity = 'Medium';
            message = `High humidity level: ${value.toFixed(1)}% RH (Comfort limit: 60%)`;
          } else if (value < 40) {
            shouldAlert = true;
            severity = 'Low';
            message = `Low humidity level: ${value.toFixed(1)}% RH (Comfort minimum: 40%)`;
          }
          break;
          
        case 'pressure_suction':
          if (value < 300 || value > 550) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Suction pressure out of range: ${value.toFixed(0)} kPa (Normal: 350-500 kPa)`;
          }
          break;
          
        case 'pressure_discharge':
          if (value > 1700) {
            shouldAlert = true;
            severity = 'High';
            message = `High discharge pressure: ${value.toFixed(0)} kPa (High limit: 1700 kPa)`;
          } else if (value < 1200) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Low discharge pressure: ${value.toFixed(0)} kPa (Low limit: 1200 kPa)`;
          }
          break;
          
        case 'cop':
          if (value < 3.0) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Low COP efficiency: ${value.toFixed(2)} (Below optimal: 3.5)`;
          }
          break;
          
        case 'eer':
          if (value < 8.5) {
            shouldAlert = true;
            severity = 'Medium';
            message = `Low EER efficiency: ${value.toFixed(1)} (Below optimal: 9.5)`;
          }
          break;
          
        case 'airflow':
          const nominalFlow = (sensor as any).baseline || 25000;
          if (value < nominalFlow * 0.7) {
            shouldAlert = true;
            severity = 'High';
            message = `Low airflow detected: ${(value/1000).toFixed(1)} m³/h (${((value/nominalFlow)*100).toFixed(0)}% of nominal)`;
          }
          break;
      }
      
      // Check for sensor offline condition
      if (!sensor.online) {
        shouldAlert = true;
        severity = 'Medium';
        message = `${sensorName} sensor offline - No communication detected`;
      }
      
      // Check for stale data (older than 5 minutes)
      const dataAge = (now.getTime() - sensor.lastReading.timestamp.getTime()) / (1000 * 60);
      if (dataAge > 5 && sensor.online) {
        shouldAlert = true;
        severity = 'Low';
        message = `${sensorName} data stale - Last reading: ${Math.round(dataAge)} minutes ago`;
      }
      
      if (shouldAlert) {
        // Check if alert already exists for this condition
        const alertId = `${asset.id}-${sensor.type}-${severity}`;
        const existingAlert = this.alerts.find(a => 
          a.assetId === asset.id && 
          a.type === sensor.type && 
          a.severity === severity &&
          !a.resolved
        );
        
        if (!existingAlert) {
          const newAlert: Alert = {
            id: alertId,
            assetId: asset.id,
            assetTag: asset.tag,
            severity,
            type: sensor.type,
            message,
            timestamp: new Date(),
            acknowledged: false,
            resolved: false,
            ruleName: `${sensor.type}_monitoring`,
            sensorValue: value,
            sensorUnit: sensor.unit
          };
          
          this.alerts.push(newAlert);
          
          // Auto-resolve old alerts of lower severity for same sensor
          this.alerts
            .filter(a => 
              a.assetId === asset.id && 
              a.type === sensor.type && 
              a.severity !== severity &&
              !a.resolved
            )
            .forEach(alert => {
              alert.resolved = true;
              alert.resolvedAt = new Date();
            });
        }
      }
    });
    
    // Generate some periodic maintenance alerts
    this.generateMaintenanceAlerts();
    
    // Auto-resolve some alerts after time
    this.autoResolveAlerts();
  }
  
  private generateMaintenanceAlerts() {
    const now = new Date();
    
    // Check maintenance schedules
    this.assets.forEach(asset => {
      if (!asset.lastMaintenance) return;
      
      const daysSinceMaintenance = Math.floor((now.getTime() - asset.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24));
      const maintenanceInterval = asset.type === 'Chiller' ? 90 : 120; // days
      
      if (daysSinceMaintenance > maintenanceInterval) {
        const existingAlert = this.alerts.find(a => 
          a.assetId === asset.id && 
          a.type === 'maintenance' && 
          !a.resolved
        );
        
        if (!existingAlert) {
          this.alerts.push({
            id: `maintenance-${asset.id}-${Date.now()}`,
            assetId: asset.id,
            assetTag: asset.tag,
            severity: 'Medium',
            type: 'maintenance' as any,
            message: `Scheduled maintenance overdue by ${daysSinceMaintenance - maintenanceInterval} days`,
            timestamp: now,
            acknowledged: false,
            resolved: false,
            ruleName: 'maintenance_schedule'
          });
        }
      } else if (daysSinceMaintenance > maintenanceInterval * 0.8) {
        const existingAlert = this.alerts.find(a => 
          a.assetId === asset.id && 
          a.type === 'maintenance_reminder' && 
          !a.resolved
        );
        
        if (!existingAlert) {
          this.alerts.push({
            id: `maintenance-reminder-${asset.id}-${Date.now()}`,
            assetId: asset.id,
            assetTag: asset.tag,
            severity: 'Low',
            type: 'maintenance_reminder' as any,
            message: `Maintenance due in ${maintenanceInterval - daysSinceMaintenance} days`,
            timestamp: now,
            acknowledged: false,
            resolved: false,
            ruleName: 'maintenance_reminder'
          });
        }
      }
    });
  }
  
  private autoResolveAlerts() {
    const now = new Date();
    
    // Auto-resolve some alerts after 24 hours
    this.alerts
      .filter(a => 
        !a.resolved && 
        (now.getTime() - a.timestamp.getTime()) > (24 * 60 * 60 * 1000) &&
        ['Low'].includes(a.severity)
      )
      .forEach(alert => {
        alert.resolved = true;
        alert.resolvedAt = now;
      });
      
    // Auto-acknowledge old alerts after 2 hours
    this.alerts
      .filter(a => 
        !a.acknowledged && 
        (now.getTime() - a.timestamp.getTime()) > (2 * 60 * 60 * 1000)
      )
      .forEach(alert => {
        alert.acknowledged = true;
        alert.acknowledgedAt = now;
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