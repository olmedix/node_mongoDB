import { sendError } from "../core/includes/inc.response.js";
import { getClientIp } from "../core/includes/inc.checkIP.js";


//const MAX_LOGINS = 3;
//const WINDOW_TIME = 10 * 60 * 1000; // 10 minutos

export function createRateLimit({maxRequests,windowTime,route}) {

  const store = {};

  return function rateLimitLogin(req, res) {
    const ip = getClientIp(req);
    const key = `${ip}:${route}`;

    const nowTime = Date.now();

    // Revisamos si ya tenemos registros de la IP
    const entry = store[key];

    // Si no hay registros de la IP creamos registro.
    if (!entry) {
      store[key] = {
        count: 1,
        firstTime: nowTime,
      };
      return true;
    }

    const timeOut = nowTime - entry.firstTime;

    // Si ha pasado el tiempo entre intentos reseteamos tiempo
    if (timeOut > windowTime) {
      store[key] = {
        count: 1,
        firstTime: nowTime,
      };
      return true;
    }

    // Si lo ha intentado demsiadas veces, Error.
    if (entry.count >= maxRequests) {
        sendError(
        res,
        429,
        "Demasiados intentos. Inténtelo más tarde."
      );
      return false;
    }

    entry.count += 1;
    return true;
  };
}

export const rateLimitLogin = createRateLimit({
  maxRequests: 3,
  windowTime : 10*60*1000,
  route: "login" 
})

export const rateLimitSignup = createRateLimit({
  maxRequests: 3,
  windowTime : 10*60*1000,
  route: "signup" 
})
