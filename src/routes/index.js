import { Router } from "../core/classes/class.Router.js";
import { userController } from "../controllers/UserController.js";
import { authController } from "../controllers/AuthController.js";
import { createAuthBearer, protect } from "../middlewares/authMiddleware.js";


export function createRouter(mongoInstance) {
  const router = new Router();

  const userControllerInstance = userController(mongoInstance);
  const authControllerInstance = authController(mongoInstance);

  const authBearer = createAuthBearer(mongoInstance);

  
  router.get("/users", userControllerInstance.index);
  router.get("/users/:email", userControllerInstance.showByEmail);
  router.post("/users", userControllerInstance.store);

  // Login
  router.post("/login", authControllerInstance.login);
  // Logout
  router.post("/logout", protect(authBearer, authControllerInstance.logout));

  // Rutas protegidas por middleware
  router.put("/users/:id",protect(authBearer, userControllerInstance.update));
  router.delete("/users/:id",protect(authBearer, userControllerInstance.destroy));
  

  
  return router;
}
