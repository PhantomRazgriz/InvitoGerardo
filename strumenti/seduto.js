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
  if (k.poltrona) F.poltrona(P, F.X_POLTRONA, 1);
  A.attore(P, F.X_POLTRONA, F.SUOLO, { azione: k.az, t: 40, rabbia: k.ra, ombra: false });

  ctx.strokeStyle = "#ddd";
  ctx.strokeRect(gx * SCALA + .5, .5, L * SCALA - 1, AL * SCALA - 1);
  ctx.fillStyle = "#555";
  ctx.font = `${SCALA * 1.6}px sans-serif`;
  ctx.fillText(k.et, gx * SCALA + 4, AL * SCALA - 6);
});

fs.writeFileSync("anteprime/seduto.png", c.toBuffer("image/png"));
console.log("seduto -> anteprime/seduto.png");

/* Il controllo che conta adesso non e' piu' "quanto copre il mobile" - la
   poltrona sta tutta dietro, quindi non copre niente per costruzione - ma
   che le due misure combacino: il piano della seduta deve cadere esatto
   sulla linea dei fianchi, o per far toccare terra al personaggio bisogna
   allungargli le gambe. E' l'errore che ha richiesto tre tentativi. */
const cy = F.SUOLO - A.ALT_PERS;
const fianchi = cy + 24;                 // riga 24 dello sprite: i pantaloni
const sottoFianchi = A.ALT_PERS - 24;    // quanto e' alto dal fianco in giu

console.log("");
console.log("  dal fianco ai piedi:      " + sottoFianchi + " px");
console.log("  linea dei fianchi:        y=" + fianchi);
console.log("  piano della seduta:       y=" + F.POLT.ySeduta);
console.log("  gambe da inventare:       " + (F.POLT.ySeduta - fianchi) + " px" +
            (F.POLT.ySeduta === fianchi ? "   (nessuna: giusto)" : "   SBAGLIATO"));

const x0 = F.X_POLTRONA - Math.round(F.POLT.larg / 2);
const x1 = x0 + F.POLT.larg - 1;
const luce = (x1 - 6) - (x0 + 6) - 1;
console.log("  luce fra i braccioli:     " + luce + " px  (spalle 16)");
console.log(luce >= 17 && luce <= 20
  ? "  la poltrona lo stringe: sembra seduto dentro"
  : "  ATTENZIONE: troppo larga o troppo stretta");
