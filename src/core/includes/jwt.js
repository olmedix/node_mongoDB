import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

if (!JWT_SECRET) {
  console.warn("⚠️ JWT_SECRET no está definido en .env");
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null; // token inválido o expirado
  }
}
