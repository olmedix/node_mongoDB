import { ObjectId } from "mongodb";

export async function validateProject(data, mongoUser) {
  const errors = {};

  // NAME
  if ("name" in data) {
    if (typeof data.name !== "string" || data.name.trim().length < 2) {
      errors.name = "El nombre del proyecto debe tener al menos 2 caracteres";
    }
  } else {
    errors.name = "El nombre del proyecto es obligatorio";
  }

  // DESCRIPTION (opcional, pero si viene debe tener mínimo 8)
  if ("description" in data) {
    if (
      typeof data.description !== "string" ||
      data.description.trim().length < 8
    ) {
      errors.description = "La descripción debe tener al menos 8 caracteres";
    }
  }

  // OWNER ID
  if ("ownerId" in data) {
    if (!data.ownerId) {
      errors.ownerId = "ownerId es obligatorio";
    } else {
      // ObjectId válido

      if (!ObjectId.isValid(data.ownerId)) {
        errors.ownerId = "ownerId debe ser un ObjectId válido";
      } else {
        // Verificar que existe en DB
        const user = await mongoUser.findById(data.ownerId);

        if (!user) {
          errors.ownerId = "El ownerId no corresponde a ningún usuario";
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
