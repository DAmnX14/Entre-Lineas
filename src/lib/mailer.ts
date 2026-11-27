import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { BRAND } from "./brand";
import { getOutboxEmail, setOutboxStatus } from "./repo";

/**
 * Envío de correos por SMTP. Funciona con Gmail (contraseña de aplicación),
 * Resend, Brevo, Mailgun o cualquier proveedor SMTP.
 *
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS y MAIL_FROM.
 */

export function mailConfigured() {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

let transport: Transporter | null = null;
function getTransport() {
  if (!transport) {
    const port = Number(process.env.SMTP_PORT ?? 465);
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transport;
}

function fromAddress() {
  const from = process.env.MAIL_FROM?.trim();
  if (from) return from;
  return `"${BRAND.name}" <${process.env.SMTP_USER}>`;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Convierte el texto del correo en HTML con la identidad de la marca. */
export function renderEmailHtml(subject: string, text: string) {
  const site = BRAND.siteUrl;
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n").map((line) =>
        esc(line).replace(/(https?:\/\/[^\s<]+)/g, (url) => {
          const label = url.includes("/api/descargas/") ? "Descargar PDF" : url.includes("/pedido/") ? "Ver mi pedido" : url;
          const isButton = label !== url;
          return isButton
            ? `<a href="${url}" style="display:inline-block;margin:6px 0;padding:10px 20px;background:#a8573d;color:#fff8f1;border-radius:999px;text-decoration:none;font-weight:600">${label}</a>`
            : `<a href="${url}" style="color:#8a4430">${url}</a>`;
        }),
      );
      return `<p style="margin:0 0 16px;line-height:1.6">${lines.join("<br>")}</p>`;
    })
    .join("");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#f3ebdd;font-family:Georgia,'Times New Roman',serif;color:#3a2a1f">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3ebdd;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fbf7f0;border-radius:12px;overflow:hidden">
        <tr><td align="center" style="padding:28px 24px 8px">
          <a href="${site}"><img src="${site}/brand/logo-email.png" width="220" alt="${esc(BRAND.name)}" style="display:block;border:0;max-width:220px;height:auto"></a>
        </td></tr>
        <tr><td style="padding:16px 32px 8px;font-size:16px">${paragraphs}</td></tr>
        <tr><td style="padding:8px 32px 28px;font-size:13px;color:#6e5a4b;border-top:1px solid #e6dccd">
          <p style="margin:16px 0 0;line-height:1.5">${esc(BRAND.name)} · ${esc(BRAND.tagline)}<br>
          ¿Dudas? Respondé este correo o escribinos por <a href="https://wa.me/${BRAND.whatsapp}" style="color:#8a4430">WhatsApp</a>.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendEmail(to: string, subject: string, text: string) {
  await getTransport().sendMail({
    from: fromAddress(),
    replyTo: BRAND.email,
    to,
    subject,
    text,
    html: renderEmailHtml(subject, text),
  });
}

/** Envía un correo de la bandeja de salida y registra el resultado. */
export async function deliverOutbox(id: number) {
  const mail = getOutboxEmail(id);
  if (!mail || mail.status === "enviado") return;
  if (!mailConfigured()) {
    setOutboxStatus(id, "sin_configurar");
    return;
  }
  try {
    await sendEmail(mail.to_email, mail.subject, mail.body);
    setOutboxStatus(id, "enviado");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[correo] No se pudo enviar el correo ${id}:`, msg);
    setOutboxStatus(id, "error", msg.slice(0, 500));
  }
}
