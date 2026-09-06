import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { createClient } from "@supabase/supabase-js";

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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método não permitido",
    });
  }

  try {
    const authorization = req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        error: "Token Firebase não enviado",
      });
    }

    const idToken = authorization.replace(
      "Bearer ",
      ""
    );

    const adminAuth = getFirebaseAdmin();

    const decodedToken =
      await adminAuth.verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const email =
      decodedToken.email || null;
    const nome =
      decodedToken.name || null;

    const { data, error } = await supabase
      .from("perfil_usuario")
      .upsert(
        {
          firebase_uid: firebaseUid,
          email,
          nome,
        },
        {
          onConflict: "firebase_uid",
        }
      )
      .select()
      .single();

    if (error) {
      console.error(
        "Erro Supabase:",
        error
      );

      return res.status(500).json({
        error:
          "Erro ao salvar usuário no Supabase",
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      usuario: data,
    });

  } catch (error) {

    console.error(
      "Erro Firebase:",
      error
    );

    return res.status(401).json({
      error:
        "Token Firebase inválido ou expirado",
    });
  }
}
