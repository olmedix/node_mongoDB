import { parseJSONBody } from "../core/includes/inc.http.js";
import { sendError, sendSuccess } from "../core/includes/inc.response.js";
import { validateProject } from "../validators/ProjectValidator.js";

export function projectController(mongoInstance) {
  return {
    // GET /projects
    index: async (req, res) => {
      try {
        const projects = await mongoInstance.findAll();
        sendSuccess(res, 200, projects);
      } catch (err) {
        sendError(res, 500, "Error al listar projects");
      }
    },

    // SELECT * FROM projects WHERE ownerId = id
    // GET /projects/:id
    indexByOwnerId: async (req, res) => {
      try {
        const { id } = req.params || {};
        if (!id) return sendError(res, 400, "Falta parámetro id");

        const projects = await mongoInstance.find({ ownerId: "id" });
        sendSuccess(res, 200, projects);
      } catch (error) {
        sendError(res, 500, "Error al listar projects");
      }
    },

    // POST /projects
    store: async (req, res) => {
      try {
        const body = await parseJSONBody(req);
        const { name, description, ownerId } = body;

        // Validación de datos
        const { isValid, errors } = validateProject(body,mongoInstance);
        if (!isValid) {
          return sendError(res, 400, errors);
        }

        if (!name || !description || !ownerId) {
          return sendError(
            res,
            400,
            "name, description y ownerId son obligatorios"
          );
        }

        const newProject = await mongoInstance.create({
          name,
          description,
          ownerId,
        });

        sendSuccess(res, 200, newProject);
      } catch (error) {
        sendError(res, 500, "Error al crear el project");
      }
    },

    update: async (req, res) => {
      try {
        const { id } = req.params || {};
        if (!id) return sendError(res, 400, "Falta parámetro id");

        const body = await parseJSONBody(req);

        const dataToUpdate = {};
        if ("name" in body) dataToUpdate.name = body.name;
        if ("description" in body) dataToUpdate.description = body.description;
        if ("ownerId" in body) dataToUpdate.ownerId = body.ownerId;

        if (Object.keys(dataToUpdate).length === 0)
          return sendError(res, 400, "No hay campos válidos para actualizar");

        // Validación de datos
        const { isValid, errors } = validateProject(body,mongoInstance);
        if (!isValid) return sendError(res, 400, errors);

        const updatedProject = await mongoInstance.updateById(id, dataToUpdate);

        if (!updatedProject)
          return sendError(res, 404, "Project no encontrado");

        sendSuccess(res, 200, updatedProject);
      } catch (error) {
        sendError(res, 500, "Error al actualizar el project");
      }
    },

    delete: async (req, res) => {
      try {
        const { id } = req.params || {};
        if (!id) return sendError(res, 400, "Falta el parámetro id");

        const deleted = await mongoInstance.deleteById(id);
        if (!deleted) sendError(res, 404, "Project no encontrado");

        sendSuccess(res, 200, { success: true });
      } catch (error) {
        sendError(res, 500, "Error al eliminar project");
      }
    },
  };
}
