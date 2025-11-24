// Normaliza IPv6 mapeado a IPv4 (ej: "::ffff:192.168.1.10" → "192.168.1.10")
function normalizeIp(ip) {
  if (!ip) return "unknown";

  // Quitar espacios
  ip = ip.trim();

  // IPv6 localhost
  if (ip === "::1") return "127.0.0.1";

  // IPv6 mapeado a IPv4 (formato ::ffff:x.x.x.x)
  if (ip.startsWith("::ffff:")) {
    return ip.substring(7);
  }

  return ip;
}

// Esto es una validación muy básica, solo para evitar cosas muy raras.
// No es una validación súper estricta de IP, pero ayuda un poco.
function looksLikeIp(ip) {
  if (!ip || typeof ip !== "string") return false;
  // Muy simple: que tenga puntos o dos puntos (IPv4 o IPv6)
  return ip.includes(".") || ip.includes(":");
}

export function getClientIp(req) {
  // 1. Cloudflare (si estás detrás de Cloudflare o WARP como proxy)
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp && looksLikeIp(cfIp)) {
    return normalizeIp(cfIp);
  }

  // 2. X-Forwarded-For (proxy estándar: el primer IP es el cliente)
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    // "ipCliente, proxy1, proxy2..."
    const first = xff.split(",")[0].trim();
    if (first && looksLikeIp(first)) {
      return normalizeIp(first);
    }
  }

  // 3. X-Real-IP (algunos proxies la usan)
  const xRealIp = req.headers["x-real-ip"];
  if (xRealIp && looksLikeIp(xRealIp)) {
    return normalizeIp(xRealIp);
  }

  // 4. Fallback: IP del socket (sin proxy)
  const remote =
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "";

  return normalizeIp(remote || "unknown");
}
