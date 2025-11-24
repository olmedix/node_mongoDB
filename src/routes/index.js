import { Router } from "../core/classes/class.Router.js";
import { createAuthBearer,requireRole,requireSelfOrAdmin, protect } from "../middlewares/authMiddleware.js";
import { wrapController } from "../core/includes/inc.error.js";
import { userController } from "../controllers/UserController.js";
import { authController } from "../controllers/AuthController.js";
import { projectController } from "../controllers/ProjectController.js";


export function createRouter(mongoDBUser,mongoDBProject) {
  const router = new Router();

  const userControllerInstance = userController(mongoDBUser);
  const authControllerInstance = authController(mongoDBUser);
  const projectControllerInstance = projectController(mongoDBProject,mongoDBUser);

  const authBearer = createAuthBearer(mongoDBUser);


  // Rutas públicas
  router.get("/users/:email",wrapController(userControllerInstance.showByEmail));
  router.post("/users", wrapController(userControllerInstance.store));

  // Login
  router.post("/login", wrapController(authControllerInstance.login));
  // Logout
  router.post("/logout", protect(authBearer, authControllerInstance.logout));

   // Ruta para administradores y managers
  //router.get("/users",protect(authBearer, requireRole("admin","Guest"), userControllerInstance.index));
  router.get("/users",protect(userControllerInstance.index));

  // Rutas protegidas por middlewarE , bearer y usuario propio y administrador
  router.put("/users/:id", protect(authBearer, requireSelfOrAdmin, userControllerInstance.update));
  router.delete("/users/:id", protect(authBearer, requireSelfOrAdmin, userControllerInstance.destroy));



  // RUTAS DE PROJECT

  router.get("/projects",wrapController(projectControllerInstance.index));
  router.get("/projects/:ownerId",wrapController(projectControllerInstance.indexByOwnerId));
  router.post("/projects",wrapController(projectControllerInstance.store));
  router.put("/projects/:id",wrapController(projectControllerInstance.update));
  router.delete("/projects/:id",wrapController(projectControllerInstance.destroy));

  return router;
}
