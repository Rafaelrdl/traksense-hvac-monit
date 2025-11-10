import { MaintenanceTask, MaintenanceSchedule, MaintenanceHistory, MaintenancePart } from '../types/hvac';

export class MaintenanceDataService {
  private tasks: MaintenanceTask[] = [];
  private schedules: MaintenanceSchedule[] = [];
  private history: MaintenanceHistory[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize schedules
    this.schedules = [
      {
        id: 'schedule-1',
        type: 'filter',
        title: 'Air Filter Replacement',
        description: 'Replace HVAC air filters to maintain air quality and system efficiency',
        frequency: 'monthly',
        interval: 30,
        duration: 60,
        priority: 'Medium',
        instructions: 'Turn off system, remove old filters, install new filters with correct orientation, restart system',
        parts: [{ id: '1', name: 'HEPA Filter 24x24x4', partNumber: 'FLT-2424-4', quantity: 2, unitCost: 45.00 }],
        tools: ['Screwdriver', 'Filter removal tool'],
        safety: ['Wear protective mask', 'Ensure system is powered off']
      },
      {
        id: 'schedule-2',
        type: 'cleaning',
        title: 'Coil Cleaning',
        description: 'Clean evaporator and condenser coils to maintain heat transfer efficiency',
        frequency: 'quarterly',
        interval: 90,
        duration: 180,
        priority: 'High',
        instructions: 'Power down system, remove panels, clean coils with approved solution, rinse and dry',
        parts: [{ id: '2', name: 'Coil Cleaner Solution', partNumber: 'CLN-001', quantity: 1, unitCost: 25.00 }],
        tools: ['Coil cleaning brush', 'Pressure washer', 'Chemical sprayer'],
        safety: ['Wear protective gear', 'Ensure adequate ventilation', 'Lockout/tagout procedures']
      },
      {
        id: 'schedule-3',
        type: 'calibration',
        title: 'Sensor Calibration',
        description: 'Calibrate temperature and pressure sensors for accurate readings',
        frequency: 'annually',
        interval: 365,
        duration: 120,
        priority: 'Medium',
        instructions: 'Use calibration equipment to verify and adjust sensor readings',
        parts: [],
        tools: ['Calibration kit', 'Reference thermometer', 'Pressure gauge'],
        safety: ['Handle precision instruments carefully']
      },
      {
        id: 'schedule-4',
        type: 'inspection',
        title: 'Electrical Connection Inspection',
        description: 'Inspect electrical connections for signs of wear, corrosion, or loose connections',
        frequency: 'quarterly',
        interval: 90,
        duration: 90,
        priority: 'High',
        instructions: 'Visual inspection of all electrical connections, tighten loose connections, replace damaged wiring',
        parts: [],
        tools: ['Multimeter', 'Torque wrench', 'Wire strippers'],
        safety: ['Lockout/tagout required', 'Verify zero energy state']
      }
    ];

    // Generate sample tasks
    this.generateMaintenanceTasks();
    this.generateMaintenanceHistory();
  }

  private generateMaintenanceTasks() {
    const assetIds = ['AHU-01', 'AHU-02', 'AHU-03', 'CHILLER-01', 'CHILLER-02', 'VRF-01', 'VRF-02'];
    const assetTags = ['AHU-NORTE-01', 'AHU-SUL-02', 'AHU-CENTRAL-03', 'CHL-PRINCIPAL-01', 'CHL-BACKUP-02', 'VRF-ESCRITORIO-01', 'VRF-LABORATORIO-02'];
    const categories: Array<'filter' | 'cleaning' | 'calibration' | 'inspection' | 'repair' | 'replacement' | 'lubrication' | 'electrical' | 'refrigerant'> = ['filter', 'cleaning', 'calibration', 'inspection', 'repair', 'lubrication'];
    const priorities = ['Low', 'Medium', 'High', 'Critical'] as const;
    const statuses: Array<'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'> = ['scheduled', 'in_progress', 'completed', 'overdue'];
    const assignees = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa'];

    // Generate 25 maintenance tasks
    for (let i = 0; i < 25; i++) {
      const assetIndex = Math.floor(Math.random() * assetIds.length);
      const assetId = assetIds[assetIndex];
      const assetTag = assetTags[assetIndex];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const type: 'preventive' | 'corrective' | 'predictive' | 'emergency' = 'preventive';
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      // Generate dates based on status
      let scheduledDate: Date;
      let completedDate: Date | undefined;

      if (status === 'overdue') {
        scheduledDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Past week
      } else if (status === 'completed') {
        scheduledDate = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000); // Past 2 weeks
        completedDate = new Date(scheduledDate.getTime() + Math.random() * 24 * 60 * 60 * 1000);
      } else {
        scheduledDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days
      }

      const task: MaintenanceTask = {
        id: `task-${i + 1}`,
        assetId,
        assetTag,
        type,
        category,
        title: this.getTaskTitle(category),
        description: this.getTaskDescription(category),
        status,
        priority,
        scheduledDate,
        estimatedDuration: 60 + Math.floor(Math.random() * 120),
        assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
        createdDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        recurring: Math.random() > 0.3,
        recurringType: Math.random() > 0.5 ? 'monthly' : 'quarterly',
        recurringInterval: Math.random() > 0.5 ? 30 : 90,
        createdBy: 'System',
        completedDate,
        completedBy: status === 'completed' ? assignees[Math.floor(Math.random() * assignees.length)] : undefined,
        cost: status === 'completed' ? Math.floor(Math.random() * 500) + 50 : undefined,
        notes: status === 'completed' ? this.getMaintenanceNotes(category) : undefined,
        partsUsed: status === 'completed' ? this.generateRandomParts() : undefined
      };

      this.tasks.push(task);
    }
  }

  private generateMaintenanceHistory() {
    const assetIds = ['AHU-01', 'AHU-02', 'AHU-03', 'CHILLER-01', 'CHILLER-02', 'VRF-01', 'VRF-02'];
    const assetTags = ['AHU-NORTE-01', 'AHU-SUL-02', 'AHU-CENTRAL-03', 'CHL-PRINCIPAL-01', 'CHL-BACKUP-02', 'VRF-ESCRITORIO-01', 'VRF-LABORATORIO-02'];
    const categories = ['filter', 'cleaning', 'calibration', 'inspection', 'repair', 'lubrication'];
    const assignees = ['João Silva', 'Maria Santos', 'Carlos Oliveira', 'Ana Costa'];

    // Generate 50 historical maintenance records
    for (let i = 0; i < 50; i++) {
      const assetIndex = Math.floor(Math.random() * assetIds.length);
      const assetId = assetIds[assetIndex];
      const assetTag = assetTags[assetIndex];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const completedDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Past 90 days

      const beforeHealthScore = 60 + Math.floor(Math.random() * 30);
      const afterHealthScore = beforeHealthScore + Math.floor(Math.random() * 20) + 5;

      this.history.push({
        id: `hist-${i + 1}`,
        taskId: `task-hist-${i + 1}`,
        assetId,
        assetTag,
        type: 'preventive' as 'preventive' | 'corrective' | 'predictive' | 'emergency',
        category: category as 'filter' | 'cleaning' | 'calibration' | 'inspection' | 'repair' | 'replacement' | 'lubrication' | 'electrical' | 'refrigerant',
        title: this.getTaskTitle(category),
        completedDate,
        completedBy: assignees[Math.floor(Math.random() * assignees.length)],
        duration: 30 + Math.floor(Math.random() * 180),
        cost: Math.floor(Math.random() * 300) + 25,
        partsUsed: this.generateRandomParts(),
        beforeHealthScore,
        afterHealthScore,
        notes: this.getMaintenanceNotes(category),
        findings: this.getFindings(category),
        recommendations: this.getRecommendations(category)
      });
    }
  }

  private getTaskTitle(category: string): string {
    const titles = {
      filter: 'Air Filter Replacement',
      cleaning: 'System Cleaning',
      calibration: 'Sensor Calibration',
      inspection: 'System Inspection',
      repair: 'Component Repair',
      lubrication: 'Equipment Lubrication',
      replacement: 'Component Replacement',
    };
    return titles[category as keyof typeof titles] || 'General Maintenance';
  }

  private getTaskDescription(category: string): string {
    const descriptions = {
      filter: 'Replace air filters to maintain air quality and system efficiency',
      cleaning: 'Clean system components to ensure optimal performance',
      calibration: 'Calibrate sensors and controls for accurate operation',
      inspection: 'Perform thorough inspection of system components',
      repair: 'Repair identified component issues and test functionality',
      lubrication: 'Lubricate moving parts to prevent wear and ensure smooth operation',
      replacement: 'Replace worn or failed components',
    };
    return descriptions[category as keyof typeof descriptions] || 'Perform scheduled maintenance';
  }

  private generateRandomParts(): MaintenancePart[] {
    const availableParts = [
      { id: '1', name: 'HEPA Filter 24x24x4', partNumber: 'FLT-2424-4', quantity: 1, unitCost: 45.00 },
      { id: '2', name: 'Coil Cleaner Solution', partNumber: 'CLN-001', quantity: 1, unitCost: 25.00 },
      { id: '3', name: 'Motor Oil 10W-30', partNumber: 'OIL-1030', quantity: 1, unitCost: 15.00 },
      { id: '4', name: 'Temperature Sensor', partNumber: 'TEMP-001', quantity: 1, unitCost: 120.00 },
      { id: '5', name: 'V-Belt', partNumber: 'BELT-V1', quantity: 1, unitCost: 35.00 },
      { id: '6', name: 'Bearing Kit', partNumber: 'BRG-KIT-01', quantity: 1, unitCost: 85.00 }
    ];

    const numParts = Math.floor(Math.random() * 3) + 1;
    const selectedParts = availableParts.sort(() => 0.5 - Math.random()).slice(0, numParts);

    return selectedParts.map(part => ({
      ...part,
      quantity: Math.floor(Math.random() * 3) + 1
    }));
  }

  private getMaintenanceNotes(category: string): string {
    const notes = {
      filter: 'Replaced filters were moderately dirty. System airflow improved significantly after replacement.',
      cleaning: 'Coils had moderate fouling. Cleaned thoroughly and checked for leaks. No issues found.',
      calibration: 'Sensors were within acceptable range. Minor adjustments made.',
      inspection: 'Overall system condition good. Minor wear noted on belt drive.',
      repair: 'Replaced faulty component. System tested and operating normally.',
      lubrication: 'Applied fresh lubricant to all bearing points. No excessive wear detected.'
    };
    return notes[category as keyof typeof notes] || 'Maintenance completed successfully.';
  }

  private getFindings(category: string): string[] {
    const findings = {
      filter: ['Filter 70% loaded with dust and debris', 'Housing seal intact', 'No air bypass detected'],
      cleaning: ['Moderate coil fouling present', 'Drain clear and functioning', 'Fan blades clean'],
      calibration: ['Temperature sensor reading +1.2°C high', 'Pressure sensors within tolerance'],
      inspection: ['Belt tension within spec', 'All electrical connections secure', 'No unusual vibration'],
      repair: ['Faulty pressure switch identified', 'Wiring connections corroded'],
      lubrication: ['Bearings operating smoothly', 'No contamination in lubricant']
    };
    return findings[category as keyof typeof findings] || ['System operating normally'];
  }

  private getRecommendations(category: string): string[] {
    const recommendations = {
      filter: ['Continue monthly filter replacement schedule', 'Consider upgrading to higher efficiency filters'],
      cleaning: ['Increase coil cleaning frequency during high pollen season', 'Install coil protection screens'],
      calibration: ['Schedule annual calibration verification', 'Consider sensor upgrade in 2 years'],
      inspection: ['Monitor belt condition closely', 'Schedule electrical connection torque check'],
      repair: ['Monitor system pressure closely', 'Consider preventive replacement of similar components'],
      lubrication: ['Continue current lubrication schedule', 'Monitor bearing temperature trends']
    };
    return recommendations[category as keyof typeof recommendations] || ['Continue current maintenance schedule'];
  }

  getTasks(): MaintenanceTask[] {
    return [...this.tasks];
  }

  getSchedules(): MaintenanceSchedule[] {
    return [...this.schedules];
  }

  getHistory(): MaintenanceHistory[] {
    return [...this.history];
  }

  // Add a new task
  addTask(task: Omit<MaintenanceTask, 'id' | 'createdDate' | 'createdBy'>): MaintenanceTask {
    const newTask: MaintenanceTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdDate: new Date(),
      createdBy: 'Current User'
    };
    this.tasks.push(newTask);
    return newTask;
  }

  // Update a task
  updateTask(taskId: string, updates: Partial<MaintenanceTask>): MaintenanceTask | null {
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
    return this.tasks[taskIndex];
  }

  // Complete a task
  completeTask(taskId: string, notes?: string, cost?: number): MaintenanceTask | null {
    const task = this.updateTask(taskId, {
      status: 'completed',
      completedDate: new Date(),
      completedBy: 'Current User',
      notes,
      cost
    });

    if (task) {
      // Add to history
      const historyEntry: MaintenanceHistory = {
        id: `hist-${Date.now()}`,
        taskId: task.id,
        assetId: task.assetId,
        assetTag: task.assetTag,
        type: task.type,
        category: task.category,
        title: task.title,
        completedDate: new Date(),
        completedBy: 'Current User',
        duration: task.estimatedDuration,
        cost: cost || 0,
        partsUsed: task.partsUsed || [],
        notes: notes || '',
        findings: ['Task completed as scheduled'],
        recommendations: ['Continue monitoring system performance']
      };
      this.history.unshift(historyEntry);

      // Create next recurring task if applicable
      if (task.recurring && task.recurringInterval) {
        const nextTask: MaintenanceTask = {
          ...task,
          id: `task-${Date.now()}-recurring`,
          status: 'scheduled',
          scheduledDate: new Date(Date.now() + task.recurringInterval * 24 * 60 * 60 * 1000),
          createdDate: new Date(),
          completedDate: undefined,
          completedBy: undefined,
          notes: undefined,
          cost: undefined,
          partsUsed: undefined
        };
        this.tasks.push(nextTask);
      }
    }

    return task;
  }
}

// Export singleton instance
export const maintenanceDataService = new MaintenanceDataService();