import bcrypt from "bcrypt";
import { parseJSONBody } from "../core/includes/inc.http.js";
import { sendError, sendSuccess } from "../core/includes/inc.response.js";
import { validateUpdateUser } from "../validators/UserValidator.js";

export function userController(mongoInstance) {
  return {
    // GET /users
    // Exemple: http://localhost:3000/users?page=1&limit=5&role=Guest

     index: async (req, res) => {
      try {
        // Parsear query params desde req.url
        const baseUrl = `http://${req.headers.host}`; // necesario para URL en Node puro
        const url = new URL(req.url, baseUrl);

        const pageParam  = url.searchParams.get("page");
        const limitParam = url.searchParams.get("limit");
        const role       = url.searchParams.get("role"); 

        // Convertir page y limit a números con valores por defecto
        const page  = pageParam  ? parseInt(pageParam, 10)  : 1;
        const limit = limitParam ? parseInt(limitParam, 10) : 10;

        // Construir filtro para Mongo
        const filter = {};
        if (role) {
          filter.role = role; // por ejemplo "admin" o "user"
        }

        // Pedir datos paginados a la capa de datos
        const { items, total, totalPages, limit: usedLimit, page: usedPage } =
          await mongoInstance.findPaginated(filter, { page, limit });

        // Respuesta estandarizada
        return sendSuccess(res, 200, {
          users: items,
          pagination: {
            page: usedPage,
            limit: usedLimit,
            total,
            totalPages,
          },
          filters: {
            role: role || null,
          },
        });
      } catch (err) {
        console.error("Error en UserController.index:", err);
        return sendError(res, 500, "Error al listar usuarios");
      }
    },

    // GET /users/:email
    showByEmail: async (req, res) => {
      try {
        const { email } = req.params || {};

        if (!email) {
          console.log("Falta parámetro email");
          return sendError(res, 400, "Falta parámetro email");
        }

        const user = await mongoInstance.findByEmail(email);
        if (!user) {
          return sendError(res, 404, "Usuario no encontrado");
        }

        sendSuccess(res, 200, user);
      } catch (err) {
        console.error("Error en UserController.showByEmail:", err);
        sendError(res, 500, "Error al obtener usuario");
      }
    },

    // POST /users
    store: async (req, res) => {
      try {
        const body = await parseJSONBody(req);
        const { name, surname, email, password, role } = body;

        // Validación de datos
        const { isValid, errors } = validateUpdateUser(body);
        if (!isValid) {
          return sendError(res, 400, errors);
        }

        if (!name || !surname || !email || !password) {
          return sendError(
            res,
            400,
            "name, surname, email y password son obligatorios"
          );
        }

        // Verificación de email único
        const emailExists = await mongoInstance.findByEmail(email);
        if (emailExists) {
          return sendError(res, 409, "El email ya está registrado");
        }
        const pass = await bcrypt.hash(password, 10); 

        const newUser = await mongoInstance.create({
          name,
          surname,
          email,
          password:pass,
          role,
        });

        sendSuccess(res, 201, newUser);
      } catch (err) {
        console.error("Error en UserController.store:", err);
        if (err.message.includes("Body JSON inválido")) {
          return sendError(res, 400, "JSON inválido en el body");
        }
        sendError(res, 500, "Error al crear usuario");
      }
    },

    // PUT /users/:id
    update: async (req, res) => {
      try {
        const { id } = req.params || {};
        if (!id) {
          return sendError(res, 400, "Falta parámetro id");
        }

        const body = await parseJSONBody(req);

        // Solo pasamos al User los campos que vengan en body.
        const dataToUpdate = {};
        if ("name" in body) dataToUpdate.name = body.name;
        if ("surname" in body) dataToUpdate.surname = body.surname;
        if ("email" in body) dataToUpdate.email = body.email;
        if ("role" in body) dataToUpdate.role = body.role;

        if (Object.keys(dataToUpdate).length === 0) {
          return sendError(res, 400, "No hay campos válidos para actualizar");
        }

        // Validación de datos
        const { isValid, errors } = validateUpdateUser(body);
        if (!isValid) {
          return sendError(res, 400, errors);
        }

        const updatedUser = await mongoInstance.updateById(id, dataToUpdate);

        if (!updatedUser) {
          return sendError(res, 404, "Usuario no encontrado");
        }

        sendSuccess(res, 200, updatedUser);
      } catch (err) {
        console.error("Error en UserController.update:", err);
        if (err.message.includes("Body JSON inválido")) {
          return sendError(res, 400, "JSON inválido en el body");
        }
        sendError(res, 500, "Error al actualizar usuario");
      }
    },

    // DELETE /users/:id
    destroy: async (req, res) => {
      try {
        const { id } = req.params || {};
        if (!id) {
          return sendError(res, 400, "Falta parámetro id");
        }

        const deleted = await mongoInstance.deleteById(id);

        if (!deleted) {
          return sendError(res, 404, "Usuario no encontrado");
        }

        sendSuccess(res, 200, { success: true });
      } catch (err) {
        console.error("Error en UserController.destroy:", err);
        sendError(res, 500, "Error al eliminar usuario");
      }
    },
  };
}
