/* Che cosa della persona resta visibile quando si siede.

   Serve affiancare la figura intera e quella dentro la poltrona: e' l'unico
   modo di accorgersi di quanto sparisce. Da solo, un personaggio tagliato
   alla vita sembra sempre plausibile.

     node strumenti/seduto.js
*/
const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const A = require("../arte.js");
const F = require("../finale.js");

const SCALA = 10, L = 60, AL = 76;
const CASI = [
  { et: "figura intera",      poltrona: false, az: "fermo",  ra: 0.15 },
  { et: "seduto",             poltrona: true,  az: "fermo",  ra: 0.15 },
  { et: "seduto, arrabbiato", poltrona: true,  az: "sbuffa", ra: 1 }
];

const c = createCanvas(L * CASI.length * SCALA, AL * SCALA);
const ctx = c.getContext("2d");
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, c.width, c.height);

CASI.forEach((k, n) => {
  const gx = n * L;
  const P = { punto(x, y, col){
    if (!col) return;
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= L || y >= AL) return;
    ctx.fillStyle = col;
    ctx.fillRect((gx + x) * SCALA, y * SCALA, SCALA, SCALA);
  }};

  F.suolo(P, 1);
  const y = k.poltrona ? F.Y_SEDUTO : F.SUOLO;
  F.poltrona(P, F.X_POLTRONA, "dietro", 1);
  A.attore(P, F.X_POLTRONA, y, { azione: k.az, t: 40, rabbia: k.ra, ombra: false });
  if (k.poltrona){
    F.poltrona(P, F.X_POLTRONA, "davanti", 1);
    F.poltrona(P, F.X_POLTRONA, "gambe", 1);
  }

  ctx.strokeStyle = "#ddd";
  ctx.strokeRect(gx * SCALA + .5, .5, L * SCALA - 1, AL * SCALA - 1);
  ctx.fillStyle = "#555";
  ctx.font = `${SCALA * 1.6}px sans-serif`;
  ctx.fillText(k.et, gx * SCALA + 4, AL * SCALA - 6);
});

fs.writeFileSync("anteprime/seduto.png", c.toBuffer("image/png"));
console.log("seduto -> anteprime/seduto.png");

/* La conta esatta: quali parti del corpo copre il mobile. */
const cy = F.Y_SEDUTO - A.ALT_PERS;
const PARTI = [["testa",0,12],["collo",13,13],["maglietta e braccia",14,23],
               ["pantaloni",24,27],["gambe",28,30],["scarpe",31,33]];

const persona = new Map();
A.attore({ punto(x,y,col){ if(col) persona.set(Math.round(x)+","+Math.round(y), 1); } },
         F.X_POLTRONA, F.Y_SEDUTO, { azione:"fermo", t:40, rabbia:0.15, ombra:false });
const mobile = new Set();
F.poltrona({ punto(x,y,col){ if(col) mobile.add(Math.round(x)+","+Math.round(y)); } },
           F.X_POLTRONA, "davanti", 1);

console.log("\nparte                 coperta dal mobile");
for (const [nome, a, b] of PARTI){
  let tot = 0, cop = 0;
  for (const k of persona.keys()){
    const r = +k.split(",")[1] - cy;
    if (r < a || r > b) continue;
    tot++; if (mobile.has(k)) cop++;
  }
  if (tot) console.log("  " + nome.padEnd(22) + String(Math.round(cop / tot * 100)).padStart(3) + "%");
}
