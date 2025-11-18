import { sendJSON } from "../core/includes/inc.http.js";
import { parseJSONBody } from "../core/includes/inc.jsonBody.js";

export function UserController(mongoInstance) {
  return {
    // GET /users
    index: async (req, res) => {
      try {
        const users = await mongoInstance.findAll();
        sendJSON(res, 200, users);
      } catch (err) {
        console.error("Error en UserController.index:", err);
        sendJSON(res, 500, { error: "Error al listar usuarios" });
      }
    },

    // GET /users/:id
    show: async (req, res) => {
      try {
        const { id } = req.params || {}; // req.params lo rellenará el router cuando lo ampliemos

        if (!id) {
          return sendJSON(res, 400, { error: "Falta parámetro id" });
        }

        const user = await mongoInstance.findById(id);

        if (!user) {
          return sendJSON(res, 404, { error: "Usuario no encontrado" });
        }

        sendJSON(res, 200, user);
      } catch (err) {
        console.error("Error en UserController.show:", err);
        sendJSON(res, 500, { error: "Error al obtener usuario" });
      }
    },

    // GET /users/:email
    showByEmail: async (req, res) => {
      try {
        const { email } = req.params || {}; // req.params lo rellenará el router cuando lo ampliemos
        console.log("Email recibido en showByEmail:", email);

        if (!email) {
          console.log("Falta parámetro email");
          return sendJSON(res, 400, { error: "Falta parámetro email" });
        }

        const user = await mongoInstance.findByEmail(email);
        if (!user) {
          return sendJSON(res, 404, { error: "Usuario no encontrado" });
        }

        sendJSON(res, 200, user);
      } catch (err) {
        console.error("Error en UserController.showByEmail:", err);
        sendJSON(res, 500, { error: "Error al obtener usuario" });
      }
    },

    // POST /users
    store: async (req, res) => {
      try {
        const body = await parseJSONBody(req);
        const { name, surname, email, role } = body;

        if (!name || !surname || !email) {
          return sendJSON(res, 400, {
            error: "name, surname y email son obligatorios",
          });
        }

        // Aquí podrías comprobar si existe ya un usuario con ese email usando findByEmail
        const newUser = await mongoInstance.create({
          name,
          surname,
          email,
          role,
        });

        sendJSON(res, 201, newUser);
      } catch (err) {
        console.error("Error en UserController.store:", err);
        if (err.message.includes("Body JSON inválido")) {
          return sendJSON(res, 400, { error: "JSON inválido en el body" });
        }
        sendJSON(res, 500, { error: "Error al crear usuario" });
      }
    },

    // PUT /users/:id
    update: async (req, res) => {
      try {
        const { id } = req.params || {};
        if (!id) {
          return sendJSON(res, 400, { error: "Falta parámetro id" });
        }

        const body = await parseJSONBody(req);

        // Solo pasamos al User los campos que vengan en body.
        const dataToUpdate = {};
        if ("name" in body) dataToUpdate.name = body.name;
        if ("surname" in body) dataToUpdate.surname = body.surname;
        if ("role" in body) dataToUpdate.role = body.role;

        if (Object.keys(dataToUpdate).length === 0) {
          return sendJSON(res, 400, {
            error: "No hay campos válidos para actualizar",
          });
        }

        const updatedUser = await mongoInstance.updateById(id, dataToUpdate);

        if (!updatedUser) {
          return sendJSON(res, 404, { error: "Usuario no encontrado" });
        }

        sendJSON(res, 200, updatedUser);
      } catch (err) {
        console.error("Error en UserController.update:", err);
        if (err.message.includes("Body JSON inválido")) {
          return sendJSON(res, 400, { error: "JSON inválido en el body" });
        }
        sendJSON(res, 500, { error: "Error al actualizar usuario" });
      }
    },

    // DELETE /users/:id
    destroy: async (req, res) => {
      try {
        const { id } = req.params || {};
        if (!id) {
          return sendJSON(res, 400, { error: "Falta parámetro id" });
        }

        const deleted = await mongoInstance.deleteById(id);

        if (!deleted) {
          return sendJSON(res, 404, { error: "Usuario no encontrado" });
        }

        sendJSON(res, 200, { success: true });
      } catch (err) {
        console.error("Error en UserController.destroy:", err);
        sendJSON(res, 500, { error: "Error al eliminar usuario" });
      }
    },
  };
}
