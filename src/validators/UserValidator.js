export function validateUpdateUser(data) {
  const errors = {};

  if ("name" in data) {
    if (typeof data.name !== "string" || data.name.trim().length < 4) {
      errors.name = "El nombre debe tener al menos 4 caracteres";
    }
  }

  if ("surname" in data) {
    if (typeof data.surname !== "string" || data.surname.trim().length < 2) {
      errors.surname = "El apellido debe tener al menos 2 caracteres";
    }
  }

  if ("email" in data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof data.email !== "string" || !emailRegex.test(data.email)) {
      errors.email = "El email no es válido";
    }
  }

  if ("password" in data) {
    if (typeof data.password !== "string" || data.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }
  }

  if ("role" in data) {
    const validRoles = ["Admin", "User", "Guest"];
    if (typeof data.role !== "string" || !validRoles.includes(data.role)) {
      errors.role = `El rol debe ser uno de los siguientes: ${validRoles.join(", ")}`;
    }
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}

