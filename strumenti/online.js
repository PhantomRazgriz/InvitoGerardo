/* Controlla il sito PUBBLICATO, non i file sul disco.

   La differenza conta: quello che c'e' in locale e quello che arriva a
   chi apre il link sono due cose diverse, e l'unico modo di esserne
   sicuri e' scaricare il secondo ed eseguirlo.

   Verifica in particolare che gli arnesi da lavoro - il selettore delle
   scene e il cursore del volume - restino spenti per chiunque non sia
   sulla rete di casa.

     node strumenti/online.js
*/
const https = require("https");
const fs = require("fs");

const SITO = "https://phantomrazgriz.github.io/InvitoGerardo";

function scarica(percorso){
  return new Promise((ok, no) => {
    https.get(SITO + percorso, r => {
      if (r.statusCode !== 200){ no(new Error(percorso + ": " + r.statusCode)); return; }
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => ok(d));
    }).on("error", no);
  });
}

// gli indirizzi da cui qualcuno aprira' davvero l'invito
const VERI = ["phantomrazgriz.github.io", "gerardo60.it", "www.gerardo60.it"];
// e quelli di lavoro, dove gli arnesi devono esserci
const CASA = ["localhost", "127.0.0.1", "192.168.1.9", "100.82.105.15"];

(async () => {
  let male = 0;
  const prova = fs.readFileSync("prova.js", "utf8");
  const vivo = await scarica("/prova.js");

  console.log("il file pubblicato e quello sul disco:");
  const uguali = vivo.replace(/\r\n/g, "\n") === prova.replace(/\r\n/g, "\n");
  console.log("  " + (uguali ? "stesso contenuto (cambiano solo i fine riga)"
                              : "DIVERSI: online c'e' altro"));
  if (!uguali) male++;

  /* La condizione si prende dal file SCARICATO e si esegue davvero, con
     l'indirizzo giusto al posto di location. Leggerla non basterebbe:
     conta come si comporta. */
  const pezzo = /const LOCALE =([\s\S]*?);\n/.exec(vivo);
  if (!pezzo){ console.log("  NON TROVO LA CONDIZIONE"); process.exit(1); }

  const acceso = h => {
    const location = { hostname: h, protocol: "https:" };
    return eval("(" + pezzo[1] + ")");
  };

  console.log("\ngli arnesi da lavoro (selettore scene, cursore volume):");
  for (const h of VERI){
    const c = acceso(h);
    if (c) male++;
    console.log("  " + h.padEnd(26) + (c ? "COMPAIONO   <-- ERRORE" : "spenti"));
  }
  for (const h of CASA){
    const c = acceso(h);
    if (!c) male++;
    console.log("  " + h.padEnd(26) + (c ? "attivi (giusto: e' casa)" : "SPENTI   <-- servono"));
  }

  /* Il cursore del volume sta dentro la stessa guardia? Se qualcuno lo
     spostasse fuori, comparirebbe online senza che nessuno se ne accorga. */
  const dopoGuardia = vivo.indexOf("if (!LOCALE)");
  const cursore = vivo.indexOf("type = 'range'");
  const selettore = vivo.indexOf("const SALTI");
  console.log("\ndentro la guardia:");
  console.log("  cursore del volume   " +
    (cursore > dopoGuardia ? "si'" : "NO   <-- comparirebbe online"));
  console.log("  selettore delle scene " +
    (selettore > dopoGuardia ? "si'" : "NO   <-- comparirebbe online"));
  if (cursore < dopoGuardia || selettore < dopoGuardia) male++;

  // e quello che INVECE deve esserci per tutti
  const pagina = await scarica("/");
  console.log("\nquello che deve esserci per chi riceve l'invito:");
  for (const [n, c] of [["interruttore del suono", 'id="audio"'],
                        ["brano di sottofondo",    'id="brano"'],
                        ["pulsanti si' e no",      'id="si"'],
                        ["conferma WhatsApp",      'id="conferma"']]){
    const ok = pagina.includes(c);
    if (!ok) male++;
    console.log("  " + n.padEnd(24) + (ok ? "c'e'" : "MANCA"));
  }

  console.log(male === 0 ? "\ntutto a posto" : "\n" + male + " problemi");
  process.exit(male === 0 ? 0 : 1);
})().catch(e => { console.log("non riesco a controllare: " + e.message); process.exit(1); });
