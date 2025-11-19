export function authBearer(req,res) {
  const header = req.headers["authorization"];

  if (!header || !header.startsWith("Bearer ")) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Token no proporcionado" }));
    return false;
  }

  const token = header.split(" ")[1];

  if (token !== "12345"){
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Token incorrecto" }));
    return false;
  }

  return true;

}


export function protect(middleware, controller) {
  return (req, res) => {
    const ok = middleware(req, res);
    if (!ok) return;
    controller(req, res);
  };
}
