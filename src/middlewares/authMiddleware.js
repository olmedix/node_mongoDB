import { verifyToken } from "../core/includes/jwt.js";
import { sendJSON } from "../core/includes/inc.http.js";
import { isTockenRevoked} from "../core/includes/jwtBlackList.js";

export function authBearer(req, res) {
  const header = req.headers["authorization"];

  if (!header || !header.startsWith("Bearer ")) {
    sendJSON(res, 401, { error: "Token no proporcionado" });
    return false;
  }

  const token = header.split(" ")[1].trim();

  // Comprobar BLACKLIST
  if (isTockenRevoked(token)) {
    sendJSON(res, 401, { error: "Token revocado" });
    return false;
  }

  const payload = verifyToken(token);

  if (!payload) {
    sendJSON(res, 401, { error: "Token inválido o expirado" });
    return false;
  }

  // Añadimos info del usuario
  req.user = {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };

  return true;
}



export function protect(middleware, controller) {
  return (req, res) => {
    const ok = middleware(req, res);
    if (!ok) return;
    controller(req, res);
  };
}
