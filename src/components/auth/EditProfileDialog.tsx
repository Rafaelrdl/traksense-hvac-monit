import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/auth';
import { authService } from '../../services/auth.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Building, 
  UserCog, 
  Phone, 
  Camera, 
  Upload, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cropToSquare, validateImageFile } from '@/lib/image-crop';
import { getInitials } from '@/lib/get-initials';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ open, onOpenChange }) => {
  const user = useAuthStore(state => state.user);
  const updateUserProfile = useAuthStore(state => state.updateUserProfile);
  const uploadAvatar = useAuthStore(state => state.uploadAvatar);
  const removeAvatar = useAuthStore(state => state.removeAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [hasAvatarChanged, setHasAvatarChanged] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Sync form data when user changes or dialog opens
  useEffect(() => {
    if (user) {
      // Parse full_name into first_name and last_name
      const fullName = user.full_name || user.name || '';
      const nameParts = fullName.split(' ');
      const firstName = user.first_name || nameParts[0] || '';
      const lastName = user.last_name || nameParts.slice(1).join(' ') || '';

      setFormData({
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
      });
      
      // Use backend avatar URL or legacy photoUrl
      const avatarUrl = user.avatar || user.photoUrl || null;
      setAvatarPreview(avatarUrl);
      setAvatarFile(null);
      setHasAvatarChanged(false);
    }
  }, [user, open]);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // 1. Upload avatar if changed
      if (hasAvatarChanged && avatarFile) {
        await uploadAvatar(avatarFile);
        toast.success('Avatar atualizado!');
      } else if (hasAvatarChanged && !avatarPreview) {
        // Avatar was removed
        await removeAvatar();
        toast.success('Avatar removido!');
      }

      // 2. Update profile data
      const updates: any = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone || null,
        bio: formData.bio || null,
      };

      await updateUserProfile(updates);
      
      toast.success('Perfil atualizado com sucesso!', {
        description: 'Suas informações foram salvas.',
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil', {
        description: error.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isChangingPassword) return;

    // Validação de senha
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem', {
        description: 'Por favor, verifique as senhas digitadas.',
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Senha muito curta', {
        description: 'A senha deve ter no mínimo 8 caracteres.',
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      await authService.changePassword({
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirm: passwordData.confirmPassword,
      });
      
      toast.success('Senha alterada com sucesso!', {
        description: 'Sua senha foi atualizada.',
      });

      // Limpar campos
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha', {
        description: error.message || 'Verifique sua senha atual e tente novamente.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validar arquivo
    const validation = validateImageFile(file, 5);
    if (!validation.valid) {
      toast.error('Erro ao carregar imagem', {
        description: validation.error,
      });
      return;
    }

    setIsProcessingImage(true);

    try {
      // Aplicar crop quadrado centralizado
      const croppedDataUrl = await cropToSquare(file, 256);
      
      // Create a new File from the data URL
      const blob = await (await fetch(croppedDataUrl)).blob();
      const croppedFile = new File([blob], file.name, { type: file.type });
      
      setAvatarPreview(croppedDataUrl);
      setAvatarFile(croppedFile);
      setHasAvatarChanged(true);
      
      toast.success('Foto processada com sucesso', {
        description: 'Clique em "Salvar Alterações" para confirmar.',
      });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast.error('Erro ao processar imagem', {
        description: 'Tente novamente com outra foto.',
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setHasAvatarChanged(true);
    toast.info('Avatar será removido ao salvar');
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UserCog className="w-5 h-5 text-primary" />
            Editar Perfil
          </DialogTitle>
          <DialogDescription>
            Atualize suas informações pessoais e de segurança.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Informações Pessoais</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          {/* Tab: Informações Pessoais */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit}>
              {/* Avatar Section */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-primary/10">
                    {avatarPreview ? (
                      <AvatarImage 
                        src={avatarPreview} 
                        alt={user.name}
                        className="object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/20 text-primary text-2xl font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={isProcessingImage}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isProcessingImage ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isProcessingImage}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 gap-2"
                    onClick={handleAvatarClick}
                    disabled={isProcessingImage}
                  >
                    {isProcessingImage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Escolher Foto
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG ou GIF • Máximo 5MB • Crop automático 1:1
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Nome
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Seu primeiro nome"
                    className="h-11"
                    required
                  />
                </div>

                {/* Sobrenome */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    Sobrenome
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Seu sobrenome"
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="h-11"
                    required
                  />
                </div>

                {/* Celular/Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Celular
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usado para notificações e recuperação de conta
                  </p>
                </div>

                {/* Bio/Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Sobre você
                  </Label>
                  <Input
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Breve descrição sobre você"
                    className="h-11"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Tab: Segurança */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Escolha uma senha forte com no mínimo 8 caracteres, incluindo letras, números e símbolos.
              </AlertDescription>
            </Alert>

            <form onSubmit={handlePasswordChange}>
              <div className="space-y-4">
                {/* Senha Atual */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Senha Atual
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Digite sua senha atual"
                      className="h-11 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Digite a nova senha"
                      className="h-11 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordData.newPassword && passwordData.newPassword.length < 8 && (
                    <p className="text-xs text-destructive">
                      A senha deve ter no mínimo 8 caracteres
                    </p>
                  )}
                </div>

                {/* Confirmar Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirme a nova senha"
                      className="h-11 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-destructive">
                      As senhas não coincidem
                    </p>
                  )}
                </div>

                {/* Password Strength Indicator */}
                {passwordData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordData.newPassword.length >= level * 2
                              ? level <= 2 ? 'bg-red-500' : level === 3 ? 'bg-yellow-500' : 'bg-green-500'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Força da senha: {
                        passwordData.newPassword.length < 6 ? 'Fraca' :
                        passwordData.newPassword.length < 8 ? 'Média' :
                        passwordData.newPassword.length < 12 ? 'Boa' : 'Forte'
                      }
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  disabled={isChangingPassword}
                >
                  Limpar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={
                    isChangingPassword ||
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword ||
                    passwordData.newPassword !== passwordData.confirmPassword ||
                    passwordData.newPassword.length < 8
                  }
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    'Alterar Senha'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
