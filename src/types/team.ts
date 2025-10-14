export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: Date;
  avatar?: string;
}

export interface TeamInvite {
  id: string;
  teamId: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  token: string;
  invitedBy: string;
  invitedByName: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
}
