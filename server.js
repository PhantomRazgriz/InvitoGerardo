/* Server locale per lo sviluppo. Nessuna dipendenza.
     node server.js  [porta]

   Tre cose che fa e che servono davvero:
   - non mette niente in cache, cosi' una modifica si vede al primo aggiornamento
   - ricarica la pagina da sola quando salvi un file
   - si affaccia sulla rete di casa, per provare l'invito dal telefono
*/
const http = require("http");
const fs   = require("fs");
const path = require("path");
const os   = require("os");

const PORTA = Number(process.argv[2] || 5173);
const RADICE = __dirname;
const VIETATE = ["materiale", ".git", "node_modules"];

const TIPI = {
  ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",   ".png":"image/png", ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg", ".svg":"image/svg+xml", ".json":"application/json",
  ".mp3":"audio/mpeg", ".ogg":"audio/ogg", ".ico":"image/x-icon"
};

/* --- chi ascolta i cambiamenti --- */
const ascoltatori = new Set();
let attesa = null;
fs.watch(RADICE, { recursive: true }, (_, file) => {
  if (!file || VIETATE.some(v => file.startsWith(v))) return;
  clearTimeout(attesa);                       // gli editor salvano piu' volte di fila
  attesa = setTimeout(() => {
    console.log("  ~ " + file + " -> ricarico");
    for (const r of ascoltatori) r.write("data: ricarica\n\n");
  }, 120);
});

const SPIA = `
<script>
new EventSource('/__cambiamenti').onmessage = () => location.reload();
</script>`;

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);

  if (url === "/__cambiamenti"){
    res.writeHead(200, { "Content-Type":"text/event-stream", "Cache-Control":"no-cache", "Connection":"keep-alive" });
    res.write("\n");
    ascoltatori.add(res);
    req.on("close", () => ascoltatori.delete(res));
    return;
  }

  let rel = url === "/" ? "index.html" : url.replace(/^\/+/, "");
  const completo = path.resolve(RADICE, rel);

  // niente uscite dalla cartella, niente cartelle private
  const dentro = completo.startsWith(RADICE);
  const privata = VIETATE.some(v => path.relative(RADICE, completo).split(path.sep)[0] === v);
  if (!dentro || privata){
    res.writeHead(403, { "Content-Type":"text/plain; charset=utf-8" });
    return res.end("Non accessibile.");
  }

  fs.readFile(completo, (err, dati) => {
    if (err){
      res.writeHead(404, { "Content-Type":"text/html; charset=utf-8" });
      return res.end("<h1>404</h1><p>" + rel + " non c'e'.</p>");
    }
    const est = path.extname(completo).toLowerCase();
    const intestazioni = {
      "Content-Type": TIPI[est] || "application/octet-stream",
      "Cache-Control": "no-store, must-revalidate"
    };
    if (est === ".html") dati = Buffer.from(dati.toString().replace("</body>", SPIA + "\n</body>"));
    res.writeHead(200, intestazioni);
    res.end(dati);
  });
}).listen(PORTA, "0.0.0.0", () => {
  const indirizzi = [];
  for (const schede of Object.values(os.networkInterfaces()))
    for (const s of schede || [])
      if (s.family === "IPv4" && !s.internal) indirizzi.push(s.address);

  console.log("\n  L'invito e' in ascolto.\n");
  console.log("    su questo computer   http://localhost:" + PORTA);
  for (const ip of indirizzi)
    console.log("    dal telefono         http://" + ip + ":" + PORTA);
  console.log("\n    laboratorio          http://localhost:" + PORTA + "/laboratorio.html");
  console.log("\n  Ctrl+C per fermarlo.\n");
});
