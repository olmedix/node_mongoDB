import bcrypt from "bcrypt";
import { signToken } from "../core/includes/jwt.js";
import { createJwtBlacklistRepo } from "../core/includes/jwtBlackList.js";
import { sendError,sendSuccess} from "../core/includes/inc.response.js";
import { parseJSONBody } from "../core/includes/inc.http.js";

export function authController(mongoInstance) {
  return {
    login: async (req, res) => {
      try {
        const { email, password } = await parseJSONBody(req);

        if (!email || !password) {
          return sendError(res, 400, "Email y password son obligatorios");
        }

        const user = await mongoInstance.findByEmail(email);
        if (!user) {
          return sendError(res, 401, "Credenciales inválidas");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return sendError(res, 401, "Credenciales inválidas");
        }

        // GENERAR EL TOKEN AQUÍ
        const token = signToken({
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        });

        return sendSuccess(res, 200, {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      } catch (err) {
        return sendError(res, 500, "Error interno");
      }
    },
    logout: async (req, res) => {
      const jwtBlacklist = createJwtBlacklistRepo(mongoInstance);
      let frase = "";

      req.rawHeaders.forEach((element) => {
        if (element.toString().includes("Bearer")) {
          frase = element.toString();
        }
      });

      if (frase !== "") {
       jwtBlacklist.revokeToken(frase.split(" ")[1].trim());
      }

      return sendSuccess(res, 200,"Logout exitoso");
    },
  };
}
