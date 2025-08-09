import { MaintenanceTask, MaintenanceSchedule, MaintenanceHistory, MaintenancePart } from '../types/hvac';

// Mock data for maintenance management
export class MaintenanceDataGenerator {
  private tasks: MaintenanceTask[] = [];
  private schedules: MaintenanceSchedule[] = [];
  private history: MaintenanceHistory[] = [];

  constructor(assetIds: string[], assetTags: string[]) {
    this.generateMaintenanceSchedules(assetIds, assetTags);
    this.generateMaintenanceTasks(assetIds, assetTags);
    this.generateMaintenanceHistory(assetIds, assetTags);
  }

  private generateMaintenanceSchedules(assetIds: string[], assetTags: string[]) {
    const scheduleTemplates = [
      {
        type: 'filter' as const,
        title: 'Air Filter Replacement',
        description: 'Replace HVAC air filters to maintain air quality and system efficiency',
        frequency: 'monthly' as const,
        interval: 30,
        duration: 60,
        priority: 'Medium' as const,
        instructions: 'Turn off system, remove old filters, install new filters with correct orientation, restart system',
        parts: [{ id: '1', name: 'HEPA Filter 24x24x4', partNumber: 'FLT-2424-4', quantity: 2, unitCost: 45.00 }],
        tools: ['Screwdriver', 'Filter removal tool'],
        safety: ['Wear protective mask', 'Ensure system is powered off']
      },
      {
        type: 'cleaning' as const,
        title: 'Coil Cleaning',
        description: 'Clean evaporator and condenser coils to maintain heat transfer efficiency',
        frequency: 'quarterly' as const,
        interval: 90,
        duration: 180,
        priority: 'High' as const,
        instructions: 'Power down system, remove panels, clean coils with approved solution, rinse and dry',
        parts: [{ id: '2', name: 'Coil Cleaner Solution', partNumber: 'CLN-001', quantity: 1, unitCost: 25.00 }],
        tools: ['Coil cleaning brush', 'Pressure washer', 'Chemical sprayer'],
        safety: ['Wear protective gear', 'Ensure adequate ventilation', 'Lockout/tagout procedures']
      },
      {
        type: 'calibration' as const,
        title: 'Sensor Calibration',
        description: 'Calibrate temperature and pressure sensors for accurate readings',
        frequency: 'annually' as const,
        interval: 365,
        duration: 120,
        priority: 'Medium' as const,
        instructions: 'Compare sensor readings with reference instruments, adjust calibration as needed',
        parts: [],
        tools: ['Calibration kit', 'Reference thermometer', 'Pressure gauge'],
        safety: ['Handle precision instruments carefully']
      },
      {
        type: 'inspection' as const,
        title: 'Electrical Connection Inspection',
        description: 'Inspect electrical connections for signs of wear, corrosion, or loose connections',
        frequency: 'quarterly' as const,
        interval: 90,
        duration: 90,
        priority: 'High' as const,
        instructions: 'Visual inspection of all electrical connections, tighten loose connections, replace damaged wiring',
        parts: [{ id: '3', name: 'Electrical Contact Cleaner', partNumber: 'ELC-001', quantity: 1, unitCost: 15.00 }],
        tools: ['Multimeter', 'Torque wrench', 'Wire strippers'],
        safety: ['Lockout/tagout procedures', 'Wear insulated gloves', 'Test for live circuits']
      },
      {
        type: 'lubrication' as const,
        title: 'Bearing Lubrication',
        description: 'Lubricate motor bearings and moving parts',
        frequency: 'monthly' as const,
        interval: 30,
        duration: 45,
        priority: 'Medium' as const,
        instructions: 'Apply specified lubricant to bearing points, check for proper grease level',
        parts: [{ id: '4', name: 'High-Temperature Bearing Grease', partNumber: 'LUB-001', quantity: 1, unitCost: 35.00 }],
        tools: ['Grease gun', 'Cleaning cloths'],
        safety: ['Ensure system is powered off', 'Avoid over-lubrication']
      }
    ];

    assetIds.forEach((assetId, index) => {
      const assetTag = assetTags[index];
      
      scheduleTemplates.forEach((template, templateIndex) => {
        const scheduleId = `sched-${assetId}-${templateIndex}`;
        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + Math.floor(Math.random() * template.interval));

        this.schedules.push({
          id: scheduleId,
          assetId,
          assetTag,
          maintenanceType: template.type,
          title: template.title,
          description: template.description,
          frequency: template.frequency,
          interval: template.interval,
          estimatedDuration: template.duration,
          priority: template.priority,
          enabled: true,
          nextDue,
          assignedTeam: Math.random() > 0.5 ? 'HVAC Team A' : 'HVAC Team B',
          instructions: template.instructions,
          requiredParts: template.parts,
          requiredTools: template.tools,
          safetyRequirements: template.safety
        });
      });
    });
  }

  private generateMaintenanceTasks(assetIds: string[], assetTags: string[]) {
    const taskTypes = ['preventive', 'corrective', 'predictive'] as const;
    const categories = ['filter', 'cleaning', 'calibration', 'inspection', 'repair', 'lubrication'] as const;
    const priorities = ['Low', 'Medium', 'High', 'Critical'] as const;
    const statuses = ['scheduled', 'in_progress', 'completed', 'overdue'] as const;
    const assignees = ['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Wilson', 'Mike Johnson'];

    // Generate upcoming and current tasks
    for (let i = 0; i < 25; i++) {
      const assetIndex = Math.floor(Math.random() * assetIds.length);
      const assetId = assetIds[assetIndex];
      const assetTag = assetTags[assetIndex];
      const type = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const scheduledDate = new Date();
      if (status === 'overdue') {
        scheduledDate.setDate(scheduledDate.getDate() - Math.floor(Math.random() * 30));
      } else {
        scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 60));
      }

      const task: MaintenanceTask = {
        id: `task-${i + 1}`,
        assetId,
        assetTag,
        type,
        category,
        title: this.getTaskTitle(category),
        description: this.getTaskDescription(category),
        priority,
        status,
        scheduledDate,
        estimatedDuration: 30 + Math.floor(Math.random() * 180), // 30-210 minutes
        assignedTo: assignees[Math.floor(Math.random() * assignees.length)],
        assignedTeam: Math.random() > 0.5 ? 'HVAC Team A' : 'HVAC Team B',
        recurring: Math.random() > 0.3,
        recurringInterval: Math.random() > 0.5 ? 30 : 90,
        recurringType: Math.random() > 0.5 ? 'monthly' : 'quarterly',
        createdDate: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)),
        createdBy: 'System',
        cost: status === 'completed' ? 50 + Math.floor(Math.random() * 500) : undefined,
        partsUsed: status === 'completed' ? this.generateRandomParts() : undefined,
        completedDate: status === 'completed' ? new Date() : undefined,
        completedBy: status === 'completed' ? assignees[Math.floor(Math.random() * assignees.length)] : undefined,
        notes: status === 'completed' ? 'Task completed successfully. All components functioning normally.' : undefined
      };

      this.tasks.push(task);
    }
  }

  private generateMaintenanceHistory(assetIds: string[], assetTags: string[]) {
    const categories = ['filter', 'cleaning', 'calibration', 'inspection', 'repair', 'lubrication'] as const;
    const assignees = ['John Smith', 'Maria Garcia', 'David Chen', 'Sarah Wilson', 'Mike Johnson'];

    // Generate 50 historical maintenance records
    for (let i = 0; i < 50; i++) {
      const assetIndex = Math.floor(Math.random() * assetIds.length);
      const assetId = assetIds[assetIndex];
      const assetTag = assetTags[assetIndex];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const completedDate = new Date();
      completedDate.setDate(completedDate.getDate() - Math.floor(Math.random() * 365)); // Last year

      const beforeHealthScore = 60 + Math.floor(Math.random() * 30); // 60-90
      const improvement = 5 + Math.floor(Math.random() * 15); // 5-20 point improvement
      const afterHealthScore = Math.min(100, beforeHealthScore + improvement);

      this.history.push({
        id: `hist-${i + 1}`,
        taskId: `task-hist-${i + 1}`,
        assetId,
        assetTag,
        type: 'preventive',
        category,
        title: this.getTaskTitle(category),
        completedDate,
        completedBy: assignees[Math.floor(Math.random() * assignees.length)],
        duration: 30 + Math.floor(Math.random() * 180),
        cost: 50 + Math.floor(Math.random() * 500),
        partsUsed: this.generateRandomParts(),
        notes: this.getMaintenanceNotes(category),
        beforeHealthScore,
        afterHealthScore,
        findings: this.getFindings(category),
        recommendations: this.getRecommendations(category)
      });
    }
  }

  private getTaskTitle(category: string): string {
    const titles = {
      filter: 'Air Filter Replacement',
      cleaning: 'System Cleaning & Inspection',
      calibration: 'Sensor Calibration',
      inspection: 'Routine Inspection',
      repair: 'Component Repair',
      lubrication: 'Bearing Lubrication',
      replacement: 'Component Replacement',
      electrical: 'Electrical System Check'
    };
    return titles[category as keyof typeof titles] || 'General Maintenance';
  }

  private getTaskDescription(category: string): string {
    const descriptions = {
      filter: 'Replace air filters and inspect filter housing for proper seal',
      cleaning: 'Clean coils, drains, and inspect overall system cleanliness',
      calibration: 'Calibrate temperature and pressure sensors for accurate readings',
      inspection: 'Visual inspection of all system components and connections',
      repair: 'Repair identified component issues and test functionality',
      lubrication: 'Lubricate bearings and moving parts per manufacturer specifications',
      replacement: 'Replace worn or failed components',
      electrical: 'Inspect electrical connections and perform continuity tests'
    };
    return descriptions[category as keyof typeof descriptions] || 'Perform scheduled maintenance';
  }

  private generateRandomParts(): MaintenancePart[] {
    const parts = [
      { id: '1', name: 'HEPA Filter 24x24x4', partNumber: 'FLT-2424-4', quantity: 1, unitCost: 45.00 },
      { id: '2', name: 'Coil Cleaner Solution', partNumber: 'CLN-001', quantity: 1, unitCost: 25.00 },
      { id: '3', name: 'Motor Oil', partNumber: 'OIL-001', quantity: 2, unitCost: 15.00 },
      { id: '4', name: 'Electrical Connector', partNumber: 'ELC-002', quantity: 3, unitCost: 8.50 },
      { id: '5', name: 'V-Belt', partNumber: 'BLT-001', quantity: 1, unitCost: 35.00 }
    ];

    const numParts = Math.floor(Math.random() * 3) + 1;
    return parts.slice(0, numParts).map(part => ({
      ...part,
      quantity: Math.floor(Math.random() * 3) + 1
    }));
  }

  private getMaintenanceNotes(category: string): string {
    const notes = {
      filter: 'Replaced filters were moderately dirty. System airflow improved significantly.',
      cleaning: 'Coils had moderate buildup. Cleaned thoroughly and checked drain functionality.',
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