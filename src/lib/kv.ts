/**
 * KV storage usando localStorage
 */

interface KVRecord {
  value: any;
  expiresAt?: number;
}

/**
 * Salva um valor no KV storage com TTL opcional
 * @param key - Chave para armazenar
 * @param value - Valor a ser armazenado
 * @param ttlSeconds - Tempo de vida em segundos (opcional)
 */
export async function kvSet(key: string, value: any, ttlSeconds?: number): Promise<void> {
  const record: KVRecord = {
    value,
    expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
  };
  
  try {
    localStorage.setItem(`kv:${key}`, JSON.stringify(record));
  } catch (error) {
    console.error('Erro ao salvar no KV:', error);
    throw error;
  }
}

/**
 * Recupera um valor do KV storage
 * @param key - Chave a buscar
 * @returns Valor armazenado ou null se não existir/expirado
 */
export async function kvGet<T = any>(key: string): Promise<T | null> {
  try {
    const stored = localStorage.getItem(`kv:${key}`);
    if (!stored) return null;
    
    const record: KVRecord = JSON.parse(stored);
    
    // Verificar expiração
    if (record.expiresAt && Date.now() > record.expiresAt) {
      await kvDelete(key);
      return null;
    }
    
    return record.value as T;
  } catch (error) {
    console.error('Erro ao recuperar do KV:', error);
    return null;
  }
}

/**
 * Remove um valor do KV storage
 * @param key - Chave a remover
 */
export async function kvDelete(key: string): Promise<void> {
  try {
    localStorage.removeItem(`kv:${key}`);
  } catch (error) {
    console.error('Erro ao deletar do KV:', error);
  }
}

/**
 * Salva token de convite no KV (7 dias)
 */
export async function saveInviteToken(
  token: string,
  data: { teamId: string; email: string; role: 'ADMIN' | 'MEMBER'; invitedBy: string }
): Promise<void> {
  const ttl = 7 * 24 * 60 * 60; // 7 dias em segundos
  await kvSet(`invite:${token}`, { ...data, createdAt: Date.now() }, ttl);
}

/**
 * Recupera dados de um token de convite
 */
export async function getInviteToken(token: string): Promise<{
  teamId: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  invitedBy: string;
  createdAt: number;
} | null> {
  return await kvGet(`invite:${token}`);
}

/**
 * Salva token de reset de senha no KV (1 hora)
 */
export async function savePasswordResetToken(
  token: string,
  data: { userId: string; email: string }
): Promise<void> {
  const ttl = 60 * 60; // 1 hora em segundos
  await kvSet(`reset:${token}`, { ...data, createdAt: Date.now() }, ttl);
}

/**
 * Recupera dados de um token de reset de senha
 */
export async function getPasswordResetToken(token: string): Promise<{
  userId: string;
  email: string;
  createdAt: number;
} | null> {
  return await kvGet(`reset:${token}`);
}
