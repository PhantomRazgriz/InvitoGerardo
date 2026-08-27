/* ==========================================================================
   PIXELLA — disegna in alto e riduci in basso.

   Il problema con cui ero bloccato: piazzare pixel a mano su una griglia
   va bene per una figura in piedi, simmetrica e compatta, ma non per un
   corpo disteso. Un corpo disteso e' fatto di curve, e su una griglia da
   venti pixel le curve non si progettano: si indovinano.

   Qui si disegna a risoluzione 12 volte piu' alta, con curve di Bezier e
   forme organiche, poi si riduce con media d'area e si quantizza sulla
   palette del personaggio. Il disegno resta modificabile in termini di
   anatomia, non di singoli pixel.
   ========================================================================== */
const { createCanvas } = require("@napi-rs/canvas");
const sharp = require("sharp");

const SU = 12;                        // fattore di sovracampionamento

/* --------------------------------------------------------------------------
   Tela ad alta risoluzione, con le coordinate del pixel d'arte
   -------------------------------------------------------------------------- */
function tela(larghezza, altezza){
  const c = createCanvas(larghezza * SU, altezza * SU);
  const x = c.getContext("2d");
  x.scale(SU, SU);
  x.lineJoin = "round";
  x.lineCap = "round";
  return { canvas: c, ctx: x, larghezza, altezza };
}

/* Capsula: un osso con spessore. Il modo naturale di costruire un arto. */
function osso(ctx, x1, y1, x2, y2, r1, r2, colore){
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  ctx.fillStyle = colore;
  ctx.beginPath();
  ctx.arc(x1, y1, r1, a, a + Math.PI);
  ctx.arc(x2, y2, r2, a + Math.PI, a + Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function macchia(ctx, cx, cy, rx, ry, rot, colore){
  ctx.fillStyle = colore;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  ctx.fill();
}

/* Riduzione a pixel art: media d'area, poi quantizzazione sulla palette
   fornita. Niente dithering: su una figura piccola sporca e basta. */
async function riduci(tela, palette, soglia = 30){
  const grande = tela.canvas.toBuffer("image/png");
  const { data, info } = await sharp(grande)
    .resize(tela.larghezza, tela.altezza, { kernel: "lanczos3", fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const voci = Object.entries(palette).map(([ch, hex]) => [ch, [
    parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)
  ]]);

  const righe = [];
  for (let y = 0; y < info.height; y++){
    let riga = "";
    for (let x = 0; x < info.width; x++){
      const i = (y * info.width + x) * info.channels;
      if (data[i + 3] < 128){ riga += "."; continue; }   // trasparente
      const c = [data[i], data[i + 1], data[i + 2]];
      let best = ".", bestD = Infinity;
      for (const [ch, rgb] of voci){
        const d = 2 * (c[0]-rgb[0])**2 + 4 * (c[1]-rgb[1])**2 + 3 * (c[2]-rgb[2])**2;
        if (d < bestD){ bestD = d; best = ch; }
      }
      riga += best;
    }
    righe.push(riga);
  }
  return pulisci(righe);
}

/* Toglie i pixel isolati: la riduzione ne lascia sempre qualcuno e a
   schermo sembrano sporcizia. */
function pulisci(righe, passate = 2){
  let g = righe.map(r => [...r]);
  const A = g.length, L = g[0].length;
  for (let p = 0; p < passate; p++){
    const n = g.map(r => [...r]);
    for (let y = 0; y < A; y++)
      for (let x = 0; x < L; x++){
        const mio = g[y][x], vic = [];
        if (y > 0) vic.push(g[y-1][x]);
        if (y < A-1) vic.push(g[y+1][x]);
        if (x > 0) vic.push(g[y][x-1]);
        if (x < L-1) vic.push(g[y][x+1]);
        if (vic.includes(mio)) continue;
        const conti = {};
        for (const v of vic) conti[v] = (conti[v] || 0) + 1;
        let vinc = mio, max = 0;
        for (const [v, q] of Object.entries(conti)) if (q > max){ max = q; vinc = v; }
        if (max >= 3) n[y][x] = vinc;
      }
    g = n;
  }
  return g.map(r => r.join(""));
}

/* Anteprima ingrandita con griglia e coordinate: serve per correggere
   dicendo "il pixel 14,7", invece di andare a tentoni. */
async function anteprima(righe, palette, file, scala = 10, griglia = true){
  const L = righe[0].length, A = righe.length;
  const c = createCanvas(L * scala, A * scala);
  const x = c.getContext("2d");
  x.fillStyle = "#2b2622"; x.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < A; y++)
    for (let px = 0; px < L; px++){
      const ch = righe[y][px];
      if (ch === "." || !palette[ch]) continue;
      x.fillStyle = palette[ch];
      x.fillRect(px * scala, y * scala, scala, scala);
    }
  if (griglia){
    x.strokeStyle = "rgba(255,255,255,.07)"; x.lineWidth = 1;
    for (let i = 0; i <= L; i++){ x.beginPath(); x.moveTo(i*scala, 0); x.lineTo(i*scala, A*scala); x.stroke(); }
    for (let i = 0; i <= A; i++){ x.beginPath(); x.moveTo(0, i*scala); x.lineTo(L*scala, i*scala); x.stroke(); }
    x.strokeStyle = "rgba(217,169,58,.35)";
    for (let i = 0; i <= L; i += 10){ x.beginPath(); x.moveTo(i*scala, 0); x.lineTo(i*scala, A*scala); x.stroke(); }
    for (let i = 0; i <= A; i += 10){ x.beginPath(); x.moveTo(0, i*scala); x.lineTo(L*scala, i*scala); x.stroke(); }
  }
  require("fs").writeFileSync(file, c.toBuffer("image/png"));
  return `${L}x${A} -> ${file}`;
}

/* Stampa lo sprite pronto da incollare nel codice */
function comeCodice(righe, nome){
  return `SPR.${nome} = [\n` + righe.map(r => `  "${r}"`).join(",\n") + `\n];`;
}

module.exports = { SU, tela, osso, macchia, riduci, pulisci, anteprima, comeCodice };
