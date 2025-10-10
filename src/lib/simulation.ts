import { HVACAsset, Sensor, TelemetryPoint, Alert, SimulationScenario, SensorReading, MaintenanceTask, MaintenanceSchedule, MaintenanceHistory } from '../types/hvac';
import { maintenanceDataService } from './maintenanceData';

export class SimulationEngine {
  private assets: HVACAsset[] = [];
  private sensors: Sensor[] = [];
  private telemetryData: Map<string, TelemetryPoint[]> = new Map();
  private alerts: Alert[] = [];
  private scenarios: SimulationScenario[] = [];
  private activeScenario: SimulationScenario | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private maintenanceData = maintenanceDataService;

  constructor() {
    this.initializeAssets();
    this.initializeSensors();
    this.initializeScenarios();
    this.generateHistoricalData();
    this.generateInitialAlerts();
    this.initializeMaintenanceData();
  }

  private initializeAssets() {
    this.assets = [
      // Oncocentro AHUs - 7 units with JE02 sensors
      {
        id: 'ahu-001-onco',
        tag: 'AHU-001',
        type: 'AHU',
        location: 'Oncologia - Quimioterapia',
        healthScore: 92,
        powerConsumption: 48.5,
        status: 'OK',
        operatingHours: 8234,
        lastMaintenance: new Date('2024-02-15'),
        specifications: { 
          capacity: 12.0,
          brand: 'Trane',
          model: 'AeroSuite AHU-25',
          serialNumber: 'TRN-AHU-001-9C1F3',
          voltage: 380,
          maxCurrent: 22,
          refrigerant: 'R-410A'
        }
      },
      {
        id: 'ahu-002-onco',
        tag: 'AHU-002',
        type: 'AHU',
        location: 'Laboratório - Análises Clínicas',
        healthScore: 88,
        powerConsumption: 61.2,
        status: 'OK',
        operatingHours: 10567,
        lastMaintenance: new Date('2024-01-20'),
        specifications: { 
          capacity: 15.5,
          brand: 'Carrier',
          model: 'OptiClean 40AHU',
          serialNumber: 'CAR-AHU-002-7B84D',
          voltage: 220,
          maxCurrent: 28,
          refrigerant: 'R-134a'
        }
      },
      {
        id: 'ahu-003-onco',
        tag: 'AHU-003',
        type: 'AHU',
        location: 'Centro Cirúrgico - Sala 1',
        healthScore: 95,
        powerConsumption: 42.8,
        status: 'OK',
        operatingHours: 6890,
        lastMaintenance: new Date('2024-03-05'),
        specifications: { 
          capacity: 10.0,
          brand: 'Daikin',
          model: 'SmartFlow AHU 300',
          serialNumber: 'DAI-AHU-003-2E61A',
          voltage: 380,
          maxCurrent: 18,
          refrigerant: 'R-410A'
        }
      },
      {
        id: 'ahu-004-onco',
        tag: 'AHU-004',
        type: 'AHU',
        location: 'UTI - Adulto',
        healthScore: 90,
        powerConsumption: 38.4,
        status: 'OK',
        operatingHours: 9123,
        lastMaintenance: new Date('2024-02-10'),
        specifications: { 
          capacity: 8.5,
          brand: 'York',
          model: 'YMA-Classic 18',
          serialNumber: 'YOR-AHU-004-5D2C9',
          voltage: 380,
          maxCurrent: 16,
          refrigerant: 'R-407C'
        }
      },
      {
        id: 'ahu-005-onco',
        tag: 'AHU-005',
        type: 'AHU',
        location: 'Imagem - Ressonância',
        healthScore: 85,
        powerConsumption: 78.9,
        status: 'Alert',
        operatingHours: 12456,
        lastMaintenance: new Date('2024-01-05'),
        specifications: { 
          capacity: 20.0,
          brand: 'LG',
          model: 'AirPro AHU 500',
          serialNumber: 'LGE-AHU-005-A19F7',
          voltage: 440,
          maxCurrent: 32,
          refrigerant: 'R-134a'
        }
      },
      {
        id: 'ahu-006-onco',
        tag: 'AHU-006',
        type: 'AHU',
        location: 'Farmácia - Manipulação',
        healthScore: 72,
        powerConsumption: 46.3,
        status: 'Maintenance',
        operatingHours: 14789,
        lastMaintenance: new Date('2023-12-15'),
        specifications: { 
          capacity: 11.5,
          brand: 'Hitachi',
          model: 'NeoAir 420',
          serialNumber: 'HIT-AHU-006-CC882',
          voltage: 220,
          maxCurrent: 20,
          refrigerant: 'R-410A'
        }
      },
      {
        id: 'ahu-007-onco',
        tag: 'AHU-007',
        type: 'AHU',
        location: 'Administrativo - Recepção',
        healthScore: 93,
        powerConsumption: 40.5,
        status: 'OK',
        operatingHours: 7654,
        lastMaintenance: new Date('2024-02-25'),
        specifications: { 
          capacity: 9.0,
          brand: 'Midea',
          model: 'ClimaMaster AHU 350',
          serialNumber: 'MID-AHU-007-8EE76',
          voltage: 380,
          maxCurrent: 14,
          refrigerant: 'R-32'
        }
      }
    ];
  }

  private initializeSensors() {
    this.sensors = [];
    
    // Only JE02 sensors for Oncocentro AHUs
    const je02Sensors = [
      {
        je02_id: 'JE02-AHU-001',
        equipment_tag: 'AHU-001',
        assetId: 'ahu-001-onco',
        location: 'Oncologia - Quimioterapia',
        data: { INPUT1: 1, INPUT2: 0, RELE: 1, WRSSI: -60, VAR0: 224, VAR1: 515, CNTSERR: 0, UPTIME: 1234 }
      },
      {
        je02_id: 'JE02-AHU-002',
        equipment_tag: 'AHU-002',
        assetId: 'ahu-002-onco',
        location: 'Laboratório - Análises Clínicas',
        data: { INPUT1: 1, INPUT2: 0, RELE: 0, WRSSI: -64, VAR0: 231, VAR1: 498, CNTSERR: 0, UPTIME: 2450 }
      },
      {
        je02_id: 'JE02-AHU-003',
        equipment_tag: 'AHU-003',
        assetId: 'ahu-003-onco',
        location: 'Centro Cirúrgico - Sala 1',
        data: { INPUT1: 1, INPUT2: 0, RELE: 1, WRSSI: -58, VAR0: 218, VAR1: 540, CNTSERR: 1, UPTIME: 3675 }
      },
      {
        je02_id: 'JE02-AHU-004',
        equipment_tag: 'AHU-004',
        assetId: 'ahu-004-onco',
        location: 'UTI - Adulto',
        data: { INPUT1: 1, INPUT2: 0, RELE: 1, WRSSI: -66, VAR0: 235, VAR1: 520, CNTSERR: 0, UPTIME: 4890 }
      },
      {
        je02_id: 'JE02-AHU-005',
        equipment_tag: 'AHU-005',
        assetId: 'ahu-005-onco',
        location: 'Imagem - Ressonância',
        data: { INPUT1: 0, INPUT2: 0, RELE: 0, WRSSI: -55, VAR0: 246, VAR1: 585, CNTSERR: 2, UPTIME: 6120 }
      },
      {
        je02_id: 'JE02-AHU-006',
        equipment_tag: 'AHU-006',
        assetId: 'ahu-006-onco',
        location: 'Farmácia - Manipulação',
        data: { INPUT1: 0, INPUT2: 1, RELE: 0, WRSSI: -72, VAR0: 212, VAR1: 610, CNTSERR: 0, UPTIME: 7300 }
      },
      {
        je02_id: 'JE02-AHU-007',
        equipment_tag: 'AHU-007',
        assetId: 'ahu-007-onco',
        location: 'Administrativo - Recepção',
        data: { INPUT1: 1, INPUT2: 0, RELE: 1, WRSSI: -59, VAR0: 228, VAR1: 560, CNTSERR: 0, UPTIME: 8510 }
      }
    ];

    je02Sensors.forEach(je02 => {
      // Add INPUT1 sensor (Digital Input 1 - Binary 0 or 1)
      // Force integer value: 0 or 1 only (no decimals)
      this.sensors.push({
        id: `${je02.assetId}-je02-input1`,
        tag: `${je02.je02_id}_INPUT1`,
        assetId: je02.assetId,
        type: 'input1' as any,
        unit: '',
        location: je02.location,
        online: true,
        lastReading: {
          value: je02.data.INPUT1 === 1 ? 1 : 0, // Ensure integer 0 or 1
          timestamp: new Date(),
          quality: 'good'
        },
        availability: 99.5,
        min: 0,
        max: 1,
        setpoint: undefined
      });

      // Add INPUT2 sensor (Digital Input 2 - Binary 0 or 1)
      // Force integer value: 0 or 1 only (no decimals)
      this.sensors.push({
        id: `${je02.assetId}-je02-input2`,
        tag: `${je02.je02_id}_INPUT2`,
        assetId: je02.assetId,
        type: 'input2' as any,
        unit: '',
        location: je02.location,
        online: true,
        lastReading: {
          value: je02.data.INPUT2 === 1 ? 1 : 0, // Ensure integer 0 or 1
          timestamp: new Date(),
          quality: 'good'
        },
        availability: 99.5,
        min: 0,
        max: 1,
        setpoint: undefined
      });

      // Add RELE sensor (Relay Output - Binary 0 or 1)
      // Force integer value: 0 or 1 only (no decimals)
      this.sensors.push({
        id: `${je02.assetId}-je02-rele`,
        tag: `${je02.je02_id}_RELE`,
        assetId: je02.assetId,
        type: 'rele' as any,
        unit: '',
        location: je02.location,
        online: true,
        lastReading: {
          value: je02.data.RELE === 1 ? 1 : 0, // Ensure integer 0 or 1
          timestamp: new Date(),
          quality: 'good'
        },
        availability: 99.5,
        min: 0,
        max: 1,
        setpoint: undefined
      });

      // Add RSSI sensor (WiFi signal strength)
      this.sensors.push({
        id: `${je02.assetId}-je02-rssi`,
        tag: `${je02.je02_id}_RSSI`,
        assetId: je02.assetId,
        type: 'rssi' as any,
        unit: 'dBm',
        location: je02.location,
        online: true,
        lastReading: {
          value: je02.data.WRSSI,
          timestamp: new Date(),
          quality: 'good'
        },
        availability: 99.5,
        min: -80,
        max: -45,
        setpoint: undefined
      });

      // Add UPTIME sensor
      this.sensors.push({
        id: `${je02.assetId}-je02-uptime`,
        tag: `${je02.je02_id}_UPTIME`,
        assetId: je02.assetId,
        type: 'uptime' as any,
        unit: 's',
        location: je02.location,
        online: true,
        lastReading: {
          value: je02.data.UPTIME,
          timestamp: new Date(),
          quality: 'good'
        },
        availability: 99.5,
        min: 0,
        max: 999999,
        setpoint: undefined
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
      // Initialize realistic starting conditions based on sensor type and asset age
      const asset = this.getAssetForSensor(sensor.id);
      let trendMultiplier = 1;
      let driftAccumulation = 0;
      let equipmentAgeEffect = 1;
      
      // Factor in equipment age and operating hours
      if (asset) {
        const ageMultiplier = Math.min(1.15, 1 + (asset.operatingHours / 100000)); // Max 15% degradation
        equipmentAgeEffect = ageMultiplier;
        
        // Different degradation patterns by asset type
        if (asset.type === 'Chiller' && asset.operatingHours > 15000) {
          equipmentAgeEffect *= 1.05; // Chillers degrade faster with age
        } else if (asset.type === 'Boiler' && asset.operatingHours > 20000) {
          equipmentAgeEffect *= 1.03; // Boilers are generally more robust
        }
      }
      
      for (let day = historyDays; day >= 0; day--) {
        const currentDate = new Date(now);
        currentDate.setDate(currentDate.getDate() - day);
        
        // Add realistic seasonal and weather effects
        const dayOfYear = Math.floor((currentDate.getTime() - new Date(currentDate.getFullYear(), 0, 0).getTime()) / 86400000);
        const isWeekend = currentDate.getDay() >= 5;
        const isSummer = dayOfYear > 120 && dayOfYear < 270; // May to September
        const isWinter = dayOfYear < 90 || dayOfYear > 300; // Dec to March
        
        // Apply seasonal effects based on sensor type
        let seasonalOffset = 0;
        if (['temp_supply', 'temp_return'].includes(sensor.type)) {
          seasonalOffset = isSummer ? 3 + Math.random() * 4 : (isWinter ? -2 - Math.random() * 3 : 0);
        } else if (['power_kw', 'current', 'energy_kwh'].includes(sensor.type)) {
          seasonalOffset = isSummer ? 0.15 : (isWinter ? 0.08 : 0); // More load in summer
        } else if (sensor.type === 'humidity') {
          seasonalOffset = isSummer ? 8 + Math.random() * 6 : -5 - Math.random() * 3;
        }
        
        const dailyLoadMultiplier = isWeekend ? 0.65 : 1.0;
        
        // Add progressive equipment degradation over the historical period
        if (sensor.type === 'dp_filter') {
          trendMultiplier = 1 + (historyDays - day) * 0.012; // Gradual filter clogging
        } else if (sensor.type === 'vibration') {
          trendMultiplier = 1 + (historyDays - day) * 0.003 * equipmentAgeEffect; // Age-related bearing wear
        } else if (sensor.type === 'power_kw') {
          trendMultiplier = Math.max(0.85, 1 - (historyDays - day) * 0.002 * equipmentAgeEffect); // Efficiency degradation
        }
        
        for (let hour = 0; hour < 24; hour++) {
          let hourlyLoadMultiplier = 1;
          
          if (asset?.type === 'Chiller' || asset?.type === 'CoolingTower') {
            // Peak cooling in afternoon
            hourlyLoadMultiplier = 0.4 + 0.6 * Math.max(0, Math.sin((hour - 6) / 12 * Math.PI));
          } else if (asset?.type === 'Boiler') {
            // Peak heating in morning and evening
            hourlyLoadMultiplier = 0.3 + 0.7 * (Math.sin((hour - 2) / 12 * Math.PI) + 0.3 * Math.sin((hour + 14) / 12 * Math.PI));
          } else {
            // Standard office building pattern
            hourlyLoadMultiplier = (hour >= 6 && hour <= 22) ? 
              0.6 + 0.4 * Math.sin((hour - 6) / 16 * Math.PI) : 0.3;
          }
          
          const finalLoadMultiplier = dailyLoadMultiplier * hourlyLoadMultiplier;
          
          for (let point = 0; point < pointsPerHour; point++) {
            const timestamp = new Date(now);
            timestamp.setDate(timestamp.getDate() - day);
            timestamp.setHours(hour, point * 5, 0, 0);
            
            let value = this.generateSensorValue(sensor, timestamp);
            
            // Force binary sensors to be exactly 0 or 1 (no decimals)
            // Skip all calculations for digital I/O sensors
            if (sensor.tag?.includes('_INPUT1') || sensor.tag?.includes('_INPUT2') || sensor.tag?.includes('_RELE')) {
              value = value === 1 ? 1 : 0;
            } else {
              // Apply seasonal effects
              if (['temp_external', 'temp_supply', 'temp_return', 'humidity'].includes(sensor.type)) {
                value += seasonalOffset;
              } else if (['power_kw', 'current', 'energy_kwh'].includes(sensor.type)) {
                value *= (1 + seasonalOffset);
              }
              
              // Apply load multiplier for operational sensors
              if (['power_kw', 'current', 'airflow', 'rpm_fan', 'energy_kwh'].includes(sensor.type)) {
                value *= finalLoadMultiplier;
              }
              
              // Apply equipment degradation/improvement over time
              value *= trendMultiplier;
              
              // Apply accumulated drift (slow degradation/improvement over time)
              driftAccumulation += (Math.random() - 0.5) * 0.08;
              value += driftAccumulation;
            }
            
            // Skip anomalies and noise for binary sensors
            if (!(sensor.tag?.includes('_INPUT1') || sensor.tag?.includes('_INPUT2') || sensor.tag?.includes('_RELE'))) {
              // Add occasional anomalies
              if (Math.random() < 0.0008) { // 0.08% chance of significant anomaly
                const anomalyTypes = ['spike', 'dip', 'step'];
                const anomalyType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)];
                
                switch (anomalyType) {
                  case 'spike':
                    value *= 1.2 + Math.random() * 0.3; // 20-50% spike
                    break;
                  case 'dip':
                    value *= 0.5 + Math.random() * 0.3; // 50-80% dip
                    break;
                  case 'step':
                    driftAccumulation += (Math.random() - 0.5) * 0.5; // Step change in baseline
                    break;
                }
              }
              
              // Add random variations (instrumentation noise)
              const noiseLevel = sensor.type === 'vibration' ? 0.03 : 
                                sensor.type === 'temp_supply' ? 0.02 : 
                                sensor.type === 'humidity' ? 0.5 : 0.01;
              value += (Math.random() - 0.5) * 2 * noiseLevel * ((sensor as any).baseline || value);
              
              // Ensure value stays within realistic sensor limits
              value = Math.max(sensor.min || -Infinity, Math.min(sensor.max || Infinity, value));
            }
            
            // Add data quality variations
            let quality: 'good' | 'uncertain' | 'bad' = 'good';
            const qualityRandom = Math.random();
            
            if (qualityRandom < 0.005) quality = 'bad';       // 0.5% bad readings
            else if (qualityRandom < 0.015) quality = 'uncertain';  // 1% uncertain readings
            else quality = 'good';                             // 98.5% good readings
            
            // Equipment offline periods (rare but realistic)
            if (!sensor.online && Math.random() < 0.1) {
              quality = 'bad';
              value = (sensor as any).baseline || 0; // Sensor returns last known value or zero
            }
            
            data.push({
              sensorId: sensor.id,
              timestamp,
              value: parseFloat(value.toFixed(3)), // Round to realistic precision
              quality
            });
          }
        }
      }
      
      this.telemetryData.set(sensor.id, data);
      
      // Update sensor's last reading
      const lastData = data[data.length - 1];
      if (lastData) {
        let finalValue = lastData.value;
        
        // Force binary sensors to be exactly 0 or 1 (no decimals)
        if (sensor.tag?.includes('_INPUT1') || sensor.tag?.includes('_INPUT2') || sensor.tag?.includes('_RELE')) {
          finalValue = finalValue === 1 ? 1 : 0;
        }
        
        sensor.lastReading = {
          timestamp: lastData.timestamp,
          value: finalValue,
          quality: lastData.quality
        };
      }
    });
    
    // Generate historical alert patterns
    this.generateHistoricalAlerts();
  }
  
  private generateHistoricalAlerts() {
    const now = new Date();
    
    // Generate some resolved historical alerts
    const historicalAlertTemplates = [
      {
        assetId: 'ahu-001',
        assetTag: 'AHU-001',
        message: 'Filter maintenance completed - Pressure drop normalized: 89.2 Pa',
        severity: 'Medium' as Alert['severity'],
        type: 'dp_filter',
        ruleName: 'dp_filter_monitoring',
        resolved: true
      },
      {
        assetId: 'vrf-001',
        assetTag: 'VRF-001',
        message: 'Temperature control restored - System rebalanced',
        severity: 'Low' as Alert['severity'],
        type: 'temp_supply',
        ruleName: 'temp_supply_monitoring',
        resolved: true
      },
      {
        assetId: 'chill-002',
        assetTag: 'CHILL-002',
        message: 'Refrigerant leak detected and repaired - System recharged',
        severity: 'High' as Alert['severity'],
        type: 'refrigerant',
        ruleName: 'refrigerant_monitoring',
        resolved: true
      },
      {
        assetId: 'ahu-002',
        assetTag: 'AHU-002',
        message: 'Bearing replacement completed - Vibration normalized',
        severity: 'Medium' as Alert['severity'],
        type: 'vibration',
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

  private getAssetForSensor(sensorId: string): HVACAsset | undefined {
    // Find sensor first, then get its asset
    const sensor = this.sensors.find(s => s.id === sensorId);
    return sensor ? this.assets.find(a => a.id === sensor.assetId) : undefined;
  }
  
  private generateInitialAlerts() {
    const now = new Date();
    
    const alertTemplates = [
      // JE02 Sensor Alerts (Oncocentro)
      {
        assetId: 'ahu-006-onco',
        assetTag: 'AHU-006',
        severity: 'High' as Alert['severity'],
        type: 'je02_fault',
        message: 'Falha detectada pelo sensor JE02 - Equipamento em modo FAULT (INPUT2=1)',
        ruleName: 'je02_fault_monitoring',
        sensorValue: 1,
        sensorUnit: ''
      },
      {
        assetId: 'ahu-005-onco',
        assetTag: 'AHU-005',
        severity: 'Medium' as Alert['severity'],
        type: 'je02_errors',
        message: 'Múltiplos erros de comunicação detectados - CNTSERR: 2',
        ruleName: 'je02_communication_monitoring',
        sensorValue: 2,
        sensorUnit: ''
      },
      {
        assetId: 'ahu-003-onco',
        assetTag: 'AHU-003',
        severity: 'Low' as Alert['severity'],
        type: 'je02_errors',
        message: 'Erro de comunicação detectado - CNTSERR: 1',
        ruleName: 'je02_communication_monitoring',
        sensorValue: 1,
        sensorUnit: ''
      }
    ];
    
    alertTemplates.forEach((template, index) => {
      const alertTime = new Date(now.getTime() - (Math.random() * 72 * 60 * 60 * 1000));
      
      this.alerts.push({
        id: `initial-alert-${index + 1}`,
        ...template,
        timestamp: alertTime,
        acknowledged: Math.random() > 0.4,
        acknowledgedAt: Math.random() > 0.4 ? new Date(alertTime.getTime() + Math.random() * 24 * 60 * 60 * 1000) : undefined,
        resolved: Math.random() > 0.8
      });
    });
  }
  
  private generateSensorValue(sensor: Sensor, timestamp: Date): number {
    const hour = timestamp.getHours();
    const dayOfYear = Math.floor((timestamp.getTime() - new Date(timestamp.getFullYear(), 0, 0).getTime()) / 86400000);
    const asset = this.assets.find(a => a.id === sensor.assetId);
    
    // Binary sensors (INPUT1, INPUT2, RELE) - return exact 0 or 1 values
    // These represent digital inputs/outputs and must be exactly 0 or 1 (no decimals)
    if (sensor.tag?.includes('_INPUT1') || sensor.tag?.includes('_INPUT2') || sensor.tag?.includes('_RELE')) {
      // Return the exact lastReading value (0 or 1) without any variation
      const value = sensor.lastReading?.value ?? 0;
      return value === 1 ? 1 : 0; // Ensure only 0 or 1
    }
    
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

  startRealTimeSimulation(intervalMs: number = 300000) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      const now = new Date();
      
      this.sensors.forEach(sensor => {
        if (!sensor.online) return;
        
        let value = this.generateSensorValue(sensor, now);
        
        // Force binary sensors to be exactly 0 or 1 (no decimals)
        if (sensor.tag?.includes('_INPUT1') || sensor.tag?.includes('_INPUT2') || sensor.tag?.includes('_RELE')) {
          value = value === 1 ? 1 : 0;
        }
        
        const point: TelemetryPoint = {
          sensorId: sensor.id,
          timestamp: now,
          value,
          quality: Math.random() > 0.02 ? 'good' : 'uncertain'
        };
        
        // Keep only last 24 hours for real-time data
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const existingData = this.telemetryData.get(sensor.id) || [];
        const filteredData = existingData.filter(p => p.timestamp > cutoff);
        filteredData.push(point);
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
      
      // Equipment-specific health calculation weights
      const healthWeights = {
        'Chiller': { vibration: 0.25, superheat: 0.20, subcooling: 0.15, pressure: 0.15, temp: 0.10, power: 0.10, others: 0.05 },
        'AHU': { filter: 0.30, vibration: 0.20, temp: 0.15, airflow: 0.15, power: 0.10, others: 0.10 },
        'VRF': { superheat: 0.25, vibration: 0.20, temp: 0.20, power: 0.15, efficiency: 0.15, others: 0.05 },
        'RTU': { filter: 0.25, vibration: 0.20, temp: 0.20, power: 0.15, compressor: 0.15, others: 0.05 },
        'CoolingTower': { vibration: 0.30, temp: 0.25, power: 0.20, airflow: 0.15, others: 0.10 },
        'Boiler': { vibration: 0.25, temp: 0.25, pressure: 0.20, power: 0.15, others: 0.15 }
      };
      
      const weights = healthWeights[asset.type] || healthWeights['AHU'];
      
      assetSensors.forEach(sensor => {
        if (!sensor.lastReading) return;
        
        const value = sensor.lastReading.value;
        let penalty = 0;
        let categoryWeight = weights.others;
        
        // Update power consumption based on current power readings
        if (sensor.type === 'power_kw') {
          totalPowerConsumption = value;
          categoryWeight = weights.power || 0.1;
          
          const baseline = (sensor as any).baseline || 50;
          if (value > baseline * 1.4) penalty = 15;
          else if (value > baseline * 1.2) penalty = 8;
          else if (value > baseline * 1.1) penalty = 3;
        }
        
        switch (sensor.type) {
          case 'dp_filter':
            categoryWeight = weights.filter || 0.3;
            if (value > 320) penalty = 30; // Critical
            else if (value > 280) penalty = 20; // High
            else if (value > 240) penalty = 12; // Medium
            else if (value > 200) penalty = 6;  // Low
            else if (value > 160) penalty = 2;  // Slight
            break;
            
          case 'vibration':
            categoryWeight = weights.vibration || 0.2;
            const vibrationLimit = asset.type === 'CoolingTower' ? 8 : 
                                  asset.type === 'Chiller' ? 6 : 5;
            if (value > vibrationLimit) penalty = 25;
            else if (value > vibrationLimit * 0.8) penalty = 15;
            else if (value > vibrationLimit * 0.6) penalty = 8;
            else if (value > vibrationLimit * 0.5) penalty = 3;
            break;
            
          case 'temp_supply':
            categoryWeight = weights.temp || 0.15;
            if (sensor.setpoint) {
              const deviation = Math.abs(value - sensor.setpoint);
              if (deviation > 5) penalty = 20;
              else if (deviation > 3.5) penalty = 12;
              else if (deviation > 2.5) penalty = 8;
              else if (deviation > 1.5) penalty = 4;
              else if (deviation > 1.0) penalty = 1;
            }
            break;
            
          case 'superheat':
            categoryWeight = weights.superheat || 0.2;
            if (value > 12) penalty = 15;
            else if (value > 10) penalty = 10;
            else if (value < 3) penalty = 20; // More critical
            else if (value < 4) penalty = 10;
            break;
            
          case 'subcooling':
            categoryWeight = weights.subcooling || 0.15;
            if (value < 2) penalty = 15;
            else if (value < 2.5) penalty = 8;
            else if (value > 8) penalty = 10;
            else if (value > 7) penalty = 5;
            break;
            
          case 'pressure_suction':
          case 'pressure_discharge':
            categoryWeight = weights.pressure || 0.15;
            const isDischarge = sensor.type === 'pressure_discharge';
            const criticalHigh = isDischarge ? 1800 : 600;
            const criticalLow = isDischarge ? 1000 : 300;
            
            if (value > criticalHigh || value < criticalLow) penalty = 18;
            else if (value > criticalHigh * 0.9 || value < criticalLow * 1.1) penalty = 10;
            else if (value > criticalHigh * 0.85 || value < criticalLow * 1.2) penalty = 5;
            break;
            
          case 'current':
            categoryWeight = weights.power || 0.1;
            if (asset.specifications.maxCurrent) {
              const utilization = value / asset.specifications.maxCurrent;
              if (utilization > 0.98) penalty = 20;
              else if (utilization > 0.95) penalty = 12;
              else if (utilization > 0.90) penalty = 8;
              else if (utilization > 0.85) penalty = 4;
            }
            break;
            
          case 'cop':
          case 'eer':
            categoryWeight = weights.efficiency || 0.15;
            const minEfficient = sensor.type === 'cop' ? 3.8 : 9.5;
            const goodEfficient = sensor.type === 'cop' ? 4.2 : 10.5;
            
            if (value < minEfficient * 0.8) penalty = 15;
            else if (value < minEfficient) penalty = 10;
            else if (value < goodEfficient) penalty = 3;
            break;
            
          case 'airflow':
            categoryWeight = weights.airflow || 0.15;
            const nominalFlow = (sensor as any).baseline || 25000;
            if (value < nominalFlow * 0.6) penalty = 20;
            else if (value < nominalFlow * 0.7) penalty = 12;
            else if (value < nominalFlow * 0.8) penalty = 6;
            else if (value < nominalFlow * 0.9) penalty = 2;
            break;
            
          case 'compressor_state':
            categoryWeight = weights.compressor || 0.1;
            // Check for frequent cycling by looking at recent state changes
            // This is simplified - in reality you'd track state changes over time
            if (Math.random() < 0.05) penalty = 5; // 5% chance of cycling penalty
            break;
        }
        
        // Additional penalty for offline sensors
        if (!sensor.online) {
          penalty += 8 * categoryWeight; // Offline sensors impact health based on importance
        }
        
        // Quality-based penalties
        if (sensor.lastReading.quality === 'uncertain') penalty += 2;
        else if (sensor.lastReading.quality === 'bad') penalty += 5;
        
        // Apply weighted penalty
        healthScore -= penalty * categoryWeight;
      });
      
      // Update power consumption (convert from kW to current consumption)
      if (totalPowerConsumption > 0) {
        asset.powerConsumption = totalPowerConsumption;
      }
      
      // Additional health penalty based on maintenance schedule
      if (asset.lastMaintenance) {
        const daysSinceMaintenance = Math.floor((new Date().getTime() - asset.lastMaintenance.getTime()) / (1000 * 60 * 60 * 24));
        let maintenanceInterval: number;
        
        switch (asset.type) {
          case 'Chiller': maintenanceInterval = 90; break;
          case 'Boiler': maintenanceInterval = 120; break;
          case 'CoolingTower': maintenanceInterval = 60; break;
          case 'RTU': maintenanceInterval = 120; break;
          default: maintenanceInterval = 120;
        }
        
        if (daysSinceMaintenance > maintenanceInterval * 1.5) {
          healthScore -= 25; // Severely overdue
        } else if (daysSinceMaintenance > maintenanceInterval) {
          healthScore -= Math.min(15, (daysSinceMaintenance - maintenanceInterval) * 0.3);
        } else if (daysSinceMaintenance > maintenanceInterval * 0.9) {
          healthScore -= 3; // Approaching due date
        }
      }
      
      // Operating hours penalty (wear and tear)
      const hoursExpectancy = {
        'Chiller': 80000,
        'Boiler': 100000,
        'AHU': 70000,
        'VRF': 60000,
        'RTU': 65000,
        'CoolingTower': 50000
      };
      
      const expectedHours = hoursExpectancy[asset.type] || 70000;
      const wearRatio = asset.operatingHours / expectedHours;
      
      if (wearRatio > 1.2) healthScore -= 15;
      else if (wearRatio > 1.0) healthScore -= 8;
      else if (wearRatio > 0.8) healthScore -= 3;
      
      // Ensure health score stays within bounds and apply realistic rounding
      asset.healthScore = Math.max(25, Math.min(100, Math.round(healthScore)));
      
      // Update status based on health and alerts
      const activeAlerts = this.alerts.filter(a => a.assetId === asset.id && !a.resolved);
      const criticalAlerts = activeAlerts.filter(a => a.severity === 'Critical' || a.severity === 'High');
      const mediumAlerts = activeAlerts.filter(a => a.severity === 'Medium');
      
      if (asset.healthScore < 40 || criticalAlerts.length > 1) {
        asset.status = 'Alert';
      } else if (asset.healthScore < 60 || criticalAlerts.length > 0) {
        asset.status = 'Alert';
      } else if (asset.healthScore < 75 || mediumAlerts.length > 1) {
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

  private initializeMaintenanceData() {
    // maintenanceDataService is already initialized as a singleton
    // No need to create a new instance
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
  
  // Maintenance getters
  getMaintenanceTasks() { return this.maintenanceData.getTasks(); }
  getMaintenanceSchedules() { return this.maintenanceData.getSchedules(); }
  getMaintenanceHistory() { return this.maintenanceData.getHistory(); }
  
  // Maintenance actions
  addMaintenanceTask(task: Omit<MaintenanceTask, 'id' | 'createdDate' | 'createdBy'>) {
    return this.maintenanceData.addTask(task);
  }
  
  updateMaintenanceTask(taskId: string, updates: Partial<MaintenanceTask>) {
    return this.maintenanceData.updateTask(taskId, updates);
  }
  
  completeMaintenanceTask(taskId: string, notes?: string, cost?: number) {
    return this.maintenanceData.completeTask(taskId, notes, cost);
  }
  
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