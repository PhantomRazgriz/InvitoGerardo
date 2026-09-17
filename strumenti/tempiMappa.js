/* Quanto dura la scena della mappa adesso che va da sola, e soprattutto
   quanto resta a schermo ogni cosa da leggere.

   Da quando il tocco non la comanda piu', i tempi non li aggiusta piu'
   nessuno: devono bastare cosi' come sono, anche a chi legge piano. Questa
   prova rifa' il giro esatto della pagina e misura le permanenze.

     node strumenti/tempiMappa.js
*/
const M = require("../mappa.js");

const LETTURA = 105;
const limite = M.FASI.comparsa + M.FASI.scansione + M.FASI.agganciato;

// le frasi vere della scena, per sapere quanto ci mettono a scriversi
const FRASI = [
  "Ma parliamo dell\u2019evento.",
  "Ecco il luogo dove avverr\u00e0 la festa.",
  "Cavallino Rosso San Giovanni Rotondo (FG) sabato 7 novembre 2026, ore 19:30"
];
const scrittura = n => Math.ceil(FRASI[n].length * 26 / 16.67);

let liv = 0, t = 0, iFrase = 0, scriv = scrittura(0), tLettura = 0;
let f = 0;
const eventi = [];
const restaSchermo = new Map();

while (f < 6000){
  f++;
  const ultimo = liv >= M.LIVELLI.length - 1;

  if (scriv > 0){ scriv--; tLettura = 0; } else tLettura++;

  const daLeggere = !ultimo && t >= limite && tLettura < LETTURA;
  if (scriv === 0 && !daLeggere) t++;

  if (!ultimo && t >= M.DURATA_LIVELLO){
    restaSchermo.set(M.LIVELLI[liv].sigla, f);
    liv++; t = 0;
    if (liv >= M.LIVELLI.length - 1){
      eventi.push(["arrivo a " + M.LIVELLI[liv].sigla, f]);
      iFrase = 1; scriv = scrittura(1);
      break;
    } else eventi.push(["ingrandisce su " + M.LIVELLI[liv].sigla, f]);
  }
}

console.log("la sequenza va da sola, senza toccare niente:");
let prec = 0;
for (const [nome, quando] of eventi){
  console.log("  " + (quando / 60).toFixed(1).padStart(5) + " s   " + nome +
    "   (" + ((quando - prec) / 60).toFixed(1) + " s di livello)");
  prec = quando;
}
console.log("");
console.log("  in tutto " + (prec / 60).toFixed(1) +
  " s dall'inizio all'arrivo in paese");

console.log("\nquanto resta ferma la prima frase prima che si stringa:");
const dopoScrittura = scrittura(0);
console.log("  si scrive in          " + (dopoScrittura / 60).toFixed(1) + " s");
console.log("  poi resta ferma       " + (LETTURA / 60).toFixed(1) +
  " s almeno, garantiti");
console.log("  " + (LETTURA / 60 >= 1.5 ? "basta per leggerla" : "TROPPO POCO"));

console.log("\nogni livello, dentro:");
for (const [n, d] of Object.entries(M.FASI))
  console.log("  " + n.padEnd(11) + (d / 60).toFixed(2) + " s");
console.log("  " + "in tutto".padEnd(11) + (M.DURATA_LIVELLO / 60).toFixed(2) + " s");
console.log("");
console.log("  BERSAGLIO ACQUISITO lampeggia ogni 14 fotogrammi: in " +
  M.FASI.agganciato + " si accende " +
  Math.floor(M.FASI.agganciato / 28) + " volte e mezza");
