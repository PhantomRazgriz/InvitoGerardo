/* ==========================================================================
   QUINTO ATTO — la caduta, e poi la scelta

   Due momenti in una sola inquadratura, perche' cambiare tela in mezzo
   avrebbe spezzato il filo:

   1. LA CADUTA. Piove dall'alto, sbatte, si scalda e sbotta. Serve a
      ricordare com'e' fatto un attimo prima di chiedere la conferma: la
      minaccia comica ("scegliete bene") funziona solo se l'hai appena
      visto arrabbiarsi.

   2. LA SCELTA. Il buio diventa bianco, entra una poltrona da sinistra,
      lui si defila e si siede ad aspettare la risposta. Il bianco non e'
      un vezzo: toglie di mezzo la scena e lascia soli chi guarda e la
      domanda.

   La poltrona si disegna in due tempi, prima lo schienale e poi seduta e
   braccioli, col personaggio nel mezzo: sono i braccioli a coprirgli le
   gambe, e cosi' non serve disegnare una posa da seduto in abiti da
   giorno che non esiste da nessuna parte.
   ========================================================================== */
(function (radice) {
"use strict";

const A = (typeof require === 'function' && typeof module !== 'undefined')
  ? require('./arte.js') : radice.ARTE;

/* La tela e' larga 124 per una ragione precisa: "MANNAGGIA AL SOLE D'AGOSTO"
   occupa 107 pixel dentro il fumetto, e su una tela da 100 veniva tagliata
   a meta'. E' la battuta a dettare la misura dell'inquadratura, non il
   contrario. (strumenti/misura.js serve a controllarlo prima di scriverne
   di nuove.) */
const LARG = 124, ALT = 76, SUOLO = 62;
const X_CADUTA = 62;          // dove atterra: il centro
const X_POLTRONA = 30;        // dove lo aspetta la poltrona, a sinistra

/* --------------------------------------------------------------------------
   TAVOLOZZA della scena
   -------------------------------------------------------------------------- */
const COL = {
  buio:      '#0b0a09',
  bianco:    '#ffffff',
  suolo:     '#2a2018',
  suoloChiaro:'#e4ded2',
  stoffa:    '#8d4a52',
  stoffaSu:  '#a85d64',
  stoffaGiu: '#6d363d',
  legno:     '#5a4030',
  filo:      '#241f1f',
  porta:     '#7b5638',
  portaScuro:'#5a3d27',
  maniglia:  '#d8b45a',
  cuore:     '#e2495c',
  lacrima:   '#63d0f0'
};

/* --------------------------------------------------------------------------
   LA CADUTA
   -------------------------------------------------------------------------- */
const FASI = { volo: 34, botta: 14, rialzo: 24, sfogo: 78 };
const DURATA_CADUTA = FASI.volo + FASI.botta + FASI.rialzo + FASI.sfogo;

/* Deve partire FUORI dall'inquadratura: e' alto 34 e i piedi vanno messi a
   una decina di pixel sopra il bordo, o al primo fotogramma lo si vede gia'
   dentro la scena e non cade da nessuna parte. */
const ALTEZZA_VOLO = SUOLO + 12;

function statoCaduta(t){
  const f = FASI;
  // --- in volo: accelera, non scende a velocita' costante ---
  if (t < f.volo){
    const q = t / f.volo;
    return {
      fase: 'volo',
      // il quadrato e' la gravita': senza, sembra calato con una corda
      y: SUOLO - ALTEZZA_VOLO * (1 - q * q),
      azione: 'sbuffa',                 // le braccia larghe leggono "cade"
      rabbia: 0, scossa: 0, polvere: -1, dice: false,
      finito: false
    };
  }
  // --- la botta: polvere, scossa, e la rabbia che parte ---
  if (t < f.volo + f.botta){
    const u = t - f.volo, q = u / f.botta;
    return {
      fase: 'botta',
      y: SUOLO,
      azione: 'fermo',
      rabbia: q * 0.45,
      /* La scossa alterna di netto e si smorza. Con un seno veniva quasi
         sempre zero sui numeri interi, e la botta non si sentiva:
         nel pixel lo scatto secco funziona, l'onda morbida no. */
      scossa: (u % 4 < 2 ? 1 : -1) * Math.max(0, 3 - Math.floor(q * 4)),
      polvere: u, durataPolvere: f.botta + 10,
      dice: false,
      finito: false
    };
  }
  // --- si rimette in piedi, e diventa rosso ---
  if (t < f.volo + f.botta + f.rialzo){
    const u = t - f.volo - f.botta, q = u / f.rialzo;
    return {
      fase: 'rialzo',
      y: SUOLO,
      azione: 'fermo',
      rabbia: 0.45 + q * 0.55,
      scossa: 0,
      polvere: f.botta + u, durataPolvere: f.botta + 10,
      dice: false,
      finito: false
    };
  }
  // --- lo sfogo ---
  const u = t - f.volo - f.botta - f.rialzo;
  return {
    fase: 'sfogo',
    y: SUOLO,
    azione: 'sbuffa',
    rabbia: 1,
    scossa: 0, polvere: -1,
    // la battuta arriva dopo un respiro: subito sarebbe stata una didascalia
    dice: u > 10 ? "MANNAGGIA AL SOLE D'AGOSTO" : false,
    finito: t >= DURATA_CADUTA
  };
}

/* --------------------------------------------------------------------------
   LA POLTRONA
   Vista di fronte. Si disegna in due passate: 'dietro' lo schienale,
   'davanti' seduta e braccioli. Il personaggio va in mezzo alle due.
   -------------------------------------------------------------------------- */
/* Le misure della poltrona, tutte riferite al piano su cui ci si siede.
   La prima versione aveva il cuscino spesso 12 e il piano a tre pixel dal
   pavimento: fra il cuscino e terra non restava spazio per le gambe, e
   seduto veniva tagliato alla pancia. Di fronte, una persona seduta si
   riconosce dalle ginocchia: senza, sembra sprofondata nel mobile.
   Ora il piano e' piu' alto e il cuscino piu' sottile, e sotto ci sono
   dodici pixel liberi in cui far scendere gli stinchi. */
const POLT = {
  larg: 38,
  ySeduta: 42,        // il piano su cui appoggia
  cuscino: 8,         // spessore del cuscino
  schienale: 30,      // quanto sale lo schienale sopra il piano
  bracciolo: 7        // quanto salgono i braccioli sopra il piano
};

function rett(P, x0, y0, x1, y1, colore){
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) P.punto(x, y, colore);
}

function cornice(P, x0, y0, x1, y1, colore){
  for (let x = x0; x <= x1; x++){ P.punto(x, y0, colore); P.punto(x, y1, colore); }
  for (let y = y0; y <= y1; y++){ P.punto(x0, y, colore); P.punto(x1, y, colore); }
}

/* Gli stinchi e le scarpe di chi e' seduto.
   Le cosce non si disegnano: di fronte sono scorciate a niente e il cuscino
   le copre comunque. Bastano le due gambe che scendono dal filo del cuscino
   fino a terra, alle stesse colonne che hanno nello sprite in piedi, o le
   gambe non sembrano le sue. */
function gambeSedute(P, cx, daY, aY){
  const sx = Math.round(cx - A.LARG_PERS / 2);
  for (const dx of [5, 12]){             // le due gambe nello sprite del corpo
    for (let y = daY; y <= aY - 3; y++){
      P.punto(sx + dx, y, A.C.o);
      for (let i = 1; i <= 3; i++) P.punto(sx + dx + i, y, A.C.s);
      P.punto(sx + dx + 4, y, A.C.o);
    }
    // calzino, scarpa e suola: le stesse tre righe dello sprite in piedi
    rett(P, sx + dx - 1, aY - 2, sx + dx + 4, aY - 2, A.C.f);
    rett(P, sx + dx - 1, aY - 1, sx + dx + 4, aY - 1, A.C.y);
    rett(P, sx + dx - 1, aY,     sx + dx + 4, aY,     A.C.o);
    P.punto(sx + dx - 1, aY - 2, A.C.o); P.punto(sx + dx + 4, aY - 2, A.C.o);
    P.punto(sx + dx - 1, aY - 1, A.C.o); P.punto(sx + dx + 4, aY - 1, A.C.o);
  }
}

function poltrona(P, cx, parte, entrata){
  // entrata da 0 a 1: arriva da fuori, a sinistra
  const dx = Math.round((1 - (entrata === undefined ? 1 : entrata)) * -60);
  const x0 = Math.round(cx - POLT.larg / 2) + dx;
  const x1 = x0 + POLT.larg - 1;
  const yS = POLT.ySeduta;
  const yGiu = yS + POLT.cuscino;               // il filo sotto il cuscino
  const ySchiena = yS - POLT.schienale;

  if (parte === 'dietro'){
    // schienale, con la bordatura chiara in alto: gli da' volume
    rett(P, x0 + 5, ySchiena, x1 - 5, yS + 2, COL.stoffa);
    rett(P, x0 + 5, ySchiena, x1 - 5, ySchiena + 2, COL.stoffaSu);
    cornice(P, x0 + 5, ySchiena, x1 - 5, yS + 2, COL.filo);
    return;
  }

  // le gambe di chi e' seduto: vanno DOPO il mobile, perche' gli stinchi
  // di chi siede stanno davanti alla base della poltrona
  if (parte === 'gambe'){
    gambeSedute(P, cx + dx, yGiu, SUOLO);
    return;
  }

  // braccioli: appoggiati sul piano, non alti fino alle spalle
  for (const bx of [x0, x1 - 6]){
    rett(P, bx, yS - POLT.bracciolo, bx + 6, yGiu, COL.stoffa);
    rett(P, bx, yS - POLT.bracciolo, bx + 6, yS - POLT.bracciolo + 2, COL.stoffaSu);
    cornice(P, bx, yS - POLT.bracciolo, bx + 6, yGiu, COL.filo);
  }
  // il cuscino
  rett(P, x0, yS, x1, yGiu, COL.stoffa);
  rett(P, x0, yS, x1, yS + 2, COL.stoffaSu);
  rett(P, x0, yGiu - 1, x1, yGiu, COL.stoffaGiu);
  cornice(P, x0, yS, x1, yGiu, COL.filo);
  /* La base, piena fino a terra. Prima c'erano quattro gambe di legno alte
     dodici pixel e la poltrona sembrava su trampoli: a un mobile imbottito
     serve peso in basso. Le gambe di chi ci siede passano DAVANTI a questa
     base, come succede davvero. */
  rett(P, x0 + 2, yGiu, x1 - 2, SUOLO - 2, COL.stoffaGiu);
  cornice(P, x0 + 2, yGiu, x1 - 2, SUOLO - 2, COL.filo);
  // due piedini appena accennati
  for (const px of [x0 + 3, x1 - 6]){
    rett(P, px, SUOLO - 2, px + 3, SUOLO, COL.legno);
    cornice(P, px, SUOLO - 2, px + 3, SUOLO, COL.filo);
  }
}

/* Dove mettere i piedi "finti" del corpo in piedi perche' il taglio del
   cuscino cada sui fianchi: otto pixel sotto il piano della seduta. */
const Y_SEDUTO = POLT.ySeduta + 8;

/* --------------------------------------------------------------------------
   LA PORTA — compare solo se rifiuta tre volte
   -------------------------------------------------------------------------- */
function porta(P, cx, ySuolo, apertura, comparsa){
  const l = 22, a = 38;
  const q = Math.max(0, Math.min(1, comparsa === undefined ? 1 : comparsa));
  if (q <= 0) return;
  const x0 = Math.round(cx - l / 2), y1 = ySuolo;
  // compare crescendo dal basso: una porta che appare tutta insieme
  // sembra un errore di disegno
  const y0 = Math.round(y1 - a * q);

  rett(P, x0, y0, x0 + l, y1, COL.porta);
  rett(P, x0, y0, x0 + 2, y1, COL.portaScuro);
  cornice(P, x0, y0, x0 + l, y1, COL.filo);

  // il battente che si apre: si scurisce il vano dietro
  const ap = Math.max(0, Math.min(1, apertura || 0));
  if (ap > 0){
    const vano = Math.round((l - 4) * ap);
    rett(P, x0 + 2, y0 + 2, x0 + 2 + vano, y1 - 1, '#141210');
    // il battente spalancato verso chi guarda
    rett(P, x0 + 2 + vano, y0 + 2, x0 + 4 + vano, y1 - 1, COL.portaScuro);
  }
  if (ap < 0.5 && q >= 1) P.punto(x0 + l - 4, Math.round(y0 + a * 0.55), COL.maniglia);
}

/* --------------------------------------------------------------------------
   I CORIANDOLI — solo per il si'
   Posizioni decise da un seme fisso: cosi' la festa e' sempre la stessa
   festa, e si puo' correggere guardandola.
   -------------------------------------------------------------------------- */
const TINTE_FESTA = ['#e2495c','#f0c04a','#5ec9a0','#63a8f0','#c47ae0','#ffffff'];

const CORIANDOLI = (() => {
  let s = 20261107;
  const caso = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const pezzi = [];
  for (let i = 0; i < 80; i++){
    const velo = 0.55 + caso() * 0.85;
    pezzi.push({
      x: caso() * LARG,
      ritardo: caso() * 34,
      velo,
      deriva: (caso() - 0.5) * 0.9,
      tinta: TINTE_FESTA[Math.floor(caso() * TINTE_FESTA.length)],
      largo: caso() < 0.35 ? 2 : 1,
      // ognuno ricomincia con un suo periodo: con un periodo unico
      // ripartivano tutti insieme e si vedeva il salto
      giro: (ALT + 12) / velo
    });
  }
  return pezzi;
})();

function coriandoli(P, t){
  for (const c of CORIANDOLI){
    const u = t - c.ritardo;
    if (u <= 0) continue;
    /* Si riciclano invece di cadere una volta sola: al primo giro la
       finestra restava vuota mentre lui ballava ancora e il ringraziamento
       era ancora a schermo. Il "boom" resta, perche' il primo giro parte
       tutto insieme; poi continua a fioccare. */
    const g = u % c.giro;
    const y = -6 + g * c.velo;
    if (y > ALT) continue;
    // oscillano scendendo: cadere in verticale sembra pioggia, non festa
    const x = c.x + Math.sin((u + c.ritardo) * 0.13) * 5 + c.deriva * g * 0.25;
    for (let i = 0; i < c.largo; i++) P.punto(x + i, y, c.tinta);
  }
}

/* --------------------------------------------------------------------------
   IL BALLO — solo per il si'
   Non serve una posa nuova: bastano il saltello e le braccia che si
   alternano. E' il ritmo a leggersi come ballo, non il disegno.
   -------------------------------------------------------------------------- */
function passoDiBallo(t){
  const b = Math.floor(t / 8) % 4;
  return {
    // salto e spostamento piu' larghi di quanto sembri necessario: a un
    // pixel di dondolio non si capiva se ballasse o tremasse
    dy: [0, -5, -1, -5][b],
    inclina: [-2, 0, 2, 0][b],
    azione: b % 2 === 0 ? 'sbuffa' : 'fianchi'
  };
}

/* --------------------------------------------------------------------------
   LE LACRIME — solo per il no
   -------------------------------------------------------------------------- */
function lacrime(P, cx, cy, t){
  /* Partono dal bordo basso degli occhiali e cadono poco: lasciandole
     scendere quanto la faccia finivano in mezzo alla maglietta e
     sembravano macchie, non lacrime. */
  for (const verso of [-1, 1]){
    for (let i = 0; i < 2; i++){
      const f = (t * 1.1 + i * 9) % 18;
      const x = cx + (verso < 0 ? 6 : 15);
      const y = cy + 9 + f * 0.45;
      if (f > 15) continue;                  // si asciuga prima della maglia
      P.punto(x, y, COL.lacrima);
      if (f > 2) P.punto(x, y - 1, 'rgba(99,208,240,0.4)');
    }
  }
}

/* --------------------------------------------------------------------------
   IL CUORE — l'ultima cosa che si vede, se non viene
   Disegnato a mano: un cuore fatto con un'ellisse viene sempre un pomodoro.
   -------------------------------------------------------------------------- */
const CUORE = [
  '.oo...oo.',
  'ooooooooo',
  'ooooooooo',
  '.ooooooo.',
  '..ooooo..',
  '...ooo...',
  '....o....'
];

function cuore(P, cx, cy, q, t){
  if (q <= 0) return;
  // batte: fermo sarebbe un simbolo, battendo e' un saluto
  const battito = Math.sin(t * 0.09) > 0.6 ? 1 : 0;
  /* Compare in dissolvenza e non a tendina: mascherandolo dal centro, a
     mezza strada restava una forma che sembrava uno scudo capovolto. */
  const tinta = q >= 1 ? COL.cuore : 'rgba(226,73,92,' + q.toFixed(2) + ')';
  const l = CUORE[0].length;
  for (let y = 0; y < CUORE.length; y++)
    for (let x = 0; x < l; x++){
      if (CUORE[y][x] !== 'o') continue;
      const px = Math.round(cx - l / 2 + x);
      const py = Math.round(cy - CUORE.length / 2 + y);
      for (let e = 0; e <= battito; e++) P.punto(px, py - e, tinta);
    }
}

/* --------------------------------------------------------------------------
   LO STATO DELLA SCELTA
   Sta qui e non nella pagina perche' lo usano in due: la pagina per
   disegnare e strumenti/finale.js per controllare. Tenendo i numeri in un
   posto solo, quello che si vede nella prova e' esattamente quello che
   andra' a schermo.
   -------------------------------------------------------------------------- */
const SCE = { sbianca: 54, siede: 20 };
const FA = { porta: 34, cammina: 64, apre: 24, esce: 36, buio: 44 };
const FINE_PORTA = FA.porta + FA.cammina + FA.apre + FA.esce;
const X_BALLO = 74;
const RABBIA_SEDUTO = [0.15, 0.52, 0.8, 1];

function statoScelta(t, esito, tE, rifiuti){
  const q = Math.min(1, t / SCE.sbianca);
  const seduto = t >= SCE.sbianca + SCE.siede;

  // il congedo al nero, dopo che e' uscito dalla porta
  if (esito === 'no' && tE > FINE_PORTA){
    const b = Math.min(1, (tE - FINE_PORTA) / FA.buio);
    /* La scena resta al suo posto e ci si stende sopra un velo nero.
       Passando invece a uno sfondo interpolato, poltrona e porta
       sparivano di colpo al primo fotogramma del congedo, e si vedeva
       il salto. */
    return { fase:'addio', bianco:1, buio:b, mostraLui:false, entrata:1,
             porta:{ comparsa:1, apre:1 },
             cuore: Math.max(0, (b - 0.45) / 0.55), finito: b >= 1 };
  }

  const s = {
    fase: esito || (seduto ? 'attende' : 'arriva'),
    bianco: q, buio: 0, entrata: q, cuore: 0, seduto,
    x: X_CADUTA + (X_POLTRONA - X_CADUTA) * q,
    y: SUOLO,
    azione: q < 1 ? 'cammina' : 'fermo',
    // arriva ancora furioso e si calma sedendosi
    rabbia: q < 1 ? 1 - q * (1 - RABBIA_SEDUTO[0]) : RABBIA_SEDUTO[Math.min(3, rifiuti)],
    piange: false, mostraLui: true,
    porta: null, coriandoli: false, finito: false
  };

  if (seduto && !esito){
    s.y = Y_SEDUTO;
    s.azione = s.rabbia > 0.6 ? 'sbuffa' : 'fermo';
  }

  if (esito === 'si'){
    // si alza dalla poltrona e va a ballare in mezzo alla scena
    const alzata = Math.min(1, tE / 26);
    s.x = X_POLTRONA + (X_BALLO - X_POLTRONA) * alzata;
    s.rabbia = 0;
    s.coriandoli = true;
    if (alzata >= 1){
      const b = passoDiBallo(tE);
      s.x += b.inclina; s.y = SUOLO + b.dy; s.azione = b.azione;
      s.fase = 'ballo';
    } else {
      /* Prima si tira su, poi si sposta: partendo gia' in piedi restava un
         fotogramma con mezzo corpo dietro il cuscino, come tagliato. */
      s.y = Y_SEDUTO + (SUOLO - Y_SEDUTO) * Math.min(1, alzata * 2.4);
      s.azione = 'cammina';
    }
  }

  if (esito === 'no'){
    s.rabbia = 1; s.piange = true;
    const comparsa = Math.min(1, tE / FA.porta);
    const apre = tE > FA.porta + FA.cammina
      ? Math.min(1, (tE - FA.porta - FA.cammina) / FA.apre) : 0;
    s.porta = { comparsa, apre };

    /* Il cammino e' in due tratti, con la porta che si apre nel mezzo.
       Con un tratto solo si fermava ACCANTO alla porta e poi svaniva: non
       sembrava che uscisse, sembrava che si smaterializzasse. Ora arriva
       davanti, aspetta che si apra, e poi entra nel vano. */
    const X_DAVANTI = LARG - 34;                 // fermo davanti alla porta
    const X_DENTRO  = LARG - 18;                 // dentro il vano
    if (tE <= FA.porta){
      s.y = Y_SEDUTO; s.azione = 'sbuffa';       // vede la porta e si alza
    } else if (tE <= FA.porta + FA.cammina){
      const c = (tE - FA.porta) / FA.cammina;
      s.x = X_POLTRONA + (X_DAVANTI - X_POLTRONA) * c;
      s.y = SUOLO; s.azione = 'cammina';
    } else if (tE <= FA.porta + FA.cammina + FA.apre){
      s.x = X_DAVANTI; s.y = SUOLO; s.azione = 'fermo';
    } else {
      const e = Math.min(1, (tE - FA.porta - FA.cammina - FA.apre) / FA.esce);
      s.x = X_DAVANTI + (X_DENTRO - X_DAVANTI) * e;
      s.y = SUOLO; s.azione = 'cammina';
      // gli ultimi fotogrammi e' passato oltre
      if (e > 0.82) s.mostraLui = false;
    }
  }

  /* Le gambe da seduto si disegnano quando, e solo quando, e' appoggiato al
     cuscino. Legarle all'altezza invece che alla fase evita di doverci
     pensare in ogni ramo: se e' li', ci sono. */
  s.gambe = s.mostraLui && Math.round(s.y) === Y_SEDUTO;

  return s;
}

/* --------------------------------------------------------------------------
   IL SUOLO — una riga sola, che passa dal buio al bianco con la scena
   -------------------------------------------------------------------------- */
/* Il velo nero, per chiudere senza far sparire niente di colpo. */
function velo(P, q){
  if (q <= 0) return;
  const c = 'rgba(0,0,0,' + Math.min(1, q).toFixed(3) + ')';
  for (let y = 0; y < ALT; y++)
    for (let x = 0; x < LARG; x++) P.punto(x, y, c);
}

function suolo(P, bianchezza){
  const c = bianchezza > 0.5 ? COL.suoloChiaro : COL.suolo;
  for (let x = 0; x < LARG; x++) P.punto(x, SUOLO + 1, c);
  for (let x = 0; x < LARG; x += 3) P.punto(x, SUOLO + 2,
    bianchezza > 0.5 ? '#d3ccbd' : '#1c1510');
}

const API = {
  LARG, ALT, SUOLO, X_CADUTA, X_POLTRONA, Y_SEDUTO, X_BALLO, COL, POLT,
  FASI, DURATA_CADUTA, statoCaduta,
  SCE, FA, FINE_PORTA, RABBIA_SEDUTO, statoScelta,
  poltrona, gambeSedute, porta, coriandoli, passoDiBallo, lacrime, cuore,
  suolo, velo,
  rett, cornice, TINTE_FESTA
};
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.FINALE = API;

})(typeof self !== 'undefined' ? self : this);
