/**
 * Migration Script: localStorage → tenantStorage
 * 
 * Script para migrar dados do localStorage global
 * para o tenantStorage isolado por tenant.
 * 
 * Executar uma vez após implementar o sistema de multi-tenant.
 */

import { tenantStorage, migrateLegacyStorage } from '@/lib/tenantStorage';
import { getTenantConfig } from '@/lib/tenant';

/**
 * Lista de chaves a migrar do localStorage para tenantStorage
 */
const KEYS_TO_MIGRATE = [
  'access_token',
  'refresh_token',
  'user',
  'user_preferences',
  'sidebar:collapsed',
  'selected_site',
  'dashboard_widgets',
  // Adicionar outras chaves conforme necessário
];

/**
 * Executa migração
 */
export const runStorageMigration = (): void => {
  console.log('🔄 Iniciando migração de storage...');
  
  const config = getTenantConfig();
  console.log(`🏢 Tenant atual: ${config.tenantName} (${config.tenantSlug})`);
  
  // Verificar se já migrou (flag de migração)
  const migrationKey = 'storage_migration_completed_v1';
  if (localStorage.getItem(migrationKey)) {
    console.log('✅ Migração já foi executada anteriormente');
    return;
  }
  
  // Executar migração
  migrateLegacyStorage(KEYS_TO_MIGRATE);
  
  // Marcar como migrado
  localStorage.setItem(migrationKey, 'true');
  
  console.log('✅ Migração de storage concluída!');
  console.log(`📊 Tamanho do tenant storage: ${tenantStorage.size()} bytes`);
  console.log(`📋 Chaves migradas:`, tenantStorage.keys());
};

/**
 * Reverte migração (desenvolvimento/debug apenas)
 */
export const revertStorageMigration = (): void => {
  console.warn('⚠️ Revertendo migração de storage...');
  
  const keys = tenantStorage.keys();
  
  keys.forEach(key => {
    const value = tenantStorage.get(key);
    if (value !== null) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  });
  
  // Remove flag de migração
  localStorage.removeItem('storage_migration_completed_v1');
  
  console.log('✅ Migração revertida');
};
