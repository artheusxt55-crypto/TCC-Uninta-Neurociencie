
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ===============================
// FIREBASE ADMIN
// ===============================

if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  );

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminAuth = getAuth();
const db = getFirestore();

// ===============================
// PEGAR IP DO USUÁRIO
// ===============================

function pegarIP(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return (
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    null
  );
}

// ===============================
// API
// ===============================

export default async function handler(req, res) {
  // Somente POST
  if (req.method !== "POST") {
    return res.status(405).json({
      erro: "Método não permitido",
    });
  }

  try {
    // ===============================
    // PEGAR TOKEN DO FIREBASE
    // ===============================

    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        erro: "Token não informado",
      });
    }

    const token = authorization.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        erro: "Token inválido",
      });
    }

    // ===============================
    // VALIDAR TOKEN
    // ===============================

    const decodedToken = await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    // ===============================
    // DADOS DO USUÁRIO
    // ===============================

    const nome =
      decodedToken.name ||
      "";

    const email =
      decodedToken.email ||
      "";

    const foto =
      decodedToken.picture ||
      "";

    // ===============================
    // IP
    // ===============================

    const ip = pegarIP(req);

    // ===============================
    // GEOLOCALIZAÇÃO DO IP
    // ===============================

    let pais = "";
    let estado = "";
    let cidade = "";
    let latitude = null;
    let longitude = null;

    if (ip) {
      try {
        const resposta = await fetch(
          `https://ipwho.is/${encodeURIComponent(ip)}`
        );

        const geo = await resposta.json();

        if (geo.success) {
          pais = geo.country || "";
          estado = geo.region || "";
          cidade = geo.city || "";

          latitude =
            typeof geo.latitude === "number"
              ? geo.latitude
              : null;

          longitude =
            typeof geo.longitude === "number"
              ? geo.longitude
              : null;
        }
      } catch (erroGeo) {
        console.error(
          "Erro ao obter localização do IP:",
          erroGeo
        );
      }
    }

    // ===============================
    // REFERÊNCIA DO USUÁRIO
    // ===============================

    const usuarioRef = db
      .collection("usuarios")
      .doc(uid);

    // ===============================
    // ATUALIZAR PERFIL
    // ===============================

    await usuarioRef.set(
      {
        uid,
        nome,
        email,
        foto,

        ultimoAcesso: FieldValue.serverTimestamp(),

        ultimoIP: ip,

        ultimoPais: pais,

        ultimoEstado: estado,

        ultimaCidade: cidade,

        ultimaLatitude: latitude,

        ultimaLongitude: longitude,

        atualizadoEm: FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    // ===============================
    // REGISTRAR HISTÓRICO
    // ===============================

    await usuarioRef
      .collection("acessos")
      .add({
        data: FieldValue.serverTimestamp(),

        ip,

        pais,

        estado,

        cidade,

        latitude,

        longitude,

        userAgent:
          req.headers["user-agent"] || "",
      });

    // ===============================
    // RESPOSTA
    // ===============================

    return res.status(200).json({
      sucesso: true,
      uid,
      mensagem: "Acesso registrado com sucesso",
    });

  } catch (erro) {
    console.error(
      "Erro ao registrar acesso:",
      erro
    );

    return res.status(500).json({
      sucesso: false,
      erro: "Não foi possível registrar o acesso",
    });
  }
}
```

### Agora a estrutura ficará assim

Quando o usuário entrar:

```text
usuarios
 └── UID_DO_USUARIO
      ├── uid
      ├── nome
      ├── email
      ├── foto
      ├── ultimoAcesso
      ├── ultimoIP
      ├── ultimoPais
      ├── ultimoEstado
      ├── ultimaCidade
      ├── ultimaLatitude
      ├── ultimaLongitude
      │
      └── acessos
           ├── acesso_1
           │    ├── data
           │    ├── ip
           │    ├── pais
           │    ├── estado
           │    ├── cidade
           │    └── userAgent
           │
           ├── acesso_2
           └── acesso_3

