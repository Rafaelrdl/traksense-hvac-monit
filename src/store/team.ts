import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Team, TeamMember, TeamInvite } from '@/types/team';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  invites: TeamInvite[];
  isLoading: boolean;
  
  // Actions
  setCurrentTeam: (team: Team | null) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updates: Partial<Team>) => void;
  removeTeam: (teamId: string) => void;
  
  // Member actions
  addMember: (teamId: string, member: TeamMember) => void;
  updateMember: (teamId: string, memberId: string, updates: Partial<TeamMember>) => void;
  removeMember: (teamId: string, memberId: string) => void;
  
  // Invite actions
  addInvite: (invite: TeamInvite) => void;
  updateInviteStatus: (inviteId: string, status: TeamInvite['status']) => void;
  removeInvite: (inviteId: string) => void;
  getTeamInvites: (teamId: string) => TeamInvite[];
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: [],
      currentTeam: null,
      invites: [],
      isLoading: false,

      setCurrentTeam: (team) => set({ currentTeam: team }),

      addTeam: (team) => set((state) => ({
        teams: [...state.teams, team]
      })),

      updateTeam: (teamId, updates) => set((state) => ({
        teams: state.teams.map((t) => 
          t.id === teamId ? { ...t, ...updates } : t
        ),
        currentTeam: state.currentTeam?.id === teamId
          ? { ...state.currentTeam, ...updates }
          : state.currentTeam
      })),

      removeTeam: (teamId) => set((state) => ({
        teams: state.teams.filter((t) => t.id !== teamId),
        currentTeam: state.currentTeam?.id === teamId ? null : state.currentTeam
      })),

      addMember: (teamId, member) => set((state) => ({
        teams: state.teams.map((t) =>
          t.id === teamId
            ? { ...t, members: [...t.members, member] }
            : t
        ),
        currentTeam: state.currentTeam?.id === teamId
          ? { ...state.currentTeam, members: [...state.currentTeam.members, member] }
          : state.currentTeam
      })),

      updateMember: (teamId, memberId, updates) => set((state) => ({
        teams: state.teams.map((t) =>
          t.id === teamId
            ? {
                ...t,
                members: t.members.map((m) =>
                  m.id === memberId ? { ...m, ...updates } : m
                )
              }
            : t
        ),
        currentTeam: state.currentTeam?.id === teamId
          ? {
              ...state.currentTeam,
              members: state.currentTeam.members.map((m) =>
                m.id === memberId ? { ...m, ...updates } : m
              )
            }
          : state.currentTeam
      })),

      removeMember: (teamId, memberId) => set((state) => ({
        teams: state.teams.map((t) =>
          t.id === teamId
            ? { ...t, members: t.members.filter((m) => m.id !== memberId) }
            : t
        ),
        currentTeam: state.currentTeam?.id === teamId
          ? {
              ...state.currentTeam,
              members: state.currentTeam.members.filter((m) => m.id !== memberId)
            }
          : state.currentTeam
      })),

      addInvite: (invite) => set((state) => ({
        invites: [...state.invites, invite]
      })),

      updateInviteStatus: (inviteId, status) => set((state) => ({
        invites: state.invites.map((inv) =>
          inv.id === inviteId ? { ...inv, status } : inv
        )
      })),

      removeInvite: (inviteId) => set((state) => ({
        invites: state.invites.filter((inv) => inv.id !== inviteId)
      })),

      getTeamInvites: (teamId) => {
        return get().invites.filter((inv) => inv.teamId === teamId);
      }
    }),
    {
      name: 'ts:teams',
      partialize: (state) => ({
        teams: state.teams,
        currentTeam: state.currentTeam,
        invites: state.invites
      })
    }
  )
);

// Helper para inicializar equipe demo se não existir
export function initializeDemoTeam(userId: string, userName: string, userEmail: string) {
  const store = useTeamStore.getState();
  
  if (store.teams.length === 0) {
    const demoTeam: Team = {
      id: 'team-1',
      name: 'Equipe Principal',
      description: 'Equipe de monitoramento HVAC',
      createdAt: new Date(),
      members: [
        {
          id: 'member-1',
          userId,
          teamId: 'team-1',
          name: userName,
          email: userEmail,
          role: 'ADMIN',
          joinedAt: new Date()
        }
      ]
    };
    
    store.addTeam(demoTeam);
    store.setCurrentTeam(demoTeam);
  }
}
