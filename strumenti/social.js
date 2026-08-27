/* Genera l'immagine che compare nell'anteprima del link su WhatsApp.
   1200x630, il formato che si aspettano tutte le chat.
     node strumenti/social.js
*/
const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const A = require("../arte.js");
const G = require("../pigiama.js");
const S = require("../salotto.js");

// la scena sta al centro, il resto e' bordo scuro
const L = 1200, H = 630;
const SCA = Math.floor(Math.min(L / S.LARG, H / S.ALT));      // 5
const ox = Math.round((L - S.LARG * SCA) / 2);
const oy = Math.round((H - S.ALT * SCA) / 2);

const c = createCanvas(L, H);
const x = c.getContext("2d");
x.fillStyle = "#0b0a09";
x.fillRect(0, 0, L, H);

const P = { punto(px, py, col){
  if (!col) return;
  px = Math.round(px); py = Math.round(py);
  if (px < 0 || py < 0 || px >= S.LARG || py >= S.ALT) return;
  x.fillStyle = col;
  x.fillRect(ox + px * SCA, oy + py * SCA, SCA, SCA);
}};

S.sfondo(P);

// lui seduto, con il telecomando in mano e il volume a 70
const sed = G.seduto();
const px = Math.round(S.POSTO.x - sed[0].length / 2);
const py = S.SEDUTA - sed.length + 6;
for (let y = 0; y < sed.length; y++)
  for (let k = 0; k < sed[y].length; k++){
    const ch = sed[y][k];
    if (ch !== '.') P.punto(px + k, py + y, A.C[ch]);
  }
S.telecomando(P, px + 13, py + 23);
S.televisore(P, true, true, 8);
S.barraVolume(P, 70, 1, false);

// l'alone della televisione, come nella pagina
const g = x.createRadialGradient(L / 2, oy + S.TV_CIMA * SCA, 40, L / 2, oy + S.TV_CIMA * SCA, 620);
g.addColorStop(0,    'rgba(150,190,240,0.18)');
g.addColorStop(0.45, 'rgba(140,180,235,0.06)');
g.addColorStop(1,    'rgba(120,160,220,0)');
x.fillStyle = g;
x.fillRect(0, 0, L, H);

// una vignettatura, perche' il centro resti il soggetto
const v = x.createLinearGradient(0, 0, 0, H);
v.addColorStop(0,    'rgba(6,6,7,0.55)');
v.addColorStop(0.35, 'rgba(6,6,7,0)');
v.addColorStop(0.7,  'rgba(6,6,7,0)');
v.addColorStop(1,    'rgba(6,6,7,0.6)');
x.fillStyle = v;
x.fillRect(0, 0, L, H);

fs.writeFileSync("anteprime/social.png", c.toBuffer("image/png"));
console.log(`social ${L}x${H} (scala ${SCA}) -> anteprime/social.png`);
