// Edge function skeleton (node / serverless).
// Deploy as a Supabase Edge Function or serverless endpoint.
// This example expects a SENDGRID key in env vars on the server side (not in client).
//
// POST payload:
// { articulo_id, comentario, autor_email, autor }
const SENDGRID_KEY = process.env.VITE_SENDGRID_KEY || process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.VITE_EMAIL_FROM || "revista@example.org";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  try {
    const { articulo_id, comentario, autor_email, autor } = await req.json();
    if (!autor_email) {
      // nothing to send
      return res.status(200).json({ status: "no_author_email" });
    }
    if (!SENDGRID_KEY) {
      console.warn("SENDGRID key missing, cannot send email");
      return res.status(500).json({ error: "mailer_not_configured" });
    }

    // Simple SendGrid call
    const payload = {
      personalizations: [{ to: [{ email: autor_email }], subject: `Nuevo comentario en su artículo` }],
      from: { email: EMAIL_FROM, name: "Sinapsis" },
      content: [{ type: "text/plain", value: `Estimado/a ${autor || ""},\n\nHa recibido un nuevo comentario:\n\n${comentario}\n\nSaludos,\nSinapsis` }]
    };

    const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("SendGrid error", t);
      return res.status(500).json({ error: "send_failed", info: t });
    }

    return res.status(200).json({ status: "sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
