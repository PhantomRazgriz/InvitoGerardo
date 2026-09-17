/* L'INVITO CLASSICO, in immagine.

   Un'immagine e non un PDF: su WhatsApp un'immagine si apre dentro la
   chat, un PDF e' un allegato da toccare. Per chi ha settant'anni quella
   e' la differenza fra vederlo e ignorarlo.

   1280x1600, quattro a cinque: la proporzione che le chat mostrano piu'
   grande senza tagliarla.

   PRIMA VERSIONE, SCARTATA: Garamond, cornice a doppio filetto d'oro,
   rombo in mezzo, maiuscoletto spaziato. Era elegante e sbagliata - quello
   e' l'abito di una partecipazione di nozze, e questa e' una festa a
   sorpresa per un uomo che si arrabbia col sole d'agosto. Un invito deve
   somigliare alla serata che promette.

   Adesso: fondo rosso caldo, un 60 grande quanto serve, e Fraunces, che e'
   una graziata grassa e un po' da manifesto - seria abbastanza per
   sessant'anni, allegra abbastanza per una festa.

     node strumenti/invito.js
*/
const fs = require("fs");
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");

GlobalFonts.registerFromPath("caratteri/Fraunces.ttf", "Fraunces");
GlobalFonts.registerFromPath("caratteri/Archivo.ttf", "Archivo");

/* --------------------------------------------------------------------------
   QUELLO CHE C'E' SCRITTO
   -------------------------------------------------------------------------- */
const D = {
  occhiello: "Festa a sorpresa per",
  nome:      "GERARDO",
  eta:       "60",
  motivo:    "che compie sessant\u2019anni",
  giorno:    "Sabato 7 novembre 2026",
  ora:       "ore 19.30",
  locale:    "Cavallino Rosso",
  citta:     "San Giovanni Rotondo (FG)",
  // VIA DA RIEMPIRE: finche' e' vuota la riga non viene disegnata affatto,
  // che e' meglio di un invito con scritto "[indirizzo]"
  via:       "",
  segreto1:  "Lui non ne sa niente.",
  segreto2:  "Mi raccomando: non dirglielo.",
  rsvp:      "Fammi sapere che ci sei",
  numero:    "352 036 3966"
};

/* Il rosso caldo e' quello dei fumetti dell'altro invito, scurito quel
   tanto che serve perche' il crema ci si legga sopra. Fra le chat, piene
   di bianco, un'immagine tutta colorata si vede da lontano. */
const C = {
  fondo:  "#a33c26",
  crema:  "#f7efe1",
  oro:    "#f0c04a",
  ombra:  "#7e2c1b"
};

const L = 1280, A = 1600;
const c = createCanvas(L, A);
const x = c.getContext("2d");

/* --------------------------------------------------------------------------
   GLI ARNESI
   -------------------------------------------------------------------------- */

/* Scrittura centrata, con spaziatura fra le lettere fatta a mano.
   A mano perche' la spaziatura automatica mette spazio anche DOPO
   l'ultima lettera, e una riga centrata risulta spostata di mezzo spazio
   a sinistra: su una riga in maiuscolo larga si vede benissimo. */
function scritta(testo, o){
  const font = o.font || "Fraunces";
  x.font = (o.corsivo ? "italic " : "") + o.corpo + "px " + font;
  x.fillStyle = o.colore || C.crema;
  x.textBaseline = "alphabetic";

  const sp = o.spazio || 0;
  if (!sp){
    x.textAlign = "center";
    x.fillText(testo, o.x || L / 2, o.y);
    return x.measureText(testo).width;
  }
  const lettere = [...testo];
  let largo = 0;
  for (const l of lettere) largo += x.measureText(l).width + sp;
  largo -= sp;
  x.textAlign = "left";
  let px = (o.x || L / 2) - largo / 2;
  for (const l of lettere){
    x.fillText(l, px, o.y);
    px += x.measureText(l).width + sp;
  }
  return largo;
}

function filetto(y, largo, colore, spesso){
  x.strokeStyle = colore || C.oro;
  x.lineWidth = spesso || 2;
  x.beginPath();
  x.moveTo((L - largo) / 2, y);
  x.lineTo((L + largo) / 2, y);
  x.stroke();
}

/* --------------------------------------------------------------------------
   IL FONDO
   Un colore piatto su milleseicento pixel sembra una parete. Due tocchi lo
   fanno respirare: un alone appena piu' chiaro dietro il numero, dove sta
   il centro di gravita', e una velatura scura sui bordi.
   -------------------------------------------------------------------------- */
x.fillStyle = C.fondo;
x.fillRect(0, 0, L, A);

const alone = x.createRadialGradient(L / 2, 560, 60, L / 2, 560, 780);
alone.addColorStop(0, "rgba(255,225,190,0.16)");
alone.addColorStop(1, "rgba(255,225,190,0)");
x.fillStyle = alone;
x.fillRect(0, 0, L, A);

const bordi = x.createRadialGradient(L / 2, A / 2, 420, L / 2, A / 2, 1000);
bordi.addColorStop(0, "rgba(0,0,0,0)");
bordi.addColorStop(1, "rgba(60,14,6,0.32)");
x.fillStyle = bordi;
x.fillRect(0, 0, L, A);

/* --------------------------------------------------------------------------
   L'IMPAGINATO
   -------------------------------------------------------------------------- */
scritta(D.occhiello.toUpperCase(), {
  y: 186, corpo: 30, spazio: 7, font: "Archivo", colore: C.oro
});

scritta(D.nome, { y: 300, corpo: 106, spazio: 9 });

/* Il 60. E' il motivo della serata, quindi e' la cosa piu' grande che c'e'.
   L'ombra e' spostata di cinque pixel e appena piu' scura del fondo: alla
   prima prova era otto pixel e molto piu' scura, e il numero sembrava
   scollato dal foglio invece che appoggiato. */
x.save();
x.textAlign = "center";
x.font = "470px Fraunces";
x.fillStyle = "rgba(110,38,22,0.55)";
x.fillText(D.eta, L / 2 + 5, 691);
x.fillStyle = C.oro;
x.fillText(D.eta, L / 2, 686);
x.restore();

/* "che compie sessant'anni" stava qui e l'ho tolto: il 60 lo dice gia', e
   grosso cosi'. Ripeterlo sotto toglieva forza al numero e rubava lo
   spazio che serviva in fondo. */

filetto(806, 300, C.oro, 2);

scritta(D.giorno.toUpperCase(), { y: 912, corpo: 46, spazio: 4, font: "Archivo" });
scritta(D.ora,                  { y: 976, corpo: 44, font: "Archivo", colore: C.oro });

scritta(D.locale, { y: 1110, corpo: 66 });
scritta(D.citta,  { y: 1164, corpo: 34, font: "Archivo" });
if (D.via) scritta(D.via, { y: 1210, corpo: 32, font: "Archivo" });

const giu = D.via ? 46 : 0;

scritta(D.segreto1, { y: 1300 + giu, corpo: 40, corsivo: true });
scritta(D.segreto2, { y: 1354 + giu, corpo: 40, corsivo: true });

filetto(1416 + giu, 220, "rgba(247,239,225,0.35)", 1.5);

scritta(D.rsvp.toUpperCase(), { y: 1466 + giu, corpo: 24, spazio: 6, font: "Archivo" });
scritta(D.numero, { y: 1524 + giu, corpo: 46, spazio: 2, font: "Archivo", colore: C.oro });

fs.writeFileSync("invito.png", c.toBuffer("image/png"));
console.log("invito.png  " + L + "x" + A + "  " +
  (fs.statSync("invito.png").size / 1024).toFixed(0) + " KB");
if (!D.via) console.log("  (manca la via: la riga non viene disegnata finche' e' vuota)");
