/* Controlla le due garanzie del selettore delle scene:
   1. che compaia sugli indirizzi locali e su nessun altro
   2. che tutti i nomi che usa esistano davvero in index.html

     node strumenti/prova.js
*/
const fs = require("fs");

const sorgente = fs.readFileSync("prova.js", "utf8");
const pagina = fs.readFileSync("index.html", "utf8");

/* --- 1. dove compare --- */
// la stessa condizione del file, ripresa dal sorgente per non poter divergere
const blocco = sorgente.match(/const LOCALE =([\s\S]*?);\n/)[1];
const locale = h => {
  const location = { hostname: h, protocol: "http:" };
  return eval(blocco.replace(/location/g, "location"));
};

const DEVE = ["localhost", "127.0.0.1", "192.168.1.9", "100.82.105.15",
              "10.0.0.5", "172.16.3.2", "172.31.255.1"];
const NON_DEVE = ["phantomrazgriz.github.io", "gerardo60.it", "example.com",
                  "1000.1.1.1", "172.32.0.1", "8.8.8.8", "notlocalhost.com"];

let male = 0;
console.log("deve comparire:");
for (const h of DEVE){
  const ok = locale(h);
  if (!ok) male++;
  console.log("  " + h.padEnd(26) + (ok ? "si" : "NO   <-- errore"));
}
console.log("non deve comparire:");
for (const h of NON_DEVE){
  const ok = !locale(h);
  if (!ok) male++;
  console.log("  " + h.padEnd(26) + (ok ? "no" : "COMPARE   <-- ERRORE"));
}

/* --- 2. i nomi che usa esistono nella pagina? --- */
const USATI = ["entraInSalotto", "entraInFacile", "entraInMappa", "entraInCaduta",
               "entraInScelta", "mostraFrase", "premuto", "fineAggancio",
               "tSalotto", "passoFacile", "tPasso", "livelloMappa", "tMappa",
               "strettaLibera", "tScelta", "rifiuti", "tRifiuto", "SC", "DOMANDE"];

console.log("\nnomi presi dalla pagina:");
for (const n of USATI){
  if (!sorgente.includes(n)) continue;
  const dichiarato = new RegExp("(function|let|const|var)\\s+" + n + "\\b").test(pagina)
                  || new RegExp("(let|const)\\s+[^;\\n]*\\b" + n + "\\b\\s*=").test(pagina);
  if (!dichiarato) male++;
  console.log("  " + n.padEnd(18) + (dichiarato ? "c'e'" : "MANCA   <-- ERRORE"));
}

/* --- 3. e la pagina lo carica per ultimo? --- */
const iProva = pagina.indexOf('src="prova.js"');
const iCorpo = pagina.lastIndexOf("</script>", iProva);
console.log("\ncaricato dopo il codice della pagina: " +
  (iProva > 0 && iCorpo > 0 ? "si" : "NO"));
if (iProva < 0) male++;

console.log(male === 0 ? "\ntutto a posto" : "\n" + male + " problemi");
process.exit(male === 0 ? 0 : 1);
