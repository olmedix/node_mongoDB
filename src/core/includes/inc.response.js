import { sendJSON } from "./inc.http.js";

export function sendSuccess(res, statusCode, data) {
  return sendJSON(res, statusCode, {
    ok: true,
    data,
    error: null,
  });
}

export function sendError(res, statusCode, message) {
  return sendJSON(res, statusCode, {
    ok: false,
    data: null,
    error: message,
  });
}
