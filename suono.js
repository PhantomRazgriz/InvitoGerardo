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

    /* Un limitatore in uscita. Preso uno per uno nessun suono e' vicino
       alla saturazione, ma capita che se ne sovrappongano parecchi - lo
       schiocco dei coriandoli sono nove suoni in mezzo secondo, e intanto
       il testo continua a scrivere. Senza limitatore quei momenti
       gracchiano, e gracchiano solo su certi telefoni: il tipo di difetto
       che non si trova mai provando sul proprio. */
    const freno = ctx.createDynamicsCompressor();
    freno.threshold.value = -12;
    freno.knee.value = 12;
    freno.ratio.value = 8;
    freno.attack.value = 0.003;
    freno.release.value = 0.15;

    generale.connect(freno);
    freno.connect(ctx.destination);

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
/* I ritardi si affidano all'orologio dell'audio, non a setTimeout.
   Due ragioni: quell'orologio e' esatto al campione, mentre setTimeout
   arriva quando puo' e basta un fotogramma lungo per sfasare uno
   schiocco; e quello che e' gia' programmato suona anche se nel frattempo
   la pagina rallenta. */
function raffica(o){
  const q = ora() + (o.ritardo || 0);
  const s = ctx.createBufferSource();
  s.buffer = rumore;
  s.loop = true;
  // parte da un punto a caso del fruscio: due passi identici si sentono
  s.loopStart = Math.random() * 0.8;
  s.loopEnd = s.loopStart + 0.2;

  const f = ctx.createBiquadFilter();
  f.type = o.tipo || 'lowpass';
  f.frequency.setValueAtTime(o.da, q);
  f.frequency.exponentialRampToValueAtTime(Math.max(40, o.a), q + o.durata);
  if (o.q) f.Q.value = o.q;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, q);
  g.gain.linearRampToValueAtTime(o.volume, q + (o.attacco || 0.006));
  g.gain.exponentialRampToValueAtTime(0.0001, q + o.durata);

  s.connect(f); f.connect(g); g.connect(generale);
  s.start(q);
  s.stop(q + o.durata + 0.02);
}

/* Una nota breve. Serve al tonfo del passo e ai blip del testo. */
function nota(o){
  const q = ora() + (o.ritardo || 0);
  const s = ctx.createOscillator();
  s.type = o.tipo || 'triangle';
  s.frequency.setValueAtTime(o.da, q);
  if (o.a) s.frequency.exponentialRampToValueAtTime(o.a, q + o.durata);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0, q);
  g.gain.linearRampToValueAtTime(o.volume, q + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, q + o.durata);

  s.connect(g); g.connect(generale);
  s.start(q);
  s.stop(q + o.durata + 0.02);
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
   DUE MODI DI FAR SCATTARE UN SUONO

   Il disegno gira sessanta volte al secondo e ripassa dagli stessi
   fotogrammi: chiedergli "suona adesso" non basta, suonerebbe sessanta
   volte. Servono due arnesi.

   SEQUENZA: dato il tempo di un gesto e un elenco di tappe, fa scattare
   ogni tappa una volta sola. Si accorge da se' che il gesto e'
   ricominciato, perche' il tempo torna indietro.

   SCATTO: per le cose che sono accese o spente - la televisione, la porta
   - suona nel momento in cui cambiano, non finche' restano.
   -------------------------------------------------------------------------- */
const seq = {};
function sequenza(nome, t, tappe){
  const s = seq[nome] || (seq[nome] = { t: -1, fatte: new Set() });
  if (t < s.t) s.fatte.clear();          // il gesto e' ricominciato
  s.t = t;
  for (const [quando, fai] of tappe)
    if (t >= quando && !s.fatte.has(quando)){ s.fatte.add(quando); fai(); }
}
function azzera(nome){
  const s = seq[nome];
  if (s){ s.t = -1; s.fatte.clear(); }
}

const acceso_ = {};
function scatto(nome, condizione, fai){
  if (condizione && !acceso_[nome]) fai();
  acceso_[nome] = !!condizione;
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
   gesto viene allungato, il suono lo segue da solo. */
function svapata(t, sta){
  if (!sta){ azzera('svapo'); return; }
  const S = (radice.ARTE && radice.ARTE.SVAPO) ||
            { tira: 78, soffia: 186, ciclo: 420 };
  sequenza('svapo', t % S.ciclo, [[S.tira, tiro], [S.soffia, soffio]]);
}

/* --------------------------------------------------------------------------
   LA TELEVISIONE CHE SI ACCENDE
   Tre cose insieme: lo scatto del tasto, il tonfo del tubo che parte, e
   un soffio di scariche che si spegne. Il fischio acuto dei televisori di
   una volta c'e' ma tenuto bassissimo: e' un ricordo, non un dispetto.
   -------------------------------------------------------------------------- */
function tvAccende(){
  if (!vivo()) return;
  raffica({ da: 4000, a: 6000, durata: 0.03, volume: 0.16, tipo: 'highpass' });
  nota({ da: 150, a: 58, durata: 0.16, volume: 0.10, tipo: 'sine' });
  raffica({ da: 3200, a: 700, durata: 0.34, volume: 0.07,
            tipo: 'lowpass', attacco: 0.03 });
  nota({ da: 6200, a: 6200, durata: 0.5, volume: 0.012, tipo: 'sine' });
}

/* --------------------------------------------------------------------------
   IL VOLUME
   Uno scatto per pressione, che sale di tono col numero: e' il tono che
   sale a raccontare che sta esagerando, molto prima che si legga il 70.
   L'ultimo e' diverso - piu' grave, piu' lungo, con una seconda voce
   scordata sotto - perche' e' quello in cui la televisione comincia a
   tremare, e deve suonare come un errore.
   -------------------------------------------------------------------------- */
function scattoVolume(v, ultimo){
  if (!vivo()) return;
  const alt = 500 + (v - 15) * 4.2;
  nota({ da: alt, a: alt, durata: 0.05, volume: 0.075, tipo: 'square' });
  if (!ultimo) return;
  nota({ da: 150, a: 92, durata: 0.55, volume: 0.10, tipo: 'sawtooth' });
  nota({ da: 154, a: 95, durata: 0.55, volume: 0.07, tipo: 'sawtooth' });
  raffica({ da: 900, a: 200, durata: 0.6, volume: 0.05, tipo: 'lowpass' });
}

let volPrec = -1;
function volume(v, ultimo){
  if (v === volPrec) return;
  const saliva = v > volPrec;
  volPrec = v;
  if (saliva && v > 0) scattoVolume(v, !!ultimo);
}
function volumeDaCapo(){ volPrec = -1; }

/* --------------------------------------------------------------------------
   IL CAMBIO D'ABITO
   Una giravolta e uno sbuffo. Il fruscio sale mentre gira e ricade con la
   nuvola; in fondo due note che salgono, che sono il modo piu' corto di
   dire "ecco fatto".
   -------------------------------------------------------------------------- */
function giravolta(){
  if (!vivo()) return;
  raffica({ da: 400, a: 2400, durata: 0.42, volume: 0.07,
            tipo: 'bandpass', q: 0.9, attacco: 0.12 });
}
function sbuffoNuvola(){
  if (!vivo()) return;
  raffica({ da: 2400, a: 280, durata: 0.55, volume: 0.10, tipo: 'lowpass' });
  nota({ da: 300, a: 140, durata: 0.2, volume: 0.05, tipo: 'sine' });
}
function ecco(){
  if (!vivo()) return;
  nota({ da: 620, a: 620, durata: 0.09, volume: 0.05, tipo: 'triangle' });
  nota({ da: 930, a: 930, durata: 0.14, volume: 0.05, tipo: 'triangle',
         ritardo: 0.09 });
}

function cambioAbito(t, durata){
  if (t <= 0){ azzera('abito'); return; }
  sequenza('abito', t, [
    [1, giravolta],
    [Math.round(durata * 0.45), sbuffoNuvola],
    [Math.round(durata * 0.88), ecco]
  ]);
}

/* --------------------------------------------------------------------------
   LA BOTTA
   Chi cade da tre metri non fa "toc". Serve peso: una nota che precipita,
   il tonfo sordo del corpo, e un crepitio secco sopra per la scossa.
   -------------------------------------------------------------------------- */
function botta(){
  if (!vivo()) return;
  nota({ da: 170, a: 38, durata: 0.28, volume: 0.22, tipo: 'sine' });
  raffica({ da: 1100, a: 160, durata: 0.3, volume: 0.16, tipo: 'lowpass' });
  raffica({ da: 5000, a: 2000, durata: 0.05, volume: 0.09, tipo: 'highpass' });
}

/* --------------------------------------------------------------------------
   I CORIANDOLI
   Lo schiocco del tappo, e dietro una manciata di scintille sparse nel
   tempo: tutte insieme farebbero un rumore solo.
   -------------------------------------------------------------------------- */
function festa(){
  if (!vivo()) return;
  raffica({ da: 7000, a: 1800, durata: 0.06, volume: 0.2, tipo: 'highpass' });
  nota({ da: 1000, a: 260, durata: 0.1, volume: 0.1, tipo: 'triangle' });
  // le scintille sparse nel tempo: tutte insieme sarebbero un rumore solo
  for (let i = 0; i < 7; i++)
    nota({ da: 900 + Math.random() * 1100, a: 700,
           durata: 0.07, volume: 0.035, tipo: 'triangle',
           ritardo: 0.06 + i * 0.055 + Math.random() * 0.04 });
}

/* --------------------------------------------------------------------------
   LA PORTA CHE SI CHIUDE
   Il legno prima, la serratura dopo. E' il mezzo secondo di ritardo fra i
   due a farla sembrare una porta vera e non una cassa.
   -------------------------------------------------------------------------- */
function porta(){
  if (!vivo()) return;
  nota({ da: 190, a: 74, durata: 0.16, volume: 0.15, tipo: 'triangle' });
  raffica({ da: 800, a: 180, durata: 0.2, volume: 0.11, tipo: 'lowpass' });
  raffica({ da: 5200, a: 2600, durata: 0.04, volume: 0.07, tipo: 'highpass',
            ritardo: 0.11 });
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
  // i richiami che usa la pagina: dicono COSA succede, non che suono fare
  camminata, svapata, lettera, nuovaFrase, volume, volumeDaCapo, cambioAbito,
  tv:        a => scatto('tv',    a, tvAccende),
  impatto:   a => scatto('botta', a, botta),
  coriandoli: a => scatto('festa', a, festa),
  portaChiusa: a => scatto('porta', a, porta),
  // i suoni nudi, per provarli
  passo, tiro, soffio, tvAccende, botta, festa, porta,
  get acceso(){ return acceso; },
  get disponibile(){ return !!CI_SONO; }
};

if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.SUONO = API;

})(typeof self !== 'undefined' ? self : this);
