import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export class MongoDB {
  constructor({ uri, dbName }) {
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoClient(this.uri);
    this.db = null;
    this.collections = {};
    this.collection = null;
  }

  async connect() {
    if (this.db) return this.db; // ya conectada

    await this.client.connect();

    this.db = this.client.db(this.dbName);
    console.log("✅ Conectado a MongoDB");

    return this.db;
  }

  useCollection(name) {
    if (!this.db)
      throw new Error("Primero debes conectar con la base de datos");

    const col = this.db.collection(name);
    this.collection = col;
    this.collections[name] = col;

    return this;
  }

  getCollection(name) {
    if (!this.db)
      throw new Error("Primero debes conectar con la base de datos");

    if (!this.collections[name]) {
      this.collections[name] = this.db.collection(name);
    }

    return this.collections[name];
  }

  async disconnect() {
    await this.client.close();
    this.db = null;
    console.log("🔌 Conexión a MongoDB cerrada");
  }

  // CREATE
  async create(document) {
    const now = new Date();

    const object = {
      ...document,
      created_at: now,
      updated_at: now,
    };

    const result = await this.collection.insertOne(object);

    return {
      ...object,
      _id: result.insertedId,
    };
  }

  async createUser(document) {
    const now = new Date();

    const hashedPassword = await bcrypt.hash(document.password, 10);

    const object = {
      ...document,
      password: hashedPassword,
      created_at: now,
      updated_at: now,
    };

    const result = await this.collection.insertOne(object);

    return {
      ...object,
      _id: result.insertedId,
    };
  }

  // READ ALL
  async findAll() {
    return this.collection.find({}).toArray();
  }

  // READ ONE BY ID
  async findById(id) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  // READ ONE BY EMAIL
  async findByEmail(email) {
    return this.collection.findOne({ email });
  }

  // READ ONE BY OWNERID
  async findByOwnerId(ownerId) {
    return this.collection.find({ ownerId: ownerId }).toArray();
  }

  // UPDATE BY ID
  async updateById(id, data) {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Invalid update");
    }

    const toSet = {
      ...data,
      updated_at: new Date(),
    };

    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: toSet },
      { returnDocument: "after" }
    );

    return result;
  }

  // DELETE BY ID
  async deleteById(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

   async deleteByEmail(email) {
    const result = await this.collection.deleteOne({email});
    return result.deletedCount === 1;
  }

  // PAGINACIÓN Y FILTROS
  async findPaginated(filter = {}, options = {}) {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;

    // aseguramos valores sanos
    const safePage = page < 1 ? 1 : page;
    const safeLimit = limit < 1 ? 1 : limit > 50 ? 50 : limit; // max 50 por página

    // Esencial para paginar, es el que hace que te saltes los registros anteriores al cambiar de pagina.
    const skip = (safePage - 1) * safeLimit;

    // Ejecutamos en paralelo: datos + total
    const [items, total] = await Promise.all([
      this.collection.find(filter).skip(skip).limit(safeLimit).toArray(),
      this.collection.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / safeLimit) || 1;

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages,
    };
  }
}
