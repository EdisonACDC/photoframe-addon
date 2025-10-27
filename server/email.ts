/**
 * Email service using Resend SDK
 * Sends automatic license notifications to admin
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || "re_GPGfLjLZ_Lt1NEgBFcQ14im3oMb5mdjit";
const ADMIN_EMAIL = "edisonacdc88@gmail.com"; // Email registrata su Resend (limitazione free tier)
const FROM_EMAIL = "PhotoFrame PRO <onboarding@resend.dev>"; // Resend's test domain

const resend = new Resend(RESEND_API_KEY);

export interface LicenseEmailData {
  customerEmail: string;
  customerName?: string | null;
  licenseKey: string;
  amount: string;
  currency: string;
  orderId: string;
}

export async function sendLicenseNotificationToAdmin(data: LicenseEmailData): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY non configurata - skip email");
    return false;
  }

  try {
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 5px; margin-top: 20px; }
    .license-key { background: #fff; padding: 15px; border-left: 4px solid #4CAF50; font-family: monospace; font-size: 18px; font-weight: bold; margin: 15px 0; }
    .details { background: #fff; padding: 15px; border-radius: 5px; margin-top: 10px; }
    .label { font-weight: bold; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Nuova Vendita PhotoFrame PRO!</h1>
    </div>
    
    <div class="content">
      <p><strong>Congratulazioni!</strong> Hai appena ricevuto un nuovo ordine PhotoFrame PRO.</p>
      
      <div class="license-key">
        ${data.licenseKey}
      </div>
      
      <div class="details">
        <p><span class="label">Cliente:</span> ${data.customerName || 'N/A'}</p>
        <p><span class="label">Email:</span> ${data.customerEmail}</p>
        <p><span class="label">Importo:</span> ${data.currency} ${data.amount}</p>
        <p><span class="label">Order ID:</span> ${data.orderId}</p>
      </div>
      
      <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px;">
        <strong>📋 Prossimi Passi:</strong><br>
        1. Copia il codice licenza sopra<br>
        2. Invia al cliente via email o Lemon Squeezy<br>
        3. Il cliente lo inserirà nell'app per attivare PRO
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `🎉 Nuova Vendita PhotoFrame PRO - ${data.currency} ${data.amount}`,
      html: emailBody,
    });

    if (result.error) {
      console.error("[Email] Errore Resend:", result.error);
      return false;
    }

    console.log("[Email] Email inviata con successo:", result.data?.id);
    return true;
  } catch (error) {
    console.error("[Email] Errore invio email:", error);
    return false;
  }
}

// Test endpoint per verificare Resend
export async function sendTestEmail(to: string = ADMIN_EMAIL): Promise<boolean> {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject: 'Test PhotoFrame - Resend Funziona! ✅',
      html: '<p>Congratulazioni! Resend è configurato correttamente. Riceverai qui i codici licenza automatici.</p>',
    });

    if (result.error) {
      console.error("[Email Test] Errore:", result.error);
      return false;
    }

    console.log("[Email Test] Email di test inviata:", result.data?.id);
    return true;
  } catch (error) {
    console.error("[Email Test] Errore:", error);
    return false;
  }
}
