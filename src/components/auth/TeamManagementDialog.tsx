import React, { useState, useEffect } from 'react';
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
  XCircle,
  Loader2,
  Eye,
  Wrench,
  Key,
  Crown
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
import { getInitials } from '@/lib/get-initials';
import teamService, { TeamMember, Invite } from '@/services/teamService';
import { RoleBadge } from '@/components/team/RoleBadge';
import { StatusBadge } from '@/components/team/StatusBadge';

interface TeamManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TeamManagementDialog: React.FC<TeamManagementDialogProps> = ({ open, onOpenChange }) => {
  const user = useAuthStore(state => state.user);
  
  // Estado real da API
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'viewer' as 'admin' | 'operator' | 'viewer',
    message: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Carregar dados quando o modal abre
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [members, invites] = await Promise.all([
        teamService.getMembers(),
        teamService.getInvites(),
      ]);
      
      // Garantir que sempre sejam arrays
      setTeamMembers(Array.isArray(members) ? members : []);
      setPendingInvites(Array.isArray(invites) ? invites : []);
    } catch (error: any) {
      console.error('Erro ao carregar dados da equipe:', error);
      setTeamMembers([]);
      setPendingInvites([]);
      toast.error('Erro ao carregar dados', {
        description: error.response?.data?.detail || 'Erro ao buscar dados da equipe',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteData.email)) {
      toast.error('Email inválido', {
        description: 'Por favor, insira um email válido.',
      });
      return;
    }

    setIsSendingInvite(true);

    try {
      await teamService.createInvite({
        email: inviteData.email,
        role: inviteData.role,
        message: inviteData.message || undefined,
      });

      toast.success('Convite enviado!', {
        description: `Um convite foi enviado para ${inviteData.email}`,
      });

      // Limpar formulário
      setInviteData({ email: '', role: 'viewer', message: '' });
      
      // Recarregar dados
      loadData();
      
    } catch (error: any) {
      toast.error('Erro ao enviar convite', {
        description: error.response?.data?.detail || error.response?.data?.email?.[0] || 'Erro desconhecido',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleChangeRole = async (memberId: number, newRole: 'owner' | 'admin' | 'operator' | 'viewer') => {
    try {
      await teamService.updateMember(memberId, { role: newRole });

      toast.success('Permissão atualizada', {
        description: 'As permissões do membro foram alteradas.',
      });

      loadData();
    } catch (error: any) {
      toast.error('Erro ao atualizar permissão', {
        description: error.response?.data?.detail || 'Erro desconhecido',
      });
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm(`Tem certeza que deseja remover ${member.user.full_name}?`)) return;
    
    try {
      await teamService.removeMember(member.id);
      
      toast.success('Membro removido', {
        description: `${member.user.full_name} foi removido da equipe.`,
      });

      loadData();
    } catch (error: any) {
      toast.error('Erro ao remover membro', {
        description: error.response?.data?.detail || 'Erro desconhecido',
      });
    }
  };

  const handleCancelInvite = async (inviteId: number) => {
    try {
      await teamService.cancelInvite(inviteId);
      
      toast.success('Convite cancelado', {
        description: 'O convite foi cancelado.',
      });

      loadData();
    } catch (error: any) {
      toast.error('Erro ao cancelar convite', {
        description: error.response?.data?.detail || 'Erro desconhecido',
      });
    }
  };

  const handleResendInvite = async (inviteId: number) => {
    try {
      await teamService.resendInvite(inviteId);
      
      toast.success('Convite reenviado!', {
        description: 'Um novo email foi enviado com o convite.',
      });
    } catch (error: any) {
      toast.error('Erro ao reenviar convite', {
        description: error.response?.data?.detail || 'Erro desconhecido',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'default';
      case 'operator': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Proprietário';
      case 'admin': return 'Administrador';
      case 'operator': return 'Operador';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Key;
      case 'operator': return Wrench;
      case 'viewer': return Eye;
      default: return Shield;
    }
  };

  const filteredMembers = Array.isArray(teamMembers) 
    ? teamMembers.filter(member =>
        member.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Verificação de permissão - apenas admin e owner podem gerenciar equipe
  if (!user || (user.role !== 'admin' && user.role !== 'owner')) return null;

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
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                  <p>Carregando membros...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhum membro encontrado</p>
                    </div>
                  ) : (
                    filteredMembers.map((member) => {
                      const RoleIcon = getRoleIcon(member.role);
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                              {getInitials(member.user.full_name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{member.user.full_name}</p>
                              {member.user.id === Number(user?.id) && (
                                <Badge variant="secondary" className="text-xs">Você</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <RoleBadge role={member.role} />
                              <StatusBadge status={member.status} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Select
                              value={member.role}
                              onValueChange={(value: any) => handleChangeRole(member.id, value)}
                              disabled={member.user.id === Number(user?.id)}
                            >
                              <SelectTrigger className="w-[140px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner">
                                  <div className="flex items-center gap-2">
                                    <Crown className="w-3 h-3" />
                                    Proprietário
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin">
                                  <div className="flex items-center gap-2">
                                    <Key className="w-3 h-3" />
                                    Administrador
                                  </div>
                                </SelectItem>
                                <SelectItem value="operator">
                                  <div className="flex items-center gap-2">
                                    <Wrench className="w-3 h-3" />
                                    Operador
                                  </div>
                                </SelectItem>
                                <SelectItem value="viewer">
                                  <div className="flex items-center gap-2">
                                    <Eye className="w-3 h-3" />
                                    Visualizador
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  aria-label="Ações do membro"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleRemoveMember(member)}
                                  disabled={member.user.id === Number(user?.id)}
                                  className="text-destructive focus:text-destructive gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remover da equipe
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
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

              <Button 
                type="submit" 
                className="w-full gap-2"
                disabled={isSendingInvite}
              >
                {isSendingInvite ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Enviar Convite
                  </>
                )}
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
                            <RoleBadge role={invite.role} />
                            <span className="text-xs text-muted-foreground">
                              Convidado por {invite.invited_by.full_name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvite(invite.id)}
                            className="h-8 text-xs"
                          >
                            Reenviar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelInvite(invite.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
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
