import {sendJSON} from "../includes/inc.http.js";

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

    const route = this.routes.find(
      (r) => r.method === method && r.path === path
    );

    if (!route) {
      return sendJSON(res, 404, { error: "Not found" });
    }

    try {
      // handler(req, res)
      await route.handler(req, res);
    } catch (err) {
      console.error("Error en handler:", err);
      sendJSON(res, 500, { error: "Internal server error" });
    }
  }
}