/* Prova di stampa dell'alfabeto: tutti i glifi e alcune parole vere.
   Le lettere si giudicano solo affiancate, mai una alla volta: la N sembrava
   una K e la G una O, e in isolamento non si notava.

     node strumenti/alfabeto.js
*/
const fs = require("fs");
const { createCanvas } = require("@napi-rs/canvas");
const A = require("../arte.js");

const SCALA = 7, MARGINE = 8;
const PAROLE = [
  "ABCDEFGHILMNOPQRSTUVZ",
  "0123456789 : , - / + '",
  "SAN GIOVANNI ROTONDO",
  "CAVALLINO ROSSO",
  "SABATO 7 NOVEMBRE",
  "ACQUISIZIONE TARGET",
  "41.70 N, 15.72 E",
  "VABBUO' VOILAT AMO'"
];

// larghezza in pixel d'arte della riga piu' lunga
const largRiga = t => [...t].reduce((s, c) => s + (A.GLIFI[c] ? A.GLIFI[c][0].length : 3) + 1, 0);
const LARG = Math.max(...PAROLE.map(largRiga)) + MARGINE * 2;
const ALT = PAROLE.length * 9 + MARGINE * 2;

const c = createCanvas(LARG * SCALA, ALT * SCALA);
const ctx = c.getContext("2d");
ctx.fillStyle = "#22201d";
ctx.fillRect(0, 0, c.width, c.height);

const punto = (x, y, colore) => {
  ctx.fillStyle = colore;
  ctx.fillRect(x * SCALA, y * SCALA, SCALA, SCALA);
};

PAROLE.forEach((testo, n) => {
  const y = MARGINE + n * 9;
  let x = MARGINE;
  // le prime due righe sono l'inventario, le altre parole d'uso: colore diverso
  const colore = n < 2 ? "#f6f1e6" : "#7ee08a";
  for (const ch of testo) {
    const g = A.GLIFI[ch] || A.GLIFI[" "];
    g.forEach((riga, ry) => {
      for (let rx = 0; rx < riga.length; rx++)
        if (riga[rx] === "o") punto(x + rx, y + ry, colore);
    });
    x += g[0].length + 1;
  }
});

fs.writeFileSync("anteprime/alfabeto.png", c.toBuffer("image/png"));
console.log(`alfabeto: ${Object.keys(A.GLIFI).length} glifi -> anteprime/alfabeto.png`);
const larghezze = {};
for (const [k, g] of Object.entries(A.GLIFI)) {
  const w = g[0].length;
  (larghezze[w] = larghezze[w] || []).push(k);
}
for (const w of Object.keys(larghezze).sort())
  console.log(`  ${w} px: ${larghezze[w].join(" ")}`);
