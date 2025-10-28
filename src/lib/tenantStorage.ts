/**
 * Tenant-Aware Storage System
 * 
 * Sistema de armazenamento que isola dados por tenant.
 * Cada tenant tem seu próprio namespace no localStorage.
 * 
 * Exemplo:
 * - Tenant UMC: "umc:access_token", "umc:user_preferences"
 * - Tenant ACME: "acme:access_token", "acme:user_preferences"
 */

import { getTenantConfig } from './tenant';

/**
 * Gera chave prefixada com tenant ID
 */
const getTenantKey = (key: string): string => {
  const { tenantSlug } = getTenantConfig();
  return `${tenantSlug}:${key}`;
};

/**
 * Storage isolado por tenant
 */
export const tenantStorage = {
  /**
   * Salva valor no localStorage do tenant atual
   */
  set: (key: string, value: any): void => {
    try {
      const tenantKey = getTenantKey(key);
      const serialized = JSON.stringify(value);
      localStorage.setItem(tenantKey, serialized);
      console.log(`💾 [${key}] Salvo no tenant storage`);
    } catch (error) {
      console.error(`❌ Erro ao salvar ${key}:`, error);
    }
  },

  /**
   * Obtém valor do localStorage do tenant atual
   */
  get: <T = any>(key: string): T | null => {
    try {
      const tenantKey = getTenantKey(key);
      const item = localStorage.getItem(tenantKey);
      
      if (item === null) {
        return null;
      }
      
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`❌ Erro ao ler ${key}:`, error);
      return null;
    }
  },

  /**
   * Remove valor do localStorage do tenant atual
   */
  remove: (key: string): void => {
    try {
      const tenantKey = getTenantKey(key);
      localStorage.removeItem(tenantKey);
      console.log(`🗑️ [${key}] Removido do tenant storage`);
    } catch (error) {
      console.error(`❌ Erro ao remover ${key}:`, error);
    }
  },

  /**
   * Verifica se chave existe no tenant atual
   */
  has: (key: string): boolean => {
    const tenantKey = getTenantKey(key);
    return localStorage.getItem(tenantKey) !== null;
  },

  /**
   * Lista todas as chaves do tenant atual
   */
  keys: (): string[] => {
    const { tenantSlug } = getTenantConfig();
    const prefix = `${tenantSlug}:`;
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }
    
    return keys;
  },

  /**
   * Limpa todos os dados do tenant atual
   */
  clear: (): void => {
    const { tenantSlug } = getTenantConfig();
    const prefix = `${tenantSlug}:`;
    const keysToRemove: string[] = [];
    
    // Coletar chaves para remover
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remover chaves
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`🗑️ Tenant storage limpo (${keysToRemove.length} itens removidos)`);
  },

  /**
   * Obtém tamanho aproximado do storage do tenant (em bytes)
   */
  size: (): number => {
    const { tenantSlug } = getTenantConfig();
    const prefix = `${tenantSlug}:`;
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        const value = localStorage.getItem(key);
        totalSize += (key.length + (value?.length || 0)) * 2; // UTF-16 = 2 bytes per char
      }
    }
    
    return totalSize;
  },
};

/**
 * Migration helper: Move dados do localStorage global para tenant storage
 * Útil para migrar dados existentes
 */
export const migrateLegacyStorage = (keys: string[]): void => {
  console.log('🔄 Migrando dados para tenant storage...');
  let migratedCount = 0;
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        // Parse e salva no tenant storage
        const parsed = JSON.parse(value);
        tenantStorage.set(key, parsed);
        
        // Remove da chave global (opcional, comentar se quiser manter backup)
        // localStorage.removeItem(key);
        
        migratedCount++;
      } catch {
        // Se não for JSON, salva como string
        tenantStorage.set(key, value);
        migratedCount++;
      }
    }
  });
  
  console.log(`✅ Migração concluída: ${migratedCount} itens migrados`);
};

/**
 * Helper: Backup de todos os dados do tenant
 */
export const backupTenantStorage = (): Record<string, any> => {
  const { tenantSlug } = getTenantConfig();
  const backup: Record<string, any> = {};
  const keys = tenantStorage.keys();
  
  keys.forEach(key => {
    backup[key] = tenantStorage.get(key);
  });
  
  console.log(`💾 Backup criado para tenant ${tenantSlug}: ${keys.length} itens`);
  return backup;
};

/**
 * Helper: Restaura backup
 */
export const restoreTenantStorage = (backup: Record<string, any>): void => {
  const { tenantSlug } = getTenantConfig();
  let restoredCount = 0;
  
  Object.entries(backup).forEach(([key, value]) => {
    tenantStorage.set(key, value);
    restoredCount++;
  });
  
  console.log(`✅ Backup restaurado para tenant ${tenantSlug}: ${restoredCount} itens`);
};
