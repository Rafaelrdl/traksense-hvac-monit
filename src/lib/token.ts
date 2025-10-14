/**
 * Gera um token aleatório criptograficamente seguro
 * @param bytes - Número de bytes aleatórios (padrão: 32)
 * @returns String hexadecimal do token gerado
 */
export function randomToken(bytes: number = 32): string {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera um token de convite de equipe
 * @returns Token único para convite
 */
export function generateInviteToken(): string {
  return randomToken(32);
}

/**
 * Gera um token de redefinição de senha
 * @returns Token único para reset de senha
 */
export function generatePasswordResetToken(): string {
  return randomToken(32);
}
