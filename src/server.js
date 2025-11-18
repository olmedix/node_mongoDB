import http from "http";
import { config } from "dotenv";
import { MongoDB } from "./core/classes/class.MongoDB.js";
import { createRouter } from "./routes/index.js";

config(); // carga .env
console.clear();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = "users";

// Conectar a la base de datos
const mongoDB = new MongoDB({ uri: MONGO_URI, dbName: DB_NAME});
const db = await mongoDB.connect();
await mongoDB.useCollection(COLLECTION_NAME);
//await mongoDB.create({ name: "Juan", surname: "Pérez" });


const router = createRouter({db , mongoDB });

const server = http.createServer((req, res) => {
  router.handle(req, res);
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
