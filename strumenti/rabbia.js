/* La scala della rabbia, tutta affiancata.
   Il rosso si giudica solo confrontando i gradini: preso da solo, ognuno
   sembra plausibile.

     node strumenti/rabbia.js
*/
const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const A = require("../arte.js");

const GRADINI = [0, 0.25, 0.5, 0.75, 1];
// due fondi: il bianco della scena della scelta e il buio della prima.
// I segnali della rabbia devono leggersi su entrambi
const FONDI = ["#ffffff", "#0b0a09"];
const CELLA_L = 30, CELLA_A = 44, SCALA = 8;
const c = createCanvas(CELLA_L * GRADINI.length * SCALA, CELLA_A * FONDI.length * SCALA);
const ctx = c.getContext("2d");

FONDI.forEach((fondo, riga) => {
  const gy = riga * CELLA_A;
  ctx.fillStyle = fondo;
  ctx.fillRect(0, gy * SCALA, c.width, CELLA_A * SCALA);

  GRADINI.forEach((q, n) => {
    const gx = n * CELLA_L;
    const P = { punto(x, y, col){
      if (!col) return;
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= CELLA_L || y >= CELLA_A) return;
      ctx.fillStyle = col;
      ctx.fillRect((gx + x) * SCALA, (gy + y) * SCALA, SCALA, SCALA);
    }};

    // sbuffa: le braccia allargate sono la posa in cui la rabbia si legge
    A.attore(P, CELLA_L / 2, 38, {
      azione: q > 0.4 ? "sbuffa" : "fermo", t: 40, rabbia: q, ombra: false
    });

    ctx.strokeStyle = riga === 0 ? "#e2dcd0" : "#2a2622";
    ctx.strokeRect(gx * SCALA + .5, gy * SCALA + .5,
                   CELLA_L * SCALA - 1, CELLA_A * SCALA - 1);
    ctx.fillStyle = riga === 0 ? "#6b6358" : "#8a8074";
    ctx.font = `${SCALA * 1.8}px sans-serif`;
    ctx.fillText("rabbia " + q, gx * SCALA + 5, (gy + CELLA_A) * SCALA - 7);
  });
});

fs.writeFileSync("anteprime/rabbia.png", c.toBuffer("image/png"));
console.log("scala della rabbia -> anteprime/rabbia.png");
