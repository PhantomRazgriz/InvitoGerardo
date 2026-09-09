const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const M = require("../mappa.js");
const SCALA = 9;
const c = createCanvas(M.LARG * SCALA * 2, M.ALT * SCALA);
const ctx = c.getContext("2d");
ctx.fillStyle = "#071409"; ctx.fillRect(0, 0, c.width, c.height);
function pit(gx){ return { punto(x,y,col){ if(!col)return; x=Math.round(x);y=Math.round(y);
  if(x<0||y<0||x>=M.LARG||y>=M.ALT)return; ctx.fillStyle=col;
  ctx.fillRect((gx+x)*SCALA,y*SCALA,SCALA,SCALA); }}; }
const L = M.LIVELLI[0];
const pr = M.proiezione(L.centro, L.ampiezza);
// a sinistra piena, a destra solo contorno
for (const [gx, pieno] of [[0,true],[M.LARG,false]]) {
  const P = pit(gx);
  for (const iso of [M.PENISOLA, M.SICILIA, M.SARDEGNA]) {
    const pt = iso.map(pr);
    if (pieno) M.riempi(P, pt, "#1c4f28");
    M.contorno(P, pt, "#6cd97a");
  }
  if (!pieno) iso_vertici(P, pr);
}
function iso_vertici(P, pr){
  for (const iso of [M.PENISOLA, M.SICILIA, M.SARDEGNA])
    for (const p of iso) { const [x,y]=pr(p); P.punto(x,y,"#ff5f45"); }
}
fs.writeFileSync("anteprime/italia.png", c.toBuffer("image/png"));
console.log("italia -> anteprime/italia.png  (vertici in rosso a destra)");
