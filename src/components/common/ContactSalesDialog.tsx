import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Mail, Phone, Building, User, MessageSquare } from 'lucide-react';

interface ContactSalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: string;
}

export function ContactSalesDialog({ open, onOpenChange, subject = 'Interesse em TrakNor' }: ContactSalesDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Validação de email simples
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('E-mail inválido');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulação de envio (em produção, usar API backend)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Log para desenvolvimento
      console.log('📧 Contato solicitado:', {
        ...formData,
        subject,
        timestamp: new Date().toISOString(),
      });
      
      // Fallback: abrir cliente de email
      const mailtoLink = `mailto:vendas@traknor.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
        `Nome: ${formData.name}\n` +
        `Empresa: ${formData.company}\n` +
        `E-mail: ${formData.email}\n` +
        `Telefone: ${formData.phone}\n\n` +
        `Mensagem:\n${formData.message}`
      )}`;
      
      window.location.href = mailtoLink;
      
      toast.success('Solicitação enviada com sucesso! Nossa equipe entrará em contato em breve.');
      
      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        message: '',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao enviar contato:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-5" />
            Fale com Nossa Equipe
          </DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo e nossa equipe entrará em contato em até 24 horas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="size-4" />
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2">
              <Building className="size-4" />
              Empresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company"
              placeholder="Ex: Acme Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>
          
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="size-4" />
              E-mail <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Ex: joao@empresa.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="size-4" />
              Telefone (opcional)
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Ex: (11) 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          
          {/* Mensagem */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              <MessageSquare className="size-4" />
              Mensagem (opcional)
            </Label>
            <Textarea
              id="message"
              placeholder="Conte-nos mais sobre suas necessidades..."
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          
          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
