javascript
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// ========================================
// FIREBASE ADMIN
// ========================================

if (!getApps().length) {
  const chave = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!chave) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY não está configurada na Vercel."
    );
  }

  const serviceAccount = JSON.parse(chave);

  initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminAuth = getAuth();
const db = getFirestore();

// ========================================
// PEGAR IP REAL DO USUÁRIO
// ========================================

function pegarIP(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    const primeiroIP = forwarded.split(",")[0].trim();

    if (primeiroIP) {
      return primeiroIP;
    }
  }

  const realIP = req.headers["x-real-ip"];

  if (realIP) {
    return realIP;
  }

  return req.socket?.remoteAddress || null;
}

// ========================================
// NORMALIZAR IP
// ========================================

function normalizarIP(ip) {
  if (!ip) return null;

  let resultado = String(ip).trim();

  // IPv4 vindo como IPv6
  if (resultado.startsWith("::ffff:")) {
    resultado = resultado.replace("::ffff:", "");
  }

  return resultado;
}

// ========================================
// GEOLOCALIZAÇÃO
// ========================================

async function localizarIP(ip) {
  const resultado = {
    pais: "",
    estado: "",
    cidade: "",
    latitude: null,
    longitude: null,
  };

  if (!ip) {
    return resultado;
  }

  // IPs locais não podem ser geolocalizados
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.20.") ||
    ip.startsWith("172.21.") ||
    ip.startsWith("172.22.") ||
    ip.startsWith("172.23.") ||
    ip.startsWith("172.24.") ||
    ip.startsWith("172.25.") ||
    ip.startsWith("172.26.") ||
    ip.startsWith("172.27.") ||
    ip.startsWith("172.28.") ||
    ip.startsWith("172.29.") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.")
  ) {
    console.log("IP local detectado:", ip);
    return resultado;
  }

  try {
    const resposta = await fetch(
      `https://ipwho.is/${encodeURIComponent(ip)}`
    );

    if (!resposta.ok) {
      console.error(
        "ipwho.is respondeu:",
        resposta.status
      );

      return resultado;
    }

    const geo = await resposta.json();

    if (!geo || geo.success !== true) {
      console.error(
        "Não foi possível localizar o IP:",
        geo
      );

      return resultado;
    }

    resultado.pais = geo.country || "";
    resultado.estado = geo.region || "";
    resultado.cidade = geo.city || "";

    if (typeof geo.latitude === "number") {
      resultado.latitude = geo.latitude;
    }

    if (typeof geo.longitude === "number") {
      resultado.longitude = geo.longitude;
    }

    console.log("🌎 Geolocalização:", resultado);

    return resultado;

  } catch (erro) {
    console.error(
      "Erro na geolocalização:",
      erro
    );

    return resultado;
  }
}

// ========================================
// API
// ========================================

export default async function handler(req, res) {

  // Somente POST
  if (req.method !== "POST") {
    return res.status(405).json({
      sucesso: false,
      erro: "Método não permitido",
    });
  }

  try {

    // ========================================
    // TOKEN
    // ========================================

    const authorization =
      req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        sucesso: false,
        erro: "Token Bearer não informado",
      });
    }

    const token = authorization.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        sucesso: false,
        erro: "Token vazio",
      });
    }

    // ========================================
    // VALIDAR TOKEN FIREBASE
    // ========================================

    const decodedToken =
      await adminAuth.verifyIdToken(token);

    const uid = decodedToken.uid;

    console.log(
      "🔐 Usuário autenticado:",
      uid
    );

    // ========================================
    // DADOS DO USUÁRIO
    // ========================================

    const nome =
      decodedToken.name || "";

    const email =
      decodedToken.email || "";

    const foto =
      decodedToken.picture || "";

    // ========================================
    // IP
    // ========================================

    const ip = normalizarIP(
      pegarIP(req)
    );

    console.log(
      "🌐 IP detectado:",
      ip
    );

    // ========================================
    // GEOLOCALIZAÇÃO
    // ========================================

    const geo = await localizarIP(ip);

    // ========================================
    // REFERÊNCIA DO USUÁRIO
    // ========================================

    const usuarioRef = db
      .collection("usuarios")
      .doc(uid);

    // ========================================
    // DATA
    // ========================================

    const agora =
      FieldValue.serverTimestamp();

    // ========================================
    // ATUALIZAR USUÁRIO
    // ========================================

    await usuarioRef.set(
      {
        uid,

        nome,

        email,

        foto,

        ultimoAcesso: agora,

        ultimoIP: ip,

        ultimoPais: geo.pais,

        ultimoEstado: geo.estado,

        ultimaCidade: geo.cidade,

        ultimaLatitude: geo.latitude,

        ultimaLongitude: geo.longitude,

        atualizadoEm:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    console.log(
      "✅ Perfil atualizado no Firestore"
    );

    // ========================================
    // HISTÓRICO DE ACESSO
    // ========================================

    const acessoRef = await usuarioRef
      .collection("acessos")
      .add({
        data:
          FieldValue.serverTimestamp(),

        ip,

        pais: geo.pais,

        estado: geo.estado,

        cidade: geo.cidade,

        latitude: geo.latitude,

        longitude: geo.longitude,

        userAgent:
          req.headers["user-agent"] || "",

        uid,
      });

    console.log(
      "✅ Acesso criado:",
      acessoRef.id
    );

    // ========================================
    // RESPOSTA
    // ========================================

    return res.status(200).json({
      sucesso: true,

      uid,

      ip,

      pais: geo.pais,

      estado: geo.estado,

      cidade: geo.cidade,

      latitude: geo.latitude,

      longitude: geo.longitude,

      acessoId: acessoRef.id,

      mensagem:
        "Acesso registrado com sucesso",
    });

  } catch (erro) {

    console.error(
      "❌ ERRO COMPLETO AO REGISTRAR ACESSO:",
      erro
    );

    return res.status(500).json({
      sucesso: false,

      erro:
        erro?.message ||
        "Não foi possível registrar o acesso",
    });
  }
}

