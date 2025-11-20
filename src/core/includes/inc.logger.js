function now() {
  return new Date().toLocaleString("es-ES", {
    timeZone: "Europe/Madrid",
    hour12: false
  });
}

export function logInfo(msg, ...args) {
  console.log(`[INFO] ${now()} - ${msg}`, ...args);
}

export function logWarn(msg, ...args) {
  console.warn(`[WARN] ${now()} - ${msg}`, ...args);
}

export function logError(msg, ...args) {
  console.error(`[ERROR] ${now()} - ${msg}`, ...args);
}
