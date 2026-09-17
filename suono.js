/* ==========================================================================
   IL SUONO

   Generato, non caricato. Tutto il resto dell'invito e' disegnato dal
   codice un pixel alla volta, e i suoni seguono la stessa regola: sono
   costruiti con oscillatori e rumore filtrato, non registrati. Costano
   zero byte da scaricare, non hanno bisogno di un file che potrebbe non
   arrivare, e restano coerenti con un disegno fatto a quadretti.

   Tre regole che valgono per tutto quello che c'e' qui dentro:

   1. NIENTE PARTE DA SOLO. I telefoni non lo permetterebbero comunque, ma
      soprattutto questo invito si apre dove capita - in ufficio, sul
      pullman - e un rumore a sorpresa e' un dispetto, non una sorpresa.
      Il motore si accende al primo tocco, che serve gia' per andare
      avanti nel racconto.

   2. SI PUO' SPEGNERE, e la scelta si ricorda. Chi lo spegne non deve
      rispegnerlo a ogni scena.

   3. SE L'AUDIO NON C'E', NON SUCCEDE NIENTE. Su un browser vecchio le
      funzioni esistono e non fanno nulla: l'invito resta identico, muto.
   ========================================================================== */
(function (radice) {
"use strict";

let ctx = null;          // il motore, creato solo quando serve
let generale = null;     // il volume di tutto
let rumore = null;       // un secondo di fruscio, riusato per sempre
let acceso = true;
let spentoAMano = false;

/* La scelta di chi ascolta sopravvive alla ricarica. Se il browser non ha
   la memoria (o e' in navigazione privata) si tira dritto senza. */
try {
  const salvato = localStorage.getItem('suono');
  if (salvato === 'no'){ acceso = false; spentoAMano = true; }
} catch (e) { /* pazienza */ }

const CI_SONO = typeof window !== 'undefined' &&
  (window.AudioContext || window.webkitAudioContext);

/* --------------------------------------------------------------------------
   IL MOTORE
   -------------------------------------------------------------------------- */
function sveglia(){
  if (!CI_SONO || !acceso) return;
  if (!ctx){
    const Motore = window.AudioContext || window.webkitAudioContext;
    ctx = new Motore();
    generale = ctx.createGain();
    generale.gain.value = 0.55;
    generale.connect(ctx.destination);

    // un secondo di fruscio bianco: e' la materia prima di passi e svapate
    const n = ctx.sampleRate;
    rumore = ctx.createBuffer(1, n, n);
    const d = rumore.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  // i telefoni tengono il motore fermo finche' non si tocca lo schermo
  if (ctx.state === 'suspended') ctx.resume();
}

const ora = () => ctx.currentTime;
const vivo = () => acceso && ctx && ctx.state === 'running';

/* Una raffica di fruscio, filtrata e sagomata. E' il mattone di quasi
   tutto: un passo e' fruscio corto e cupo, una svapata e' fruscio lungo
   e sottile. */
function raffica(o){
  const s = ctx.createBufferSource();
  s.buffer = rumore;
  s.loop = true;
  // parte da un punto a caso del fruscio: due passi identici si sentono
  s.loopStart = Math.random() * 0.8;
  s.loopEnd = s.loopStart + 0.2;

  const f = ctx.createBiquadFilter();
  f.type = o.tipo || 'lowpass';
  f.frequency.setValueAtTime(o.da, ora());
  f.frequency.exponentialRampToValueAtTime(Math.max(40, o.a), ora() + o.durata);
  if (o.q) f.Q.value = o.q;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, ora());
  g.gain.linearRampToValueAtTime(o.volume, ora() + (o.attacco || 0.006));
  g.gain.exponentialRampToValueAtTime(0.0001, ora() + o.durata);

  s.connect(f); f.connect(g); g.connect(generale);
  s.start(ora());
  s.stop(ora() + o.durata + 0.02);
}

/* Una nota breve. Serve al tonfo del passo e ai blip del testo. */
function nota(o){
  const s = ctx.createOscillator();
  s.type = o.tipo || 'triangle';
  s.frequency.setValueAtTime(o.da, ora());
  if (o.a) s.frequency.exponentialRampToValueAtTime(o.a, ora() + o.durata);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, ora());
  g.gain.linearRampToValueAtTime(o.volume, ora() + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, ora() + o.durata);

  s.connect(g); g.connect(generale);
  s.start(ora());
  s.stop(ora() + o.durata + 0.02);
}

/* --------------------------------------------------------------------------
   I PASSI
   Un passo non e' un tono: e' un colpo. Fruscio cupo per la suola che
   tocca, e sotto un tonfo che scende, per il peso. Senza il tonfo suona
   come carta sfregata; senza il fruscio come un tamburo.
   -------------------------------------------------------------------------- */
function passo(){
  if (!vivo()) return;
  // ogni passo un po' diverso: due colpi identici si sentono subito, e
  // diventano un rumore di macchina invece che di persona
  const v = 0.9 + Math.random() * 0.2;
  raffica({ da: 1400 * v, a: 300, durata: 0.075, volume: 0.10, tipo: 'lowpass' });
  nota({ da: 96 * v, a: 54, durata: 0.085, volume: 0.075, tipo: 'sine' });
}

/* Il passo si sente quando il piede TOCCA, non quando si alza. Nel ciclo
   della camminata le fasi 1 e 3 sono quelle con la gamba sollevata: il
   contatto e' il ritorno a 0 e a 2. Sbagliando questo, il suono cade
   mezzo passo dopo e sembra scollato dal disegno. */
let fasePasso = -1;
function camminata(t, sta){
  if (!sta){ fasePasso = -1; return; }
  const p = Math.floor(t / 7) % 4;
  if (p === fasePasso) return;
  const prima = fasePasso;
  fasePasso = p;
  if (prima >= 0 && (p === 0 || p === 2)) passo();
}

/* --------------------------------------------------------------------------
   LA SVAPATA
   Due tempi, come il gesto: tira, e dopo un po' soffia.
   Il tiro e' sottile e sale, il soffio e' largo e scende. Vanno tenuti
   molto bassi: sono un contorno, non un evento.
   -------------------------------------------------------------------------- */
function tiro(){
  if (!vivo()) return;
  raffica({ da: 600, a: 2600, durata: 0.5, volume: 0.045,
            tipo: 'bandpass', q: 1.2, attacco: 0.14 });
}

function soffio(){
  if (!vivo()) return;
  raffica({ da: 1800, a: 320, durata: 0.85, volume: 0.05,
            tipo: 'lowpass', attacco: 0.1 });
}

/* Gli istanti li detta arte.js, non li reinvento qui: se un giorno il
   gesto viene allungato, il suono lo segue da solo.
   Il ricominciare si riconosce dal tempo che torna indietro, e non dal
   contare i giri: cosi' funziona anche se il gesto riparte da zero due
   volte di seguito, che e' il caso in cui il conteggio dei giri restava
   fermo e la seconda svapata veniva muta. */
const segnati = new Set();
let tPrec = -1;

function svapata(t, sta){
  if (!sta){ tPrec = -1; segnati.clear(); return; }
  if (t < tPrec) segnati.clear();
  tPrec = t;

  const S = (radice.ARTE && radice.ARTE.SVAPO) ||
            { tira: 78, soffia: 186, ciclo: 420 };
  const dentro = t % S.ciclo;
  if (dentro >= S.tira   && !segnati.has('t')){ segnati.add('t'); tiro(); }
  if (dentro >= S.soffia && !segnati.has('s')){ segnati.add('s'); soffio(); }
}

/* --------------------------------------------------------------------------
   IL TESTO
   Un blip per lettera sarebbe una mitragliatrice: a ventisei millisecondi
   per carattere farebbe trentotto colpi al secondo. Se ne suona uno ogni
   due, e mai sugli spazi - il silenzio fra le parole e' quello che fa
   sembrare una voce invece che un motore.
   -------------------------------------------------------------------------- */
let quante = 0;
function lettera(ch){
  if (!vivo()) return;
  if (ch === ' ' || ch === '\n' || ch === undefined) return;
  if (++quante % 2) return;
  // il tono cambia appena, o dopo tre parole diventa insopportabile
  const v = 1 + (Math.random() - 0.5) * 0.14;
  nota({ da: 760 * v, a: 660 * v, durata: 0.028, volume: 0.035, tipo: 'square' });
}
function nuovaFrase(){ quante = 0; }

/* --------------------------------------------------------------------------
   L'INTERRUTTORE
   -------------------------------------------------------------------------- */
function commuta(){
  acceso = !acceso;
  spentoAMano = true;
  try { localStorage.setItem('suono', acceso ? 'si' : 'no'); } catch (e) {}
  if (acceso) sveglia();
  else if (ctx && ctx.state === 'running') ctx.suspend();
  return acceso;
}

const API = {
  sveglia, commuta,
  camminata, svapata, lettera, nuovaFrase,
  passo, tiro, soffio,
  get acceso(){ return acceso; },
  get disponibile(){ return !!CI_SONO; }
};

if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.SUONO = API;

})(typeof self !== 'undefined' ? self : this);
