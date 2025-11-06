/**
 * Telemetry Service - FASE 3
 * 
 * Service para comunicação com os endpoints de telemetria do backend.
 * Endpoints: /api/telemetry/latest/, /history/, /device/.../summary/
 */

import { api } from '@/lib/api';
import {
  LatestReadingsResponse,
  DeviceHistoryResponse,
  DeviceSummaryResponse,
  HistoryQueryParams,
  TelemetryReading,
  TimeSeriesPoint,
  AggregationLevel,
} from '@/types/telemetry';
import {
  mapApiDeviceHistoryToFrontend,
  mapApiDeviceSummaryToFrontend,
  mapApiLatestReadingsToFrontend,
  mapApiReadingToFrontend,
  mapApiTimeSeriesPointToFrontend,
} from '@/lib/mappers/telemetryMapper';

/**
 * TelemetryService - Métodos para consumir API de telemetria.
 */
class TelemetryService {
  private baseUrl = '/telemetry';

  /**
   * GET /api/telemetry/latest/<device_id>/
   * Retorna últimas leituras de todos os sensores do device.
   * 
   * @param deviceId - Identificador do device (serial_number)
   * @param sensorId - (Opcional) Filtrar sensor específico
   * @returns Últimas leituras por sensor
   */
  async getLatest(
    deviceId: string,
    sensorId?: string
  ): Promise<LatestReadingsResponse> {
    const params = new URLSearchParams();
    if (sensorId) {
      params.append('sensor_id', sensorId);
    }

    const url = `${this.baseUrl}/latest/${deviceId}/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get<any>(url);
    return mapApiLatestReadingsToFrontend(response.data);
  }

  /**
   * GET /api/telemetry/history/<device_id>/
   * Retorna histórico temporal com agregação automática.
   * 
   * Backend escolhe agregação baseado no range:
   * - < 1h: raw data
   * - 1-6h: 1 minuto
   * - 6-24h: 5 minutos
   * - > 24h: 1 hora
   * 
   * @param params - Parâmetros de consulta
   * @returns Séries temporais agregadas
   */
  async getHistory(params: HistoryQueryParams): Promise<DeviceHistoryResponse> {
    // O backend espera 'from' e 'to' (ISO-8601) e 'interval' (opcional)
    const { deviceId, from, to, sensorId, interval } = params as any;
    
    const queryParams = new URLSearchParams();
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    
    // 🆕 Suportar múltiplos sensor_id (array ou string)
    if (sensorId) {
      if (Array.isArray(sensorId)) {
        // Múltiplos sensores: ?sensor_id=1&sensor_id=2
        sensorId.forEach((id: string) => queryParams.append('sensor_id', id));
      } else {
        // Sensor único
        queryParams.append('sensor_id', sensorId);
      }
    }
    
    if (interval) queryParams.append('interval', interval);

    const url = `${this.baseUrl}/history/${deviceId}/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get<any>(url);
    return mapApiDeviceHistoryToFrontend(response.data);
  }

  /**
   * GET /api/telemetry/device/<device_id>/summary/
   * Retorna resumo completo do device com estatísticas 24h.
   * 
   * @param deviceId - Identificador do device
   * @returns Resumo do device com status, sensores e estatísticas
   */
  async getDeviceSummary(deviceId: string): Promise<DeviceSummaryResponse> {
    const url = `${this.baseUrl}/device/${deviceId}/summary/`;
    const response = await api.get<any>(url);
    
    // Mapear response do backend (snake_case) para frontend (camelCase)
    return mapApiDeviceSummaryToFrontend(response.data);
  }

  /**
   * GET /api/telemetry/readings/
   * Endpoint existente - readings com filtros.
   * Útil para consultas customizadas.
   * 
   * @param filters - Filtros de consulta
   * @returns Lista de readings
   */
  async getReadings(filters?: {
    deviceId?: string;
    sensorId?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<{ results: TelemetryReading[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.deviceId) params.append('device_id', filters.deviceId);
    if (filters?.sensorId) params.append('sensor_id', filters.sensorId);
    if (filters?.from) params.append('ts_from', filters.from);
    if (filters?.to) params.append('ts_to', filters.to);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `${this.baseUrl}/readings/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get<{ results: any[]; count: number }>(url);
    const results = (response.data.results || []).map(mapApiReadingToFrontend);
    return {
      count: response.data.count,
      results,
    };
  }

  /**
   * GET /api/telemetry/series/
   * Endpoint existente - time-series agregado com bucket customizado.
   * 
   * @param filters - Filtros de agregação
   * @returns Pontos agregados
   */
  async getSeries(filters?: {
    deviceId?: string;
    sensorId?: string;
    bucket?: Exclude<AggregationLevel, 'raw'>;
    from?: string;
    to?: string;
  }): Promise<TimeSeriesPoint[]> {
    const params = new URLSearchParams();
    if (filters?.deviceId) params.append('device_id', filters.deviceId);
    if (filters?.sensorId) params.append('sensor_id', filters.sensorId);
    if (filters?.bucket) params.append('bucket', filters.bucket);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);

    const url = `${this.baseUrl}/series/${params.toString() ? '?' + params.toString() : ''}`;
    const response = await api.get<any>(url);
    const payload = Array.isArray(response.data) ? response.data : (response.data?.results ?? []);
    return payload.map(mapApiTimeSeriesPointToFrontend);
  }

  /**
   * GET /api/telemetry/assets/<asset_tag>/history/
   * Retorna histórico temporal usando asset_tag do MQTT (source of truth).
   * 
   * Esta é a forma PREFERIDA de buscar telemetria pois usa a hierarquia
   * do tópico MQTT (tenant/site/asset) que sempre está presente e correta,
   * ao invés de depender do device_mqtt_client_id que pode estar vazio.
   * 
   * @param assetTag - Tag do asset (ex: CHILLER-001)
   * @param hours - Número de horas de histórico
   * @param sensorIds - (Opcional) Array de sensor IDs para filtrar
   * @returns Histórico temporal
   */
  async getHistoryByAsset(
    assetTag: string,
    hours: number = 24,
    sensorIds?: string[]
  ): Promise<DeviceHistoryResponse> {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
    
    // Determinar intervalo de agregação baseado no período
    let interval: string;
    if (hours < 1) {
      interval = 'raw';
    } else if (hours <= 6) {
      interval = '1m';
    } else if (hours <= 24) {
      interval = '5m';
    } else if (hours <= 168) {
      interval = '15m';
    } else {
      interval = '1h';
    }
    
    const queryParams = new URLSearchParams();
    queryParams.append('from', start.toISOString());
    queryParams.append('to', end.toISOString());
    queryParams.append('interval', interval);
    
    // Adicionar sensor_id múltiplos vezes se houver array
    if (sensorIds && sensorIds.length > 0) {
      sensorIds.forEach(id => queryParams.append('sensor_id', id));
    }

    const url = `${this.baseUrl}/assets/${assetTag}/history/?${queryParams.toString()}`;
    const response = await api.get<any>(url);
    return mapApiDeviceHistoryToFrontend(response.data);
  }

  /**
   * Helper: Obter histórico das últimas N horas.
   * Conveniência para chamadas comuns.
   * 
   * @param deviceId - Identificador do device
   * @param hours - Número de horas (default: 24)
   * @param sensorId - (Opcional) Filtrar sensor específico
   * @returns Histórico temporal
   */
  async getHistoryLastHours(
    deviceId: string,
    hours: number = 24,
    sensorId?: string
  ): Promise<DeviceHistoryResponse> {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000);

    return this.getHistory({
      deviceId,
      from: start.toISOString(),
      to: end.toISOString(),
      sensorId,
    });
  }

  /**
   * Helper: Polling para auto-refresh.
   * Retorna função de cleanup para cancelar polling.
   * 
   * @param deviceId - Device a monitorar
   * @param callback - Função chamada a cada atualização
   * @param intervalMs - Intervalo em milissegundos (default: 30000 = 30s)
   * @returns Função de cleanup
   */
  startPolling(
    deviceId: string,
    callback: (data: LatestReadingsResponse) => void,
    intervalMs: number = 30000
  ): () => void {
    // Fazer primeira requisição imediatamente
    this.getLatest(deviceId)
      .then(callback)
      .catch(error => {
        console.error('Telemetry polling error:', error);
      });

    // Configurar intervalo
    const intervalId = setInterval(() => {
      this.getLatest(deviceId)
        .then(callback)
        .catch(error => {
          console.error('Telemetry polling error:', error);
        });
    }, intervalMs);

    // Retornar função de cleanup
    return () => clearInterval(intervalId);
  }

  /**
   * Helper: Verificar se device está online.
   * Considera online se última leitura < 5 minutos.
   * 
   * @param deviceId - Device a verificar
   * @returns true se online, false caso contrário
   */
  async isDeviceOnline(deviceId: string): Promise<boolean> {
    try {
      const summary = await this.getDeviceSummary(deviceId);
      
      if (!summary.lastSeen) return false;
      
      const lastSeen = new Date(summary.lastSeen);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastSeen.getTime()) / (1000 * 60);
      
      return diffMinutes < 5;
    } catch (error) {
      console.error('Error checking device status:', error);
      return false;
    }
  }

  /**
   * Helper: Obter múltiplos devices em paralelo.
   * Útil para dashboards com vários devices.
   * 
   * @param deviceIds - Lista de IDs dos devices
   * @returns Array de summaries (null se erro)
   */
  async getMultipleDeviceSummaries(
    deviceIds: string[]
  ): Promise<(DeviceSummaryResponse | null)[]> {
    const promises = deviceIds.map(id =>
      this.getDeviceSummary(id).catch(error => {
        console.error(`Error fetching summary for device ${id}:`, error);
        return null;
      })
    );

    return Promise.all(promises);
  }

  /**
   * Helper: Calcular estatísticas agregadas de múltiplos sensores.
   * Útil para overview de sites/assets.
   * 
   * @param summaries - Lista de device summaries
   * @returns Estatísticas agregadas
   */
  calculateAggregatedStats(summaries: DeviceSummaryResponse[]): {
    totalDevices: number;
    devicesOnline: number;
    totalSensors: number;
    sensorsOnline: number;
    totalReadings24h: number;
    avgReadingsPerDevice: number;
  } {
    const stats = summaries.reduce(
      (acc, summary) => {
        acc.totalDevices++;
        if (summary.status === 'ONLINE') acc.devicesOnline++;
        acc.totalSensors += summary.statistics.sensorsTotal;
        acc.sensorsOnline += summary.statistics.sensorsOnline;
        acc.totalReadings24h += summary.statistics.totalReadings24h;
        return acc;
      },
      {
        totalDevices: 0,
        devicesOnline: 0,
        totalSensors: 0,
        sensorsOnline: 0,
        totalReadings24h: 0,
        avgReadingsPerDevice: 0,
      }
    );

    stats.avgReadingsPerDevice =
      stats.totalDevices > 0
        ? Math.round(stats.totalReadings24h / stats.totalDevices)
        : 0;

    return stats;
  }
}

// Exportar instância singleton
export const telemetryService = new TelemetryService();
export default telemetryService;
