import { Router } from "../core/classes/class.Router.js";
import { UserController } from "../controllers/UserController.js";
import {authBearer, protect } from "../middlewares/authMiddleware.js";


export function createRouter(mongoInstance) {
  const router = new Router();

  const userController = UserController(mongoInstance);

  
  router.get("/users", userController.index);
  router.get("/users/:email", userController.showByEmail);
  router.post("/users", userController.store);

  // Rutas protegidas por middleware
  router.put("/users/:id",protect(authBearer, userController.update));
  router.delete("/users/:id",protect(authBearer, userController.destroy));
  

  
  return router;
}
