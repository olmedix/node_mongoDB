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
}
