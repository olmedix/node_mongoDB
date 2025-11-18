
// Helper para enviar respuestas JSON en HTTP
export function sendJSON(res, statusCode, data, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  };

  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
}


