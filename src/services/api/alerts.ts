/**
 * Alerts & Rules API Service
 * 
 * This service provides methods to interact with the alerts and rules system.
 */

import { api } from '@/lib/api';

// ============================================================================
// Types
// ============================================================================

// Backend usa PascalCase (Critical, High, Medium, Low)
// Frontend usa UPPERCASE (CRITICAL, HIGH, MEDIUM, LOW) para UI
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type NotificationAction = 'EMAIL' | 'IN_APP' | 'SMS' | 'WHATSAPP';
export type Operator = '>' | '<' | '>=' | '<=' | '==' | '!=';

export interface Rule {
  id: number;
  name: string;
  description: string;
  equipment: number;
  equipment_name?: string;
  equipment_tag?: string;
  parameter_key: string;
  variable_key: string;
  operator: Operator;
  threshold: number;
  unit?: string;
  duration: number;  // Backend usa 'duration' (não cooldown_minutes)
  severity: Severity;
  actions: NotificationAction[];
  enabled: boolean;
  created_by?: number;
  created_by_email?: string;
  created_at: string;
  updated_at: string;
  condition_display?: string;
}

export interface Alert {
  id: number;
  rule: number;
  rule_name: string;
  asset_tag: string;
  equipment_name: string;
  severity: Severity;
  message: string;
  raw_data: Record<string, any>;
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: number;
  acknowledged_by_email?: string;
  acknowledged_notes?: string;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: number;
  resolved_by_email?: string;
  resolved_notes?: string;
  is_active: boolean;
}

export interface NotificationPreference {
  id: number;
  user: number;
  email_enabled: boolean;
  push_enabled: boolean;
  sound_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  critical_alerts: boolean;
  high_alerts: boolean;
  medium_alerts: boolean;
  low_alerts: boolean;
  phone_number?: string;
  whatsapp_number?: string;
  created_at: string;
  updated_at: string;
}

export interface RuleStatistics {
  total: number;
  enabled: number;
  disabled: number;
  by_severity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

export interface AlertStatistics {
  total: number;
  active: number;
  acknowledged: number;
  resolved: number;
  by_severity: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

// Request types
export interface CreateRuleRequest {
  name: string;
  description: string;
  equipment: number;
  parameter_key: string;
  variable_key: string;
  operator: Operator;
  threshold: number;
  unit?: string;
  duration?: number;  // Backend usa 'duration' (minutos de cooldown)
  severity: Severity;
  actions: NotificationAction[];
  enabled?: boolean;
}

export interface UpdateRuleRequest extends Partial<CreateRuleRequest> {}

export interface AcknowledgeAlertRequest {
  notes?: string;
}

export interface ResolveAlertRequest {
  notes?: string;
}

export interface UpdatePreferencesRequest {
  email_enabled?: boolean;
  push_enabled?: boolean;
  sound_enabled?: boolean;
  sms_enabled?: boolean;
  whatsapp_enabled?: boolean;
  critical_alerts?: boolean;
  high_alerts?: boolean;
  medium_alerts?: boolean;
  low_alerts?: boolean;
  phone_number?: string;
  whatsapp_number?: string;
}

// Query params
export interface RuleListParams {
  enabled?: boolean;
  severity?: Severity;
  equipment_id?: number;
  page?: number;
  page_size?: number;
}

export interface AlertListParams {
  status?: AlertStatus;
  severity?: Severity;
  rule_id?: number;
  asset_tag?: string;
  page?: number;
  page_size?: number;
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Rules API
 */
export const rulesApi = {
  /**
   * List all rules with optional filters
   */
  list: async (params?: RuleListParams) => {
    const response = await api.get<{ results: Rule[]; count: number }>('/alerts/rules/', {
      params,
    });
    return response.data;
  },

  /**
   * Get a single rule by ID
   */
  get: async (id: number) => {
    const response = await api.get<Rule>(`/alerts/rules/${id}/`);
    return response.data;
  },

  /**
   * Create a new rule
   */
  create: async (data: CreateRuleRequest) => {
    const response = await api.post<Rule>('/alerts/rules/', data);
    return response.data;
  },

  /**
   * Update an existing rule
   */
  update: async (id: number, data: UpdateRuleRequest) => {
    const response = await api.put<Rule>(`/alerts/rules/${id}/`, data);
    return response.data;
  },

  /**
   * Partially update a rule
   */
  patch: async (id: number, data: UpdateRuleRequest) => {
    const response = await api.patch<Rule>(`/alerts/rules/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a rule
   */
  delete: async (id: number) => {
    await api.delete(`/alerts/rules/${id}/`);
  },

  /**
   * Toggle rule enabled status
   */
  toggleStatus: async (id: number) => {
    const response = await api.post<Rule>(`/alerts/rules/${id}/toggle_status/`);
    return response.data;
  },

  /**
   * Get rule statistics
   */
  statistics: async () => {
    const response = await api.get<RuleStatistics>('/alerts/rules/statistics/');
    return response.data;
  },
};

/**
 * Alerts API
 */
export const alertsApi = {
  /**
   * List all alerts with optional filters
   */
  list: async (params?: AlertListParams) => {
    const response = await api.get<{ results: Alert[]; count: number }>('/alerts/alerts/', {
      params,
    });
    return response.data;
  },

  /**
   * Get a single alert by ID
   */
  get: async (id: number) => {
    const response = await api.get<Alert>(`/alerts/alerts/${id}/`);
    return response.data;
  },

  /**
   * Acknowledge an alert
   */
  acknowledge: async (id: number, data?: AcknowledgeAlertRequest) => {
    const response = await api.post<Alert>(`/alerts/alerts/${id}/acknowledge/`, data || {});
    return response.data;
  },

  /**
   * Resolve an alert
   */
  resolve: async (id: number, data?: ResolveAlertRequest) => {
    const response = await api.post<Alert>(`/alerts/alerts/${id}/resolve/`, data || {});
    return response.data;
  },

  /**
   * Get alert statistics
   */
  statistics: async () => {
    const response = await api.get<AlertStatistics>('/alerts/alerts/statistics/');
    return response.data;
  },
};

/**
 * Notification Preferences API
 */
export const preferencesApi = {
  /**
   * Get current user's notification preferences
   */
  getMe: async () => {
    const response = await api.get<NotificationPreference>('/alerts/notification-preferences/me/');
    return response.data;
  },

  /**
   * Update current user's notification preferences (full update)
   */
  updateMe: async (data: UpdatePreferencesRequest) => {
    const response = await api.put<NotificationPreference>('/alerts/notification-preferences/me/', data);
    return response.data;
  },

  /**
   * Partially update current user's notification preferences
   */
  patchMe: async (data: UpdatePreferencesRequest) => {
    const response = await api.patch<NotificationPreference>('/alerts/notification-preferences/me/', data);
    return response.data;
  },
};
