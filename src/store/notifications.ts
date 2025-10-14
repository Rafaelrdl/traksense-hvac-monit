import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Notification type definition
 */
export type Notification = {
  id: string;
  title: string;
  message?: string;
  severity?: 'info' | 'warning' | 'critical';
  createdAt: number; // epoch ms
  read: boolean;
};

/**
 * Notification store state and actions
 */
interface NotificationState {
  items: Notification[];
  add: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'> & Partial<Pick<Notification, 'createdAt' | 'read'>>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
  clear: () => void;
  remove: (id: string) => void;
}

/**
 * Generate simple unique ID
 */
function generateId(): string {
  return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Notification store with persistence
 * 
 * Features:
 * - Add notifications with auto-generated ID
 * - Mark as read (individual or all)
 * - Count unread notifications
 * - Persist to localStorage
 */
export const useNotifications = create<NotificationState>()(
  persist(
    (set, get) => ({
      items: [],
      
      add: (notification) => {
        const newNotification: Notification = {
          id: generateId(),
          createdAt: Date.now(),
          read: false,
          ...notification,
        };
        
        set((state) => ({
          items: [newNotification, ...state.items],
        }));
      },
      
      markRead: (id) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, read: true } : item
          ),
        }));
      },
      
      markAllRead: () => {
        set((state) => ({
          items: state.items.map((item) => ({ ...item, read: true })),
        }));
      },
      
      unreadCount: () => {
        return get().items.filter((item) => !item.read).length;
      },
      
      remove: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      clear: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'ts:notifs',
    }
  )
);
