// middlewares/authMiddleware.js
import { verifyToken } from "../core/includes/jwt.js";
import { sendError } from "../core/includes/inc.response.js";
import { errorHandler } from "../core/includes/inc.error.js";
import { createJwtBlacklistRepo } from "../core/includes/jwtBlackList.js";
import { sendJSON } from "../core/includes/inc.http.js";

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

export function requireSelfOrAdmin(req, res) {
  const userRole = req.user.role;
  const userId = req.user.id;
  const paramId = req.params.id;

  if (userRole.toLowerCase() === "admin") return true;
  if (userId === paramId) return true;

  sendJSON(res, 403, {
    ok: false,
    data: null,
    error: "No tienes permisos para esta acción",
  });
  return false;
}

export function requireRole(...allowedRoles) {
  return (req, res) => {
    const userRole = req.user.role.toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      sendJSON(res, 403, {
        ok: false,
        data: null,
        message: "No tienes permisos para acceder a este recurso",
      });
      return false;
    }
    return true;
  };
}

// Podemos encadenasr varios middlewares y un controller final
// handlers = [mw1, mw2, ..., controllerFinal]
export function protect(...handlers) {
  return async (req, res) => {
    try {
      const controller = handlers[handlers.length - 1];

      const middlewares = handlers.slice(0, -1);

      for (const middleware of middlewares) {
        const result = await middleware(req, res);

        // Si el middleware devuelve false, cortamos la cadena.
        if (result === false) {
          return;
        }
      }
      await controller(req, res);
    } catch (err) {
      errorHandler(err, req, res);
    }
  };
}
