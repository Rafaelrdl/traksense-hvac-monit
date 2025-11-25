import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveAlertsQuery } from './useAlertsQuery';
import { useNotifications } from '@/store/notifications';
import type { Alert } from '@/services/api/alerts';

/**
 * Hook que sincroniza alertas ativos com o sistema de notificações.
 * 
 * Este hook:
 * 1. Monitora alertas ativos via polling (10s)
 * 2. Detecta novos alertas comparando com os anteriores
 * 3. Cria notificações para cada novo alerta
 * 4. Evita duplicatas usando um Set de IDs já notificados
 * 5. Na primeira carga, sincroniza alertas existentes como notificações
 * 
 * Deve ser usado uma única vez no App ou Header.
 */
export function useAlertNotifications() {
  const { data: alerts = [], isSuccess } = useActiveAlertsQuery();
  const { add: addNotification, items: existingNotifications } = useNotifications();
  const queryClient = useQueryClient();
  
  // Manter registro de alertas já notificados (por sessão)
  const notifiedAlertIds = useRef<Set<number>>(new Set());
  
  // Manter registro dos alertas anteriores para comparação
  const previousAlertsRef = useRef<Alert[]>([]);
  
  // Flag para sincronização inicial
  const hasInitialSync = useRef(false);

  useEffect(() => {
    if (!isSuccess || !alerts.length) return;
    
    const activeAlerts = alerts.filter(a => a.is_active && !a.acknowledged);
    
    // Sincronização inicial: se não há notificações e há alertas ativos
    if (!hasInitialSync.current && existingNotifications.length === 0 && activeAlerts.length > 0) {
      console.log(`🔔 Sincronização inicial: ${activeAlerts.length} alerta(s) ativo(s)`);
      
      // Limitar a 10 alertas mais recentes para não sobrecarregar
      const recentAlerts = activeAlerts.slice(0, 10);
      
      recentAlerts.forEach(alert => {
        const severity = mapSeverity(alert.severity);
        
        addNotification({
          title: alert.rule_name || 'Alerta Ativo',
          message: alert.message || `Alerta em ${alert.equipment_name || alert.asset_tag}`,
          severity,
        });
        
        notifiedAlertIds.current.add(alert.id);
      });
      
      hasInitialSync.current = true;
      previousAlertsRef.current = alerts;
      return;
    }
    
    // Detectar novos alertas após a sincronização inicial
    if (hasInitialSync.current) {
      const previousIds = new Set(previousAlertsRef.current.map(a => a.id));
      
      const newAlerts = activeAlerts.filter(alert => 
        !previousIds.has(alert.id) && 
        !notifiedAlertIds.current.has(alert.id)
      );
      
      if (newAlerts.length > 0) {
        console.log(`🔔 ${newAlerts.length} novo(s) alerta(s) detectado(s):`, newAlerts.map(a => a.id));
        
        newAlerts.forEach(alert => {
          const severity = mapSeverity(alert.severity);
          
          addNotification({
            title: alert.rule_name || 'Novo Alerta',
            message: alert.message || `Alerta em ${alert.equipment_name || alert.asset_tag}`,
            severity,
          });
          
          notifiedAlertIds.current.add(alert.id);
        });
      }
    }
    
    // Atualizar referência dos alertas anteriores
    previousAlertsRef.current = alerts;
    
  }, [alerts, isSuccess, addNotification, existingNotifications.length]);

  // Retornar contagem para uso se necessário
  return {
    activeAlertsCount: alerts.filter(a => a.is_active && !a.acknowledged).length,
    totalAlertsCount: alerts.length,
  };
}

/**
 * Mapear severity da API para o formato de notificação
 */
function mapSeverity(severity?: string): 'info' | 'warning' | 'critical' {
  const s = (severity || '').toLowerCase();
  
  if (s.includes('critical') || s === 'critical') {
    return 'critical';
  }
  if (s.includes('high') || s === 'high' || s.includes('alto') || s === 'alto') {
    return 'warning';
  }
  if (s.includes('medium') || s === 'medium' || s.includes('médio') || s === 'medio') {
    return 'warning';
  }
  
  return 'info';
}
