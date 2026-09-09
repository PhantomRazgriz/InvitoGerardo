/* ==========================================================================
   QUARTA SCENA — "ma parliamo dell'evento"
   Una mappa letta come da centrale operativa: tre zoom successivi che dal
   disegno dell'Italia scendono fino alla strada.

   Il contorno e' geografia vera, in gradi di longitudine e latitudine: cosi'
   i tre zoom sono UNO stesso disegno guardato piu' da vicino, non tre disegni
   diversi. E' la ragione per cui l'inquadratura convince: le coste restano
   coerenti fra un livello e l'altro, come in una mappa che si ingrandisce
   davvero.

   L'ultimo livello non e' geografia ma pianta stradale: San Giovanni Rotondo
   e' nell'entroterra e a quella scala del mare non si vede piu' niente.
   ========================================================================== */
(function(radice){
"use strict";

const A = (typeof require === 'function' && typeof module !== 'undefined')
  ? require('./arte.js') : radice.ARTE;

const LARG = 112, ALT = 96;

/* La tavolozza del fosforo verde. Un solo verde non basta: senza almeno tre
   livelli di luminosita' la mappa diventa una macchia piatta. */
const COL = {
  fondo:     '#050d07',
  griglia:   '#0f2413',
  mare:      '#071409',
  terra:     '#1c4f28',
  costa:     '#6cd97a',
  mirino:    '#9dfaa8',
  testo:     '#6cd97a',
  spento:    '#2c5f36',
  bersaglio: '#ff5f45',
  lampo:     '#dffbe4'
};

/* --------------------------------------------------------------------------
   GEOGRAFIA — contorni in (longitudine, latitudine)
   Il livello di dettaglio non e' uniforme: e' infittito intorno al Gargano,
   perche' e' l'unico punto in cui la mappa viene guardata da vicino.
   -------------------------------------------------------------------------- */
const PENISOLA = [
  // l'arco alpino, da ovest a est. Il vertice del Monte Bianco a 6,85 conta:
  // fermandosi a 7,6 il Piemonte spariva e il confine con la Francia
  // diventava un taglio verticale, che e' la cosa che rendeva il disegno
  // subito falso
  [6.85,45.85],[7.60,45.95],[8.45,46.20],[9.05,46.50],[10.10,46.85],
  [11.20,46.95],[12.20,46.85],[13.10,46.55],[13.70,45.95],
  [13.10,45.70],[12.50,45.50],
  [12.30,44.90],[12.60,44.20],[13.50,43.60],[14.00,42.90],[14.70,42.20],
  // il Gargano: lo sperone, la parte che conta
  [15.10,41.90],[15.35,41.90],[15.55,41.94],[15.88,41.93],[16.02,41.95],
  [16.17,41.89],[16.19,41.83],[16.14,41.78],[16.05,41.71],[15.98,41.66],
  [15.91,41.63],[15.88,41.55],[15.95,41.45],[16.10,41.38],
  [16.30,41.30],[16.85,41.13],[17.40,40.90],[17.95,40.65],[18.40,40.25],
  [18.50,40.10],[18.35,39.80],[18.00,40.05],[17.60,40.30],[17.20,40.45],
  // il golfo di Taranto e la costa ionica
  [16.90,40.40],[16.60,40.15],[16.50,39.75],[16.85,39.40],[17.15,39.05],
  [16.90,38.75],[16.60,38.50],[16.20,38.15],[15.65,37.95],
  // risalita tirrenica
  [15.90,38.45],[16.10,38.90],[15.90,39.40],[15.65,39.90],[15.30,40.05],
  [15.00,40.25],[14.90,40.60],[14.45,40.70],[14.00,40.85],[13.70,41.15],
  [13.00,41.25],[12.40,41.55],[11.90,42.10],[11.10,42.40],[10.50,42.95],
  [10.30,43.50],[10.00,44.05],[9.20,44.30],[8.80,44.40],[8.00,43.95],
  // la Liguria, poi il confine che risale verso le Alpi occidentali
  [7.55,43.80],[7.00,44.15],[6.70,45.05]
];

/* La Sicilia con un vertice per capo. Con quattro punti veniva un triangolo
   con la punta in basso, che sembrava un imbuto attaccato allo stivale: il
   guaio era la costa meridionale, tirata troppo a sud. Il tratto Passero -
   Gela - Agrigento - Sciacca risale piano, ed e' quella salita lenta a far
   riconoscere l'isola. */
const SICILIA = [
  [15.65,38.26],[15.29,37.85],[15.09,37.50],[15.29,37.07],[15.09,36.65],
  [14.50,37.00],[13.90,37.10],[13.30,37.40],[12.65,37.65],[12.43,37.80],
  [12.51,38.02],[12.73,38.18],[13.36,38.12],[14.02,38.04],[14.75,38.16],
  [15.24,38.22]
];

const SARDEGNA = [
  [9.20,41.25],[9.80,40.90],[9.70,40.10],[9.60,39.20],[9.05,38.90],
  [8.40,39.15],[8.45,40.00],[8.15,40.60],[8.60,41.10]
];

// il bersaglio: San Giovanni Rotondo, coordinate vere
const BERSAGLIO = [15.7269, 41.7086];

// il quando e il dove, in un posto solo: se cambiano, cambiano qui
const DATA = '07/11/2026';
const LUOGO = 'CAVALLINO ROSSO';

/* --------------------------------------------------------------------------
   I LIVELLI — dove guarda l'inquadratura e quanto e' larga, in gradi.
   L'ultimo non ha ampiezza: e' la pianta stradale.
   -------------------------------------------------------------------------- */
/* Le ampiezze non sono a occhio: l'Italia e' alta 10,5 gradi di latitudine e
   la tela e' larga, non alta. Perche' ci stia tutta servono 18 gradi di
   longitudine, altrimenti le Alpi e la Sicilia restano fuori dai bordi.
   L'ultimo livello ha un'ampiezza piccola ma non nulla: a zero la proiezione
   divide per zero e il bersaglio finisce in NaN, cioe' non viene disegnato. */
const LIVELLI = [
  { nome:'ITALIA',   sigla:'ITA',  centro:[12.60,41.85], ampiezza:18.0 },
  { nome:'PUGLIA',   sigla:'PUG',  centro:[16.30,41.30], ampiezza:5.00 },
  { nome:'GARGANO',  sigla:'GAR',  centro:[15.88,41.72], ampiezza:2.30 },
  { nome:'SAN GIOVANNI ROTONDO', sigla:'SGR',
    centro:BERSAGLIO, ampiezza:0.06, strade:true }
];

/* Alle nostre latitudini un grado di longitudine e' circa 82 km e uno di
   latitudine 111: senza correggere, l'Italia viene schiacciata e larga. */
const SCHIACCIAMENTO = 1.34;

/* Proiezione: da gradi a pixel, per un dato livello.
   Restituisce la funzione che serve al disegno. */
function proiezione(centro, ampiezza){
  const kx = LARG / ampiezza;
  const ky = kx * SCHIACCIAMENTO;
  return ([lon, lat]) => [
    LARG / 2 + (lon - centro[0]) * kx,
    ALT / 2 - (lat - centro[1]) * ky
  ];
}

/* --------------------------------------------------------------------------
   DISEGNO DI BASE
   -------------------------------------------------------------------------- */

/* Riempimento di un poligono anche concavo, a scansione di righe con la
   regola pari-dispari. Quello che c'e' in arte.js vale solo per i convessi,
   e l'Italia e' tutto tranne che convessa. */
function riempi(P, punti, colore, ritaglio){
  const [x0, y0, x1, y1] = ritaglio || [0, 0, LARG - 1, ALT - 1];
  let su = Infinity, giu = -Infinity;
  for (const [, y] of punti){ if (y < su) su = y; if (y > giu) giu = y; }
  su  = Math.max(y0, Math.floor(su));
  giu = Math.min(y1, Math.ceil(giu));

  for (let y = su; y <= giu; y++){
    const tagli = [];
    for (let i = 0; i < punti.length; i++){
      const [ax, ay] = punti[i];
      const [bx, by] = punti[(i + 1) % punti.length];
      // il campione al centro della riga evita i buchi sui vertici
      const q = y + 0.5;
      if ((ay <= q && by > q) || (by <= q && ay > q))
        tagli.push(ax + (q - ay) / (by - ay) * (bx - ax));
    }
    tagli.sort((a, b) => a - b);
    for (let i = 0; i + 1 < tagli.length; i += 2){
      const da = Math.max(x0, Math.round(tagli[i]));
      const a  = Math.min(x1, Math.round(tagli[i + 1]));
      for (let x = da; x <= a; x++) P.punto(x, y, colore);
    }
  }
}

/* Segmento a passi interi: serve al contorno delle coste. */
function segmento(P, ax, ay, bx, by, colore, ritaglio){
  const [x0, y0, x1, y1] = ritaglio || [0, 0, LARG - 1, ALT - 1];
  ax = Math.round(ax); ay = Math.round(ay);
  bx = Math.round(bx); by = Math.round(by);
  const dx = Math.abs(bx - ax), dy = Math.abs(by - ay);
  const sx = ax < bx ? 1 : -1, sy = ay < by ? 1 : -1;
  let err = dx - dy, passi = 0;
  for (;;){
    if (ax >= x0 && ax <= x1 && ay >= y0 && ay <= y1) P.punto(ax, ay, colore);
    if ((ax === bx && ay === by) || ++passi > 900) break;
    const e2 = 2 * err;
    if (e2 > -dy){ err -= dy; ax += sx; }
    if (e2 <  dx){ err += dx; ay += sy; }
  }
}

function contorno(P, punti, colore, ritaglio){
  for (let i = 0; i < punti.length; i++){
    const [ax, ay] = punti[i];
    const [bx, by] = punti[(i + 1) % punti.length];
    segmento(P, ax, ay, bx, by, colore, ritaglio);
  }
}

/* --------------------------------------------------------------------------
   LA PIANTA STRADALE dell'ultimo livello.
   Non e' la mappa vera di San Giovanni Rotondo: e' una pianta verosimile,
   costruita sempre uguale da un seme fisso. A questa scala serve a dire
   "siamo arrivati in paese", non a farsi guidare.
   -------------------------------------------------------------------------- */
function caso(seme){
  let s = seme;
  return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
}

/* La pianta: prima le vie, poi gli isolati fra le vie. Le sole strade su
   fondo nero si leggevano come una griglia da foglio a quadretti; sono i
   pieni degli isolati a far sembrare un paese visto dall'alto. */
const PIANTA = (() => {
  const r = caso(41706);
  const cx = Math.round(LARG / 2), cy = Math.round(ALT / 2);
  const oriz = [cy], vert = [cx];

  // distanze irregolari: una maglia perfetta sa di finto
  for (let y = cy - 11; y > -8; y -= 8 + Math.round(r() * 7)) oriz.push(y);
  for (let y = cy + 11; y < ALT + 8; y += 8 + Math.round(r() * 7)) oriz.push(y);
  for (let x = cx - 13; x > -8; x -= 10 + Math.round(r() * 8)) vert.push(x);
  for (let x = cx + 13; x < LARG + 8; x += 10 + Math.round(r() * 8)) vert.push(x);

  oriz.sort((a, b) => a - b);
  vert.sort((a, b) => a - b);

  // un isolato per ogni maglia, con un rientro variabile dal filo strada
  const blocchi = [];
  for (let i = 0; i + 1 < oriz.length; i++)
    for (let j = 0; j + 1 < vert.length; j++){
      if (r() < 0.14) continue;                  // qualche vuoto: piazze, orti
      const m = 1 + Math.round(r() * 1.4);
      blocchi.push({
        x0: vert[j] + m, y0: oriz[i] + m,
        x1: vert[j + 1] - m, y1: oriz[i + 1] - m,
        // due tinte di pieno: alterna e da' profondita' alla pianta
        scuro: r() < 0.45
      });
    }
  return { oriz, vert, cx, cy, blocchi };
})();

function strade(P, q){
  const { oriz, vert, cx, cy, blocchi } = PIANTA;
  // q da 0 a 1: la pianta si rivela dall'alto verso il basso
  const alt = Math.round(ALT * q);

  for (const b of blocchi){
    for (let y = Math.max(0, b.y0); y <= Math.min(alt - 1, b.y1); y++)
      for (let x = Math.max(0, b.x0); x <= Math.min(LARG - 1, b.x1); x++)
        P.punto(x, y, b.scuro ? '#0e2c16' : '#143a1e');
  }

  // le vie secondarie, poi le due principali sopra a tutto
  for (const y of oriz)
    for (let x = 0; x < LARG; x++){ if (y < alt) P.punto(x, y, COL.spento); }
  for (const x of vert)
    for (let y = 0; y < alt; y++) P.punto(x, y, COL.spento);

  for (let x = 0; x < LARG; x++)
    for (let s = 0; s < 2; s++) if (cy + s < alt) P.punto(x, cy + s, COL.costa);
  for (let y = 0; y < alt; y++)
    for (let s = 0; s < 2; s++) P.punto(cx + s, y, COL.costa);
}

/* --------------------------------------------------------------------------
   L'INTERFACCIA — quello che fa sembrare tutto una lettura strumentale
   -------------------------------------------------------------------------- */

function griglia(P, scorrimento){
  const passo = 8;
  const off = Math.floor(scorrimento) % passo;
  for (let y = -passo; y < ALT; y += passo)
    for (let x = 0; x < LARG; x += 2) P.punto(x, y + off, COL.griglia);
  for (let x = 0; x < LARG; x += passo)
    for (let y = 0; y < ALT; y += 2) P.punto(x, y, COL.griglia);
}

/* Le quattro parentesi angolari dell'inquadratura. Se il riquadro e' piu'
   piccolo della tela sta stringendo su un punto: e' il gesto dello zoom. */
function angoli(P, x0, y0, x1, y1, lung, colore){
  const L = lung || 7;
  const c = colore || COL.mirino;
  for (let i = 0; i < L; i++){
    P.punto(x0 + i, y0, c); P.punto(x0, y0 + i, c);
    P.punto(x1 - i, y0, c); P.punto(x1, y0 + i, c);
    P.punto(x0 + i, y1, c); P.punto(x0, y1 - i, c);
    P.punto(x1 - i, y1, c); P.punto(x1, y1 - i, c);
  }
}

/* Il mirino sul bersaglio: croce con il centro vuoto, e un quadrato che
   pulsa. Il centro vuoto e' quello che lo fa leggere come mira e non come
   croce disegnata sopra la mappa. */
function mirino(P, cx, cy, t, colore){
  const c = colore || COL.mirino;
  cx = Math.round(cx); cy = Math.round(cy);
  for (let i = 3; i <= 7; i++){
    P.punto(cx + i, cy, c); P.punto(cx - i, cy, c);
    P.punto(cx, cy + i, c); P.punto(cx, cy - i, c);
  }
  const r = 4 + (Math.floor(t / 12) % 2);
  for (let i = -r; i <= r; i++){
    if (Math.abs(i) > r - 2){
      P.punto(cx + i, cy - r, c); P.punto(cx + i, cy + r, c);
      P.punto(cx - r, cy + i, c); P.punto(cx + r, cy + i, c);
    }
  }
}

/* La riga che scorre dall'alto in basso, come una scansione in corso. */
function scansione(P, y, colore){
  y = Math.round(y);
  if (y < 0 || y >= ALT) return;
  for (let x = 0; x < LARG; x++) P.punto(x, y, colore || COL.mirino);
  for (let x = 0; x < LARG; x += 2){
    if (y + 1 < ALT) P.punto(x, y + 1, COL.spento);
    if (y - 1 >= 0)  P.punto(x, y - 1, COL.spento);
  }
}

/* Scritta secca, senza fumetto: qui non parla nessuno, e' uno strumento che
   riporta dei dati. Il fumetto di arte.js e' per le battute e qui stonerebbe.
   Se si passa "da", il testo compare una lettera alla volta: e' il dettaglio
   che fa sembrare la scritta stampata da una macchina invece che disegnata. */
const INTORNO = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];

function scritta(P, x, y, testo, colore, quante){
  const lim = quante === undefined ? testo.length : Math.floor(quante);
  /* Due passate: prima l'alone scuro attorno a ogni pixel della lettera, poi
     la lettera. Serve perche' le scritte cadono sopra la terra verde e da
     sole si perdevano. La prima soluzione era una fascia nera piena in alto e
     in basso, ma mangiava trenta pixel di altezza e la Sicilia finiva
     nascosta: l'alone costa qualche pixel in piu' e non toglie mappa. */
  for (let passata = 0; passata < 2; passata++){
    let cx = Math.round(x);
    for (let i = 0; i < testo.length && i < lim; i++){
      const g = A.GLIFI[testo[i]] || A.GLIFI[' '];
      for (let ry = 0; ry < g.length; ry++)
        for (let rx = 0; rx < g[ry].length; rx++){
          if (g[ry][rx] !== 'o') continue;
          if (passata === 0)
            for (const [dx, dy] of INTORNO)
              P.punto(cx + rx + dx, y + ry + dy, COL.fondo);
          else
            P.punto(cx + rx, y + ry, colore || COL.testo);
        }
      cx += g[0].length + 1;
    }
    if (passata === 1) return cx;
  }
}

function largScritta(testo){
  let l = 0;
  for (const ch of testo) l += ((A.GLIFI[ch] || A.GLIFI[' '])[0].length) + 1;
  return l - 1;
}

/* Le coordinate del bersaglio, scritte come le scriverebbe uno strumento. */
function coordinate(){
  const [lon, lat] = BERSAGLIO;
  return lat.toFixed(2) + ' N ' + lon.toFixed(2) + ' E';
}

/* Una barretta di avanzamento: dice che la macchina sta facendo qualcosa. */
function barra(P, x, y, largo, q, colore){
  // il letto scuro con un filo di cornice, altrimenti sopra la terra la
  // parte ancora da riempire non si distingue
  for (let i = -1; i <= largo; i++){
    P.punto(x + i, y - 1, COL.fondo);
    P.punto(x + i, y,     COL.fondo);
    P.punto(x + i, y + 1, COL.fondo);
  }
  const n = Math.round(largo * Math.max(0, Math.min(1, q)));
  for (let i = 0; i < n; i++) P.punto(x + i, y, colore || COL.testo);
}

/* Le tacche sui bordi: il righello di una mappa strumentale. */
function tacche(P, scorrimento){
  const off = Math.floor(scorrimento) % 10;
  for (let x = off; x < LARG; x += 10){
    P.punto(x, 0, COL.spento); P.punto(x, 1, COL.spento);
    P.punto(x, ALT - 1, COL.spento); P.punto(x, ALT - 2, COL.spento);
  }
  for (let y = off; y < ALT; y += 10){
    P.punto(0, y, COL.spento); P.punto(1, y, COL.spento);
    P.punto(LARG - 1, y, COL.spento); P.punto(LARG - 2, y, COL.spento);
  }
}

/* --------------------------------------------------------------------------
   LA SEQUENZA
   Ogni livello: compare, scandisce, aggancia il bersaglio, poi stringe.
   -------------------------------------------------------------------------- */
const FASI = { comparsa: 26, scansione: 54, agganciato: 34, stretta: 30 };
const DURATA_LIVELLO = FASI.comparsa + FASI.scansione + FASI.agganciato + FASI.stretta;

/* Interpola due livelli: e' cosi' che lo zoom diventa continuo invece di
   essere un taglio. Durante la stretta l'inquadratura si muove davvero
   verso il livello successivo. */
function inquadratura(i, q){
  const a = LIVELLI[Math.min(i, LIVELLI.length - 1)];
  const b = LIVELLI[Math.min(i + 1, LIVELLI.length - 1)];
  if (q <= 0 || a === b) return { centro: a.centro, ampiezza: a.ampiezza };
  // l'ampiezza si interpola in modo geometrico: lo zoom e' moltiplicativo,
  // e a interpolarla per differenza la corsa sembrava frenare all'inizio
  const ampA = a.ampiezza || 0.05;
  const ampB = b.ampiezza || 0.05;
  return {
    centro: [ a.centro[0] + (b.centro[0] - a.centro[0]) * q,
              a.centro[1] + (b.centro[1] - a.centro[1]) * q ],
    ampiezza: ampA * Math.pow(ampB / ampA, q)
  };
}

function stato(livello, t){
  const i = Math.max(0, Math.min(LIVELLI.length - 1, livello));
  const ultimo = i === LIVELLI.length - 1;
  let fase = 'comparsa', q = 0, stretta = 0;

  if (t < FASI.comparsa){
    fase = 'comparsa'; q = t / FASI.comparsa;
  } else if (t < FASI.comparsa + FASI.scansione){
    fase = 'scansione'; q = (t - FASI.comparsa) / FASI.scansione;
  } else if (t < FASI.comparsa + FASI.scansione + FASI.agganciato){
    fase = 'agganciato';
    q = (t - FASI.comparsa - FASI.scansione) / FASI.agganciato;
  } else {
    fase = 'stretta';
    stretta = Math.min(1, (t - FASI.comparsa - FASI.scansione - FASI.agganciato) / FASI.stretta);
    q = stretta;
  }

  // sull'ultimo livello non si stringe piu': si resta li'
  if (ultimo && fase === 'stretta'){ fase = 'agganciato'; stretta = 0; q = 1; }

  return {
    livello: i, nome: LIVELLI[i].nome, sigla: LIVELLI[i].sigla,
    fase, q, stretta,
    ultimo,
    // il lampo del passaggio: pochi fotogrammi, altrimenti da' fastidio
    lampo: fase === 'stretta' && stretta > 0.9 ? (stretta - 0.9) / 0.1 : 0,
    finito: t >= DURATA_LIVELLO
  };
}

/* --------------------------------------------------------------------------
   IL QUADRO COMPLETO
   -------------------------------------------------------------------------- */
function disegna(P, s, t){
  for (let y = 0; y < ALT; y++)
    for (let x = 0; x < LARG; x++) P.punto(x, y, s.livello === 3 ? COL.fondo : COL.mare);

  griglia(P, t * 0.25);

  const inq = inquadratura(s.livello, s.stretta);
  const pr = proiezione(inq.centro, inq.ampiezza);

  if (LIVELLI[s.livello].strade && s.stretta === 0){
    strade(P, s.fase === 'comparsa' ? s.q : 1);
  } else {
    // terra e coste, tagliate su quanto e' comparso
    const alt = s.fase === 'comparsa' ? Math.round(ALT * s.q) : ALT;
    const rit = [0, 0, LARG - 1, alt - 1];
    for (const isola of [PENISOLA, SICILIA, SARDEGNA]){
      const pt = isola.map(pr);
      riempi(P, pt, COL.terra, rit);
      contorno(P, pt, COL.costa, rit);
    }
  }

  tacche(P, t * 0.25);

  const [bx, by] = pr(BERSAGLIO);



  // la scansione passa una volta sola, poi aggancia
  if (s.fase === 'scansione'){
    scansione(P, s.q * ALT);
    // il bersaglio si accende solo quando la riga lo ha superato
    if (s.q * ALT > by) mirino(P, bx, by, t, COL.bersaglio);
  }

  if (s.fase === 'agganciato' || s.fase === 'stretta'){
    mirino(P, bx, by, t, COL.bersaglio);
  }

  // l'inquadratura che stringe verso il punto
  if (s.fase === 'stretta'){
    const k = 1 - s.stretta * 0.82;
    const mx = bx + (LARG / 2 - bx) * 0;   // stringe centrata sul bersaglio
    const x0 = Math.round(mx - (LARG / 2) * k);
    const x1 = Math.round(mx + (LARG / 2) * k);
    const y0 = Math.round(by - (ALT / 2) * k);
    const y1 = Math.round(by + (ALT / 2) * k);
    angoli(P, x0, y0, x1, y1, 7);
  } else {
    angoli(P, 2, 2, LARG - 3, ALT - 3, 7);
  }

  /* --- le scritte --- */
  const liv = LIVELLI[s.livello];

  // in alto: che cosa stiamo guardando, e a che passo dei quattro siamo
  scritta(P, 4, 3, liv.nome.length > 14 ? liv.sigla : liv.nome);
  const passo = (s.livello + 1) + '/' + LIVELLI.length;
  scritta(P, LARG - 4 - largScritta(passo), 3, passo, COL.spento);

  // in basso: le coordinate, sempre; e lo stato, che cambia con la fase
  scritta(P, 4, ALT - 8, coordinate(), COL.spento);

  if (s.fase === 'comparsa'){
    // le lettere arrivano una per volta, come battute da una macchina
    scritta(P, 4, ALT - 15, 'RICERCA', COL.testo, s.q * 8);
    barra(P, 46, ALT - 13, LARG - 50, s.q);
  } else if (s.fase === 'scansione'){
    scritta(P, 4, ALT - 15, 'SCANSIONE', COL.testo);
    barra(P, 46, ALT - 13, LARG - 50, s.q);
  } else if (s.ultimo){
    /* Arrivati. Qui non si cerca piu' niente: si danno le due informazioni
       per cui esiste tutto il resto. La data ferma e il luogo lampeggiante:
       se lampeggiassero entrambi lo sguardo non saprebbe dove posarsi. */
    scritta(P, 4, ALT - 22, DATA, COL.mirino);
    if (Math.floor(t / 16) % 2 === 0)
      scritta(P, 4, ALT - 15, LUOGO, COL.bersaglio);
  } else if (s.fase === 'agganciato'){
    // lampeggia: fermo sarebbe una didascalia, lampeggiando e' un allarme
    if (Math.floor(t / 14) % 2 === 0)
      scritta(P, 4, ALT - 15, 'BERSAGLIO ACQUISITO', COL.bersaglio);
  } else {
    scritta(P, 4, ALT - 15, 'INGRANDIMENTO', COL.mirino);
  }

  // sull'ultimo livello il nome sta accanto al mirino, non solo in fondo
  if (s.ultimo && s.fase !== 'comparsa'){
    const et = 'QUI';
    scritta(P, bx - largScritta(et) - 8, by - 12, et, COL.bersaglio);
  }

  if (s.lampo > 0){
    for (let y = 0; y < ALT; y++)
      for (let x = 0; x < LARG; x += (s.lampo > 0.6 ? 1 : 2))
        P.punto(x, y, COL.lampo);
  }
}

const API = {
  LARG, ALT, COL, LIVELLI, BERSAGLIO, DATA, LUOGO, FASI, DURATA_LIVELLO,
  proiezione, riempi, contorno, segmento, strade, griglia, angoli,
  mirino, scansione, tacche, inquadratura, stato, disegna,
  scritta, largScritta, coordinate, barra,
  PENISOLA, SICILIA, SARDEGNA
};
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.MAPPA = API;

})(typeof self !== 'undefined' ? self : this);
