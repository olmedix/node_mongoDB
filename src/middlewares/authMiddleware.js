// middlewares/authMiddleware.js
import { verifyToken } from "../core/includes/jwt.js";
import { sendJSON } from "../core/includes/inc.http.js";
import { createJwtBlacklistRepo } from "../core/includes/jwtBlackList.js";

export function createAuthBearer(mongoDB) {
  const jwtBlacklist = createJwtBlacklistRepo(mongoDB);

  // 👇 este es el middleware real
  return async function authBearer(req, res) {
    const header = req.headers["authorization"];

    if (!header || !header.startsWith("Bearer ")) {
      sendJSON(res, 401, { error: "Token no proporcionado" });
      return false;
    }

    const token = header.split(" ")[1].trim();
    req.token = token; // lo guardamos por si lo necesita logout

    // 1) Comprobar BLACKLIST en Mongo
    const revoked = await jwtBlacklist.isTokenRevoked(token);
    if (revoked) {
      sendJSON(res, 401, { error: "Token revocado" });
      return false;
    }

    // 2) Verificar JWT
    const payload = verifyToken(token);

    if (!payload) {
      sendJSON(res, 401, { error: "Token inválido o expirado" });
      return false;
    }

    // 3) Añadimos info del usuario a la request
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
    };

    return true;
  };
}

// PROTECT actualizado para soportar middlewares async
export function protect(middleware, controller) {
  return async (req, res) => {
    const ok = await middleware(req, res); // 👈 puede ser sync o async
    if (!ok) return;
    return controller(req, res);
  };
}
