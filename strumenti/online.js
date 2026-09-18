/* Controlla il sito PUBBLICATO, non i file sul disco.

   La differenza conta: quello che sta in locale e quello che riceve chi
   apre il link sono due cose diverse, e l'unico modo di esserne sicuri e'
   scaricare il secondo.

   Verifica tre cose:
   - che ci sia tutto quello che serve a chi riceve l'invito;
   - che NON ci sia piu' niente del cantiere - il selettore delle scene, il
     cursore del volume, la pagina di laboratorio;
   - che le foto di Gerardo non siano finite online.

     node strumenti/online.js
*/
const https = require("https");

const SITO = "https://phantomrazgriz.github.io/InvitoGerardo";

function chiedi(percorso){
  return new Promise(ok => {
    https.get(SITO + percorso, r => {
      let d = "";
      r.on("data", c => d += c);
      r.on("end", () => ok({ stato: r.statusCode, corpo: d }));
    }).on("error", () => ok({ stato: 0, corpo: "" }));
  });
}

let male = 0;
function esito(nome, ok, dettaglio){
  if (!ok) male++;
  console.log("  " + nome.padEnd(40) + (ok ? "ok" : "NO") +
    (dettaglio ? "   " + dettaglio : ""));
}

(async () => {
  /* --- quello che DEVE esserci --- */
  console.log("quello che serve a chi riceve l'invito:");
  const SERVONO = ["/", "/arte.js", "/salotto.js", "/pigiama.js", "/facile.js",
                   "/mappa.js", "/finale.js", "/suono.js",
                   "/brano.m4a", "/brano.mp3", "/anteprime/social.png"];
  for (const p of SERVONO){
    const r = await chiedi(p);
    esito(p, r.stato === 200, r.stato !== 200 ? "risposta " + r.stato : "");
  }

  const pagina = (await chiedi("/")).corpo;
  for (const [n, c] of [["interruttore del suono", 'id="audio"'],
                        ["schermata d'apertura",   'id="avvio"'],
                        ["brano di sottofondo",    'id="brano"'],
                        ["pulsanti si' e no",      'id="si"'],
                        ["conferma WhatsApp",      'id="conferma"']])
    esito(n, pagina.includes(c));

  /* --- quello che NON deve esserci --- */
  console.log("\nquello che doveva restare in cantiere:");
  for (const [n, p] of [["selettore delle scene", "/prova.js"],
                        ["pagina di laboratorio", "/laboratorio.html"]]){
    const r = await chiedi(p);
    esito(n + " rimosso", r.stato === 404, "risposta " + r.stato);
  }
  esito("la pagina non lo richiama piu'", !pagina.includes("prova.js"));

  /* --- le foto --- */
  console.log("\nle foto di Gerardo:");
  for (const p of ["/materiale/Sala%201.jpeg", "/materiale/"]){
    const r = await chiedi(p);
    esito("fuori dal sito (" + p + ")", r.stato === 404, "risposta " + r.stato);
  }

  console.log(male === 0
    ? "\nil sito e' quello giusto: c'e' tutto l'invito e niente del cantiere"
    : "\n" + male + " problemi");
  process.exit(male === 0 ? 0 : 1);
})();
