import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar, Clock, User, Wrench, Plus, Filter, CheckCircle, AlertTriangle, Settings, History } from 'lucide-react';
import { useAppStore } from '@/store/app';
import { MaintenanceTask, MaintenanceSchedule } from '@/types/hvac';
import { formatDistanceToNow, format } from 'date-fns';

interface MaintenanceTaskFormData {
  assetId: string;
  type: MaintenanceTask['type'];
  category: MaintenanceTask['category'];
  title: string;
  description: string;
  priority: MaintenanceTask['priority'];
  scheduledDate: string;
  estimatedDuration: number;
  assignedTo?: string;
  assignedTeam?: string;
  recurring: boolean;
  recurringInterval?: number;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
}

export const MaintenancePage: React.FC = () => {
  const { 
    maintenanceTasks, 
    maintenanceSchedules, 
    maintenanceHistory, 
    assets,
    addMaintenanceTask,
    updateMaintenanceTask,
    completeMaintenanceTask
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assetFilter, setAssetFilter] = useState<string>('all');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  
  const [taskForm, setTaskForm] = useState<MaintenanceTaskFormData>({
    assetId: '',
    type: 'preventive',
    category: 'filter',
    title: '',
    description: '',
    priority: 'Medium',
    scheduledDate: '',
    estimatedDuration: 60,
    assignedTo: '',
    assignedTeam: '',
    recurring: false
  });

  // Filter and search logic
  const filteredTasks = useMemo(() => {
    return maintenanceTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assetTag.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAsset = assetFilter === 'all' || task.assetId === assetFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAsset;
    });
  }, [maintenanceTasks, searchTerm, statusFilter, priorityFilter, assetFilter]);

  // Get overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return maintenanceTasks.filter(task => 
      task.status === 'scheduled' && 
      new Date(task.scheduledDate) < now
    );
  }, [maintenanceTasks]);

  // Get upcoming tasks (next 7 days)
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return maintenanceTasks.filter(task => 
      task.status === 'scheduled' && 
      new Date(task.scheduledDate) >= now &&
      new Date(task.scheduledDate) <= weekFromNow
    );
  }, [maintenanceTasks]);

  const handleCreateTask = () => {
    if (!taskForm.title || !taskForm.assetId || !taskForm.scheduledDate) return;

    const asset = assets.find(a => a.id === taskForm.assetId);
    if (!asset) return;

    const newTask: Omit<MaintenanceTask, 'id' | 'createdDate' | 'createdBy'> = {
      assetId: taskForm.assetId,
      assetTag: asset.tag,
      type: taskForm.type,
      category: taskForm.category,
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      status: 'scheduled',
      scheduledDate: new Date(taskForm.scheduledDate),
      estimatedDuration: taskForm.estimatedDuration,
      assignedTo: taskForm.assignedTo,
      assignedTeam: taskForm.assignedTeam,
      recurring: taskForm.recurring,
      recurringInterval: taskForm.recurring ? taskForm.recurringInterval : undefined,
      recurringType: taskForm.recurring ? taskForm.recurringType : undefined
    };

    addMaintenanceTask(newTask);
    setIsTaskDialogOpen(false);
    resetTaskForm();
  };

  const handleCompleteTask = (taskId: string) => {
    const task = maintenanceTasks.find(t => t.id === taskId);
    if (task) {
      completeMaintenanceTask(taskId, 'Task completed successfully', undefined);
    }
  };

  const resetTaskForm = () => {
    setTaskForm({
      assetId: '',
      type: 'preventive',
      category: 'filter',
      title: '',
      description: '',
      priority: 'Medium',
      scheduledDate: '',
      estimatedDuration: 60,
      assignedTo: '',
      assignedTeam: '',
      recurring: false
    });
    setEditingTask(null);
  };

  const getStatusBadge = (status: MaintenanceTask['status']) => {
    const variants = {
      scheduled: 'secondary',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'secondary',
      overdue: 'destructive'
    } as const;

    const colors = {
      scheduled: 'text-blue-600 bg-blue-50',
      in_progress: 'text-yellow-600 bg-yellow-50',
      completed: 'text-green-600 bg-green-50',
      cancelled: 'text-gray-600 bg-gray-50',
      overdue: 'text-red-600 bg-red-50'
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: MaintenanceTask['priority']) => {
    const colors = {
      Low: 'text-gray-600 bg-gray-100',
      Medium: 'text-blue-600 bg-blue-100',
      High: 'text-orange-600 bg-orange-100',
      Critical: 'text-red-600 bg-red-100'
    };

    return (
      <Badge variant="secondary" className={colors[priority]}>
        {priority}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Maintenance Management</h1>
          <p className="text-muted-foreground mt-1">
            Schedule, track, and manage HVAC maintenance tasks
          </p>
        </div>
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetTaskForm()} className="gap-2">
              <Plus size={16} />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="asset">Asset</Label>
                  <Select value={taskForm.assetId} onValueChange={(value) => setTaskForm({...taskForm, assetId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map(asset => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.tag} - {asset.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={taskForm.type} onValueChange={(value: any) => setTaskForm({...taskForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                      <SelectItem value="predictive">Predictive</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={taskForm.category} onValueChange={(value: any) => setTaskForm({...taskForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="filter">Filter</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="calibration">Calibration</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                      <SelectItem value="lubrication">Lubrication</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="refrigerant">Refrigerant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={taskForm.priority} onValueChange={(value: any) => setTaskForm({...taskForm, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                  placeholder="Task title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                  placeholder="Task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={taskForm.scheduledDate}
                    onChange={(e) => setTaskForm({...taskForm, scheduledDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={taskForm.estimatedDuration}
                    onChange={(e) => setTaskForm({...taskForm, estimatedDuration: parseInt(e.target.value) || 60})}
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                    placeholder="Technician name"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={taskForm.recurring}
                  onCheckedChange={(checked) => setTaskForm({...taskForm, recurring: checked})}
                />
                <Label htmlFor="recurring">Recurring task</Label>
              </div>

              {taskForm.recurring && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interval">Interval</Label>
                    <Input
                      id="interval"
                      type="number"
                      value={taskForm.recurringInterval || 30}
                      onChange={(e) => setTaskForm({...taskForm, recurringInterval: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="recurringType">Type</Label>
                    <Select value={taskForm.recurringType || 'monthly'} onValueChange={(value: any) => setTaskForm({...taskForm, recurringType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTask}>
                {editingTask ? 'Update' : 'Create'} Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold text-primary">{maintenanceTasks.length}</p>
            </div>
            <Wrench className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold text-destructive">{overdueTasks.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold text-accent">{upcomingTasks.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-accent" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {maintenanceTasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={assetFilter} onValueChange={setAssetFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {assets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>{asset.tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Tasks List */}
          <div className="grid gap-4">
            {filteredTasks.map(task => (
              <Card key={task.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{task.title}</h3>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{task.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Settings size={16} />
                        <span>{task.assetTag}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>{format(new Date(task.scheduledDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span>{task.estimatedDuration} min</span>
                      </div>
                      {task.assignedTo && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User size={16} />
                          <span>{task.assignedTo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {task.status === 'scheduled' && (
                      <Button size="sm" onClick={() => handleCompleteTask(task.id)}>
                        Complete
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="grid gap-4">
            {maintenanceSchedules.map(schedule => (
              <Card key={schedule.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{schedule.title}</h3>
                      {getPriorityBadge(schedule.priority)}
                      <Badge variant={schedule.enabled ? "default" : "secondary"} className={schedule.enabled ? "text-green-600 bg-green-50" : ""}>
                        {schedule.enabled ? 'Active' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{schedule.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Settings size={16} />
                        <span>{schedule.assetTag}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>{schedule.frequency} ({schedule.interval} days)</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span>{schedule.estimatedDuration} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>Next: {format(new Date(schedule.nextDue), 'MMM d')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {maintenanceHistory.slice(0, 20).map(record => (
              <Card key={record.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{record.title}</h3>
                      <Badge variant="outline" className="text-green-600 bg-green-50">
                        Completed
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{record.notes}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Settings size={16} />
                        <span>{record.assetTag}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>{format(new Date(record.completedDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User size={16} />
                        <span>{record.completedBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="text-green-600">Cost: ${record.cost.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {record.beforeHealthScore && record.afterHealthScore && (
                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Health Score: </span>
                        <span className="text-red-500">{record.beforeHealthScore}%</span>
                        <span className="text-muted-foreground"> → </span>
                        <span className="text-green-600">{record.afterHealthScore}%</span>
                        <span className="text-green-600"> (+{record.afterHealthScore - record.beforeHealthScore}%)</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};