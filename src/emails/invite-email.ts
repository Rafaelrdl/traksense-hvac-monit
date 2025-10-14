/**
 * Renderiza o e-mail de convite para equipe
 */
export interface InviteEmailParams {
  appName: string;
  teamName: string;
  invitedBy: string;
  inviteUrl: string;
  role: 'ADMIN' | 'MEMBER';
}

export function renderInviteEmail(params: InviteEmailParams) {
  const { appName, teamName, invitedBy, inviteUrl, role } = params;
  
  const roleName = role === 'ADMIN' ? 'Administrador' : 'Membro';
  
  const subject = `[${appName}] Você foi convidado(a) para a equipe ${teamName}`;
  
  const text = `Olá!

${invitedBy} convidou você para fazer parte da equipe "${teamName}" no ${appName} como ${roleName}.

Para aceitar o convite, acesse o link abaixo:
${inviteUrl}

Este convite expira em 7 dias.

Se você não solicitou este convite ou não reconhece quem enviou, pode ignorar este e-mail com segurança.

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
            <td style="background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                ${appName}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 24px 0; color: #111827; font-size: 22px; font-weight: 600;">
                Você foi convidado(a)!
              </h2>
              
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>${invitedBy}</strong> convidou você para fazer parte da equipe <strong>"${teamName}"</strong> como <strong>${roleName}</strong>.
              </p>
              
              <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                Para aceitar o convite e começar a colaborar, clique no botão abaixo:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 32px 0;">
                    <a href="${inviteUrl}" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);">
                      Aceitar Convite
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Info Box -->
              <div style="background-color: #f3f4f6; border-left: 4px solid #0d9488; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                  <strong>⏰ Atenção:</strong> Este convite expira em <strong>7 dias</strong>.
                </p>
              </div>
              
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; line-height: 1.5;">
                Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
              </p>
              <p style="margin: 0 0 24px 0; color: #0d9488; font-size: 13px; word-break: break-all;">
                ${inviteUrl}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
              
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                Se você não solicitou este convite ou não reconhece quem enviou, pode ignorar este e-mail com segurança.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.
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
