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
const mongoDBUser = new MongoDB({ uri: MONGO_URI, dbName: DB_NAME});
await mongoDBUser.connect();
await mongoDBUser.useCollection("users");

// Conectar a la base de datos
const mongoDBProject = new MongoDB({ uri: MONGO_URI, dbName: DB_NAME});
await mongoDBProject.connect();
await mongoDBProject.useCollection("projects");

const router = createRouter(mongoDBUser,mongoDBProject);

const server = http.createServer((req, res) => {
  router.handle(req, res);
});

server.listen(PORT, () => {
  logInfo(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
