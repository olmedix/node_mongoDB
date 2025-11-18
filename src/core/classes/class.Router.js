import { sendJSON } from "../includes/inc.http.js";

export class Router {
  constructor() {
    this.routes = [];
  }

  add(method, path, handler) {
    this.routes.push({
      method: method.toUpperCase(),
      path,
      handler,
    });
  }

  get(path, handler) {
    this.add("GET", path, handler);
  }

  post(path, handler) {
    this.add("POST", path, handler);
  }

  put(path, handler) {
    this.add("PUT", path, handler);
  }

  delete(path, handler) {
    this.add("DELETE", path, handler);
  }

  // Método que llamará nuestro server HTTP
  async handle(req, res) {
    const { method, url } = req;
    const path = url.split("?")[0];

    const route = this.routes.find((r) => {
      if (r.method !== method) return false;

      const routeParts = r.path.split("/");
      const pathParts = path.split("/");

      if (routeParts.length !== pathParts.length) return false;

      // COMPARA CADA PARTE, SI ES DINÁMICA (:) ACEPTA CUALQUIER COSA
      // SI NO, DEBE COINCIDIR EXACTAMENTE
      return routeParts.every((part, i) => {
        return part.startsWith(":") || part === pathParts[i];
      });
    });

    if (!route) {
      return sendJSON(res, 404, { error: "Not found" });
    }

    // Extraer parámetros dinámicos
    const routeParts = route.path.split("/");
    const pathParts = path.split("/");

    req.params = {};
    routeParts.forEach((part, i) => {
      if (part.startsWith(":")) {
        const key = part.slice(1);
        req.params[key] = decodeURIComponent(pathParts[i]);
      }
    });

    try {
      await route.handler(req, res);
    } catch (err) {
      console.error("Error en handler:", err);
      sendJSON(res, 500, { error: "Internal server error" });
    }
  }
}
