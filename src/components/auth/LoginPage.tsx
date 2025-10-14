import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Building2, 
  Users, 
  Activity, 
  AlertCircle,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import logoImage from '@/assets/images/Logo-white.png';
import traksenseLogo from '@/assets/images/traksense-logo.svg';
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
    <div className="min-h-screen bg-gradient-to-br from-[#0A4952] via-[#076A75] to-[#0D5B64] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#2E868F] rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#1A7983] rounded-full blur-3xl opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-[#076A75] rounded-full blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md space-y-5">
        {/* Logo and Header - Unified Brand Block */}
        <div className="text-center animate-in fade-in slide-in-from-top duration-700">
          {/* Logo and Platform Name - Grouped together */}
          <div className="inline-flex flex-col items-center space-y-2 px-6 py-4 rounded-2xl bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm border border-white/10">
            {/* Climatrak Logo */}
            <div className="flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <img 
                src={logoImage} 
                alt="Climatrak Logo" 
                className="w-28 h-28 object-contain"
              />
            </div>
            
            {/* Subtle Divider */}
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            
            {/* Platform Name */}
            <div className="space-y-0.5">
              <img 
                src={traksenseLogo} 
                alt="TrakSense" 
                className="h-8 w-auto object-contain"
              />
            </div>
          </div>
          
          {/* Platform Description and Features */}
          <div className="mt-3 space-y-2">
            <p className="text-[#93E6EE] text-sm font-medium">
              Monitoramento HVAC Inteligente
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-white/70">
              <div className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Seguro</span>
              </div>
              <div className="w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Real-time</span>
              </div>
              <div className="w-1 h-1 bg-white/30 rounded-full"></div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>IoT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-2xl bg-white backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-700">
          <CardHeader className="space-y-2 pb-3 pt-6 bg-white">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-[#0b3a3f]">
                Bem-vindo de volta
              </h2>
              <p className="text-sm text-[#609DA3]">
                Entre com suas credenciais para continuar
              </p>
            </div>
            
            {error && (
              <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm animate-in slide-in-from-top">
                <AlertCircle className="h-4 h-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3.5 px-6 py-3">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#0b3a3f] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
                    <Mail className="w-4.5 h-4.5 text-[#93BDC2] group-focus-within:text-[#076A75]" />
                  </div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 h-11 border-2 border-[#D4E5E7] bg-[#F9FCFD] focus:border-[#076A75] focus:bg-white focus:ring-4 focus:ring-[#076A75]/10 transition-all duration-200 placeholder:text-[#93BDC2] text-sm"
                    required
                    autoComplete="email"
                  />
                  {email && (
                    <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-green-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#0b3a3f] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Senha
                  </label>
                  <button
                    type="button"
                    className="text-xs text-[#076A75] hover:text-[#0A4952] font-medium hover:underline transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors">
                    <Lock className="w-4.5 h-4.5 text-[#93BDC2] group-focus-within:text-[#076A75]" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 pr-10 h-11 border-2 border-[#D4E5E7] bg-[#F9FCFD] focus:border-[#076A75] focus:bg-white focus:ring-4 focus:ring-[#076A75]/10 transition-all duration-200 placeholder:text-[#93BDC2] text-sm"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#93BDC2] hover:text-[#076A75] transition-colors p-1 hover:bg-[#076A75]/5 rounded"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 px-6 pb-5 pt-2">
              <Button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-gradient-to-r from-[#076A75] to-[#0A4952] hover:from-[#0A4952] hover:to-[#076A75] text-white font-semibold h-10 text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Autenticando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Entrar na plataforma</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>

              <div className="relative w-full py-1.5">
                <Separator className="bg-[#D4E5E7]" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                  <span className="text-[10px] font-medium text-[#93BDC2] uppercase tracking-wider">Demonstração</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDemoUsers(!showDemoUsers)}
                className="w-full border-2 border-[#D4E5E7] text-[#076A75] hover:bg-[#F4FAFB] hover:border-[#076A75] h-9 font-semibold text-sm transition-all duration-200 group"
              >
                <Users className="w-3.5 h-3.5 mr-1.5 group-hover:scale-110 transition-transform" />
                {showDemoUsers ? 'Ocultar' : 'Acessar'} contas demo
                <ArrowRight className={`w-3.5 h-3.5 ml-1.5 transition-transform ${showDemoUsers ? 'rotate-90' : ''}`} />
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Users */}
        {showDemoUsers && (
          <Card className="border-0 shadow-2xl bg-white backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-500">
            <CardHeader className="bg-gradient-to-b from-[#F4FAFB] to-white pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#076A75]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-[#076A75]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0b3a3f]">
                    Contas de Demonstração
                  </h3>
                  <p className="text-sm text-[#609DA3]">
                    Clique para autenticar automaticamente
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 p-4">
              {demoUsers.map((user, index) => (
                <button
                  key={user.email}
                  onClick={() => handleDemoLogin(user.email, user.role)}
                  className="w-full p-4 rounded-xl border-2 border-[#D4E5E7] hover:border-[#076A75] hover:shadow-lg bg-white hover:bg-gradient-to-r hover:from-[#F4FAFB] hover:to-white transition-all duration-300 text-left group relative overflow-hidden animate-in slide-in-from-left"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#076A75]/0 via-[#076A75]/5 to-[#076A75]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${getRoleColor(user.role).split(' ')[0]} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        {getRoleIcon(user.role)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[#0b3a3f] group-hover:text-[#076A75] transition-colors">
                          {user.name}
                        </div>
                        <div className="text-sm text-[#609DA3] flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Building2 className="w-3 h-3 text-[#93BDC2]" />
                          <span className="text-xs text-[#93BDC2] font-medium">{user.site}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`${getRoleColor(user.role)} capitalize font-semibold px-3 py-1 shadow-sm`}>
                        {user.role === 'operator' ? 'operador' :
                         user.role === 'viewer' ? 'visualizador' : 
                         user.role === 'admin' ? 'admin' : user.role}
                      </Badge>
                      <ArrowRight className="w-5 h-5 text-[#93BDC2] group-hover:text-[#076A75] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
            <CardFooter className="bg-[#F4FAFB] border-t border-[#D4E5E7] p-4">
              <div className="flex items-start gap-2 text-xs text-[#609DA3]">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-[#0b3a3f]">Ambiente de demonstração:</strong> As senhas são preenchidas automaticamente para facilitar o teste da plataforma.
                </p>
              </div>
            </CardFooter>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center space-y-2 animate-in fade-in duration-1000">
          <div className="flex items-center justify-center gap-4 text-xs text-white/60">
            <a href="#" className="hover:text-white transition-colors hover:underline">
              Sobre
            </a>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <a href="#" className="hover:text-white transition-colors hover:underline">
              Suporte
            </a>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <a href="#" className="hover:text-white transition-colors hover:underline">
              Documentação
            </a>
          </div>
          <p className="text-white/50 text-xs font-medium">
            © 2025 <span className="font-sans font-bold">Trak</span><span className="font-sans font-bold">Sense</span>. Transformando dados HVAC em decisões inteligentes.
          </p>
        </div>
      </div>
    </div>
  );
};