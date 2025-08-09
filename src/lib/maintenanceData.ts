import { MaintenanceTask, MaintenanceSchedule, MaintenanceHistory, MaintenancePart } from '../types/hvac';

  private tasks: MaintenanceTask[] = []
  private history: MaintenanceHistory[]
  private tasks: MaintenanceTask[] = [];
  private schedules: MaintenanceSchedule[] = [];
  private history: MaintenanceHistory[] = [];

      {
        title: 'Air Filter Replacement',
        frequency: 'monthly' as const,
        duration: 60,
   

      },
        type: 'cleaning' as con
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
        parts: [],
        duration: 180,
      },
        instructions: 'Power down system, remove panels, clean coils with approved solution, rinse and dry',
        parts: [{ id: '2', name: 'Coil Cleaner Solution', partNumber: 'CLN-001', quantity: 1, unitCost: 25.00 }],
        tools: ['Coil cleaning brush', 'Pressure washer', 'Chemical sprayer'],
        safety: ['Wear protective gear', 'Ensure adequate ventilation', 'Lockout/tagout procedures']
      },
       
        type: 'calibration' as const,
        title: 'Sensor Calibration',
        description: 'Calibrate temperature and pressure sensors for accurate readings',
        frequency: 'annually' as const,
        interval: 365,
        frequency: 'mo
        priority: 'Medium' as const,
        priority: 'Medium' as const,
        parts: [],
        tools: ['Calibration kit', 'Reference thermometer', 'Pressure gauge'],
        safety: ['Handle precision instruments carefully']
    ];
      {
        type: 'inspection' as const,
        title: 'Electrical Connection Inspection',
        description: 'Inspect electrical connections for signs of wear, corrosion, or loose connections',
        frequency: 'quarterly' as const,

        duration: 90,
        priority: 'High' as const,
        instructions: 'Visual inspection of all electrical connections, tighten loose connections, replace damaged wiring',
      const priority = priorities[Math.floor(Math.random() * priorities.length)];

      if (status === 'overdue') {
      } 
      }
      const task: MaintenanceTask = {
        assetId,
        type,
        title: this.getTaskTitle(categ
        priority,
        scheduledDate
        assignedTo: assignees[Math.f
        recurring: Math.random() > 0.3,
        recurringType: Math.random() > 0.5 ? 'monthly' : 'quarterly',
        createdBy: 'System',
        partsUsed: status === 'completed' ? this.generateRandomParts() : u
       
      

  }
  private generateMaintenanceHistory(ass
    co
    // Generate 50 historical maintenance records
      const assetIndex = Math.floor(Math.random() * assetIds.le
      const assetTag = assetTags[as
      

      const beforeHealthScore
      const afterHealthSc
      this.history
        taskId: `ta
        assetTag,
        category,
        completedDate,
        duration: 30 + Math.floor(Math.r
        partsUsed: this.generateRandom
        beforeHealthScore,
        findings: this.getFindings(cat
      });
  }
  private getTaskTitle(category: string): string {
      filter: 'Air Filter Replacement',
      calibration: 'Sensor Calibration',
      repair: 'Component Repair',
      replacement: 'Component Replacement',
    };
  }
  priva
   

      repair: 'Repair identified component issues and test functionality',
      replacement: 'Replace worn or failed components',
    };
  }
  private generateRandomParts(): MaintenancePart[] {
      { id: '1', name: 'HEPA Filter 24x24x4', partNumber: 'FLT-2424-4', quantity: 1, unitCost: 45.0

      { id: '5', name: 'V-Belt', partNumbe

    return parts.slice(0, numParts).map(part => ({
      quantity: Math.floor(Math.random() * 
  }
  private getMaintenanceNotes(category: string): string {
      filter: 'Replaced filters were moderately dirty. System airflow improved si
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      repair: 'Replaced faulty component. System tested and operating norma

  }
      if (status === 'overdue') {
      filter: ['Filter 70% loaded with dust and debris', 'Housing seal intact', 'No air 
      calibrat
      repair: ['Faulty pressure switch identified', 'Wiring connections corroded'],
      }

      const task: MaintenanceTask = {
      filter: ['Continue mon
        assetId,
      repair: ['M
        type,
  }
  getTasks(): MaintenanceTask[] {
  }
        priority,
  }
  getHistory(): Mainte
  }
  // Add a new task
    const newTask: MaintenanceTask = {
        recurring: Math.random() > 0.3,
      createdBy: 'Current User'
        recurringType: Math.random() > 0.5 ? 'monthly' : 'quarterly',
  }
        createdBy: 'System',
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);

    return this.tasks[taskIndex];

  completeTask(taskId: string, notes?: string, cost?: number): MaintenanceTask | null {
      st

      cost

  }

        assetId: task.assetId,
        type: task.type,
        title: task.title,

    // Generate 50 historical maintenance records
        notes: notes || '',
        recommendations: ['Continue monitoring system performance']
      this.history.unshift(historyEntry);
      // Create next recurring task if applic
        const nextTask: MaintenanceTask = {
      
          scheduledDate: new Date(Date.
          completedDate: undefined,

          partsUsed: undefined
        this.tasks.push(nextTask);
    }

}



        assetTag,

        category,

        completedDate,





        beforeHealthScore,



      });

  }

  private getTaskTitle(category: string): string {

      filter: 'Air Filter Replacement',

      calibration: 'Sensor Calibration',

      repair: 'Component Repair',

      replacement: 'Component Replacement',

    };

  }







      repair: 'Repair identified component issues and test functionality',

      replacement: 'Replace worn or failed components',

    };

  }

  private generateRandomParts(): MaintenancePart[] {









    return parts.slice(0, numParts).map(part => ({



  }

  private getMaintenanceNotes(category: string): string {



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