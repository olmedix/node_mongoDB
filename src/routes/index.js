import { Router } from "../core/classes/class.Router.js";
import { userController } from "../controllers/UserController.js";
import { authController } from "../controllers/AuthController.js";
import { createAuthBearer,requireRole,requireSelfOrAdmin, protect } from "../middlewares/authMiddleware.js";
import { wrapController } from "../core/includes/inc.error.js";

export function createRouter(mongoInstance) {
  const router = new Router();

  const userControllerInstance = userController(mongoInstance);
  const authControllerInstance = authController(mongoInstance);

  const authBearer = createAuthBearer(mongoInstance);


  // Rutas públicas
  router.get(
    "/users/:email",
    wrapController(userControllerInstance.showByEmail)
  );
  router.post("/users", wrapController(userControllerInstance.store));

  // Login
  router.post("/login", wrapController(authControllerInstance.login));
  // Logout
  router.post("/logout", protect(authBearer, authControllerInstance.logout));

   // Ruta para administradores y managers
  router.get(
    "/users",
    protect(authBearer, requireRole("admin","Guest"), userControllerInstance.index)
  );

  // Rutas protegidas por middleware
  router.put("/users/:id", protect(authBearer, requireSelfOrAdmin, userControllerInstance.update));
  router.delete(
    "/users/:id",
    protect(authBearer, requireSelfOrAdmin, userControllerInstance.destroy)
  );

  return router;
}
