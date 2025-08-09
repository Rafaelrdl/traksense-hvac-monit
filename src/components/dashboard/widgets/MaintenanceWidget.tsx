import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, CheckCircle, Wrench } from '@phosphor-icons/react';
import { useAppStore } from '@/store/app';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface MaintenanceWidgetProps {
  onResize?: () => void;
  onRemove?: () => void;
}

export const MaintenanceWidget: React.FC<MaintenanceWidgetProps> = ({
  onResize,
  onRemove
}) => {
  const { maintenanceTasks, maintenanceHistory, assets } = useAppStore();

  const now = new Date();
  const weekFromNow = addDays(now, 7);

  // Calculate statistics
  const overdueTasks = maintenanceTasks.filter(task => 
    task.status === 'scheduled' && isBefore(new Date(task.scheduledDate), now)
  );

  const upcomingTasks = maintenanceTasks.filter(task => 
    task.status === 'scheduled' && 
    isAfter(new Date(task.scheduledDate), now) &&
    isBefore(new Date(task.scheduledDate), weekFromNow)
  );

  const completedThisMonth = maintenanceHistory.filter(record =>
    isAfter(new Date(record.completedDate), addDays(now, -30))
  );

  const priorityBreakdown = maintenanceTasks
    .filter(task => task.status === 'scheduled')
    .reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wrench className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Maintenance Overview</h3>
            <p className="text-sm text-muted-foreground">Tasks and schedules summary</p>
          </div>
        </div>
        {onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove} className="opacity-0 group-hover:opacity-100">
            ×
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-lg mx-auto mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mx-auto mb-2">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{upcomingTasks.length}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Priority Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(priorityBreakdown).map(([priority, count]) => (
              <div key={priority} className="flex items-center justify-between">
                <Badge variant="secondary" className={getPriorityColor(priority)}>
                  {priority}
                </Badge>
                <span className="text-sm font-medium">{count} tasks</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Recent Activity</h4>
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-lg mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-lg font-semibold text-green-600">{completedThisMonth.length}</div>
            <div className="text-xs text-muted-foreground">Tasks completed this month</div>
          </div>
        </div>

        {/* Next Tasks */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3">Next Tasks</h4>
          <div className="space-y-2">
            {upcomingTasks.slice(0, 3).map(task => {
              const asset = assets.find(a => a.id === task.assetId);
              return (
                <div key={task.id} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {asset?.tag} • {format(new Date(task.scheduledDate), 'MMM d')}
                    </div>
                  </div>
                </div>
              );
            })}
            {upcomingTasks.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No upcoming tasks this week
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};