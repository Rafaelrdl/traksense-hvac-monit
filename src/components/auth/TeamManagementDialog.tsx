import React, { useState } from 'react';
import { useAuthStore } from '../../store/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Mail, 
  UserPlus, 
  Shield, 
  Trash2, 
  Search,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinedAt: Date;
  site?: string;
}

interface PendingInvite {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  invitedAt: Date;
  invitedBy: string;
}

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeamManagementDialog: React.FC<TeamManagementDialogProps> = ({ open, onOpenChange }) => {
  const user = useAuthStore(state => state.user);
  
  // Mock data - substituir com dados reais da API
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Admin TrakSense',
      email: 'admin@traksense.com',
      role: 'admin',
      status: 'active',
      joinedAt: new Date('2024-01-15'),
      site: 'Data Center Principal'
    },
    {
      id: '2',
      name: 'João Silva',
      email: 'joao@traksense.com',
      role: 'operator',
      status: 'active',
      joinedAt: new Date('2024-03-20'),
      site: 'Data Center Principal'
    },
    {
      id: '3',
      name: 'Maria Santos',
      email: 'maria@traksense.com',
      role: 'viewer',
      status: 'active',
      joinedAt: new Date('2024-05-10'),
      site: 'Data Center Secundário'
    }
  ]);

  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([
    {
      id: 'inv-1',
      email: 'novo@traksense.com',
      role: 'operator',
      invitedAt: new Date('2024-10-01'),
      invitedBy: 'Admin TrakSense'
    }
  ]);

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'viewer' as 'admin' | 'operator' | 'viewer',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast.error('Email inválido', {
        description: 'Por favor, insira um email válido.',
      });
      return;
    }

    // Verificar se já existe
    const emailExists = teamMembers.some(member => member.email === inviteData.email);
    const inviteExists = pendingInvites.some(invite => invite.email === inviteData.email);

    if (emailExists || inviteExists) {
      toast.error('Email já cadastrado', {
        description: 'Este email já está na equipe ou possui convite pendente.',
      });
      return;
    }

    // Adicionar convite pendente
    const newInvite: PendingInvite = {
      id: `inv-${Date.now()}`,
      email: inviteData.email,
      role: inviteData.role,
      invitedAt: new Date(),
      invitedBy: user?.name || 'Você'
    };

    setPendingInvites([...pendingInvites, newInvite]);

    toast.success('Convite enviado!', {
      description: `Um convite foi enviado para ${inviteData.email}`,
    });

    // Limpar formulário
    setInviteData({ email: '', role: 'viewer' });
  };

  const handleChangeRole = (memberId: string, newRole: 'admin' | 'operator' | 'viewer') => {
    setTeamMembers(teamMembers.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    ));

    toast.success('Permissão atualizada', {
      description: 'As permissões do membro foram alteradas.',
    });
  };

  const handleRemoveMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    
    if (member?.id === user?.id) {
      toast.error('Ação não permitida', {
        description: 'Você não pode remover sua própria conta.',
      });
      return;
    }

    setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    
    toast.success('Membro removido', {
      description: `${member?.name} foi removido da equipe.`,
    });
  };

  const handleCancelInvite = (inviteId: string) => {
    setPendingInvites(pendingInvites.filter(inv => inv.id !== inviteId));
    
    toast.success('Convite cancelado', {
      description: 'O convite foi cancelado.',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'operator': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'operator': return 'Operador';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || user.role !== 'admin') return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5 text-primary" />
            Gerenciar Equipe
          </DialogTitle>
          <DialogDescription>
            Convide membros, gerencie permissões e controle o acesso à plataforma.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">
              Membros ({teamMembers.length})
            </TabsTrigger>
            <TabsTrigger value="invite">
              Convidar
              {pendingInvites.length > 0 && (
                <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-xs">
                  {pendingInvites.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab: Membros da Equipe */}
          <TabsContent value="members" className="space-y-4 mt-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar membros por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Separator />

            {/* Members List */}
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum membro encontrado</p>
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{member.name}</p>
                          {member.id === user.id && (
                            <Badge variant="secondary" className="text-xs">Você</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        {member.site && (
                          <p className="text-xs text-muted-foreground mt-0.5">{member.site}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(value: any) => handleChangeRole(member.id, value)}
                          disabled={member.id === user.id}
                        >
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">
                              <div className="flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                Administrador
                              </div>
                            </SelectItem>
                            <SelectItem value="operator">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Operador
                              </div>
                            </SelectItem>
                            <SelectItem value="viewer">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                Visualizador
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={member.id === user.id}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remover da equipe
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Tab: Convidar Membros */}
          <TabsContent value="invite" className="space-y-4 mt-4">
            {/* Invite Form */}
            <form onSubmit={handleInviteMember} className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Email do Membro
                </Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="membro@empresa.com"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inviteRole" className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Nível de Permissão
                </Label>
                <Select
                  value={inviteData.role}
                  onValueChange={(value: any) => setInviteData({ ...inviteData, role: value })}
                >
                  <SelectTrigger id="inviteRole" className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex flex-col items-start py-1">
                        <span className="font-medium">Administrador</span>
                        <span className="text-xs text-muted-foreground">Acesso total ao sistema</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="operator">
                      <div className="flex flex-col items-start py-1">
                        <span className="font-medium">Operador</span>
                        <span className="text-xs text-muted-foreground">Pode visualizar e gerenciar alertas</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex flex-col items-start py-1">
                        <span className="font-medium">Visualizador</span>
                        <span className="text-xs text-muted-foreground">Apenas visualização</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full gap-2">
                <UserPlus className="w-4 h-4" />
                Enviar Convite
              </Button>
            </form>

            <Separator />

            {/* Pending Invites */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Convites Pendentes ({pendingInvites.length})
              </h4>

              {pendingInvites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum convite pendente</p>
                </div>
              ) : (
                <ScrollArea className="h-[250px]">
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{invite.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getRoleBadgeVariant(invite.role)} className="text-xs">
                              {getRoleLabel(invite.role)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Convidado por {invite.invitedBy}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {invite.invitedAt.toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCancelInvite(invite.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
