/* L'INVITO CLASSICO, in immagine.

   Un'immagine e non un PDF perche' si manda su WhatsApp: un'immagine si
   apre dentro la chat, un PDF e' un allegato da toccare. Per chi ha
   settant'anni quella e' la differenza fra vederlo e ignorarlo.

   1280x1600, cioe' quattro a cinque: e' la proporzione che WhatsApp mostra
   piu' grande senza tagliarla, ed e' abbastanza fitta da restare nitida
   dopo la ricompressione della chat.

   Il carattere e' EB Garamond, licenza aperta: si puo' incorporare e
   ridistribuire senza chiedere niente a nessuno.

     node strumenti/invito.js
*/
const fs = require("fs");
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");

GlobalFonts.registerFromPath("caratteri/EBGaramond-Regular.ttf", "Garamond");
GlobalFonts.registerFromPath("caratteri/EBGaramond-Italic.ttf", "GaramondCorsivo");

/* --------------------------------------------------------------------------
   QUELLO CHE C'E' SCRITTO
   Tutto qui in cima: se cambia un orario non si va a cercarlo nel disegno.
   -------------------------------------------------------------------------- */
const D = {
  occhiello: "\u00c8 una sorpresa",
  nome:      "Gerardo",
  motivo:    "compie sessant\u2019anni",
  giorno:    "Sabato 7 novembre 2026",
  ora:       "ore 19.30",
  locale:    "Cavallino Rosso",
  citta:     "San Giovanni Rotondo (FG)",
  // VIA DA RIEMPIRE: finche' e' vuota la riga non viene disegnata affatto,
  // che e' meglio di un invito con scritto "[indirizzo]"
  via:       "",
  segreto1:  "Lui non ne sa niente.",
  segreto2:  "Contiamo su di te per non dirglielo.",
  rsvp:      "Fai sapere che ci sarai",
  numero:    "349 797 7607"
};

const C = {
  carta:  "#f6f1e6",     // la stessa carta dei fumetti dell'altro invito
  inchio: "#241f1f",     // e lo stesso inchiostro
  oro:    "#a8802c",
  rosso:  "#9e3b28",
  tenue:  "#8a7f6e"
};

const L = 1280, A = 1600;
const c = createCanvas(L, A);
const x = c.getContext("2d");

x.fillStyle = C.carta;
x.fillRect(0, 0, L, A);

/* --------------------------------------------------------------------------
   GLI ARNESI
   -------------------------------------------------------------------------- */

/* Scrittura centrata, con spaziatura fra le lettere fatta a mano.
   A mano e non con la proprieta' del browser perche' quella distribuisce
   lo spazio anche DOPO l'ultima lettera, e una riga centrata risulta
   spostata a sinistra di mezzo spazio: su una riga in maiuscoletto larga
   e spaziata si vede benissimo. */
function scritta(testo, o){
  x.font = (o.corsivo ? "italic " : "") + o.corpo + "px " +
           (o.corsivo ? "GaramondCorsivo" : "Garamond");
  x.fillStyle = o.colore || C.inchio;
  x.textBaseline = "alphabetic";

  const sp = o.spazio || 0;
  if (!sp){
    x.textAlign = "center";
    x.fillText(testo, L / 2, o.y);
    return;
  }
  const lettere = [...testo];
  let largo = 0;
  for (const l of lettere) largo += x.measureText(l).width + sp;
  largo -= sp;                                  // non dopo l'ultima
  x.textAlign = "left";
  let px = (L - largo) / 2;
  for (const l of lettere){
    x.fillText(l, px, o.y);
    px += x.measureText(l).width + sp;
  }
}

// un filetto sottile, con o senza il rombo in mezzo
function filetto(y, largo, rombo){
  const x0 = (L - largo) / 2;
  x.strokeStyle = C.oro;
  x.lineWidth = 1.4;
  if (!rombo){
    x.beginPath(); x.moveTo(x0, y); x.lineTo(x0 + largo, y); x.stroke();
    return;
  }
  const vuoto = 34;
  x.beginPath();
  x.moveTo(x0, y); x.lineTo(L / 2 - vuoto, y);
  x.moveTo(L / 2 + vuoto, y); x.lineTo(x0 + largo, y);
  x.stroke();
  const r = 7;
  x.fillStyle = C.oro;
  x.beginPath();
  x.moveTo(L / 2, y - r); x.lineTo(L / 2 + r, y);
  x.lineTo(L / 2, y + r); x.lineTo(L / 2 - r, y);
  x.closePath(); x.fill();
}

/* La cornice: due filetti, uno spesso e uno sottile, con un dito di
   distanza. E' la cosa piu' semplice che dice "questo e' un invito" senza
   aggiungere un solo disegno. */
function cornice(){
  x.strokeStyle = C.oro;
  x.lineWidth = 2.5;
  x.strokeRect(54, 54, L - 108, A - 108);
  x.lineWidth = 1;
  x.strokeRect(66, 66, L - 132, A - 132);
}

/* --------------------------------------------------------------------------
   L'IMPAGINATO
   Le altezze sono scritte una per una e non calcolate: un invito e' un
   oggetto solo, e si compone guardandolo.
   -------------------------------------------------------------------------- */
cornice();

/* Tutto il testo sale di ventisei pixel. Dentro la cornice restava 122 di
   aria sopra e 84 sotto, cioe' il blocco sedeva basso: un impaginato
   centrato vuole semmai il contrario, un filo piu' di respiro in fondo che
   in cima, o sembra scivolato. */
const SU = 26;
const y = n => n - SU;

scritta(D.occhiello.toUpperCase(), { y: y(208), corpo: 32, spazio: 11, colore: C.oro });

/* Il nome e' il centro di gravita' della pagina: tutto il resto gli sta
   intorno, e niente altro deve avere la sua misura. */
scritta(D.nome,   { y: y(432), corpo: 176 });
scritta(D.motivo, { y: y(512), corpo: 56, corsivo: true });

filetto(y(608), 520, true);

/* La data e l'ora sono la ragione per cui questo foglio esiste: vanno
   dello stesso inchiostro. Nella prima versione l'ora era grigia, cioe'
   la cosa piu' pallida della pagina, quando e' una delle due che non si
   possono sbagliare. */
scritta(D.giorno.toUpperCase(), { y: y(702), corpo: 46, spazio: 5 });
scritta(D.ora,                  { y: y(766), corpo: 44 });

/* Il locale era in rosso: faceva un secondo centro che si contendeva
   l'occhio col nome, e il rosso su una pagina altrimenti tutta d'inchiostro
   e oro sembrava un avvertimento piu' che un indirizzo. */
scritta(D.locale.toUpperCase(), { y: y(900), corpo: 54, spazio: 7 });
scritta(D.citta,                { y: y(962), corpo: 40 });
if (D.via) scritta(D.via, { y: y(1014), corpo: 36, colore: C.tenue });

const giu = D.via ? 52 : 0;
filetto(y(1074 + giu), 360, false);

scritta(D.segreto1, { y: y(1170 + giu), corpo: 44, corsivo: true });
scritta(D.segreto2, { y: y(1228 + giu), corpo: 44, corsivo: true });

scritta(D.rsvp.toUpperCase(), { y: y(1394), corpo: 28, spazio: 9, colore: C.oro });
scritta(D.numero,             { y: y(1462), corpo: 54, spazio: 2 });

fs.mkdirSync("anteprime", { recursive: true });
fs.writeFileSync("invito.png", c.toBuffer("image/png"));
const kb = fs.statSync("invito.png").size / 1024;
console.log("invito.png  " + L + "x" + A + "  " + kb.toFixed(0) + " KB");
if (!D.via) console.log("  (manca la via: la riga non viene disegnata finche' e' vuota)");

