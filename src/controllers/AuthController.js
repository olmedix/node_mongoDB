import bcrypt from "bcrypt";
import { signToken } from "../core/includes/jwt.js";
import { revokeToken } from "../core/includes/jwtBlackList.js";
import { sendJSON } from "../core/includes/inc.http.js";
import { parseJSONBody } from "../core/includes/inc.jsonBody.js";

export function authController(mongoInstance) {
  return {
    login: async (req, res) => {
      try {
        const { email, password } = await parseJSONBody(req);

        if (!email || !password) {
          return sendJSON(res, 400, {
            error: "Email y password son obligatorios",
          });
        }

        const user = await mongoInstance.findByEmail(email);
        if (!user) {
          return sendJSON(res, 401, { error: "Credenciales inválidas" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return sendJSON(res, 401, { error: "Credenciales inválidas" });
        }

        // GENERAR EL TOKEN AQUÍ
        const token = signToken({
          id: user._id.toString(),
          email: user.email,
          role: user.role,
        });

        return sendJSON(res, 200, {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      } catch (err) {
        console.error("Error en login:", err);
        return sendJSON(res, 500, { error: "Error interno" });
      }
    },
    logout: async (req, res) => {
      let frase="";

      req.rawHeaders.forEach(element => {
        if(element.toString().includes("Bearer")){
          frase=element.toString();
        } 
      });

      if(frase !== ""){
        revokeToken(frase.split(" ")[1].trim());
      }
      return sendJSON(res, 200, { message: "Logout exitoso" });
    }
  };
}
