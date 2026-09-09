/* Quanto e' larga una battuta dentro il fumetto, in pixel d'arte.
   Serve prima di scrivere una frase nuova: la tela e' stretta e una battuta
   che sfora viene tagliata a meta'.

     node strumenti/misura.js "MANNAGGIA AL SOLE D'AGOSTO"
*/
const A = require("../arte.js");

const TELE = { buio: 80, facile: 88, mappa: 112, salotto: 124 };

function larghezza(testo){
  let l = 2;                                  // i due bordi del fumetto
  for (const c of testo) l += (A.GLIFI[c] ? A.GLIFI[c][0].length : 3) + 1;
  return l + 4;                               // il margine interno
}

const frasi = process.argv.length > 2 ? process.argv.slice(2) : [
  "MANNAGGIA AL SOLE D'AGOSTO",
  "MANNAGGIA AL SOLE",
  "SOLE D'AGOSTO",
  "E ALLORA NO",
  "MA COME NO",
  "BASTA",
  "SI BALLA"
];

for (const f of frasi){
  const l = larghezza(f);
  const dove = Object.entries(TELE)
    .map(([n, w]) => (l <= w ? n : null)).filter(Boolean);
  console.log(String(l).padStart(4) + " px  \"" + f + "\"" +
    (dove.length ? "   sta in: " + dove.join(", ") : "   NON STA IN NESSUNA TELA"));
}
