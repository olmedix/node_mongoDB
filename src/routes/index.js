// src/routes/index.js
import { Router } from "../core/classes/class.Router.js";
import { sendJSON } from "../core/includes/inc.http.js";

export function createRouter() {
  const router = new Router();

  // Ruta de prueba: GET /status
  router.get("/status", (req, res) => {
    sendJSON(res, 200, {
      ok: true,
      time: new Date().toISOString(),
    });
  });

  
  
  return router;
}
