import { parseJSONBody } from "../core/includes/inc.http.js";
import { sendError, sendSuccess } from "../core/includes/inc.response.js";
import { validateProject } from "../validators/ProjectValidator.js";

export function projectController(mongoDBProject, mongoDBUser) {
  return {
    // GET /projects
    index: async (req, res) => {
      try {
        const projects = await mongoDBProject.findAll();
        sendSuccess(res, 200, projects);
      } catch (err) {
        sendError(res, 500, "Error al listar projects");
      }
    },

    // SELECT * FROM projects WHERE ownerId = id
    // GET /projects/:id
    indexByOwnerId: async (req, res) => {
      try {
        const { ownerId } = req.params || {};
        if (!ownerId) return sendError(res, 400, "Falta parámetro id");
        
        const projects = await mongoDBProject.findByOwnerId(ownerId);

        console.log("proyecto: " + projects);
        return sendSuccess(res, 200, projects);
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
        const { isValid, errors } = await validateProject(body, mongoDBUser);
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

        const newProject = await mongoDBProject.create({
          name,
          description,
          ownerId,
        });
        console.log(newProject);

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
        const { isValid, errors } = await validateProject(body, mongoDBUser);
        if (!isValid) return sendError(res, 400, errors);

        const updatedProject = await mongoDBProject.updateById(
          id,
          dataToUpdate
        );

        if (!updatedProject)
          return sendError(res, 404, "Project no encontrado");

        return sendSuccess(res, 200, updatedProject);
      } catch (error) {
        sendError(res, 500, "Error al actualizar el project");
      }
    },

    destroy: async (req, res) => {
      try {
        const { id } = req.params || {};
        if (!id) return sendError(res, 400, "Falta el parámetro id");

        const deleted = await mongoDBProject.deleteById(id);
        if (!deleted) sendError(res, 404, "Project no encontrado");

        sendSuccess(res, 200, { success: true });
      } catch (error) {
        sendError(res, 500, "Error al eliminar project");
      }
    },
  };
}
