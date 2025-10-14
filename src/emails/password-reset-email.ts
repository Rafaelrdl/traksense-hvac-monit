/**
 * Renderiza o e-mail de redefinição de senha
 */
export interface PasswordResetEmailParams {
  appName: string;
  resetUrl: string;
  userName?: string;
}

export function renderPasswordResetEmail(params: PasswordResetEmailParams) {
  const { appName, resetUrl, userName } = params;
  
  const subject = `[${appName}] Redefinição de senha solicitada`;
  
  const text = `Olá${userName ? ` ${userName}` : ''}!

Recebemos uma solicitação para redefinir sua senha no ${appName}.

Para criar uma nova senha, acesse o link abaixo:
${resetUrl}

Este link de redefinição expira em 1 hora por motivos de segurança.

Se você não solicitou a redefinição de senha, ignore este e-mail. Sua senha permanecerá inalterada.

Atenciosamente,
Equipe ${appName}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                ${appName}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 22px; font-weight: 600;">
                Redefinição de Senha
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                ${userName ? `Olá <strong>${userName}</strong>,` : 'Olá,'}
              </p>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                Recebemos uma solicitação para redefinir a senha da sua conta no <strong>${appName}</strong>.
              </p>
              
              <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                Para criar uma nova senha, clique no botão abaixo:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);">
                      Redefinir Senha
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Box -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  ⚠️ Importante:
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.5;">
                  Este link expira em <strong>1 hora</strong> por motivos de segurança.
                </p>
              </div>
              
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="margin: 0 0 24px 0; color: #dc2626; font-size: 13px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              
              <!-- Security Notice -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 16px; border-radius: 4px;">
                <p style="margin: 0 0 8px 0; color: #075985; font-size: 14px; font-weight: 600;">
                  🔒 Não solicitou esta redefinição?
                </p>
                <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.5;">
                  Se você não solicitou a redefinição de senha, pode ignorar este e-mail com segurança. Sua senha permanecerá inalterada e nenhuma ação será tomada.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                Este é um e-mail automático. Por favor, não responda.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, text, html };
}
