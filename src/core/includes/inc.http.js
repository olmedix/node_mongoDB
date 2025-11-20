
// Helper para enviar respuestas JSON en HTTP
export function sendJSON(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

export async function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      if (!body) return resolve({}); // sin body → objeto vacío

      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (err) {
        reject(new Error("Body JSON inválido"));
      }
    });

    req.on("error", (err) => {
      reject(err);
    });
  });
}


