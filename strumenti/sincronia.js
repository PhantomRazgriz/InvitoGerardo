const F = require("../facile.js");
const FRASI = [
  "Per lui, pero', non esiste niente di complicato.",
  "Si e' rotto qualcosa? Si aggiusta.",
  "Bisogna costruire da zero? Si costruisce.",
  "Qualcuno ha un problema?",
  "Anche quello ha una soluzione. Ed e' sempre la stessa.",
  "E se una cosa e' semplicemente impossibile?",
  "...si aggiusta pure quella.",
  "Gerardo, ora pero' devi andare via."
];
// 26 ms per lettera, a 60 fotogrammi al secondo
const fotogrammiTesto = n => Math.ceil(FRASI[n].length * 26 / 16.67);

function prova(vecchio, ogniQuanti){
  let passo = 0, t = 0, iFrase = -1, scriv = 0, fine = false;
  const dette = [];

  const mostra = n => {
    if (n === undefined || n <= iFrase) return;
    iFrase = n; dette.push(n); scriv = fotogrammiTesto(n);
  };
  const scorri = () => {                      // la vecchia prossimaFrase
    const n = iFrase + 1;
    if (n >= FRASI.length) return;
    iFrase = n; dette.push(n); scriv = fotogrammiTesto(n);
  };
  const avanti = vecchio ? scorri : mostra;

  mostra(0);                                   // entraInFacile

  for (let f = 0; f < 6000 && !fine; f++){
    const p = F.PASSI[passo];

    // --- il disegno ---
    if (vecchio){
      t++;
      if (p.ritardoFrase && t === p.ritardoFrase) scorri();
    } else {
      const attende = p.frase !== undefined && !p.ritardoFrase && scriv > 0;
      if (!attende) t++;
      if (p.ritardoFrase && t >= p.ritardoFrase) mostra(p.frase);
    }
    if (scriv > 0) scriv--;

    // --- il tocco, ogni tot fotogrammi ---
    if (f % ogniQuanti === 0){
      if (scriv > 0){ scriv = 0; }
      else {
        const s = F.stato(passo, t);
        if (!s.finito) t = p.durata;
        else if (passo >= F.PASSI.length - 1) fine = true;
        else {
          passo++; t = 0;
          const q = F.PASSI[passo];
          if (vecchio){ if (q.frase !== undefined && !q.ritardoFrase) scorri(); }
          else if (!q.ritardoFrase) mostra(q.frase);
        }
      }
    }
  }
  return dette;
}

for (const ogni of [4, 12, 30, 90]){
  for (const vecchio of [true, false]){
    const d = prova(vecchio, ogni);
    const perse = [];
    for (let i = 0; i < FRASI.length; i++) if (!d.includes(i)) perse.push(i);
    const doppie = d.filter((v, i) => d.indexOf(v) !== i);
    const ordinate = d.every((v, i) => i === 0 || v > d[i-1]);
    console.log(
      (vecchio ? "PRIMA " : "DOPO  ") +
      "tocco ogni " + String(ogni).padStart(2) + " fotogrammi:  " +
      "dette [" + d.join(",") + "]" +
      (perse.length ? "  PERSE: " + perse.join(",") : "  nessuna persa") +
      (doppie.length ? "  RIPETUTE: " + doppie.join(",") : "") +
      (ordinate ? "" : "  FUORI ORDINE")
    );
  }
  console.log("");
}
