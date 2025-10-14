import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotifications, type Notification } from '@/store/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

/**
 * Severity icon mapping
 */
const severityConfig = {
  info: {
    icon: Info,
    className: 'text-info bg-info-subtle border-info',
    label: 'Info',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-warning bg-warning-subtle border-warning',
    label: 'Aviso',
  },
  critical: {
    icon: AlertCircle,
    className: 'text-destructive bg-destructive-subtle border-destructive',
    label: 'Crítico',
  },
};

/**
 * Single notification item
 */
function NotificationItem({ notification, onMarkRead, onRemove }: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const severity = notification.severity || 'info';
  const config = severityConfig[severity];
  const Icon = config.icon;
  
  return (
    <div
      className={cn(
        'group relative rounded-lg p-3 border transition-colors',
        notification.read ? 'bg-card/50 opacity-70' : 'bg-card'
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
      )}
      
      <div className="flex items-start gap-3 pl-3">
        {/* Severity icon */}
        <div className={cn('mt-0.5 rounded-full p-1', config.className)}>
          <Icon className="w-3 h-3" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className={cn(
                'text-sm font-medium leading-tight',
                notification.read && 'text-muted-foreground'
              )}>
                {notification.title}
              </p>
              {notification.message && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
              )}
            </div>
            
            {/* Remove button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(notification.id)}
              aria-label="Remover notificação"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Footer */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(notification.createdAt, {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
            {!notification.read && (
              <>
                <span className="text-muted-foreground">•</span>
                <button
                  onClick={() => onMarkRead(notification.id)}
                  className="text-[11px] text-primary hover:underline"
                >
                  Marcar como lida
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Header Notifications Component
 * 
 * Features:
 * - Popover with notification list
 * - Unread count badge
 * - Mark as read (individual or all)
 * - Remove notifications
 * - Severity badges (info/warning/critical)
 * - Navigation to alerts page
 * - Keyboard accessible
 */
export function HeaderNotifications({ onNavigateToAlerts }: { onNavigateToAlerts?: () => void }) {
  const { items, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const unread = unreadCount();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Abrir notificações${unread > 0 ? ` (${unread} não lida${unread > 1 ? 's' : ''})` : ''}`}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unread > 9 ? '9+' : unread}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-[380px] p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h3 className="text-sm font-semibold">Notificações</h3>
            {unread > 0 && (
              <p className="text-xs text-muted-foreground">
                {unread} não lida{unread > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="h-8 text-xs"
            >
              Marcar todas
            </Button>
          )}
        </div>
        
        {/* Notification list */}
        <div className="overflow-hidden">
          <ScrollArea className="h-[380px]">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 rounded-full bg-muted p-3">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Sem notificações</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Você está em dia!
                </p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {items.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markRead}
                    onRemove={remove}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Footer */}
        {items.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  onNavigateToAlerts?.();
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
