import 'dotenv/config';
import express    from 'express';
import { Resend } from 'resend';
import cors       from 'cors';

// ─── Validate required environment variables on startup ───────────────────────
const REQUIRED_ENV = ['RESEND_API_KEY'];
const missingEnv   = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[Server] ❌ Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('[Server] Set them in your hosting provider\'s Environment settings.');
  process.exit(1);
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PORT         = process.env.PORT || 3001;
// TODO: swap in your verified sending domain once it's set up in Resend.
const FROM_ADDRESS = process.env.RESEND_FROM || 'MuniCircle <welcome@municircle.app>';
const NODE_ENV      = process.env.NODE_ENV || 'development';

// Base URL of the deployed frontend, used to build the "Open MuniCircle" link
// in the welcome email.
const APP_BASE_URL = (process.env.CLIENT_ORIGIN || 'https://municircle-d2dcc.web.app').replace(/\/$/, '');

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

// ─── Valid email types ────────────────────────────────────────────────────────
const EMAIL_TYPES = new Set([
  'welcome', // Sent once onboarding completes
]);

// ─── Express app ──────────────────────────────────────────────────────────────
const app = express();

// IMPORTANT: Allow preflight OPTIONS requests for all routes (required for CORS)
app.options('*', cors());

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no origin header) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    console.warn(`[CORS] Blocked request from: ${origin}`);
    callback(new Error(`CORS: origin "${origin}" is not allowed`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '16kb' }));

// ─── Resend client ────────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);
console.log('[Email] ✅ Resend client initialized');

// ─── Email HTML template ──────────────────────────────────────────────────────

const buildEmailHtml = (title, bodyHtml, recipientEmail = '') => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if !mso]><!-->
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <!--<![endif]-->
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Preheader: hidden text that appears as inbox snippet in Gmail/Outlook.
       Pad with spaces/zero-width chars so nothing bleeds into the visible email. -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;
              font-size:1px;line-height:1px;color:#f4f4f5;">
    ${title} - MuniCircle · Muni University
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
         style="background-color:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">

      <!-- Email card -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="560"
             style="max-width:560px;background-color:#ffffff;border-radius:12px;
                    overflow:hidden;border:1px solid #e2e8f0;">

        <!-- ── HEADER / LOGO ── -->
        <tr>
          <td align="center" style="padding:32px 24px 16px;background-color:#ffffff;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:10px;vertical-align:middle;">
                  <!-- TODO: replace with a hosted MuniCircle logo URL -->
                  <div style="width:48px;height:48px;border-radius:50%;border:2px solid #e2e8f0;
                              background-color:#0066FF;color:#ffffff;font-family:Arial,Helvetica,sans-serif;
                              font-weight:700;font-size:18px;line-height:48px;text-align:center;">MC</div>
                </td>
                <td style="vertical-align:middle;">
                  <p style="margin:0;font-size:17px;font-weight:700;color:#1e293b;
                            letter-spacing:-0.3px;font-family:Arial,Helvetica,sans-serif;">
                    Muni<span style="color:#0066FF;font-weight:700;">Circle</span>
                  </p>
                  <p style="margin:2px 0 0;font-size:10px;font-weight:700;letter-spacing:2px;
                            color:#94a3b8;text-transform:uppercase;
                            font-family:Arial,Helvetica,sans-serif;">
                    Muni University Community
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 24px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr><td style="border-top:1px solid #f1f5f9;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- ── TITLE ── -->
        <tr>
          <td style="padding:24px 32px 8px;text-align:center;">
            <h1 style="margin:0;font-size:22px;font-weight:700;color:#1e293b;
                       line-height:1.3;font-family:Arial,Helvetica,sans-serif;">
              ${title}
            </h1>
          </td>
        </tr>

        <!-- ── BODY ── -->
        <tr>
          <td style="padding:16px 32px 32px;color:#475569;font-size:15px;
                     line-height:1.75;font-family:Arial,Helvetica,sans-serif;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <!--
          Footer requirements:
          - Physical mailing address of the institution (Muni University P.O. Box)
          - Clear identification of sender
          - Reason recipient is receiving this email
          - Developer/support contact details
        -->
        <tr>
          <td style="padding:20px 32px 24px;text-align:center;
                     background-color:#f8fafc;border-top:1px solid #f1f5f9;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#475569;
                      font-family:Arial,Helvetica,sans-serif;">
              MuniCircle — Muni University
            </p>
            <!-- TODO: fill in Muni University's official P.O. Box / postal address -->
            <p style="margin:0 0 6px;font-size:11px;color:#94a3b8;line-height:1.6;
                      font-family:Arial,Helvetica,sans-serif;">
              P.O. Box [XXX], Arua, Uganda
            </p>
            <p style="margin:0 0 10px;font-size:11px;color:#94a3b8;line-height:1.6;
                      font-family:Arial,Helvetica,sans-serif;">
              &copy; ${new Date().getFullYear()} MuniCircle. All rights reserved.
            </p>
            <p style="margin:0 0 8px;font-size:11px;color:#94a3b8;line-height:1.6;
                      font-family:Arial,Helvetica,sans-serif;">
              You are receiving this email because you completed onboarding with your
              @muni.ac.ug account on
              <a href="${APP_BASE_URL}" style="color:#94a3b8;text-decoration:underline;">MuniCircle</a>.
              If this was not you, please disregard this message.
            </p>
            <!-- TODO: fill in developer / support contact details -->
            <p style="margin:0 0 4px;font-size:11px;color:#cbd5e1;line-height:1.6;
                      font-family:Arial,Helvetica,sans-serif;">
              Built &amp; maintained by [Developer Name] &nbsp;&middot;&nbsp;
              <a href="mailto:[dev-email@example.com]" style="color:#cbd5e1;text-decoration:underline;">[dev-email@example.com]</a>
              &nbsp;&middot;&nbsp; [+256 XXX XXX XXX]
            </p>
            ${recipientEmail ? `
            <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;font-family:Arial,Helvetica,sans-serif;">
              <a href="${APP_BASE_URL}/privacy"
                 style="color:#cbd5e1;text-decoration:underline;">Privacy Policy</a>
            </p>` : ''}
          </td>
        </tr>

      </table>
      <!-- /Email card -->

    </td></tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;

// ─── Plain-text fallback builder ─────────────────────────────────────────────

const buildPlainText = (title, name, extra = {}) => {
  const year     = new Date().getFullYear();
  const divider  = '─'.repeat(56);

  const bodyLines = [
    `Hi ${name},`,
    '',
    `Welcome to MuniCircle — the Muni University community app! We're glad`,
    `you're here.`,
    '',
    `Your profile is set up${extra.faculty ? ` (${extra.faculty}${extra.communityStatus ? `, ${extra.communityStatus}` : ''})` : ''}.`,
    `Head to the app to start exploring:`,
    `  ${APP_BASE_URL}`,
    '',
    `If you didn't create this account, you can safely ignore this email.`,
  ];

  return [
    title.toUpperCase(),
    divider,
    '',
    ...bodyLines,
    '',
    'Warm regards,',
    'The MuniCircle Team',
    '',
    divider,
    `© ${year} MuniCircle — Muni University`,
    'Arua, Uganda', 
    `${FROM_ADDRESS}`,
    '',
    'Built & maintained by [Developer Name] — [dev-email@example.com] — [+256 XXX XXX XXX]', // TODO: fill in
    '',
    'You received this because you completed onboarding on MuniCircle.',
  ].join('\n');
};

// ─── Email content factory ────────────────────────────────────────────────────
const buildEmailContent = (type, name, extra = {}) => {
  switch (type) {

    case 'welcome': {
      const { faculty = '', communityStatus = '' } = extra;
      return {
        subject: `Welcome to MuniCircle, ${name}! 🎓`,
        title:   'Welcome to MuniCircle!',
        body: `
          <p>Hi <strong>${name}</strong>,</p>
          <p>
            Welcome to <strong>MuniCircle</strong> — the community app for Muni University
            students, staff, and alumni. Your profile is all set up${faculty ? `, and you're
            now connected as part of <strong>${faculty}</strong>${communityStatus ? ` (${communityStatus})` : ''}` : ''}.
          </p>
          <p>
            You can now connect with the rest of the Muni University community, join
            conversations, and stay in the loop on everything happening on campus.
          </p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:20px 0;">
            <tr>
              <td style="border-radius:8px;background-color:#0066FF;">
                <a href="${APP_BASE_URL}"
                   style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:700;
                          color:#ffffff;text-decoration:none;border-radius:8px;font-family:Arial,Helvetica,sans-serif;">
                  Open MuniCircle
                </a>
              </td>
            </tr>
          </table>
          <p style="margin-top:24px;">
            Glad to have you in the Circle!
          </p>
          <p style="margin-top:24px;color:#94a3b8;font-size:13px;">
            Warm regards,<br /><strong style="color:#475569;">The MuniCircle Team</strong>
          </p>`,
      };
    }

    default:
      return null;
  }
};

// ─── POST /api/send-email ─────────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  const { type, to, name, faculty, communityStatus } = req.body ?? {};

  if (!type || !to || !name) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields. Expected: type, to, name.',
    });
  }

  if (!EMAIL_TYPES.has(type)) {
    return res.status(400).json({
      success: false,
      message: `Invalid email type "${type}". Valid types: ${[...EMAIL_TYPES].join(', ')}.`,
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ success: false, message: `Invalid recipient email: "${to}"` });
  }

  const extra = { faculty, communityStatus };

  const content = buildEmailContent(type, name, extra);
  if (!content) {
    return res.status(500).json({ success: false, message: 'Failed to build email content.' });
  }

  try {
    const html      = buildEmailHtml(content.title, content.body, to);
    const text      = buildPlainText(content.title, name, extra);
    const messageId = `municircle-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const { data, error } = await resend.emails.send({
      from:     FROM_ADDRESS,
      to,
      // TODO: point this at a real, monitored support inbox once you have one.
      reply_to: 'support@municircle.app',
      subject:  content.subject,
      html,
      text, // Plain-text alternative — HTML-only emails score as spam
      headers: {
        'Precedence':      'transactional',
        'X-Entity-Ref-ID': messageId,
        'X-Mailer':        'MuniCircle-Email-API/1.0',
      },
    });

    if (error) {
      throw new Error(error.message || 'Resend API error');
    }

    console.log(`[Email] ✅ "${type}" → ${to} | messageId: ${data.id}`);
    return res.status(200).json({ success: true, messageId: data.id });

  } catch (err) {
    console.error(`[Email] ❌ Failed to send "${type}" → ${to}:`, err.message);
    return res.status(500).json({
      success: false,
      message: NODE_ENV === 'production'
        ? 'Email delivery failed. Please try again later.'
        : err.message,
    });
  }
});

// ─── GET /api/health ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status:    'ok',
    service:   'MuniCircle Email API',
    env:       NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('─────────────────────────────────────────');
  console.log(`  MuniCircle Email API`);
  console.log(`  Environment : ${NODE_ENV}`);
  console.log(`  Port        : ${PORT}`);
  console.log(`  Email via   : Resend`);
  console.log(`  From        : ${FROM_ADDRESS}`);
  console.log(`  App URL     : ${APP_BASE_URL}`);
  console.log('─────────────────────────────────────────');
  console.log('  Deliverability checklist (DNS required):');
  console.log('  ✉  SPF   — TXT record on your sending domain');
  console.log('             e.g. "v=spf1 include:amazonses.com ~all"');
  console.log('             (Resend adds this when you verify a domain)');
  console.log('  🔑 DKIM  — CNAME records from Resend domain settings');
  console.log('  🛡  DMARC — TXT _dmarc.<domain>');
  console.log('             e.g. "v=DMARC1; p=quarantine; rua=mailto:dmarc@municircle.app"');
  console.log('  Without all three, mail WILL land in spam regardless of code.');
  console.log('─────────────────────────────────────────');
});

// ─── Render free-tier keep-alive ──────────────────────────────────────────────
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
  const PING_INTERVAL = 14 * 60 * 1000;
  setInterval(async () => {
    try {
      const res = await fetch(`${RENDER_URL}/api/health`);
      console.log(`[Keep-alive] Ping → ${res.status}`);
    } catch (err) {
      console.warn('[Keep-alive] Ping failed:', err.message);
    }
  }, PING_INTERVAL);
  console.log(`[Keep-alive] Self-ping enabled → ${RENDER_URL}/api/health`);
}