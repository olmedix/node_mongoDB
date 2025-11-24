import request from "supertest";
import { createTestServer,mongoDBUser,mongoDBProject } from "../src/server.js";


describe("Auth: Login", () => {
  let server;

  beforeAll(async () => {

    await mongoDBUser.deleteByEmail("test@login.com");

    await mongoDBUser.createUser({
      name: "Test",
      surname: "Login",
      email: "test@login.com",
      password: "123456",
      role: "User",
    });
  });

  beforeEach(() => {
    server = createTestServer();
  });

  afterAll(async () => {
    if (mongoDBUser && mongoDBUser.client) {
      await mongoDBUser.disconnect();
    }

    if (mongoDBProject && mongoDBProject.client) {
      await mongoDBProject.disconnect();
    }
  });

  test("Debe devolver 200 y un token válido al hacer login", async () => {
    const res = await request(server)
      .post("/login")
      .send({
        email: "test@login.com",
        password: "123456",
      })
      .expect(200);

    // Ajustado a tu sendSuccess / sendError típicos
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe("string");
  });

  test("Debe devolver 401 si la contraseña es incorrecta", async () => {
    const res = await request(server)
      .post("/login")
      .send({
        email: "test@login.com",
        password: "password_incorrecto",
      })
      .expect(401);

    expect(res.body.error).toBe("Credenciales inválidas");
  });

  test("Debe devolver 400 si faltan email o password", async () => {
    const res = await request(server)
      .post("/login")
      .send({
        email: "test@login.com",
        // falta password
      })
      .expect(400);

    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe("Email y password son obligatorios");
  });
});
