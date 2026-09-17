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
let generale = null;     // il volume degli effetti
let freno = null;        // il limitatore in uscita
let rumore = null;       // un secondo di fruscio, riusato per sempre
let musica = null;       // il volume del brano di sottofondo
let elBrano = null;      // l'elemento <audio> della pagina
let acceso = true;
let spentoAMano = false;

/* IL VOLUME DEL BRANO, e perche' proprio questo numero.

   Il file e' inciso a -20 LUFS. Gli effetti, passati per il volume
   generale, vanno da -18 dBFS della botta fino a -34 del blip del testo,
   che e' il suono piu' piano che deve restare udibile.

   Se il sottofondo stesse a -34 coprirebbe proprio quello. A 0,11 di
   guadagno il brano si assesta intorno ai -39, cioe' cinque decibel sotto
   il piu' timido degli effetti: si sente, e non copre niente.

   Non e' un numero da difendere con le unghie - si giudica a orecchio, e
   il pannello delle prove ha un cursore per cambiarlo mentre si ascolta. */
let livelloMusica = 0.11;

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
    freno = ctx.createDynamicsCompressor();
    freno.threshold.value = -12;
    freno.knee.value = 12;
    freno.ratio.value = 8;
    freno.attack.value = 0.003;
    freno.release.value = 0.15;

    generale.connect(freno);
    freno.connect(ctx.destination);

    // il brano ha una sua manopola, indipendente da quella degli effetti
    musica = ctx.createGain();
    musica.gain.value = livelloMusica;
    musica.connect(freno);

    // un secondo di fruscio bianco: e' la materia prima di passi e svapate
    const n = ctx.sampleRate;
    rumore = ctx.createBuffer(1, n, n);
    const d = rumore.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  // i telefoni tengono il motore fermo finche' non si tocca lo schermo
  if (ctx.state === 'suspended') ctx.resume();
  avviaBrano();
}

/* --------------------------------------------------------------------------
   IL BRANO DI SOTTOFONDO

   Passa da un elemento <audio> della pagina e non da un buffer caricato
   tutto in memoria: due megabyte scaricati per intero prima di sentire
   una nota vorrebbero dire mezzo minuto di silenzio su una linea lenta.
   Cosi' invece comincia appena ne ha abbastanza, e intanto continua a
   scaricare. Se la rete e' lenta l'invito parte lo stesso, muto di
   sottofondo per qualche secondo: non aspetta nessuno.
   -------------------------------------------------------------------------- */
function collegaBrano(el){ elBrano = el; }

function avviaBrano(){
  if (!elBrano || !ctx || !acceso) return;
  if (!elBrano._collegato){
    try {
      const sorgente = ctx.createMediaElementSource(elBrano);
      sorgente.connect(musica);
      elBrano._collegato = true;
    } catch (e) { return; }      // gia' collegato, o il browser non vuole
  }
  const p = elBrano.play();
  // se il browser rifiuta non e' un errore da mostrare: si riprova al tocco dopo
  if (p && p.catch) p.catch(() => {});
}

/* L'abbassata. Quando succede qualcosa di importante il sottofondo si fa
   da parte per mezzo secondo e poi risale. Non su tutto: abbassarlo a
   ogni passo o a ogni lettera lo farebbe respirare di continuo, che e'
   piu' fastidioso del sottofondo stesso. Solo sulle voci e sui colpi. */
function abbassa(){
  if (!musica || !ctx) return;
  const t = ctx.currentTime;
  musica.gain.cancelScheduledValues(t);
  musica.gain.setValueAtTime(musica.gain.value, t);
  musica.gain.linearRampToValueAtTime(livelloMusica * 0.45, t + 0.05);
  musica.gain.linearRampToValueAtTime(livelloMusica, t + 0.75);
}

function volumeMusica(v){
  livelloMusica = Math.max(0, Math.min(1, v));
  if (musica && ctx){
    musica.gain.cancelScheduledValues(ctx.currentTime);
    musica.gain.setValueAtTime(livelloMusica, ctx.currentTime);
  }
  return livelloMusica;
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
  abbassa();
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
  abbassa();
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
  abbassa();
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
  abbassa();
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
   LE VOCI

   Si sentono parlare una volta sola in tutto l'invito: la persona triste
   che dice SONO TRISTE, e Gerardo che risponde LAVORA. E' una scelta, non
   una dimenticanza. Tutte le altre battute - Mh, VABBUO', VOILAT, AMO' -
   restano mute, e proprio per questo quelle due si sentono davvero.

   Non sono parole: sono due o tre grugniti a tono fisso, come nei giochi
   di una volta. La differenza fra i due sta tutta nell'altezza e nella
   forma d'onda. Gerardo e' GRAVE - dente di sega bassa, ruvida, che si
   appoggia; la persona triste e' piu' alta e sottile, e scende, perche'
   lamentarsi e' una frase che cade.
-------------------------------------------------------------------------- */
function grugnito(o){
  if (!vivo()) return;
  for (let i = 0; i < o.sillabe; i++){
    const f = o.tono * (1 + (Math.random() - 0.5) * 0.1);
    nota({ da: f, a: f * o.china, durata: o.lunga, volume: o.volume,
           tipo: o.tipo, ritardo: i * o.passo });
    // un filo di fruscio sopra: e' quello che lo fa sembrare una bocca
    raffica({ da: f * 6, a: f * 3, durata: o.lunga * 0.8,
              volume: o.volume * 0.35, tipo: 'bandpass', q: 3,
              ritardo: i * o.passo });
  }
}

// GERARDO: grave, ruvido, e che NON scende - non chiede, ordina
function voceGerardo(){
  abbassa();
  grugnito({ sillabe: 3, tono: 104, china: 1.0, lunga: 0.11,
             passo: 0.125, volume: 0.10, tipo: 'sawtooth' });
}

// la persona triste: piu' alta, morbida, e in discesa
function voceTriste(){
  abbassa();
  grugnito({ sillabe: 3, tono: 232, china: 0.78, lunga: 0.13,
             passo: 0.15, volume: 0.055, tipo: 'triangle' });
}

/* --------------------------------------------------------------------------
   I PULSANTI
   Un pulsante che non risponde sembra rotto, e si preme due volte. Il si'
   e il no hanno due toni diversi apposta: quello che si e' scelto si sente
   prima ancora di leggerlo.
   -------------------------------------------------------------------------- */
function tocco(){
  if (!vivo()) return;
  nota({ da: 1150, a: 900, durata: 0.035, volume: 0.06, tipo: 'square' });
}
function conferma(){
  if (!vivo()) return;
  nota({ da: 620, a: 620, durata: 0.08, volume: 0.075, tipo: 'triangle' });
  nota({ da: 930, a: 930, durata: 0.13, volume: 0.07, tipo: 'triangle',
         ritardo: 0.075 });
}
function rifiuto(){
  if (!vivo()) return;
  nota({ da: 300, a: 300, durata: 0.09, volume: 0.08, tipo: 'square' });
  nota({ da: 210, a: 190, durata: 0.17, volume: 0.075, tipo: 'square',
         ritardo: 0.085 });
}

/* --------------------------------------------------------------------------
   LA SCENA DEL SALOTTO
   -------------------------------------------------------------------------- */
function presa(){                    // raccoglie il telecomando
  if (!vivo()) return;
  raffica({ da: 2600, a: 900, durata: 0.07, volume: 0.05, tipo: 'bandpass', q: 2 });
  nota({ da: 340, a: 260, durata: 0.05, volume: 0.04, tipo: 'square' });
}
function siede(){                    // il peso che affonda nel cuscino
  if (!vivo()) return;
  raffica({ da: 900, a: 200, durata: 0.34, volume: 0.09,
            tipo: 'lowpass', attacco: 0.03 });
  nota({ da: 120, a: 66, durata: 0.2, volume: 0.06, tipo: 'sine' });
}
function canale(){                   // scatto del tasto e un soffio di scariche
  if (!vivo()) return;
  nota({ da: 900, a: 900, durata: 0.03, volume: 0.06, tipo: 'square' });
  raffica({ da: 4000, a: 1200, durata: 0.14, volume: 0.06,
            tipo: 'highpass', ritardo: 0.03 });
}
/* Il russare e' un giro lungo: un respiro dentro e uno fuori, e il
   palloncino che scoppia in fondo. Va tenuto molto basso, o dopo tre
   giri si vorrebbe svegliarlo. */
function russaDentro(){
  if (!vivo()) return;
  raffica({ da: 260, a: 700, durata: 0.75, volume: 0.06,
            tipo: 'lowpass', attacco: 0.3 });
  nota({ da: 62, a: 78, durata: 0.75, volume: 0.05, tipo: 'sawtooth' });
}
function russaFuori(){
  if (!vivo()) return;
  raffica({ da: 600, a: 200, durata: 0.6, volume: 0.045,
            tipo: 'lowpass', attacco: 0.18 });
}
function palloncino(){
  if (!vivo()) return;
  nota({ da: 1500, a: 400, durata: 0.06, volume: 0.05, tipo: 'triangle' });
}

/* --------------------------------------------------------------------------
   LA SCENA DELLE RIPARAZIONI
   -------------------------------------------------------------------------- */
function arriva(){                   // un oggetto che scivola dentro
  if (!vivo()) return;
  raffica({ da: 300, a: 1600, durata: 0.34, volume: 0.06,
            tipo: 'bandpass', q: 1.1, attacco: 0.16 });
}
function fruga(){                    // pesca nella cassetta degli attrezzi
  if (!vivo()) return;
  for (let i = 0; i < 3; i++)
    raffica({ da: 3000 + Math.random() * 2000, a: 1200, durata: 0.05,
              volume: 0.045, tipo: 'bandpass', q: 3,
              ritardo: i * 0.075 + Math.random() * 0.03 });
}
function aggiusta(){                 // la nuvola, e sotto la nuvola il lavoro
  if (!vivo()) return;
  raffica({ da: 2600, a: 300, durata: 0.5, volume: 0.085, tipo: 'lowpass' });
  for (let i = 0; i < 4; i++)
    nota({ da: 520 + i * 90, a: 520 + i * 90, durata: 0.05,
           volume: 0.04, tipo: 'square', ritardo: 0.06 + i * 0.085 });
}
function goccia(){                   // il tubo che perde
  if (!vivo()) return;
  nota({ da: 1500, a: 620, durata: 0.06, volume: 0.045, tipo: 'sine' });
}

/* --------------------------------------------------------------------------
   LA MAPPA
   Suoni da strumento: puliti, a tono fisso, senza calore. E' l'unica scena
   in cui non c'e' una persona, e si deve sentire.
   -------------------------------------------------------------------------- */
function scansione(){
  if (!vivo()) return;
  raffica({ da: 400, a: 3000, durata: 0.9, volume: 0.035,
            tipo: 'bandpass', q: 4, attacco: 0.25 });
}
function aggancio(){
  if (!vivo()) return;
  nota({ da: 1400, a: 1400, durata: 0.06, volume: 0.06, tipo: 'square' });
  nota({ da: 1400, a: 1400, durata: 0.06, volume: 0.06, tipo: 'square',
         ritardo: 0.1 });
}
function ingrandisce(){
  if (!vivo()) return;
  raffica({ da: 900, a: 4200, durata: 0.36, volume: 0.06,
            tipo: 'bandpass', q: 1.4, attacco: 0.2 });
  nota({ da: 220, a: 560, durata: 0.36, volume: 0.045, tipo: 'sine' });
}
function arrivati(){
  if (!vivo()) return;
  abbassa();
  const note = [523, 659, 784];        // do mi sol: e' arrivato, punto
  note.forEach((f, i) =>
    nota({ da: f, a: f, durata: 0.16, volume: 0.06, tipo: 'triangle',
           ritardo: i * 0.1 }));
}

/* --------------------------------------------------------------------------
   IL FINALE
   -------------------------------------------------------------------------- */
function poltronaEntra(){
  if (!vivo()) return;
  raffica({ da: 500, a: 180, durata: 0.7, volume: 0.06,
            tipo: 'lowpass', attacco: 0.3 });
}
function cuore(){
  if (!vivo()) return;
  const note = [784, 988, 1175];
  note.forEach((f, i) =>
    nota({ da: f, a: f, durata: 0.5, volume: 0.035, tipo: 'sine',
           ritardo: i * 0.16 }));
}

/* --------------------------------------------------------------------------
   I GESTI DELLA PRIMA SCENA
   -------------------------------------------------------------------------- */
function sospiro(){
  if (!vivo()) return;
  raffica({ da: 900, a: 300, durata: 0.6, volume: 0.05,
            tipo: 'lowpass', attacco: 0.2 });
}
function occhiali(){
  if (!vivo()) return;
  raffica({ da: 3400, a: 1600, durata: 0.05, volume: 0.04, tipo: 'bandpass', q: 3 });
}
function squillo(){
  if (!vivo()) return;
  for (let g2 = 0; g2 < 2; g2++)
    for (let i = 0; i < 2; i++)
      nota({ da: i ? 1050 : 800, a: i ? 1050 : 800, durata: 0.11,
             volume: 0.055, tipo: 'square', ritardo: g2 * 0.5 + i * 0.13 });
}

/* --------------------------------------------------------------------------
   L'INTERRUTTORE
   -------------------------------------------------------------------------- */
function commuta(){
  acceso = !acceso;
  spentoAMano = true;
  try { localStorage.setItem('suono', acceso ? 'si' : 'no'); } catch (e) {}
  if (acceso){ sveglia(); }
  else {
    // il brano si ferma davvero: sospendere il motore basterebbe a non
    // farlo sentire, ma continuerebbe a scorrere e a consumare rete
    if (elBrano) elBrano.pause();
    if (ctx && ctx.state === 'running') ctx.suspend();
  }
  return acceso;
}

/* Un battito periodico: serve alle cose che continuano, come il tubo che
   gocciola o il respiro di chi dorme. */
function ogni(nome, t, sta, periodo, fai){
  if (!sta){ azzera(nome); return; }
  const s = seq[nome] || (seq[nome] = { t: -1, fatte: new Set() });
  if (t < s.t) s.fatte.clear();
  s.t = t;
  const colpo = Math.floor(t / periodo);
  if (!s.fatte.has(colpo)){ s.fatte.add(colpo); fai(); }
}

const API = {
  sveglia, commuta, collegaBrano, volumeMusica,
  get livelloMusica(){ return livelloMusica; },

  /* I richiami che usa la pagina dicono COSA succede, non che suono fare.
     Se un giorno il tonfo della porta diventa un cigolio, la pagina non
     cambia di una riga. */
  camminata, svapata, lettera, nuovaFrase, volume, volumeDaCapo, cambioAbito,
  tv:          a => scatto('tv',      a, tvAccende),
  impatto:     a => scatto('botta',   a, botta),
  coriandoli:  a => scatto('festa',   a, festa),
  portaChiusa: a => scatto('porta',   a, porta),

  // le voci: una volta sola in tutto l'invito
  diceLavora:  a => scatto('lavora',  a, voceGerardo),
  diceTriste:  a => scatto('triste',  a, voceTriste),

  // i pulsanti
  tocco, conferma, rifiuto,

  // il salotto
  prendeTelecomando: a => scatto('presa',   a, presa),
  siSiede:           a => scatto('siede',   a, siede),
  cambiaCanale:      a => scatto('canale',  a, canale),
  /* Il palloncino del sonno si gonfia e scoppia ogni 130 fotogrammi, e
     scoppia al 72 per cento del giro: il numero viene da arte.js, non me
     lo invento qui. */
  scoppiaPalloncino: (t, sta) => {
    if (!sta){ azzera('pallone'); return; }
    sequenza('pallone', t % 130, [[Math.round(130 * 0.72), palloncino]]);
  },
  russa: (t, sta) => {
    if (!sta){ azzera('russa'); return; }
    sequenza('russa', t % 150, [[0, russaDentro], [78, russaFuori]]);
  },

  // le riparazioni
  oggettoArriva: a => scatto('arriva',  a, arriva),
  frugaScatola:  a => scatto('fruga',   a, fruga),
  riparazione:   a => scatto('aggiusta',a, aggiusta),
  perdita: (t, sta) => ogni('goccia', t, sta, 26, goccia),

  // la mappa
  scansione:   a => scatto('scan',   a, scansione),
  aggancio:    a => scatto('lock',   a, aggancio),
  ingrandisce: a => scatto('zoom',   a, ingrandisce),
  arrivati:    a => scatto('arriv',  a, arrivati),

  // il finale
  poltronaEntra: a => scatto('polt',  a, poltronaEntra),
  cuore:         a => scatto('cuore', a, cuore),

  // i gesti della prima scena
  sospiro:  a => scatto('sosp',  a, sospiro),
  occhiali: a => scatto('occh',  a, occhiali),
  squillo:  a => scatto('squil', a, squillo),

  // i suoni nudi, per provarli a orecchio
  passo, tiro, soffio, tvAccende, botta, festa, porta,
  voceGerardo, voceTriste,

  get acceso(){ return acceso; },
  get disponibile(){ return !!CI_SONO; }
};

if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.SUONO = API;

})(typeof self !== 'undefined' ? self : this);


