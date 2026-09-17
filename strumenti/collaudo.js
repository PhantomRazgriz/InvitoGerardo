/* COLLAUDO — costo di ogni scena e resa sui telefoni veri.

   Due domande, una per volta:
   1. quanto costa un fotogramma, scena per scena, contro i 16,7 ms
      disponibili a sessanta al secondo
   2. quanto viene grande la tela sugli schermi che useranno davvero

     node strumenti/collaudo.js
*/
const A = require("../arte.js");
const S = require("../salotto.js");
const G = require("../pigiama.js");
const F3 = require("../facile.js");
const M = require("../mappa.js");
const FN = require("../finale.js");

/* -------------------------------------------------------------------------
   1. COSTO PER FOTOGRAMMA
   Si conta ogni scrittura di pixel e si cronometra il disegno vero.
   ------------------------------------------------------------------------- */
function misura(nome, larg, alt, disegna){
  let n = 0;
  const conta = { punto(x, y, c){
    if (!c) return;
    x = (x + 0.5) | 0; y = (y + 0.5) | 0;
    if (x < 0 || y < 0 || x >= larg || y >= alt) return;
    n++;
  }};
  disegna(conta, 100);

  const muto = { punto(x, y, c){
    if (!c) return;
    x = (x + 0.5) | 0; y = (y + 0.5) | 0;
    if (x < 0 || y < 0 || x >= larg || y >= alt) return;
  }};
  const giri = 400;
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < giri; i++) disegna(muto, i);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6 / giri;

  return { nome, tela: larg + "x" + alt, punti: n, ms };
}

const fondo = (P, l, a, c) => {
  for (let y = 0; y < a; y++) for (let x = 0; x < l; x++) P.punto(x, y, c);
};

const SCENE = [
  misura("1 buio", 80, 64, (P, t) => {
    fondo(P, 80, 64, "#0b0a09");
    A.attore(P, 40, 56, { azione: "svapo", t, largTela: 80 });
    A.fumetto(P, 30, 8, "VABBUO'", null, 80);
  }),
  misura("2 salotto", 124, 104, (P, t) => {
    S.sfondo(P);
    S.televisore(P, true, 1, t);
    S.divano(P, 0);
    A.attore(P, 60, 78, { azione: "fermo", t, pigiama: true, largTela: 124 });
    S.barraVolume(P, 70, 1, 0);
  }),
  misura("3 facile", 88, 68, (P, t) => {
    fondo(P, 88, 68, "#0b0a09");
    const s = F3.stato(6, t % 168);
    F3.scatola(P, 4, F3.SUOLO - 9, s.pesca);
    A.attore(P, 22, F3.SUOLO, { azione: "fermo", t, largTela: 88 });
    F3.persona(P, F3.X_POSTO, F3.SUOLO, true, t, false);
    if (s.polvere >= 0) A.polvere(P, 60, F3.SUOLO + 4, s.polvere, s.durataPolvere);
    A.fumetto(P, 26, 10, "VOILAT", null, 88);
  }),
  misura("4 mappa", M.LARG, M.ALT, (P, t) => {
    M.disegna(P, M.stato(0, 90), t);
  }),
  misura("4 mappa (citta')", M.LARG, M.ALT, (P, t) => {
    M.disegna(P, M.stato(3, 120), t);
  }),
  misura("5 caduta", FN.LARG, FN.ALT, (P, t) => {
    const s = FN.statoCaduta(40);
    fondo(P, FN.LARG, FN.ALT, FN.COL.buio);
    FN.suolo(P, 0);
    A.polvere(P, FN.X_CADUTA, FN.SUOLO + 4, s.polvere, s.durataPolvere);
    A.attore(P, FN.X_CADUTA, s.y, { azione: s.azione, t, rabbia: s.rabbia });
    A.fumetto(P, FN.X_CADUTA - 12, 5, "MANNAGGIA AL SOLE D'AGOSTO", null, FN.LARG);
  }),
  misura("5 scelta", FN.LARG, FN.ALT, (P, t) => {
    const s = FN.statoScelta(120, null, 0, 1);
    fondo(P, FN.LARG, FN.ALT, FN.COL.bianco);
    FN.suolo(P, 1);
    FN.poltrona(P, FN.X_POLTRONA, 1);
    A.attore(P, s.x, s.y, { azione: s.azione, t, rabbia: s.rabbia });
    A.fumetto(P, FN.X_POLTRONA - 4, 5, "MA COME NO?!", null, FN.LARG);
  }),
  misura("5 festa", FN.LARG, FN.ALT, (P, t) => {
    const s = FN.statoScelta(120, "si", 120, 0);
    fondo(P, FN.LARG, FN.ALT, FN.COL.bianco);
    FN.suolo(P, 1);
    FN.poltrona(P, FN.X_POLTRONA, 1);
    A.attore(P, s.x, s.y, { azione: s.azione, t, rabbia: 0 });
    FN.coriandoli(P, t);
  }),
  misura("5 addio (velo)", FN.LARG, FN.ALT, (P, t) => {
    fondo(P, FN.LARG, FN.ALT, FN.COL.bianco);
    FN.suolo(P, 1);
    FN.poltrona(P, FN.X_POLTRONA, 1);
    FN.porta(P, FN.LARG - 16, FN.SUOLO, 1, 1);
    FN.velo(P, 0.5);
    FN.cuore(P, FN.LARG / 2, FN.ALT / 2, 1, t);
  })
];

console.log("COSTO PER FOTOGRAMMA          (bilancio: 16,7 ms a 60/s)");
console.log("  scena                tela      punti     ms    uso");
let peggio = 0;
for (const s of SCENE){
  peggio = Math.max(peggio, s.ms);
  const uso = (s.ms / 16.7 * 100);
  console.log("  " + s.nome.padEnd(20) + s.tela.padEnd(9) +
    s.punti.toLocaleString().padStart(7) + "  " + s.ms.toFixed(2).padStart(5) +
    "  " + uso.toFixed(1).padStart(4) + "%" + (uso > 50 ? "  <-- pesante" : ""));
}
console.log("  peggiore: " + peggio.toFixed(2) + " ms, cioe' " +
  Math.floor(16.7 / peggio) + " volte sotto il limite");

/* -------------------------------------------------------------------------
   2. LA TELA SUGLI SCHERMI VERI
   Si rifa' lo stesso conto che fa la pagina, per ogni telefono.
   ------------------------------------------------------------------------- */
const VISTE = {
  "1 buio":    { LARG: 80,  ALT: 64,  sicura: 80  },
  "2 salotto": { LARG: 124, ALT: 104, sicura: 124 },
  "3 facile":  { LARG: 88,  ALT: 68,  sicura: 88  },
  "4 mappa":   { LARG: 112, ALT: 96,  sicura: 112 },
  "5 finale":  { LARG: 124, ALT: 76,  sicura: 124 }
};

/* Lo stesso conto di ridimensiona(): spazio del palco, scala contata in
   pixel dello schermo. La cornice si stima qui perche' non c'e' un palco
   vero da misurare; a video quella stima non serve. */
function misuraTela(vista, w, h, dpr){
  const p = palco(w, h);
  const l = Math.max(80, p.w - 8);
  const a = Math.max(80, p.h - 8);
  const d = Math.min(3, Math.max(1, dpr));
  const s = Math.max(2, Math.min(9 * d,
    Math.floor(Math.min(l * d / vista.sicura, a * d / vista.ALT))));
  return { scala: s, larg: vista.LARG * s / d, alt: vista.ALT * s / d };
}

// la cornice con il pulsante AVANTI visibile, il caso piu' ingombrante
const CORNICE = 242;

/* Lo spazio del palco cambia con l'orientamento: in verticale la cornice
   sta sotto e mangia altezza, coricato sta di fianco e mangia larghezza.
   E' la stessa regola del foglio di stile. */
function palco(w, h){
  const coricato = w > h && h <= 560;
  return coricato
    ? { w: w - Math.min(w * 0.46, 380) - 20, h: h }
    : { w: w, h: h - CORNICE };
}

const TELEFONI = [
  ["iPhone SE",        375, 667, 2],
  ["iPhone 12/13/14",  390, 844, 3],
  ["iPhone 14 Pro Max",430, 932, 3],
  ["Galaxy S20",       360, 800, 3],
  ["Android 2x",       360, 640, 2],
  ["iPad mini",        744,1133, 2],
  ["computer",        1280, 800, 1],
  ["telefono coricato",844, 390, 3]
];

console.log("\nQUANTO VIENE GRANDE LA TELA   (scala x  ->  % della larghezza del palco)");
console.log("  schermo             dpr  " +
  Object.keys(VISTE).map(n => n.slice(2, 9).padEnd(11)).join(""));
const stretti = [], sforati = [];
for (const [nome, w, h, dpr] of TELEFONI){
  let riga = "  " + nome.padEnd(20) + dpr + "x   ";
  for (const [n, v] of Object.entries(VISTE)){
    const m = misuraTela(v, w, h, dpr);
    const perc = Math.round(m.larg / palco(w, h).w * 100);
    riga += (m.scala + "x  " + perc + "%").padEnd(11);
    if (perc < 75 && w < 900) stretti.push(nome + " / " + n + " (" + perc + "%)");
    if (m.alt > palco(w, h).h) sforati.push(nome + " / " + n);
  }
  console.log(riga);
}
console.log(stretti.length
  ? "\n  sotto il 75% della larghezza:\n    " + stretti.join("\n    ")
  : "\n  nessuna tela stretta sui telefoni  (sul computer la limita l'altezza, ed e' giusto)");
console.log(sforati.length
  ? "  ALTEZZA SFORATA: " + sforati.join(", ")
  : "  nessuna scena sfora in altezza");

/* I punti da premere: sotto i 44 pixel il pollice sbaglia. */
console.log("\nPUNTI DA PREMERE   (minimo consigliato 44 px)");
const TOCCHI = [
  ["SI / NO",       18 * 2 + 22],
  ["AVANTI",        14 * 2 + 17],
  ["invia conferma",15 * 2 + 17],
  ["dammi data e luogo", 44]   // altezza minima imposta nel foglio di stile
];
for (const [n, alt] of TOCCHI)
  console.log("  " + n.padEnd(20) + String(alt).padStart(3) + " px" +
    (alt >= 44 ? "" : "   TROPPO PICCOLO"));

/* -------------------------------------------------------------------------
   3. IL COLLEGAMENTO A WHATSAPP
   E' l'unica cosa dell'invito che deve funzionare al primo colpo: se
   sbaglia destinatario, la conferma si perde e nessuno se ne accorge.
   ------------------------------------------------------------------------- */
{
  const fs2 = require("fs");
  const pagina = fs2.readFileSync("index.html", "utf8");
  const pezzi = pagina.match(/const NUMERO = \[([^\]]+)\]/);
  const numero = pezzi
    ? pezzi[1].replace(/['"\s]/g, "").split(",").join("")
    : "";
  const msg = /const MESSAGGIO =([\s\S]*?);\n/.exec(pagina);

  console.log("\nIL COLLEGAMENTO A WHATSAPP");
  console.log("  numero        " + (numero || "(nessuno)"));
  const bene = /^39\d{9,10}$/.test(numero);
  console.log("  formato       " + (bene
    ? "prefisso 39 e " + (numero.length - 2) + " cifre: buono"
    : "SBAGLIATO: serve 39 seguito dal numero, senza + ne' spazi"));
  console.log("  nel sorgente  " +
    (pagina.includes(numero) ? "IN CHIARO, i raccoglitori lo trovano"
                             : "spezzato, i raccoglitori non lo trovano"));
  console.log("  chiude con    " +
    (msg && /Sono: /.test(msg[1]) ? "\"Sono: \", cosi' chi conferma si firma"
                                  : "niente: arriveranno messaggi anonimi"));
}

/* -------------------------------------------------------------------------
   4. QUANTO PESA
   ------------------------------------------------------------------------- */
const fs = require("fs");
const zlib = require("zlib");
console.log("\nPESO DI QUELLO CHE SI SCARICA");
let tot = 0, compresso = 0;
for (const f of ["index.html", "arte.js", "salotto.js", "pigiama.js",
                 "facile.js", "mappa.js", "finale.js", "suono.js"]){
  const dati = fs.readFileSync(f);
  tot += dati.length / 1024;
  compresso += zlib.gzipSync(dati).length / 1024;
  console.log("  " + f.padEnd(14) + (dati.length / 1024).toFixed(1).padStart(6) + " KB");
}
console.log("  " + "TOTALE".padEnd(14) + tot.toFixed(1).padStart(6) + " KB");
/* Quello che conta e' il compresso: i server lo mandano cosi'. Sotto i
   150 KB una pagina si apre in un paio di secondi anche con una linea
   lenta, che e' la condizione in cui qualcuno la aprira' davvero. */
console.log("  " + "in rete".padEnd(14) + compresso.toFixed(1).padStart(6) + " KB compressi" +
  (compresso < 150 ? "   (si apre subito anche in 3G)" : "   da alleggerire"));
const social = fs.statSync("anteprime/social.png").size / 1024;
console.log("  anteprima social " + social.toFixed(1) + " KB (solo per WhatsApp, non per la pagina)");





