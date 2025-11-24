import { sendError } from "../core/includes/inc.response.js";
import { getClientIp } from "../core/includes/inc.checkIP.js";

const loginStore = {};
const MAX_LOGINS = 3;
const WINDOW_TIME = 10 * 60 * 1000; // 10 minutos

export function rateLimitLogin(req, res) {
  const ip = getClientIp(req);
  const route = "/login";
  const key = `${ip}:${route}`;

  const nowTime = Date.now();

  // Revisamos si ya tenemos registros de la IP
  const entry = loginStore[key];

  // Si no hay registros de la IP creamos registro.
  if (!entry) {
    loginStore[key] = {
      count: 1,
      firstTime: nowTime,
    };
    return true;
  }

  const timeOut = nowTime - entry.firstTime;

  // Si ha pasado el tiempo entre intentos reseteamos tiempo
  if (timeOut > WINDOW_TIME) {
    loginStore[key] = {
      count: 1,
      firstTime: nowTime,
    };
    return true;
  }

  // Si lo ha intentado demsiadas veces, Error.
  if (entry.count >= MAX_LOGINS) {
    return sendError(
      res,
      429,
      "Demsiados intentos de login.Inténtelo más tarde."
    );
  }

  entry.count += 1;
  return true;
}
