// middlewares/authMiddleware.js
import { verifyToken } from "../core/includes/jwt.js";
import { sendError } from "../core/includes/inc.response.js";
import { errorHandler } from "../core/includes/inc.error.js";
import { createJwtBlacklistRepo } from "../core/includes/jwtBlackList.js";

export function createAuthBearer(mongoDB) {
  const jwtBlacklist = createJwtBlacklistRepo(mongoDB);

  // este es el middleware real
  return async function authBearer(req, res) {
    const header = req.headers["authorization"];

    if (!header || !header.startsWith("Bearer ")) {
      sendError(res, 401, "Token no proporcionado");
      return false;
    }

    const token = header.split(" ")[1].trim();
    req.token = token; // lo guardamos por si lo necesita logout

    // 1) Comprobar BLACKLIST en Mongo
    const revoked = await jwtBlacklist.isTokenRevoked(token);
    if (revoked) {
      sendError(res, 401, "Token revocado");
      return false;
    }

    // 2) Verificar JWT
    const payload = verifyToken(token);

    if (!payload) {
      sendError(res, 401, "Token inválido o expirado");
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


export function protect(middleware, controller) {
  return async (req, res) => {
    try{
    const ok = await middleware(req, res);
    if (!ok) return;
    return controller(req, res);
    } catch(err){
      return errorHandler(err,req,res);
    }
  };
}
