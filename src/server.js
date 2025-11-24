import http from "http";
import { config } from "dotenv";
import { MongoDB } from "./core/classes/class.MongoDB.js";
import { createRouter } from "./routes/index.js";
import { logInfo } from "./core/includes/inc.logger.js";

config(); // carga .env

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

// Conectar a la base de datos
export const mongoDBUser = new MongoDB({ uri: MONGO_URI, dbName: DB_NAME});
await mongoDBUser.connect();
await mongoDBUser.useCollection("users");

// Conectar a la base de datos
export const mongoDBProject = new MongoDB({ uri: MONGO_URI, dbName: DB_NAME});
await mongoDBProject.connect();
await mongoDBProject.useCollection("projects");

const router = createRouter(mongoDBUser,mongoDBProject);

// ====== Función para crear servidores (normal o de test) ======
function buildServer() {
  return http.createServer((req, res) => {
    router.handle(req, res);
  });
}

// ====== Servidor normal ======
if (process.env.NODE_ENV !== "test") {
  const server = buildServer();

  server.listen(PORT, () => {
    logInfo(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  });
}

// ====== PARA TESTING ======
export function createTestServer() {
  return buildServer();
}

