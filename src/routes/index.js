import { Router } from "../core/classes/class.Router.js";
import { userController } from "../controllers/UserController.js";
import { authController } from "../controllers/AuthController.js";
import { createAuthBearer, protect } from "../middlewares/authMiddleware.js";
import { wrapController } from "../core/includes/inc.error.js";


export function createRouter(mongoInstance) {
  const router = new Router();

  const userControllerInstance = userController(mongoInstance);
  const authControllerInstance = authController(mongoInstance);

  const authBearer = createAuthBearer(mongoInstance);

  
  router.get("/users",wrapController(userControllerInstance.index));
  router.get("/users/:email", wrapController(userControllerInstance.showByEmail));
  router.post("/users", wrapController(userControllerInstance.store));

  // Login
  router.post("/login", wrapController(authControllerInstance.login));
  // Logout
  router.post("/logout", protect(authBearer, authControllerInstance.logout));

  // Rutas protegidas por middleware
  router.put("/users/:id",protect(authBearer, userControllerInstance.update));
  router.delete("/users/:id",protect(authBearer, userControllerInstance.destroy));
  

  
  return router;
}
