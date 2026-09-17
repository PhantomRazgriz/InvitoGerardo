/* Controlla che i suoni scattino quando devono, e soltanto allora.

   Si costruisce un finto motore audio che non emette niente ma tiene il
   conto: cosi' si puo' verificare il RITMO senza sentire nulla, che e'
   l'unica cosa verificabile a macchina. Il timbro si giudica con le
   orecchie, non con un programma.

     node strumenti/suono.js
*/
const fs = require("fs");
const vm = require("vm");

let eventi = [];

function nodo(){
  const nulla = { value: 0, setValueAtTime(){}, linearRampToValueAtTime(){},
                  exponentialRampToValueAtTime(){} };
  return { connect(){}, start(){}, stop(){}, gain: nulla, frequency: nulla,
           Q: { value: 0 }, type: "", buffer: null,
           loop: false, loopStart: 0, loopEnd: 0 };
}

function Motore(){
  return {
    currentTime: 0, state: "running", sampleRate: 8000, destination: {},
    createGain: nodo, createBiquadFilter: nodo,
    createOscillator(){ eventi.push("nota"); return nodo(); },
    createBufferSource(){ eventi.push("fruscio"); return nodo(); },
    createBuffer(){ return { getChannelData(){ return new Float32Array(8000); } }; },
    resume(){}, suspend(){}
  };
}

const g = { AudioContext: Motore,
            localStorage: { getItem(){ return null; }, setItem(){} } };
const ctx = vm.createContext({ self: g, window: g, console, AudioContext: Motore });
vm.runInContext(fs.readFileSync("arte.js", "utf8"), ctx, { filename: "arte.js" });
vm.runInContext(fs.readFileSync("suono.js", "utf8"), ctx, { filename: "suono.js" });

const S = g.SUONO;
S.sveglia();

let male = 0;
function prova(nome, atteso, fatto){
  eventi = [];
  fatto();
  const n = eventi.length;
  const ok = n === atteso;
  if (!ok) male++;
  console.log("  " + nome.padEnd(42) + String(n).padStart(3) + "  atteso " +
    String(atteso).padStart(3) + (ok ? "" : "   SBAGLIATO"));
}

console.log("suoni emessi:");

// un passo = un fruscio + un tonfo, quindi due nodi
prova("60 fotogrammi di cammino (4 passi)", 8, () => {
  S.camminata(0, false);
  for (let t = 0; t < 60; t++) S.camminata(t, true);
});

prova("fermo: nessun passo", 0, () => {
  S.camminata(0, false);
  for (let t = 0; t < 60; t++) S.camminata(t, false);
});

prova("due svapate di fila (tiro + soffio per due)", 4, () => {
  S.svapata(0, false);
  for (let g2 = 0; g2 < 2; g2++){
    for (let t = 0; t < 420; t++) S.svapata(t, true);
    S.svapata(0, false);            // fra un gesto e l'altro
  }
});

prova("una frase di 26 lettere (spazi esclusi, uno ogni due)", 11, () => {
  S.nuovaFrase();
  for (const c of "Lui e' Gerardo, e compie 60") S.lettera(c);
});

prova("a suono spento non esce niente", 0, () => {
  S.commuta();                        // spegne
  S.passo(); S.lettera("a"); S.tiro(); S.soffio();
  S.commuta();                        // riaccende per le prove seguenti
});

console.log("\nritmo:");
const PASSO = 14;   // fotogrammi fra un piede e l'altro, da passiDi()
console.log("  un passo ogni " + PASSO + " fotogrammi = " +
  (60 / PASSO).toFixed(1) + " al secondo");
console.log("  un blip ogni 2 lettere a 26 ms = " +
  (1000 / 26 / 2).toFixed(0) + " al secondo");

console.log(male === 0 ? "\ntutto a posto" : "\n" + male + " prove fallite");
process.exit(male === 0 ? 0 : 1);
