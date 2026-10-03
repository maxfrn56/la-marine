import { Resend } from "resend";

const FROM = process.env.MAIL_FROM ?? "La Marine <beth.t@example.com>";
const RESTAURANT = process.env.NOTIFY_EMAIL ?? process.env.ADMIN_EMAIL ?? "";
const KEY = process.env.RESEND_API_KEY ?? "";

const resend = KEY ? new Resend(KEY) : null;

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(new Date(`${date}T12:00:00Z`));
}

function formatTime(time) {
  return time.replace(":", "h");
}

function wrap(title, body) {
  return `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#060f18;color:#f2ead8;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#060f18;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="padding:28px 8px 18px;text-align:center;letter-spacing:0.32em;font-size:11px;text-transform:uppercase;color:#c9a24b;font-family:Arial,sans-serif;">
              20 Quai de l’Océan · Port Maria
            </td>
          </tr>
          <tr>
            <td style="padding:0 8px 10px;text-align:center;font-size:34px;color:#f2ead8;">La Marine</td>
          </tr>
          <tr>
            <td style="padding:0 8px 28px;text-align:center;font-size:18px;font-style:italic;color:#d8cdb4;">${title}</td>
          </tr>
          <tr>
            <td style="background:#0a1826;border:1px solid rgba(201,162,75,0.35);border-radius:8px;padding:28px 28px 24px;font-size:16px;line-height:1.65;color:#f2ead8;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 8px 0;text-align:center;font-size:12px;letter-spacing:0.08em;color:#d8cdb4;font-family:Arial,sans-serif;">
              02 97 50 09 81 · 20 Quai de l’Océan, 56170 Quiberon
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function details(reservation) {
  const service = reservation.service === "midi" ? "Midi" : "Soir";
  return `
    <p style="margin:0 0 16px;">
      <strong style="color:#e6c47a;">${formatDate(reservation.date)}</strong><br/>
      ${service} · ${formatTime(reservation.time)} · ${reservation.partySize} couvert${reservation.partySize > 1 ? "s" : ""}
    </p>
    <p style="margin:0 0 8px;">${reservation.name}<br/>${reservation.phone}${reservation.email ? `<br/>${reservation.email}` : ""}</p>
    ${reservation.notes ? `<p style="margin:16px 0 0;color:#d8cdb4;font-style:italic;">« ${reservation.notes} »</p>` : ""}
    <p style="margin:22px 0 0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a24b;">
      Confirmation ${reservation.code}
    </p>`;
}

async function send(message) {
  if (!resend) {
    console.warn("Mail non envoyé (RESEND_API_KEY absente) :", message.subject);
    return { sent: false };
  }
  const { error } = await resend.emails.send({
    from: FROM,
    replyTo: RESTAURANT || undefined,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  if (error) throw new Error(error.message);
  return { sent: true };
}

export async function sendConfirmation(reservation) {
  const results = { guest: false, restaurant: false };
  if (reservation.email) {
    const guest = await send({
      to: reservation.email,
      subject: `Votre table à La Marine — ${reservation.code}`,
      text: `Votre table est réservée le ${formatDate(reservation.date)} à ${formatTime(reservation.time)} pour ${reservation.partySize} couvert(s). Confirmation ${reservation.code}.`,
      html: wrap(
        "Votre table est retenue",
        `<p style="margin:0 0 18px;">Bonjour ${reservation.name.split(" ")[0]},</p>
         <p style="margin:0 0 18px;">Nous avons le plaisir de vous confirmer votre table au plus vieux restaurant de Quiberon.</p>
         ${details(reservation)}
         <p style="margin:22px 0 0;">À très bientôt sur le port,<br/>L’équipe de La Marine</p>`
      ),
    });
    results.guest = guest.sent;
  }
  if (RESTAURANT) {
    const house = await send({
      to: RESTAURANT,
      subject: `Nouvelle réservation ${reservation.code} — ${reservation.partySize} couverts`,
      text: `${reservation.name} · ${formatDate(reservation.date)} ${formatTime(reservation.time)} · ${reservation.partySize} couverts · ${reservation.phone}`,
      html: wrap("Une table vient d’être retenue", details(reservation)),
    });
    results.restaurant = house.sent;
  }
  return results;
}

export async function sendCancellation(reservation) {
  if (!reservation.email) return { sent: false };
  return send({
    to: reservation.email,
    subject: `Réservation annulée — ${reservation.code}`,
    text: `Votre réservation ${reservation.code} du ${formatDate(reservation.date)} à ${formatTime(reservation.time)} a été annulée.`,
    html: wrap(
      "Réservation annulée",
      `<p style="margin:0 0 18px;">Bonjour ${reservation.name.split(" ")[0]},</p>
       <p style="margin:0 0 18px;">Votre table du ${formatDate(reservation.date)} à ${formatTime(reservation.time)} a bien été annulée.</p>
       <p style="margin:0;">Pour une nouvelle date, le plus simple est de repasser par le site — ou de nous appeler au 02 97 50 09 81.</p>`
    ),
  });
}
