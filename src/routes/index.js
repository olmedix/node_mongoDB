import { Router } from "../core/classes/class.Router.js";
import { UserController } from "../controllers/UserController.js";

export function createRouter(mongoInstance) {
  const router = new Router();

  const userController = UserController(mongoInstance);

  router.get("/users", userController.index);

  // Ruta de prueba: GET /status
  router.get("/status", (req, res) => {
    sendJSON(res, 200, {
      ok: true,
      time: new Date().toISOString(),
    });
  });

  
  
  return router;
}
