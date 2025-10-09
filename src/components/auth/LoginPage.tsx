import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Lock, Mail, Building2, Users, Activity, AlertCircle } from 'lucide-react';
import { useAuthStore, getDemoUsers } from '../../store/auth';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  
  const { login, isLoading, error, clearError } = useAuthStore();
  const demoUsers = getDemoUsers();

  useEffect(() => {
    // Clear any existing error when component mounts
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const success = await login(email, password);
    
    if (success) {
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Falha no login. Verifique suas credenciais.');
    }
  };

  const handleDemoLogin = (demoEmail: string, role: string) => {
    setEmail(demoEmail);
    const passwords: Record<string, string> = {
      admin: 'admin123',
      operator: 'operator123',
      technician: 'tech123',
      viewer: 'viewer123'
    };
    setPassword(passwords[role] || 'demo123');
    setShowDemoUsers(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'operator': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'technician': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Users className="w-4 h-4" />;
      case 'operator': return <Activity className="w-4 h-4" />;
      case 'technician': return <Lock className="w-4 h-4" />;
      case 'viewer': return <Eye className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4FAFB] via-[#EDF7F8] to-[#E6F4F5] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-[#076A75] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#1A7983] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#2E868F] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-[#076A75] rounded-2xl flex items-center justify-center shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#0b3a3f]">TrakSense</h1>
            <p className="text-[#3c5b5f] mt-2">
              Monitoramento HVAC em tempo real
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-[#0b3a3f]">
              Acesse sua conta
            </h2>
            
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0b3a3f]">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#609DA3]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 border-[#93BDC2] focus:border-[#076A75] focus:ring-[#076A75]/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#0b3a3f]">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#609DA3]" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 border-[#93BDC2] focus:border-[#076A75] focus:ring-[#076A75]/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#609DA3] hover:text-[#076A75] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-[#076A75] hover:bg-[#056A75] text-white font-medium py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </div>
                ) : (
                  'Entrar'
                )}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#B7C9CA]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-[#3c5b5f]">ou</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDemoUsers(!showDemoUsers)}
                className="w-full border-[#93BDC2] text-[#076A75] hover:bg-[#076A75]/5 hover:border-[#076A75] transition-all duration-200"
              >
                {showDemoUsers ? 'Ocultar' : 'Ver'} contas de demonstração
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Users */}
        {showDemoUsers && (
          <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <h3 className="text-lg font-semibold text-[#0b3a3f]">
                Contas de Demonstração
              </h3>
              <p className="text-sm text-[#3c5b5f]">
                Clique em uma conta para preencher automaticamente
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {demoUsers.map((user) => (
                <button
                  key={user.email}
                  onClick={() => handleDemoLogin(user.email, user.role)}
                  className="w-full p-3 rounded-lg border border-[#B7C9CA] hover:border-[#076A75] hover:bg-[#076A75]/5 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#076A75]/10 rounded-full flex items-center justify-center group-hover:bg-[#076A75]/20 transition-colors">
                        {getRoleIcon(user.role)}
                      </div>
                      <div>
                        <div className="font-medium text-[#0b3a3f]">{user.name}</div>
                        <div className="text-sm text-[#3c5b5f]">{user.email}</div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Building2 className="w-3 h-3 text-[#609DA3]" />
                          <span className="text-xs text-[#609DA3]">{user.site}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getRoleColor(user.role)} capitalize`}>
                      {user.role === 'technician' ? 'técnico' : 
                       user.role === 'operator' ? 'operador' :
                       user.role === 'viewer' ? 'visualizador' : user.role}
                    </Badge>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-[#3c5b5f]">
          <p>
            © 2024 TrakSense. Transformando dados HVAC em decisões.
          </p>
        </div>
      </div>
    </div>
  );
};