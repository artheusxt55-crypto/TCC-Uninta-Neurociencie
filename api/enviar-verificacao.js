import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getAuth();
  }

  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  );

  initializeApp({
    credential: cert(serviceAccount),
  });

  return getAuth();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido",
    });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "E-mail não informado",
      });
    }

    const adminAuth = getFirebaseAdmin();

    // Firebase cria o link REAL de verificação
    const verificationLink =
      await adminAuth.generateEmailVerificationLink(email);

    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "EducaCube <noreply@educacube.online>",
          to: [email],
          subject: "Confirme seu e-mail — EducaCube",
          html: `
            <!DOCTYPE html>
            <html>
              <body style="
                margin:0;
                padding:0;
                background:#f5f3ff;
                font-family:Arial,sans-serif;
              ">

                <div style="
                  max-width:600px;
                  margin:40px auto;
                  background:white;
                  border-radius:16px;
                  padding:40px;
                  text-align:center;
                  box-shadow:0 5px 25px rgba(0,0,0,0.08);
                ">

                  <h1 style="
                    color:#6d28d9;
                    margin-bottom:10px;
                  ">
                    🦉 EducaCube
                  </h1>

                  <h2>
                    Confirme seu e-mail
                  </h2>

                  <p style="
                    color:#555;
                    font-size:16px;
                    line-height:1.6;
                  ">
                    Bem-vindo ao EducaCube!
                  </p>

                  <p style="
                    color:#555;
                    font-size:16px;
                    line-height:1.6;
                  ">
                    Para ativar sua conta, confirme seu endereço
                    de e-mail clicando no botão abaixo.
                  </p>

                  <a
                    href="${verificationLink}"
                    style="
                      display:inline-block;
                      margin-top:20px;
                      padding:14px 28px;
                      background:#7c3aed;
                      color:white;
                      text-decoration:none;
                      border-radius:10px;
                      font-weight:bold;
                    "
                  >
                    VERIFICAR MEU E-MAIL
                  </a>

                  <p style="
                    margin-top:30px;
                    color:#888;
                    font-size:13px;
                  ">
                    Se você não criou uma conta no EducaCube,
                    ignore este e-mail.
                  </p>

                </div>

              </body>
            </html>
          `,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Resend:", data);

      return res.status(500).json({
        error: "Erro ao enviar e-mail",
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "E-mail de verificação enviado!",
    });

  } catch (error) {
    console.error("ERRO API VERIFICAÇÃO:", error);

    return res.status(500).json({
      error: "Erro interno ao enviar verificação",
      details:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
}
