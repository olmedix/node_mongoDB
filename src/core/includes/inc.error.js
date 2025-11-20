import { sendJSON } from "./inc.http.js";

// Centralización de manejo de errores no controlados
export function errorHandler(err,req,res) {
  console.error("Error no controlado:");
  console.error(err);
  
  return sendJSON(res, 500, {
    ok: false,
    error: "Error interno del servidor",
  });
}

// Wrapper para controllers que no usan middlewares
export function wrapController(controller) {
  return async (req, res) => {
    try {
      await controller(req, res);
    } catch (err) {
      errorHandler(err, req, res);
    }
  };
}
