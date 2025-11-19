import { Router } from "../core/classes/class.Router.js";
import { UserController } from "../controllers/UserController.js";

export function createRouter(mongoInstance) {
  const router = new Router();

  const userController = UserController(mongoInstance);

  router.put("/users/:id", userController.update);
  router.get("/users", userController.index);
  router.get("/users/:email", userController.showByEmail);
  

  
  return router;
}
