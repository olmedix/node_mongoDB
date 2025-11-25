import request from "supertest";
import {
  createTestServer,
  mongoDBUser,
  mongoDBProject,
} from "../src/server.js";

let server;

beforeAll(async () => {
  await mongoDBUser.deleteByEmail("test@login.com");
  await mongoDBUser.deleteByEmail("anthony@mail.com");

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

describe("User: Store" , () => {

  test("Debe devolver 200 si se ha insertado un usuario en la BBDD" , async () => {
    const res = await request(server)
    .post("/users")
    .send({
    name: "Andrés",
    surname: "Santos",
    email: "anthony@mail.com",
    password: "123456",
    role: "Guest"
  })
  .expect(201);

  expect(res.body.ok).toBe(true);
  expect(res.body.data).toBeDefined();
  expect(res.body.error).toBeNull();

  })

  test("Debe devolver 400 si falta un campo obligatorio" , async () => {
    const res = await request(server)
    .post("/users")
    .send({
    //name: "Andrés",
    surname: "Santos",
    email: "anthony@mail.com",
    password: "123456",
    role: "Guest"
  })
  .expect(400);

  expect(res.body.ok).toBe(false);
  expect(res.body.data).toBeNull();
  expect(res.body.error).toBe("name, surname, email y password son obligatorios");
  })

  test("Debe devolver 409 si el email ya está registrado" , async () => {
    const res = await request(server)
    .post("/users")
    .send({
    name: "Andrés",
    surname: "Santos",
    email: "anthony@mail.com",
    password: "123456",
    role: "Guest"
  })
  .expect(409);

  expect(res.body.ok).toBe(false);
  expect(res.body.data).toBeNull();
  expect(res.body.error).toBe("El email ya está registrado");
  })


});

describe("User: show/:email", () => {

  test("Debe devolver 400 si falta el parámetro email", async () => {

    const res = await request(server)
    .get("/users/")
    .expect(400);

    expect(res.body.ok).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBe("Falta parámetro email");
  })

  test("Debe devolver 404 si el email no está en la BBDD", async () => {

    const res = await request(server)
    .get("/users/test1111@login.com")
    .expect(404);

    expect(res.body.ok).toBe(false);
    expect(res.body.data).toBeNull();
    expect(res.body.error).toBe("Usuario no encontrado");
  })

  test("Debe devolver 200 si encuentra el usuario mediante email", async () => {

    const res = await request(server)
    .get("/users/test@login.com")
    .expect(200);

    expect(res.body.ok).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.error).toBeNull();
  })

});

describe("Auth: Login", () => {
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

describe("Auth: Logout", () => {
  test("Debe devolver 200 y agregar el token a la blacklist", async () => {
    const login = await request(server)
      .post("/login")
      .send({
        email: "test@login.com",
        password: "123456",
      })
      .expect(200);

    const token = login.body.data.token;

    const res = await request(server)
      .post("/logout")
      //set() para enviar headers
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const blackList = mongoDBUser.getCollection("jwtBlackList");
    const tokenBlackList = await blackList.findOne({ token });

    expect(res.body.ok).toBe(true);
    expect(tokenBlackList).not.toBeNull();
    expect(tokenBlackList.token).toBe(token);
  });
});


