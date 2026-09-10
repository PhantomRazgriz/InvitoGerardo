/* Controllo del quinto atto.

     node strumenti/finale.js            la caduta, fotogramma per fotogramma
     node strumenti/finale.js poltrona   la scena della scelta
     node strumenti/finale.js festa      coriandoli e ballo
     node strumenti/finale.js addio      porta, lacrime, cuore
*/
const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const A = require("../arte.js");
const F = require("../finale.js");

const SCALA = 4;
const modo = process.argv[2] || "caduta";

function tela(quadri, colonne, fondo){
  const righe = Math.ceil(quadri / colonne);
  const c = createCanvas(F.LARG * colonne * SCALA, F.ALT * righe * SCALA);
  const ctx = c.getContext("2d");
  ctx.fillStyle = fondo;
  ctx.fillRect(0, 0, c.width, c.height);
  return { c, ctx, colonne };
}

function pittore(ctx, gx, gy){
  return { punto(x, y, col){
    if (!col) return;
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= F.LARG || y >= F.ALT) return;
    ctx.fillStyle = col;
    ctx.fillRect((gx + x) * SCALA, (gy + y) * SCALA, SCALA, SCALA);
  }};
}

function riquadro(ctx, gx, gy, etichetta, chiaro){
  ctx.strokeStyle = chiaro ? "#ddd6c8" : "#332e28";
  ctx.strokeRect(gx * SCALA + .5, gy * SCALA + .5,
                 F.LARG * SCALA - 1, F.ALT * SCALA - 1);
  ctx.fillStyle = chiaro ? "#7a7266" : "#8a8074";
  ctx.font = `${SCALA * 2.4}px sans-serif`;
  ctx.fillText(etichetta, gx * SCALA + 4, (gy + F.ALT) * SCALA - 5);
}

/* ---------------- la caduta ---------------- */
if (modo === "caduta"){
  const ISTANTI = [0, 14, 24, 32, 35, 40, 50, 64, 80, 100, 120, 148];
  const { c, ctx, colonne } = tela(ISTANTI.length, 4, "#000");
  ISTANTI.forEach((t, n) => {
    const gx = (n % colonne) * F.LARG, gy = Math.floor(n / colonne) * F.ALT;
    const P = pittore(ctx, gx, gy);
    for (let y = 0; y < F.ALT; y++)
      for (let x = 0; x < F.LARG; x++) P.punto(x, y, F.COL.buio);
    const s = F.statoCaduta(t);
    F.suolo(P, 0);
    if (s.polvere >= 0) A.polvere(P, F.X_CADUTA, F.SUOLO + 4, s.polvere, s.durataPolvere);
    A.attore(P, F.X_CADUTA + s.scossa, s.y, {
      azione: s.azione, t, rabbia: s.rabbia, ombra: s.fase !== "volo"
    });
    if (s.dice) A.fumetto(P, F.X_CADUTA - 10, 6, s.dice, null, F.LARG);
    riquadro(ctx, gx, gy, `t=${t} ${s.fase}`, false);
  });
  fs.writeFileSync("anteprime/caduta.png", c.toBuffer("image/png"));
  console.log("caduta -> anteprime/caduta.png");
}

/* ---------------- la poltrona e la scelta ---------------- */
if (modo === "poltrona"){
  const CASI = [
    { et: "buio, entra", bianco: 0.0, entrata: 0.0, seduto: false, rabbia: 1 },
    { et: "sbianca", bianco: 0.5, entrata: 0.45, seduto: false, rabbia: 0.8 },
    { et: "bianco, arriva", bianco: 1, entrata: 1, seduto: false, rabbia: 0.5 },
    { et: "seduto, aspetta", bianco: 1, entrata: 1, seduto: true, rabbia: 0.2 },
    { et: "primo no", bianco: 1, entrata: 1, seduto: true, rabbia: 0.5 },
    { et: "terzo no", bianco: 1, entrata: 1, seduto: true, rabbia: 1 }
  ];
  const { c, ctx, colonne } = tela(CASI.length, 3, "#fff");
  CASI.forEach((k, n) => {
    const gx = (n % colonne) * F.LARG, gy = Math.floor(n / colonne) * F.ALT;
    const P = pittore(ctx, gx, gy);
    const fondo = A.mescola(F.COL.buio, F.COL.bianco, k.bianco);
    for (let y = 0; y < F.ALT; y++)
      for (let x = 0; x < F.LARG; x++) P.punto(x, y, fondo);
    F.suolo(P, k.bianco);
    F.poltrona(P, F.X_POLTRONA, k.entrata);
    const x = k.seduto ? F.X_POLTRONA : F.X_POLTRONA + 46;
    A.attore(P, x, F.SUOLO, {
      azione: k.rabbia > 0.6 ? "sbuffa" : "fermo",
      t: 40, rabbia: k.rabbia, ombra: !k.seduto
    });
    riquadro(ctx, gx, gy, k.et, k.bianco > 0.5);
  });
  fs.writeFileSync("anteprime/scelta.png", c.toBuffer("image/png"));
  console.log("scelta -> anteprime/scelta.png");
}

/* ---------------- la festa ---------------- */
if (modo === "festa"){
  const ISTANTI = [6, 20, 40, 70, 110, 160];
  const { c, ctx, colonne } = tela(ISTANTI.length, 3, "#fff");
  ISTANTI.forEach((t, n) => {
    const gx = (n % colonne) * F.LARG, gy = Math.floor(n / colonne) * F.ALT;
    const P = pittore(ctx, gx, gy);
    for (let y = 0; y < F.ALT; y++)
      for (let x = 0; x < F.LARG; x++) P.punto(x, y, F.COL.bianco);
    F.suolo(P, 1);
    F.poltrona(P, F.X_POLTRONA, 1);
    
    const b = F.passoDiBallo(t);
    A.attore(P, 74 + b.inclina, F.SUOLO + b.dy, {
      azione: b.azione, t, rabbia: 0, ombra: true
    });
    F.coriandoli(P, t);
    riquadro(ctx, gx, gy, `t=${t} ballo`, true);
  });
  fs.writeFileSync("anteprime/festa.png", c.toBuffer("image/png"));
  console.log("festa -> anteprime/festa.png");
}

/* ---------------- i due rami, con i numeri veri del modulo ---------------- */
if (modo === "si" || modo === "no"){
  const esito = modo;
  const ISTANTI = esito === "si"
    ? [0, 14, 30, 52, 84, 120, 160, 210]
    : [0, 22, 46, 74, 100, 128, 146, 158, 176, 200, 214, 240];
  const { c, ctx, colonne } = tela(ISTANTI.length, 4, "#fff");
  ISTANTI.forEach((tE, n) => {
    const gx = (n % colonne) * F.LARG, gy = Math.floor(n / colonne) * F.ALT;
    const P = pittore(ctx, gx, gy);
    // si e' seduto da un pezzo: la transizione al bianco e' finita
    const s = F.statoScelta(120, esito, tE, esito === "no" ? 3 : 0);

    if (s.fase === "addio"){
      for (let y = 0; y < F.ALT; y++)
        for (let x = 0; x < F.LARG; x++) P.punto(x, y, F.COL.bianco);
      F.suolo(P, 1);
      F.poltrona(P, F.X_POLTRONA, 1);
      F.porta(P, F.LARG - 16, F.SUOLO, 1, 1);
      F.velo(P, s.buio);
      F.cuore(P, F.LARG / 2, F.ALT / 2 - 2, s.cuore, 20);
    } else {
      for (let y = 0; y < F.ALT; y++)
        for (let x = 0; x < F.LARG; x++) P.punto(x, y, F.COL.bianco);
      F.suolo(P, 1);
      F.poltrona(P, F.X_POLTRONA, 1);
      if (s.porta) F.porta(P, F.LARG - 16, F.SUOLO, s.porta.apre, s.porta.comparsa);
      if (s.mostraLui){
        const r = A.attore(P, s.x, s.y, {
          azione: s.azione, t: tE, rabbia: s.rabbia,
          ombra: s.y === F.SUOLO, largTela: F.LARG
        });
        if (s.piange) F.lacrime(P, r.cx, r.cy, tE);
      }
      if (s.coriandoli) F.coriandoli(P, tE);
    }
    riquadro(ctx, gx, gy, `tE=${tE} ${s.fase}`, s.buio === undefined || s.buio < 0.5);
  });
  const file = `anteprime/ramo-${esito}.png`;
  fs.writeFileSync(file, c.toBuffer("image/png"));
  console.log(`ramo del ${esito} -> ${file}`);
}

/* ---------------- l'addio ---------------- */
if (modo === "addio"){
  const CASI = [
    { et: "porta compare", comparsa: 0.4, apertura: 0, x: 30, bianco: 1, cuore: 0 },
    { et: "porta pronta", comparsa: 1, apertura: 0, x: 40, bianco: 1, cuore: 0 },
    { et: "si apre", comparsa: 1, apertura: 0.6, x: 76, bianco: 1, cuore: 0 },
    { et: "esce", comparsa: 1, apertura: 1, x: 84, bianco: 1, cuore: 0 },
    { et: "buio", comparsa: 0, apertura: 0, x: -99, bianco: 0, cuore: 0.5 },
    { et: "il cuore", comparsa: 0, apertura: 0, x: -99, bianco: 0, cuore: 1 }
  ];
  const { c, ctx, colonne } = tela(CASI.length, 3, "#fff");
  CASI.forEach((k, n) => {
    const gx = (n % colonne) * F.LARG, gy = Math.floor(n / colonne) * F.ALT;
    const P = pittore(ctx, gx, gy);
    const fondo = A.mescola(F.COL.buio, F.COL.bianco, k.bianco);
    for (let y = 0; y < F.ALT; y++)
      for (let x = 0; x < F.LARG; x++) P.punto(x, y, fondo);
    if (k.bianco > 0.5){
      F.suolo(P, k.bianco);
      F.porta(P, 92, F.SUOLO, k.apertura, k.comparsa);
      if (k.x > 0){
        const r = A.attore(P, k.x, F.SUOLO, {
          azione: "fermo", t: 30, rabbia: 1, ombra: true
        });
        F.lacrime(P, r.cx, r.cy, 30);
      }
    }
    F.cuore(P, F.LARG / 2, F.ALT / 2, k.cuore, 20);
    riquadro(ctx, gx, gy, k.et, k.bianco > 0.5);
  });
  fs.writeFileSync("anteprime/addio.png", c.toBuffer("image/png"));
  console.log("addio -> anteprime/addio.png");
}





