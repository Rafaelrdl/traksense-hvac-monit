/**
 * Email provider abstraction
 * Suporta Resend em produção e Console em desenvolvimento
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>;
}

/**
 * Console provider para desenvolvimento
 * Loga o e-mail no console e mostra notificação com link para copiar
 */
export class ConsoleEmailProvider implements EmailProvider {
  async send(payload: EmailPayload): Promise<void> {
    console.group('📧 [DEV] E-mail enviado');
    console.log('Para:', payload.to);
    console.log('Assunto:', payload.subject);
    console.log('Texto:', payload.text);
    console.log('HTML Preview:', payload.html.substring(0, 200) + '...');
    console.groupEnd();
    
    // Simula delay de envio
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Resend provider para produção
 * Usa a API do Resend para envio real de e-mails
 */
export class ResendEmailProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  async send(payload: EmailPayload): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        from: 'TrakSense HVAC <noreply@traksense.io>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Falha ao enviar e-mail: ${error}`);
    }

    const data = await response.json();
    console.log('E-mail enviado via Resend:', data);
  }
}

/**
 * Factory para criar o provider adequado baseado no ambiente
 */
export function getEmailProvider(): EmailProvider {
  const apiKey = import.meta.env.VITE_RESEND_API_KEY;
  
  if (apiKey && apiKey.trim().length > 0) {
    console.log('✉️ Usando Resend Email Provider');
    return new ResendEmailProvider(apiKey);
  }
  
  console.log('🔧 Usando Console Email Provider (DEV)');
  return new ConsoleEmailProvider();
}

/**
 * Função auxiliar para enviar e-mail de convite
 */
export async function sendInviteEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const provider = getEmailProvider();
  await provider.send({ to, subject, html, text });
}

/**
 * Função auxiliar para enviar e-mail de redefinição de senha
 */
export async function sendPasswordResetEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  const provider = getEmailProvider();
  await provider.send({ to, subject, html, text });
}
