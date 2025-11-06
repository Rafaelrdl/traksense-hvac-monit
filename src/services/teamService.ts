/**
 * Team Management Service - FASE 5
 * 
 * Service para gerenciar membros e convites de equipe.
 * Endpoints: /api/team/members/, /api/team/invites/
 */

import { api } from '@/lib/api';

// ============================================================================
// TYPES
// ============================================================================

export interface TeamMember {
  id: number;
  user: {
    id: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  role: 'owner' | 'admin' | 'operator' | 'viewer';
  status: 'active' | 'inactive' | 'suspended';
  invited_by: {
    id: number;
    email: string;
    full_name: string;
  } | null;
  joined_at: string;
  can_manage_team: boolean;
  can_write: boolean;
  can_delete_tenant: boolean;
}

export interface Invite {
  id: number;
  email: string;
  role: 'owner' | 'admin' | 'operator' | 'viewer';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  token: string;
  message?: string;
  invited_by: {
    id: number;
    email: string;
    full_name: string;
  };
  created_at: string;
  expires_at: string;
  accepted_at?: string;
  is_valid: boolean;
  is_expired: boolean;
}

export interface TeamStats {
  total_members: number;
  members_by_role: Record<string, number>;
  members_by_status: Record<string, number>;
  active_members?: number;
  pending_invites?: number;
}

export interface CreateInviteData {
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  message?: string;
}

export interface UpdateMemberData {
  role?: 'owner' | 'admin' | 'operator' | 'viewer';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface AcceptInviteData {
  token: string;
}

// ============================================================================
// SERVICE
// ============================================================================

class TeamService {
  private baseUrl = '/team';

  // --------------------------------------------------------------------------
  // MEMBERS
  // --------------------------------------------------------------------------

  /**
   * Lista todos os membros da equipe
   * GET /api/team/members/
   */
  async getMembers(): Promise<TeamMember[]> {
    const response = await api.get<{ results: TeamMember[] } | TeamMember[]>(`${this.baseUrl}/members/`);
    
    // DRF pode retornar paginado {results: [...]} ou array direto
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return response.data.results;
    }
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Busca detalhes de um membro específico
   * GET /api/team/members/{id}/
   */
  async getMember(id: number): Promise<TeamMember> {
    const response = await api.get<TeamMember>(`${this.baseUrl}/members/${id}/`);
    return response.data;
  }

  /**
   * Atualiza role ou status de um membro
   * PATCH /api/team/members/{id}/
   */
  async updateMember(id: number, data: UpdateMemberData): Promise<TeamMember> {
    const response = await api.patch<TeamMember>(`${this.baseUrl}/members/${id}/`, data);
    return response.data;
  }

  /**
   * Remove um membro da equipe (soft delete)
   * DELETE /api/team/members/{id}/
   */
  async removeMember(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/members/${id}/`);
  }

  /**
   * Busca estatísticas da equipe
   * GET /api/team/members/stats/
   */
  async getStats(): Promise<TeamStats> {
    const response = await api.get<any>(`${this.baseUrl}/members/stats/`);
    const data = response.data || {};

    const membersByStatus =
      data.members_by_status ?? {
        active: data.active_members ?? 0,
        inactive: (data.total_members ?? 0) - (data.active_members ?? 0),
        pending: data.pending_invites ?? 0,
      };

    return {
      total_members: data.total_members ?? 0,
      members_by_role: data.members_by_role ?? {},
      members_by_status: membersByStatus,
      active_members: data.active_members,
      pending_invites: data.pending_invites,
    };
  }

  // --------------------------------------------------------------------------
  // INVITES
  // --------------------------------------------------------------------------

  /**
   * Lista todos os convites
   * GET /api/team/invites/
   */
  async getInvites(): Promise<Invite[]> {
    const response = await api.get<{ results: Invite[] } | Invite[]>(`${this.baseUrl}/invites/`);
    
    // DRF pode retornar paginado {results: [...]} ou array direto
    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
      return response.data.results;
    }
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Cria um novo convite e envia email
   * POST /api/team/invites/
   */
  async createInvite(data: CreateInviteData): Promise<Invite> {
    const response = await api.post<Invite>(`${this.baseUrl}/invites/`, data);
    return response.data;
  }

  /**
   * Cancela um convite pendente
   * DELETE /api/team/invites/{id}/
   */
  async cancelInvite(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/invites/${id}/`);
  }

  /**
   * Reenvia email de convite
   * POST /api/team/invites/{id}/resend/
   */
  async resendInvite(id: number): Promise<Invite> {
    const response = await api.post<Invite>(`${this.baseUrl}/invites/${id}/resend/`);
    return response.data;
  }

  /**
   * Aceita um convite via token
   * POST /api/team/invites/accept/
   */
  async acceptInvite(data: AcceptInviteData): Promise<{ message: string; membership: TeamMember }> {
    const response = await api.post<{ message: string; membership: TeamMember }>(`${this.baseUrl}/invites/accept/`, data);
    return response.data;
  }
}

// Exportar instância singleton
export const teamService = new TeamService();
export default teamService;
