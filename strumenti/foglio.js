/* Foglio della serie in pigiama: tutte le pose affiancate, con il nome
   e la verifica delle proporzioni. Serve a vederle insieme, perche' e'
   confrontandole che si notano le incoerenze.

     node strumenti/foglio.js
     node strumenti/foglio.js silhouette     tutte in nero pieno
*/
const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const A = require("../arte.js");
const G = require("../pigiama.js");

const SILHOUETTE = process.argv[2] === "silhouette";
const CELLA_L = 38, CELLA_A = 44, SCALA = 6, COL = 5;

/* pittore su una cella della griglia */
function pittore(ctx, gx, gy){
  return { punto(x, y, colore){
    if (!colore) return;
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= CELLA_L || y >= CELLA_A) return;
    ctx.fillStyle = SILHOUETTE ? "#000000" : colore;
    ctx.fillRect((gx + x) * SCALA, (gy + y) * SCALA, SCALA, SCALA);
  }};
}

const pose = [
  ...G.IN_PIEDI.map(p => ({ ...p, tipo: "attore" })),
  { nome: "seduto",   tipo: "sprite", sprite: G.SPR.seduto },
  { nome: "sdraiato", tipo: "sprite", sprite: G.SPR.sdraiato }
];

const RIG = Math.ceil(pose.length / COL);
const c = createCanvas(CELLA_L * COL * SCALA, CELLA_A * RIG * SCALA);
const ctx = c.getContext("2d");
ctx.fillStyle = "#22201d";
ctx.fillRect(0, 0, c.width, c.height);

pose.forEach((p, n) => {
  const gx = (n % COL) * CELLA_L, gy = Math.floor(n / COL) * CELLA_A;
  // cornice della cella
  ctx.strokeStyle = "#3a352f"; ctx.lineWidth = 1;
  ctx.strokeRect(gx * SCALA + .5, gy * SCALA + .5, CELLA_L * SCALA - 1, CELLA_A * SCALA - 1);
  // linea del pavimento, uguale per tutte: mostra chi non poggia
  ctx.fillStyle = "#4a4038";
  ctx.fillRect(gx * SCALA, (gy + 38) * SCALA, CELLA_L * SCALA, SCALA);

  const P = pittore(ctx, gx, gy);
  if (p.tipo === "attore"){
    A.attore(P, CELLA_L / 2, 38, { azione: p.azione, t: p.t, pigiama: true, ombra: false });
  } else {
    const s = p.sprite;
    const ox = Math.round((CELLA_L - s[0].length) / 2);
    const oy = 38 - s.length;
    for (let y = 0; y < s.length; y++)
      for (let x = 0; x < s[y].length; x++){
        const ch = s[y][x];
        if (ch !== ".") P.punto(ox + x, oy + y, A.C[ch]);
      }
  }

  ctx.fillStyle = "#8a8074";
  ctx.font = `${SCALA * 2}px sans-serif`;
  ctx.fillText(p.nome, gx * SCALA + 4, (gy + CELLA_A) * SCALA - 6);
});

const file = SILHOUETTE ? "anteprime/pigiama-silhouette.png" : "anteprime/pigiama-serie.png";
fs.writeFileSync(file, c.toBuffer("image/png"));

console.log(`serie in pigiama: ${pose.length} pose -> ${file}`);
if (!SILHOUETTE){
  console.log("\nproporzioni (limite " + G.MISURE.rapporto.toFixed(2) + " teste):");
  for (const e of G.verifica())
    console.log("  " + e.nome.padEnd(10) + e.misura.padEnd(8) + e.teste + " teste  " +
                (e.dentroIlVincolo ? "OK" : "SFORA"));
}
