import type { TeamMember, Team } from '@/types/team';

/**
 * Verifica se um usuário é administrador de uma equipe
 * @param userId - ID do usuário a verificar
 * @param team - Equipe contendo lista de membros
 * @returns true se o usuário é admin, false caso contrário
 */
export function isTeamAdmin(userId: string, team: Team): boolean {
  if (!team || !team.members) return false;
  
  const member = team.members.find((m) => m.userId === userId);
  return member?.role === 'ADMIN';
}

/**
 * Verifica se um usuário pode gerenciar membros da equipe
 * @param userId - ID do usuário a verificar
 * @param team - Equipe a verificar
 * @returns true se tem permissão, false caso contrário
 */
export function canManageMembers(userId: string, team: Team): boolean {
  return isTeamAdmin(userId, team);
}

/**
 * Verifica se um usuário pode enviar convites
 * @param userId - ID do usuário a verificar
 * @param team - Equipe a verificar
 * @returns true se tem permissão, false caso contrário
 */
export function canSendInvites(userId: string, team: Team): boolean {
  return isTeamAdmin(userId, team);
}

/**
 * Verifica se um usuário pode redefinir senha de outro membro
 * @param userId - ID do usuário a verificar
 * @param team - Equipe a verificar
 * @returns true se tem permissão, false caso contrário
 */
export function canResetMemberPassword(userId: string, team: Team): boolean {
  return isTeamAdmin(userId, team);
}

/**
 * Formata o nome da role para exibição
 * @param role - Role a formatar
 * @returns Nome formatado em português
 */
export function formatRole(role: 'ADMIN' | 'MEMBER'): string {
  return role === 'ADMIN' ? 'Administrador' : 'Membro';
}
