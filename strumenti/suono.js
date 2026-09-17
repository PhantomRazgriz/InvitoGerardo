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
    createDynamicsCompressor(){
      const n = nodo();
      for (const k of ["threshold","knee","ratio","attack","release"]) n[k] = { value: 0 };
      return n;
    },
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

/* --- i suoni a scatto: devono suonare al cambio, non finche' dura --- */
prova("televisione: suona all'accensione, una volta", 4, () => {
  S.tv(false);
  for (let i = 0; i < 40; i++) S.tv(i >= 10);   // accesa dal decimo in poi
});

prova("i nove scatti del volume", 9 + 3, () => {
  S.volumeDaCapo();
  const V = [15,25,30,35,45,50,55,65,70];
  let i = 0;
  for (let t = 0; t < 200; t++){
    if (t % 20 === 0 && i < V.length) i++;
    S.volume(i ? V[i-1] : 0, i === V.length);
  }
});

prova("botta della caduta, una volta sola", 3, () => {
  S.impatto(false);
  for (let t = 0; t < 60; t++) S.impatto(t >= 20 && t < 34);
});

prova("porta chiusa: legno, tonfo e serratura", 3, () => {
  S.portaChiusa(false);
  for (let t = 0; t < 40; t++) S.portaChiusa(t >= 15);
});

prova("cambio d'abito: giravolta, sbuffo, ecco", 5, () => {
  S.cambioAbito(0, 92);
  for (let t = 1; t <= 92; t++) S.cambioAbito(t, 92);
});

prova("cambio d'abito ripetuto: rifa' tutto", 10, () => {
  for (let g2 = 0; g2 < 2; g2++){
    S.cambioAbito(0, 92);
    for (let t = 1; t <= 92; t++) S.cambioAbito(t, 92);
  }
});

console.log("\nritmo:");
const PASSO = 14;   // fotogrammi fra un piede e l'altro, da passiDi()
console.log("  un passo ogni " + PASSO + " fotogrammi = " +
  (60 / PASSO).toFixed(1) + " al secondo");
console.log("  un blip ogni 2 lettere a 26 ms = " +
  (1000 / 26 / 2).toFixed(0) + " al secondo");

console.log(male === 0 ? "\ntutto a posto" : "\n" + male + " prove fallite");
process.exit(male === 0 ? 0 : 1);


