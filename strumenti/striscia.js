/* Striscia di fotogrammi di un passo della terza scena, affiancati.
   Le animazioni non si giudicano da un fermo immagine: serve vedere la
   sequenza tutta insieme per capire se il tempo comico funziona.

     node strumenti/striscia.js            l'ultimo passo (il congedo)
     node strumenti/striscia.js 6          il passo 6
     node strumenti/striscia.js 6 12       il passo 6 con 12 fotogrammi
*/
const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const A = require("../arte.js");
const F = require("../facile.js");

const passo = process.argv[2] !== undefined
  ? Math.max(0, Math.min(F.PASSI.length - 1, Number(process.argv[2])))
  : F.PASSI.length - 1;
const QUANTI = Number(process.argv[3] || 7);
const durata = F.PASSI[passo].durata || 60;
// un po' oltre la durata, per vedere anche il fotogramma di riposo
const ISTANTI = Array.from({ length: QUANTI },
  (_, i) => Math.round((durata * 1.02) * i / (QUANTI - 1)));

const SCALA = 5;
const c = createCanvas(F.LARG * QUANTI * SCALA, F.ALT * SCALA);
const ctx = c.getContext("2d");
ctx.fillStyle = "#181410";
ctx.fillRect(0, 0, c.width, c.height);

ISTANTI.forEach((t, n) => {
  const gx = n * F.LARG;
  const P = { punto(x, y, col){
    if (!col) return;
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= F.LARG || y >= F.ALT) return;
    ctx.fillStyle = col;
    ctx.fillRect((gx + x) * SCALA, y * SCALA, SCALA, SCALA);
  }};

  const s = F.stato(passo, t);

  for (let x = 0; x < F.LARG; x++) P.punto(x, F.SUOLO + 1, "#2a2018");
  for (let x = 0; x < F.LARG; x += 3) P.punto(x, F.SUOLO + 2, "#1c1510");

  F.scatola(P, 4, F.SUOLO - 9, s.pesca);

  const xLui = s.xLui === undefined ? 22 : s.xLui;
  A.attore(P, xLui, F.SUOLO, {
    azione: s.camminaLui ? "cammina" : "fermo", t, pigiama: false
  });

  if (s.pesca){
    for (let i = 0; i < 5; i++) P.punto(15 - i, F.SUOLO - 12 + i, A.C.s);
    P.punto(10, F.SUOLO - 8, A.C.l);
  }

  let x = Math.round(s.xOgg);
  if (s.esce) x += Math.round(s.esce * 60);
  if (s.cosa === "tubo")    F.tubo(P, x, F.SUOLO - 2, s.q, t);
  if (s.cosa === "muro")    F.muro(P, x, F.SUOLO - 2, s.q);
  if (s.cosa === "torre")   F.torre(P, x, F.SUOLO - 2, 1 - s.q);
  if (s.cosa === "persona") F.persona(P, x, F.SUOLO, s.q > 0.5, t, s.cammina);
  if (s.polvere >= 0) A.polvere(P, x + 8, F.SUOLO + 4, s.polvere, s.durataPolvere);

  if (s.dice === true) A.fumetto(P, 30, 10, "VOILAT", null, F.LARG);
  else if (typeof s.dice === "string") A.fumetto(P, x - 2, 8, s.dice, null, F.LARG);
  else if (s.diceLui) A.fumetto(P, xLui + 4, 10, s.diceLui, null, F.LARG);

  ctx.strokeStyle = "#39322a"; ctx.lineWidth = 1;
  ctx.strokeRect(gx * SCALA + .5, .5, F.LARG * SCALA - 1, F.ALT * SCALA - 1);
  ctx.fillStyle = "#8a8074"; ctx.font = `${SCALA * 2.2}px sans-serif`;
  ctx.fillText("t=" + t, gx * SCALA + 5, F.ALT * SCALA - 6);
});

const file = `anteprime/passo-${passo}.png`;
fs.writeFileSync(file, c.toBuffer("image/png"));
console.log(`passo ${passo} (${F.PASSI[passo].cosa || "solo testo"}, ${durata} fotogrammi) -> ${file}`);
