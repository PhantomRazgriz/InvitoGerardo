/* Esamina un mp3 senza bisogno di programmi esterni, leggendo le
   intestazioni dei fotogrammi audio uno per uno.

   Serve a sapere tre cose prima di mettere un brano dentro l'invito:
   quanto dura, quanto pesa al secondo, e se e' inciso a qualita' costante
   o variabile. Il peso e' quello che conta: l'invito si apre col telefono,
   spesso fuori casa.

     node strumenti/musica.js percorso/del/file.mp3
*/
const fs = require("fs");

const BITRATE = {
  1: [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0],   // MPEG1 layer III
  2: [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0]        // MPEG2/2.5 layer III
};
const FREQUENZA = {
  3: [44100, 48000, 32000, 0],     // MPEG1
  2: [22050, 24000, 16000, 0],     // MPEG2
  0: [11025, 12000,  8000, 0]      // MPEG2.5
};
const CANALI = ["stereo", "stereo uniti", "doppio mono", "mono"];

function esamina(file){
  const d = fs.readFileSync(file);
  let i = 0;

  // salta l'etichetta ID3v2, se c'e'
  if (d.slice(0, 3).toString("latin1") === "ID3"){
    const n = ((d[6] & 0x7f) << 21) | ((d[7] & 0x7f) << 14) |
              ((d[8] & 0x7f) << 7)  |  (d[9] & 0x7f);
    i = 10 + n;
  }

  const trovati = {};
  let fotogrammi = 0, campioni = 0, primo = null, byteAudio = 0;

  while (i < d.length - 4){
    if (d[i] !== 0xff || (d[i+1] & 0xe0) !== 0xe0){ i++; continue; }

    const versione = (d[i+1] >> 3) & 3;          // 3=MPEG1, 2=MPEG2, 0=MPEG2.5
    const strato   = (d[i+1] >> 1) & 3;          // 1 = layer III
    const iBit     = (d[i+2] >> 4) & 15;
    const iFreq    = (d[i+2] >> 2) & 3;
    const riempi   = (d[i+2] >> 1) & 1;
    const canale   = (d[i+3] >> 6) & 3;

    if (versione === 1 || strato !== 1 || iBit === 0 || iBit === 15 || iFreq === 3){
      i++; continue;
    }

    const kbps = BITRATE[versione === 3 ? 1 : 2][iBit];
    const hz   = FREQUENZA[versione][iFreq];
    if (!kbps || !hz){ i++; continue; }

    const perFotogramma = versione === 3 ? 1152 : 576;
    const lungo = Math.floor(perFotogramma / 8 * 1000 * kbps / hz) + riempi;
    if (lungo < 24){ i++; continue; }

    if (!primo) primo = { hz, canali: CANALI[canale], versione };
    trovati[kbps] = (trovati[kbps] || 0) + 1;
    fotogrammi++;
    campioni += perFotogramma;
    byteAudio += lungo;
    i += lungo;
  }

  if (!fotogrammi) return null;
  const secondi = campioni / primo.hz;
  const qualita = Object.entries(trovati).sort((a, b) => b[1] - a[1]);
  const media = byteAudio * 8 / secondi / 1000;

  return { file, byte: d.length, secondi, fotogrammi, media,
           costante: qualita.length === 1, qualita, ...primo };
}

const file = process.argv[2];
if (!file){ console.log("uso: node strumenti/musica.js file.mp3"); process.exit(1); }

const r = esamina(file);
if (!r){ console.log("non sembra un mp3 leggibile"); process.exit(1); }

const mm = Math.floor(r.secondi / 60), ss = Math.round(r.secondi % 60);
console.log("  file        " + r.file);
console.log("  peso        " + (r.byte / 1024 / 1024).toFixed(2) + " MB");
console.log("  durata      " + mm + ":" + String(ss).padStart(2, "0"));
console.log("  qualita'    " + r.media.toFixed(0) + " kbps " +
  (r.costante ? "costante" : "variabile") +
  "   (" + r.qualita.slice(0, 3).map(q => q[0] + "k").join(", ") + ")");
console.log("  campioni    " + r.hz + " Hz, " + r.canali);
console.log("");

/* Quanto ci mette ad arrivare. Sono le velocita' vere di una linea
   mobile, non quelle di casa. */
const RETI = [["3G lento", 0.4], ["4G scarso", 1.5], ["4G buono", 6], ["wifi", 20]];
console.log("  tempo per scaricarlo:");
for (const [nome, mbps] of RETI){
  const s = r.byte * 8 / 1e6 / mbps;
  console.log("    " + nome.padEnd(11) + (s < 1 ? "<1" : s.toFixed(0)) + " s" +
    (s > 12 ? "   troppo: si stanca e chiude" : ""));
}

console.log("");
console.log("  per il confronto: tutto il resto dell'invito pesa 69 KB compressi");
console.log("  cioe' questo brano da solo e' " +
  Math.round(r.byte / 1024 / 69) + " volte l'intero invito");
