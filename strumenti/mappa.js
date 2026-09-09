/* Controllo della scena della mappa.

     node strumenti/mappa.js            i quattro livelli agganciati
     node strumenti/mappa.js sequenza   la corsa completa, zoom compresi
*/
const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const A = require("../arte.js");
const M = require("../mappa.js");

const SCALA = 5;
const modo = process.argv[2] || "livelli";

function pittore(ctx, gx, gy){
  return { punto(x, y, colore){
    if (!colore) return;
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= M.LARG || y >= M.ALT) return;
    ctx.fillStyle = colore;
    ctx.fillRect((gx + x) * SCALA, (gy + y) * SCALA, SCALA, SCALA);
  }};
}

// quale istante di ogni livello mostrare: quello ad aggancio avvenuto
const AGGANCIO = M.FASI.comparsa + M.FASI.scansione + 12;

let quadri;
if (modo === "sequenza"){
  // una corsa continua sui quattro livelli, campionata
  quadri = [];
  for (let liv = 0; liv < M.LIVELLI.length; liv++)
    for (const frazione of [0.2, 0.55, 0.8, 0.97])
      quadri.push({ liv, t: Math.round(M.DURATA_LIVELLO * frazione) });
} else {
  quadri = M.LIVELLI.map((_, liv) => ({ liv, t: AGGANCIO }));
}

const COL_N = modo === "sequenza" ? 4 : M.LIVELLI.length;
const RIG_N = Math.ceil(quadri.length / COL_N);
const c = createCanvas(M.LARG * COL_N * SCALA, M.ALT * RIG_N * SCALA);
const ctx = c.getContext("2d");
ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.width, c.height);

quadri.forEach((q, n) => {
  const gx = (n % COL_N) * M.LARG, gy = Math.floor(n / COL_N) * M.ALT;
  const P = pittore(ctx, gx, gy);
  const s = M.stato(q.liv, q.t);
  M.disegna(P, s, q.t);

  ctx.fillStyle = "#8a8074";
  ctx.font = `${SCALA * 2}px sans-serif`;
  ctx.fillText(`${M.LIVELLI[q.liv].sigla} t=${q.t} ${s.fase}`,
               gx * SCALA + 4, (gy + M.ALT) * SCALA - 5);
  ctx.strokeStyle = "#2a2a2a";
  ctx.strokeRect(gx * SCALA + .5, gy * SCALA + .5,
                 M.LARG * SCALA - 1, M.ALT * SCALA - 1);
});

const file = modo === "sequenza" ? "anteprime/mappa-sequenza.png" : "anteprime/mappa.png";
fs.writeFileSync(file, c.toBuffer("image/png"));
console.log(`${quadri.length} quadri -> ${file}`);
