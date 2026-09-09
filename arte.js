/* ==========================================================================
   GERARDO — personaggio e ambiente isometrico
   Personaggio semplice e leggibile (alla Enter the Gungeon), ambiente e luce
   piu' definiti (alla Replaced). Deve essere riconducibile a lui, non identico.

   Modulo condiviso: lo usano la pagina nel browser e il renderer di controllo.
   ========================================================================== */
(function (radice) {
"use strict";

/* --------------------------------------------------------------------------
   TAVOLOZZA — poche tinte, molto contrasto, luce calda da destra
   -------------------------------------------------------------------------- */
const C = {
  '.': null,
  'o': '#241f1f',   // contorno, usato solo dove serve

  // pelle: campionata dalla foto con la maglietta bianca. E' rosata,
  // non arancione: era l'errore che piu' allontanava dalla somiglianza.
  'l': '#e9bcac',   // pelle in luce, la calotta
  's': '#d29383',   // pelle
  'S': '#a76b5d',   // pelle in ombra
  'P': '#834840',   // pelle in ombra profonda

  'h': '#a8a29a',   // capelli, grigio argento
  'H': '#d5d0c8',   // capelli in luce

  'k': '#20202a',   // montatura, sottilissima
  'K': '#141319',   // lente nera
  'R': '#4a4c58',   // unico riflesso sulla lente

  'b': '#b3877c',   // barba corta, appena piu' scura della pelle
  'm': '#8a4b4a',   // accenno di bocca
  'e': '#3a2a26',   // occhi

  't': '#f2f3f8',   // maglietta bianca, con un filo di freddo
  'T': '#ffffff',   // maglietta in luce
  'u': '#cbcdd8',   // maglietta in ombra
  'U': '#a8aab6',   // maglietta in ombra profonda

  'j': '#cdbfae',   // bermuda
  'J': '#9d8a78',   // bermuda in ombra

  'f': '#3c3b38',   // scarpa
  'y': '#d2a838',   // giallo antinfortunistico

  // pigiama e pantofole: quello che indossa appena entra in casa
  'p': '#3f4a6b',   // pigiama
  'P': '#55628c',   // pigiama in luce
  'q': '#2c3450',   // pigiama in ombra
  'Q': '#1e2438',   // pigiama in ombra profonda
  'r': '#2d3550',   // pantaloni del pigiama, piu' scuri della casacca
  'R2':'#3c4666',   // pantaloni in luce
  'z': '#6d6154',   // pantofola
  'Z': '#4b4239',   // pantofola in ombra

  'v': '#2a2a30',   // corpo della sigaretta elettronica
  'V': '#3e3f48',   // riflesso sul metallo
  'L': '#63d0f0'    // LED spento (da acceso diventa azzurro brillante)
};

// per l'ombreggiatura automatica dei bordi
// quale capo indossa: le pose leggono da qui, cosi' funzionano
// identiche in maglietta e in pigiama senza doverle riscrivere
let VESTE = { b:'t', l:'T', o:'u', c:'U' };
const VESTITI = { giorno:{ b:'t', l:'T', o:'u', c:'U' }, notte:{ b:'p', l:'P', o:'q', c:'Q' } };

const PIU_CHIARO = { s:'l', t:'T', u:'t', j:'j', b:'b', f:'f' };
const PIU_SCURO  = { s:'S', S:'P', l:'s', t:'u', T:'t', u:'U', j:'J', h:'h', H:'h', b:'S' };

/* --------------------------------------------------------------------------
   PERSONAGGIO — 22 x 34
   Riconoscibile da quattro cose sole: la pelata, gli occhiali da sole
   appoggiati in testa, la barba corta e la camicia a quadretti.
   -------------------------------------------------------------------------- */
const R = (...seg) => seg.map(([c, n]) => c.repeat(n)).join('');

const SPR = {};

SPR.corpo = [
  // calotta: la pelata si deve vedere, e' meta' del riconoscimento
  R(['.',6],['o',1],['l',8],['o',1],['.',6]),
  R(['.',5],['o',1],['l',5],['s',5],['o',1],['.',5]),
  R(['.',4],['o',1],['l',5],['s',7],['o',1],['.',4]),
  // qui sopra si appoggiano gli occhiali da sole
  R(['.',4],['o',1],['l',4],['s',8],['o',1],['.',4]),
  // i capelli partono alti sulla tempia e stanno dentro la sagoma:
  // fuori sembravano cuffie appoggiate sulle orecchie
  R(['.',4],['o',1],['h',1],['l',3],['s',7],['h',1],['o',1],['.',4]),
  R(['.',4],['o',1],['h',1],['s',10],['h',1],['o',1],['.',4]),
  R(['.',4],['o',1],['h',1],['s',10],['h',1],['o',1],['.',4]),
  R(['.',4],['o',1],['h',1],['s',1],['e',2],['s',4],['e',2],['s',1],['h',1],['o',1],['.',4]),
  R(['.',4],['o',1],['s',12],['o',1],['.',4]),
  R(['.',4],['o',1],['s',12],['o',1],['.',4]),
  // barba corta: solo il contorno della mascella e il mento
  R(['.',4],['o',1],['b',2],['s',3],['m',2],['s',3],['b',2],['o',1],['.',4]),
  R(['.',5],['o',1],['b',2],['s',6],['b',2],['o',1],['.',5]),
  R(['.',6],['o',1],['b',8],['o',1],['.',6]),
  R(['.',8],['o',1],['S',4],['o',1],['.',8]),

  // maglietta bianca, girocollo, con le braccia che si staccano dal tronco
  R(['.',4],['o',1],['t',4],['S',4],['t',4],['o',1],['.',4]),
  R(['.',3],['o',1],['u',1],['t',4],['u',2],['t',6],['u',1],['o',1],['.',3]),
  R(['.',3],['o',1],['u',1],['t',12],['u',1],['o',1],['.',3]),
  R(['.',3],['o',1],['u',1],['t',12],['u',1],['o',1],['.',3]),
  R(['.',3],['o',1],['u',1],['t',12],['u',1],['o',1],['.',3]),
  R(['.',3],['o',1],['u',1],['t',12],['u',1],['o',1],['.',3]),
  R(['.',3],['o',1],['u',1],['t',12],['u',1],['o',1],['.',3]),
  R(['.',3],['o',1],['s',1],['t',12],['s',1],['o',1],['.',3]),
  R(['.',3],['o',1],['s',1],['t',12],['s',1],['o',1],['.',3]),
  R(['.',4],['o',1],['t',12],['o',1],['.',4]),

  // bermuda
  R(['.',4],['o',1],['j',12],['o',1],['.',4]),
  R(['.',4],['o',1],['j',12],['o',1],['.',4]),
  R(['.',4],['o',1],['j',5],['o',2],['j',5],['o',1],['.',4]),
  R(['.',4],['o',1],['j',5],['o',2],['j',5],['o',1],['.',4]),

  // gambe
  R(['.',5],['o',1],['s',3],['o',1],['.',2],['o',1],['s',3],['o',1],['.',5]),
  R(['.',5],['o',1],['s',3],['o',1],['.',2],['o',1],['s',3],['o',1],['.',5]),
  R(['.',5],['o',1],['s',3],['o',1],['.',2],['o',1],['s',3],['o',1],['.',5]),

  // scarpe antinfortunistiche
  R(['.',4],['o',1],['f',4],['o',1],['.',2],['o',1],['f',4],['o',1],['.',4]),
  R(['.',4],['o',1],['y',4],['o',1],['.',2],['o',1],['y',4],['o',1],['.',4]),
  R(['.',4],['o',6],['.',2],['o',6],['.',4])
];

/* 15 x 3 — il suo modello: avvolgenti, lenti nere molto schiacciate,
   montatura sottilissima, stanghette che corrono verso le tempie.
   Li porta indossati: e' cosi' che si riconosce al primo sguardo. */
SPR.occhiali = [
  R(['.',1],['k',13],['.',1]),
  R(['k',1],['R',1],['K',4],['k',3],['R',1],['K',4],['k',1]),
  R(['.',2],['K',3],['.',5],['K',3],['.',2])
];
SPR.occhialiX = 4;
SPR.occhialiY = 6;   // proprio sopra gli occhi

// versione alzata sulla fronte, per quando serve mostrare gli occhi
SPR.occhialiSu = { x: 5, y: 2 };

// 2 x 4 — la sigaretta elettronica: piccola, o copre mezza faccia
SPR.svapo = [
  R(['v',1],['V',1]),
  R(['v',1],['V',1]),
  R(['v',2]),
  R(['L',1],['v',1])
];

// 2 x 5 — il telefono
SPR.telefono = [
  R(['v',2]),
  R(['V',2]),
  R(['V',2]),
  R(['V',2]),
  R(['v',2])
];

// 3 x 6 — il telecomando, quello che nessuno puo' toccare
SPR.telecomando = [
  R(['v',3]),
  R(['v',1],['L',1],['v',1]),
  R(['v',1],['V',1],['v',1]),
  R(['v',1],['V',1],['v',1]),
  R(['v',1],['V',1],['v',1]),
  R(['v',3])
];

const LARG_PERS = SPR.corpo[0].length;
const ALT_PERS  = SPR.corpo.length;

/* --------------------------------------------------------------------------
   Ombreggiatura automatica: schiarisce il primo pixel utile di ogni riga
   e scurisce gli ultimi due. Da' volume senza disegnare tre volte lo sprite.
   -------------------------------------------------------------------------- */
function ombreggia(righe){
  const g = righe.map(r => [...r]);
  for (let y = 0; y < g.length; y++){
    const pieni = [];
    for (let x = 0; x < g[y].length; x++) if (g[y][x] !== '.' && g[y][x] !== 'o') pieni.push(x);
    if (!pieni.length) continue;
    const primo = pieni[0], ultimo = pieni[pieni.length - 1];
    const su = c => PIU_CHIARO[c] || c, giu = c => PIU_SCURO[c] || c;
    g[y][primo] = su(g[y][primo]);
    g[y][ultimo] = giu(giu(g[y][ultimo]));
    if (ultimo - 1 > primo) g[y][ultimo - 1] = giu(g[y][ultimo - 1]);
  }
  return g.map(r => r.join(''));
}

const CORPO = ombreggia(SPR.corpo);

/* Lo stesso corpo, ma vestito da casa. Non e' un secondo sprite disegnato
   da capo: e' il primo con i colori rimappati per fasce di righe, cosi'
   qualunque correzione al personaggio vale automaticamente anche qui. */
function vestiDaNotte(righe){
  const capo = { t:'p', T:'P', u:'q', U:'Q' };          // maglietta -> casacca
  const sotto = { j:'r', J:'Q' };                        // bermuda -> pantaloni, piu' scuri
  const gamba = { s:'r', l:'p', S:'Q' };                 // gambe nude -> pantaloni lunghi
  const piede = { f:'z', y:'Z' };                        // scarpe -> pantofole
  return righe.map((riga, y) => {
    let m = null;
    if (y >= 14 && y <= 23) m = capo;
    else if (y >= 24 && y <= 27) m = sotto;
    else if (y >= 28 && y <= 30) m = gamba;
    else if (y >= 31) m = piede;
    if (!m) return riga;
    return [...riga].map(ch => m[ch] || ch).join('');
  });
}
const PIGIAMA = vestiDaNotte(CORPO);
const PEZZI_P = {
  testa:  PIGIAMA.slice(0, 13),
  tronco: PIGIAMA.slice(13, 26),
  bacino: PIGIAMA.slice(24, 28),
  zampe:  PIGIAMA.slice(28)
};

/* Il corpo si anima solo se e' fatto di pezzi. Tre blocchi con scorrimenti
   indipendenti bastano a far sembrare vivo il personaggio: testa che si
   alza, torace che si gonfia, gambe ferme a terra. */
const PEZZI = {
  testa:  CORPO.slice(0, 13),    // fino al mento
  // il tronco si porta due righe di bermuda: quando il torace si gonfia
  // riempiono il buco che altrimenti si aprirebbe sopra i pantaloni
  tronco: CORPO.slice(13, 26),
  gambe:  CORPO.slice(24)        // bermuda, gambe, scarpe
};
const Y_TRONCO = 13, Y_GAMBE = 24;
// per camminare servono le due gambe separate, ma i bermuda devono
// restare interi: se si spezzano si vede subito
PEZZI.bacino = CORPO.slice(24, 28);
PEZZI.zampe  = CORPO.slice(28);
const Y_BACINO = 24, Y_ZAMPE = 28;

/* --------------------------------------------------------------------------
   PROIEZIONE ISOMETRICA — la regola e' una sola: due passi in orizzontale
   per uno in verticale. Tutto il resto segue.
   -------------------------------------------------------------------------- */
const TILE_L = 32, TILE_A = 16, MURO_A = 26;
const proietta = (c, r) => [ (c - r) * (TILE_L / 2), (c + r) * (TILE_A / 2) ];

/* --------------------------------------------------------------------------
   DISEGNO
   -------------------------------------------------------------------------- */
function sprite(P, righe, ox, oy, daX, aX){
  for (let y = 0; y < righe.length; y++)
    for (let x = 0; x < righe[y].length; x++){
      if (daX !== undefined && (x < daX || x > aX)) continue;
      const ch = righe[y][x];
      if (ch === '.') continue;
      P.punto(ox + x, oy + y, C[ch]);
    }
}

/* --------------------------------------------------------------------------
   POSE — si disegnano sopra il corpo. Il corpo resta uno solo: cambiano
   le braccia, che sono l'unica cosa necessaria a leggere un atteggiamento.
   -------------------------------------------------------------------------- */

// entrambe le mani sui fianchi: la posa di chi aspetta, e non volentieri
function pugniSuiFianchi(P, cx, cy, dy){
  manoSulFianco(P, cx, cy, dy);
  const p = (x, y, c) => P.punto(cx + x, cy + y + dy, c);
  for (const y of [19, 20, 21, 22, 23]) p(17, y, C[VESTE.b]);
  p(18, 16, C[VESTE.o]); p(17, 16, C.o);
  p(18, 17, C[VESTE.o]); p(17, 17, C.o);
  p(19, 18, C[VESTE.o]); p(18, 18, C[VESTE.o]); p(17, 18, C.o);
  p(19, 19, C.s); p(18, 19, C.S); p(17, 19, C.o);
  p(18, 20, C.s); p(17, 20, C.S);
  p(17, 21, C.l); p(16, 21, C.s);
  p(17, 22, C.S);
}

// braccia conserte: due avambracci sovrapposti sul petto
function braccioConserte(P, cx, cy, dy){
  const p = (x, y, c) => P.punto(cx + x, cy + y + dy, c);
  for (const y of [18, 19, 20, 21, 22, 23]){ p(4, y, C[VESTE.b]); p(17, y, C[VESTE.b]); }

  // Due sole righe per braccio, e sfalsate: larghe quanto il torace
  // diventavano una fascia unica invece di leggersi come braccia.
  for (let x = 5; x <= 16; x++) p(x, 18, C.o);
  for (let x = 5; x <= 16; x++) p(x, 19, x <= 6 ? C.l : C.s);   // pelle, mano a sinistra
  p(4, 19, C.o); p(17, 18, C[VESTE.o]); p(17, 19, C[VESTE.o]);                // gomito che sporge

  for (let x = 6; x <= 17; x++) p(x, 20, C.o);
  for (let x = 6; x <= 17; x++) p(x, 21, x >= 15 ? C.l : C[VESTE.o]);  // manica, mano a destra
  p(5, 20, C.o); p(5, 21, C[VESTE.o]); p(18, 20, C.o); p(18, 21, C.o);
}

/* Un braccio qualunque, dalla spalla alla mano. Con questo si costruisce
   ogni gesto: allargare le braccia, gesticolare, tenere il telefono. */
function braccioDa(P, cx, cy, sx, sy, mx, my, dy, quotaManica = 0.45, verso = 1){
  const passi = Math.max(1, Math.round(Math.max(Math.abs(mx - sx), Math.abs(my - sy))));
  for (let i = 0; i <= passi; i++){
    const q = i / passi;
    const x = Math.round(sx + (mx - sx) * q), y = Math.round(sy + (my - sy) * q);
    const capo = q < quotaManica;
    P.punto(cx + x, cy + y + dy, capo ? C[VESTE.o] : C.s);
    P.punto(cx + x + verso, cy + y + dy, capo ? C[VESTE.o] : C.S);
  }
  const mX = Math.round(mx), mY = Math.round(my);
  P.punto(cx + mX, cy + mY + dy, C.l);
  P.punto(cx + mX + verso, cy + mY + dy, C.s);
  P.punto(cx + mX, cy + mY + 1 + dy, C.S);
}

/* Allarga le braccia al cielo e poi se le sbatte sui fianchi.
   Il gesto di chi ha finito la pazienza. */
const SBUFFO = { apre:22, tiene:46, sbatte:56, fine:120 };
function bracciaAllargate(P, cx, cy, dy, t){
  let q;
  if (t < SBUFFO.apre)        q = morbido(t / SBUFFO.apre);
  else if (t < SBUFFO.tiene)  q = 1;
  else if (t < SBUFFO.sbatte) q = 1 - (t - SBUFFO.tiene) / (SBUFFO.sbatte - SBUFFO.tiene);
  else { pugniSuiFianchi(P, cx, cy, dy); return; }

  for (const y of [19, 20, 21, 22, 23]){ P.punto(cx + 4, cy + y + dy, C[VESTE.b]); P.punto(cx + 17, cy + y + dy, C[VESTE.b]); }
  braccioDa(P, cx, cy, 4, 18, 4 - 4 * q, 20 - 8 * q, dy, 0.5, -1);
  braccioDa(P, cx, cy, 17, 18, 17 + 4 * q, 20 - 8 * q, dy, 0.5, 1);
}

/* Al telefono. Una mano all'orecchio, l'altra che gesticola da sola:
   senza quella, sembra soltanto che si gratti la testa. */
const TELEFONATA = { alza:30, chiude:330, fine:360 };
const BATTUTE = [[62, 130, 'OH'], [155, 220, 'EH'], [245, 320, "VABBUO'"]];

function alTelefono(P, cx, cy, dy, t){
  const q = t < TELEFONATA.alza ? morbido(t / TELEFONATA.alza)
          : t > TELEFONATA.chiude ? 1 - morbido((t - TELEFONATA.chiude) / (TELEFONATA.fine - TELEFONATA.chiude))
          : 1;
  for (const y of [19, 20, 21, 22, 23]){ P.punto(cx + 4, cy + y + dy, C[VESTE.b]); P.punto(cx + 17, cy + y + dy, C[VESTE.b]); }

  // la mano libera gesticola: si muove sempre, come fa lui
  const gx = 3 - Math.cos(t / 13) * 1.6, gy = 19 - 4 * q - Math.sin(t / 9) * 3.2;
  braccioDa(P, cx, cy, 4, 18, gx, gy, dy, 0.5, -1);

  // la mano che regge il telefono all'orecchio
  const mx = 17 - 2 * q, my = 20 - 12 * q;
  braccioDa(P, cx, cy, 17, 18, mx, my, dy, 0.5, 1);
  if (q > 0.7) sprite(P, SPR.telefono, cx + Math.round(mx), cy + Math.round(my) - 4 + dy);
}
function passiDi(t){
  const p = Math.floor(t / 7) % 4;
  return {
    sinistra: [0, -2, 0, 0][p],
    destra:   [0, 0, 0, -2][p],
    rimbalzo: (p === 1 || p === 3) ? -1 : 0
  };
}

/* Alfabeto completo in 3x5. Era nato con le poche lettere delle sue battute,
   ma la scena della mappa ha bisogno di parole vere (PUGLIA, TARGET, le
   coordinate) e conviene averlo tutto una volta per sempre.
   Dove tre colonne creavano ambiguita' si passa a quattro: la N sembrava una
   K, la G era una O a cui mancava un pixel. */
const GLIFI = {
  'M':["o.o","ooo","ooo","o.o","o.o"], 'h':["o..","o..","oo.","o.o","o.o"],
  'O':["ooo","o.o","o.o","o.o","ooo"], 'H':["o.o","o.o","ooo","o.o","o.o"],
  'E':["ooo","o..","ooo","o..","ooo"], 'V':["o.o","o.o","o.o","o.o",".o."],
  'A':[".o.","o.o","ooo","o.o","o.o"], 'B':["oo.","o.o","oo.","o.o","oo."],
  'U':["o.o","o.o","o.o","o.o","ooo"],
  'I':["ooo",".o.",".o.",".o.","ooo"], 'L':["o..","o..","o..","o..","ooo"],
  'T':["ooo",".o.",".o.",".o.",".o."], 'S':["ooo","o..","ooo","..o","ooo"],
  'N':["o..o","oo.o","o.oo","o..o","o..o"], 'R':["oo.","o.o","oo.","o.o","o.o"],
  'D':["oo.","o.o","o.o","o.o","oo."],
  'C':["ooo","o..","o..","o..","ooo"], 'F':["ooo","o..","ooo","o..","o.."],
  // la G chiusa in basso si leggeva come un 6: gli angoli smussati e la
  // barretta interna la staccano dalla O
  'G':[".ooo","o...","o.oo","o..o",".ooo"],
  'P':["oo.","o.o","oo.","o..","o.."],
  // la Q col codino dentro il tondo era un 9: il codino esce a destra
  'Q':["ooo.","o.o.","o.o.","ooo.","..oo"],
  'Z':["ooo","..o",".o.","o..","ooo"],
  // In 3x5 non c'e' spazio per accento + O: si leggeva come una "d".
  // Con l'apostrofo il problema non esiste e la parola resta la sua.
  "'":["o","o",".",".","."],
  '0':["ooo","o.o","o.o","o.o","ooo"], '1':[".o.","oo.",".o.",".o.","ooo"],
  '2':["ooo","..o","ooo","o..","ooo"], '3':["ooo","..o","ooo","..o","ooo"],
  '4':["o.o","o.o","ooo","..o","..o"], '5':["ooo","o..","ooo","..o","ooo"],
  '6':["ooo","o..","ooo","o.o","ooo"], '7':["ooo","..o","..o","..o","..o"],
  '8':["ooo","o.o","ooo","o.o","ooo"], '9':["ooo","o.o","ooo","..o","ooo"],
  '?':["oo.","..o",".o.","...",".o."],
  '!':["o","o","o",".","o"], '.':[".",".",".",".","o"], ' ':[" "," "," "," "," "],
  // per le scritte da centrale operativa
  ':':[".","o",".","o","."], ',':[".",".",".","o","o"],
  '-':["...","...","ooo","...","..."], '/':["..o","..o",".o.","o..","o.."],
  '°':["oo","oo","..","..",".."], '+':["...",".o.","ooo",".o.","..."]
};

/* Fumetto. Se gli si passa la larghezza della tela, si sposta da solo per
   non uscire dai bordi: su telefono la tela e' stretta e le battute lunghe
   come VABBUO' finivano tagliate a metà. La codina resta puntata verso chi
   parla, cosi' si capisce comunque chi ha detto la battuta. */
function fumetto(P, x, y, testo, colore, largTela = 0, altTela = 0){
  // attenzione: null non fa scattare il valore predefinito di un parametro,
  // e il testo veniva disegnato con colore nullo, cioe' non disegnato
  colore = colore || '#241f1f';
  let largh = 2;
  for (const ch of testo) largh += (GLIFI[ch] ? GLIFI[ch][0].length : 3) + 1;
  const totale = largh + 4;

  const codinaX = x + 4;                      // dove punta, prima di spostare
  if (largTela){
    if (x + totale > largTela - 1) x = largTela - 1 - totale;
    if (x < 1) x = 1;
  }
  if (altTela && y < 1) y = 1;

  for (let iy = 0; iy < 11; iy++)
    for (let ix = 0; ix < totale; ix++){
      const bordo = (ix === 0 || ix === totale - 1 || iy === 0 || iy === 10);
      P.punto(x + ix, y + iy, bordo ? colore : '#f6f1e6');
    }
  // la codina resta dove serve, ma solo se cade sotto il fumetto
  const cx0 = Math.max(x + 2, Math.min(x + totale - 5, codinaX));
  for (let i = 0; i < 3; i++) P.punto(cx0 + i, y + 11, i === 2 ? colore : '#f6f1e6');
  P.punto(cx0 - 1, y + 11, colore); P.punto(cx0, y + 12, colore);

  let cx = x + 3;
  for (const ch of testo){
    const g = GLIFI[ch] || GLIFI[' '];
    g.forEach((riga, ry) => {
      for (let rx = 0; rx < riga.length; rx++)
        if (riga[rx] === 'o') P.punto(cx + rx, y + 3 + ry, colore);
    });
    cx += g[0].length + 1;
  }
}

// vertice nord del tile (c, r): l'ancora di tutta la geometria
const vertice = (c, r) => [ (c - r) * (TILE_L / 2) + TILE_L / 2, (c + r) * (TILE_A / 2) ];

// riempimento di un poligono convesso a scanline: serve per rombi e facce
function poligono(P, punti, colore){
  let ymin = Infinity, ymax = -Infinity;
  for (const [, y] of punti){ if (y < ymin) ymin = y; if (y > ymax) ymax = y; }
  ymin = Math.round(ymin); ymax = Math.round(ymax);
  for (let y = ymin; y <= ymax; y++){
    let a = Infinity, b = -Infinity;
    for (let i = 0; i < punti.length; i++){
      const [x1, y1] = punti[i], [x2, y2] = punti[(i + 1) % punti.length];
      if (y1 === y2) continue;
      const lo = Math.min(y1, y2), hi = Math.max(y1, y2);
      if (y + 0.5 < lo || y + 0.5 > hi) continue;
      const x = x1 + (x2 - x1) * (y + 0.5 - y1) / (y2 - y1);
      if (x < a) a = x; if (x > b) b = x;
    }
    if (a > b) continue;
    for (let x = Math.round(a); x < Math.round(b); x++) P.punto(x, y, colore);
  }
}

// una piastrella del pavimento
function piastrella(P, c, r, colore, fuga){
  const N = vertice(c, r), E = vertice(c + 1, r), S = vertice(c + 1, r + 1), O = vertice(c, r + 1);
  poligono(P, [N, E, S, O], fuga || colore);
  if (fuga){
    const k = 0.13;
    const dentro = [
      [N[0], N[1] + TILE_A * k], [E[0] - TILE_L * k, E[1]],
      [S[0], S[1] - TILE_A * k], [O[0] + TILE_L * k, O[1]]
    ];
    poligono(P, dentro, colore);
  }
}

function pavimento(P, colonne, righe, tinte){
  for (let r = 0; r < righe; r++)
    for (let c = 0; c < colonne; c++)
      piastrella(P, c, r, (c + r) % 2 === 0 ? tinte.chiaro : tinte.scuro, tinte.fuga);
}

/* Scatola isometrica: la primitiva con cui si costruisce tutto l'arredo
   e anche i muri. Occupa le celle da (c0,r0) a (c1,r1) ed e' alta h pixel.
   La luce arriva da destra: faccia destra chiara, faccia sinistra in ombra. */
function scatola(P, c0, r0, c1, r1, h, tinte, alzata = 0){
  const su = ([x, y]) => [x, y - h - alzata];
  const giu = ([x, y]) => [x, y - alzata];
  const N = vertice(c0, r0), E = vertice(c1 + 1, r0),
        S = vertice(c1 + 1, r1 + 1), O = vertice(c0, r1 + 1);

  poligono(P, [giu(O), giu(S), su(S), su(O)], tinte.sinistra);
  poligono(P, [giu(S), giu(E), su(E), su(S)], tinte.destra);
  poligono(P, [su(N), su(E), su(S), su(O)], tinte.cima);
  // filo di luce sullo spigolo che guarda la stanza
  if (tinte.filo){
    const [ax, ay] = su(S), [bx, by] = su(E);
    const passi = Math.max(Math.abs(bx - ax), Math.abs(by - ay));
    for (let i = 0; i <= passi; i++)
      P.punto(Math.round(ax + (bx - ax) * i / passi), Math.round(ay + (by - ay) * i / passi), tinte.filo);
  }
}

/* --------------------------------------------------------------------------
   ANIMAZIONE DELLA SVAPATA
   Una sola timeline in fotogrammi: porta la sigaretta alla bocca, tira,
   riabbassa il braccio, trattiene, poi soffia la nuvola che si dirada.
   -------------------------------------------------------------------------- */
const SVAPO = { tira:78, scende:132, soffia:186, durataFumo:210, ciclo:420 };

// interpolazione morbida: parte piano, arriva piano. E' quello che
// distingue un movimento a scatti da un gesto.
const morbido = q => q * q * (3 - 2 * q);

/* Traiettoria della mano: punti chiave con il loro istante. Fra un punto
   e l'altro la posizione viene calcolata, quindi la mano passa per tutte
   le posizioni intermedie invece di saltare fra tre pose. */
const PERCORSO_MANO = [
  [0,   16, 20], [38,  16, 20],
  [50,  16, 17], [62,  15, 14],
  [78,  13, 11], [132, 13, 11],
  [144, 15, 14], [158, 16, 20], [420, 16, 20]
];

function lungoIlPercorso(chiavi, t){
  for (let i = 0; i < chiavi.length - 1; i++){
    const [t1, x1, y1] = chiavi[i], [t2, x2, y2] = chiavi[i + 1];
    if (t < t1 || t > t2) continue;
    const q = t2 === t1 ? 0 : morbido((t - t1) / (t2 - t1));
    return [x1 + (x2 - x1) * q, y1 + (y2 - y1) * q];
  }
  const u = chiavi[chiavi.length - 1];
  return [u[1], u[2]];
}

function fasiSvapo(fase){
  const t = ((fase % SVAPO.ciclo) + SVAPO.ciclo) % SVAPO.ciclo;
  const mano = lungoIlPercorso(PERCORSO_MANO, t);
  const alzata = t >= 40 && t < 158;                  // il braccio e' in moto
  const led = t >= SVAPO.tira && t < SVAPO.scende;
  const guance = t >= SVAPO.tira && t < SVAPO.soffia;
  const tFumo = t >= SVAPO.soffia ? t - SVAPO.soffia : -1;

  // respiro di fondo: testa e torace sfalsati, cosi' non pulsano all'unisono
  const onda = (f, periodo) => -Math.round(Math.max(0, Math.sin(f * 2 * Math.PI / periodo)) * 1.4);
  let dyTesta = onda(t, 96), dyTronco = onda(t - 14, 96);

  // inspirazione: il torace si gonfia e la testa scende verso la mano
  if (t >= SVAPO.tira && t < SVAPO.soffia){
    const q = morbido(Math.min(1, (t - SVAPO.tira) / 26));
    dyTronco = -Math.round(q * 2);
    dyTesta  = -Math.round(q * 1);
  }
  // espirazione: si svuota, la testa scende e poi risale
  if (t >= SVAPO.soffia){
    const q = Math.min(1, (t - SVAPO.soffia) / 30);
    dyTronco = Math.round(q * 1);
    dyTesta  = Math.round(q * 1) + onda(t - SVAPO.soffia, 96);
  }
  return { t, mano, alzata, led, guance, tFumo, dyTesta, dyTronco };
}

/* L'altro braccio non resta a pendere: mano sul fianco, gomito in fuori.
   E' la posa che tiene tutto il gesto insieme. */
function manoSulFianco(P, cx, cy, dy){
  const p = (x, y, c) => P.punto(cx + x, cy + y + dy, c);
  // il fianco torna pulito: la mano non pende piu'
  for (const y of [19, 20, 21, 22, 23]) p(4, y, C[VESTE.b]);
  // Braccio a L. Il contorno va all'interno, contro la maglietta bianca:
  // messo all'esterno finirebbe sul fondo scuro e non si vedrebbe.
  p(3, 16, C[VESTE.o]); p(4, 16, C.o);
  p(3, 17, C[VESTE.o]); p(4, 17, C.o);
  p(2, 18, C[VESTE.o]); p(3, 18, C[VESTE.o]); p(4, 18, C.o);
  p(2, 19, C.s); p(3, 19, C.S); p(4, 19, C.o);
  p(3, 20, C.s); p(4, 20, C.S);
  p(4, 21, C.l); p(5, 21, C.s);
  p(4, 22, C.S);
}

function braccioSvapo(P, cx, cy, mano, dyTronco, led){
  // la mano abbassata di serie va coperta, altrimenti se ne vedono due
  for (const y of [21, 22]) for (const x of [16, 17]) P.punto(cx + x, cy + y + dyTronco, C[VESTE.o]);

  const mx = Math.round(mano[0]), my = Math.round(mano[1]);
  const sxo = 17, syo = 20 + dyTronco;                 // la spalla segue il torace
  const passi = Math.max(1, Math.max(Math.abs(mx - sxo), Math.abs(my - syo)));
  for (let i = 0; i <= passi; i++){
    const q = i / passi;
    const x = Math.round(sxo + (mx - sxo) * q);
    const y = Math.round(syo + (my - syo) * q);
    P.punto(cx + x,     cy + y, q < 0.45 ? C[VESTE.o] : C.s);
    P.punto(cx + x + 1, cy + y, q < 0.45 ? C[VESTE.o] : C.S);
  }
  P.punto(cx + mx,     cy + my,     C.l);
  P.punto(cx + mx + 1, cy + my,     C.s);
  P.punto(cx + mx,     cy + my + 1, C.s);
  P.punto(cx + mx + 1, cy + my + 1, C.S);

  sprite(P, SPR.svapo, cx + mx, cy + my - 4);
  if (led){
    P.punto(cx + mx, cy + my - 1, '#8fe4ff');
    P.punto(cx + mx, cy + my - 2, 'rgba(143,228,255,0.40)');
  }
}

/* Il fumo come campo di densita': sommo i contributi delle particelle e
   taglio a tre soglie. Cosi' la nuvola ha bordi netti a fasce, invece di
   essere una sfumatura sfocata che in pixel art stona. */
const casuale = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const PARTICELLE = 30;

function fumo(P, cx, cy, t){
  if (t < 0) return;
  const bocca = [cx + 11, cy + 10];
  const vive = [];
  for (let i = 0; i < PARTICELLE; i++){
    const tp = t - i * 1.5;
    if (tp <= 0) continue;
    const p = tp / SVAPO.durataFumo;
    if (p >= 1) continue;
    // la nuvola si apre in tutte le direzioni: deve coprirgli la faccia,
    // non scappare di lato
    const ang = casuale(i, 1) * Math.PI * 2;
    const sp = 1 - Math.exp(-tp / 30);            // si apre e poi si assesta
    const forza = 0.5 + casuale(i, 2) * 0.75;
    const opac = Math.min(1, tp / 7) * Math.max(0, 1 - Math.pow(p / 0.60, 2.1));
    if (opac <= 0.02) continue;
    vive.push({
      x: bocca[0] + Math.cos(ang) * 13 * sp * forza,
      y: bocca[1] + Math.sin(ang) * 9 * sp * forza - 7 * sp - tp * 0.025,
      r: 2.2 + 7 * sp * forza,
      o: opac
    });
  }
  if (!vive.length) return;

  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const v of vive){
    x0 = Math.min(x0, v.x - v.r); x1 = Math.max(x1, v.x + v.r);
    y0 = Math.min(y0, v.y - v.r); y1 = Math.max(y1, v.y + v.r);
  }
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++)
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x++){
      let d = 0;
      for (const v of vive){
        const dx = x - v.x, dy = (y - v.y) * 1.25;   // un po' schiacciata
        const q = 1 - (dx * dx + dy * dy) / (v.r * v.r);
        if (q > 0) d += q * v.o;
      }
      // tre soli livelli: quando la densita' cala la nuvola si restringe,
      // invece di ingrigire. Un quarto livello troppo tenue, su fondo scuro,
      // diventava fuliggine.
      if (d > 0.88)      P.punto(x, y, '#f4f4f7');
      else if (d > 0.45) P.punto(x, y, 'rgba(231,234,241,0.93)');
      else if (d > 0.22) P.punto(x, y, 'rgba(216,221,233,0.74)');
    }
}

function personaggio(P, c, r, opz){
  const o = Object.assign({ fase: 0, occhialiAlzati: false, azione: null }, opz);
  const [sx, sy] = proietta(c, r);
  const cx = Math.round(sx + TILE_L / 2 - LARG_PERS / 2);
  const cy = Math.round(sy + TILE_A / 2 - ALT_PERS);

  const a = o.azione === 'svapo' ? fasiSvapo(o.fase) : null;
  // anche da fermo i due blocchi respirano sfalsati
  const onda = (f, p) => -Math.round(Math.max(0, Math.sin(f * 2 * Math.PI / p)) * 1.4);
  const dyTesta  = a ? a.dyTesta  : onda(o.fase, 96);
  const dyTronco = a ? a.dyTronco : onda(o.fase - 14, 96);

  // ombra a terra, schiacciata come le piastrelle
  poligono(P, [
    [sx + TILE_L / 2, sy + 3], [sx + TILE_L / 2 + 8, sy + 8],
    [sx + TILE_L / 2, sy + 13], [sx + TILE_L / 2 - 8, sy + 8]
  ], 'rgba(18,12,10,0.30)');

  sprite(P, PEZZI.gambe,  cx, cy + Y_GAMBE);
  sprite(P, PEZZI.tronco, cx, cy + Y_TRONCO + dyTronco);
  sprite(P, PEZZI.testa,  cx, cy + dyTesta);

  // guance in ombra mentre trattiene il fiato
  if (a && a.guance){
    P.punto(cx + 6,  cy + 10 + dyTesta, C.S);
    P.punto(cx + 15, cy + 10 + dyTesta, C.S);
  }

  const g = o.occhialiAlzati ? SPR.occhialiSu : { x: SPR.occhialiX, y: SPR.occhialiY };
  sprite(P, SPR.occhiali, cx + g.x, cy + g.y + dyTesta);

  if (a) manoSulFianco(P, cx, cy, dyTronco);
  if (a && a.alzata) braccioSvapo(P, cx, cy, a.mano, dyTronco, a.led);
  if (a) fumo(P, cx, cy + dyTesta, a.tFumo);

  return { cx, cy };
}

/* --------------------------------------------------------------------------
   LA RABBIA — la pelle che va al rosso.
   Il personaggio e' disegnato da una dozzina di funzioni che leggono i colori
   dalla tavolozza C. Passare a tutte un parametro in piu' avrebbe voluto dire
   toccarle tutte: si tinge invece la tavolozza per il tempo del disegno, e
   subito dopo si rimette com'era. Chi disegna non sa di essere arrabbiato.
   -------------------------------------------------------------------------- */
const PELLE_CALMA = { l:C.l, s:C.s, S:C.S, b:C.b };
// non un rosso qualsiasi: e' la pelle che si scalda, quindi resta nella
// famiglia dell'incarnato invece di virare al pomodoro
const PELLE_ROSSA = { l:'#f4795e', s:'#dd4b34', S:'#9e2b1d', b:'#c4543f' };

function mescola(a, b, q){
  const n = c => [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16)];
  const [r1,g1,b1] = n(a), [r2,g2,b2] = n(b);
  const v = x => Math.round(x).toString(16).padStart(2, '0');
  return '#' + v(r1+(r2-r1)*q) + v(g1+(g2-g1)*q) + v(b1+(b2-b1)*q);
}

function tingiPelle(q){
  q = Math.max(0, Math.min(1, q || 0));
  for (const k in PELLE_CALMA)
    C[k] = q === 0 ? PELLE_CALMA[k] : mescola(PELLE_CALMA[k], PELLE_ROSSA[k], q);
}

/* Le sopracciglia calate.
   Il rosso da solo fa sembrare che abbia caldo: sono le sopracciglia a dire
   che e' arrabbiato. Ma gli occhi stanno alla riga 7 e gli occhiali da sole
   li coprono tutti: le sopracciglia vanno quindi sulla fronte, righe 4 e 5,
   che e' l'unico spazio libero che ha in faccia. Esterno alto e interno
   basso: e' la pendenza, non lo spessore, a fare la rabbia. */
function cigliaArrabbiate(P, cx, cy, dyTesta, q){
  if (q < 0.25) return;
  const c = C.e || '#3a2a26';
  /* Righe 4 e 5, e non una di piu': alla riga 6 comincia la montatura degli
     occhiali, che e' quasi nera, e le sopracciglia scure ci sparivano dentro.
     Sulla fronte chiara invece stampano. */
  const y = cy + dyTesta + 4;
  /* Gli occhi stanno alle colonne 7-8 e 13-14: le sopracciglia devono
     cadere sopra quelle, non altrove, o sembrano rughe.
     Quattro pixel per lato su due righe, esterno alto e interno basso: con
     tre erano sei pixel in croce e non si leggeva niente. */
  const punti = q > 0.6
    ? [[6, 0], [7, 0], [8, 1], [9, 1]]
    : [[7, 0], [8, 1]];
  for (const [dx, giu] of punti){
    P.punto(cx + dx,      y + giu, c);
    P.punto(cx + 21 - dx, y + giu, c);        // lo specchio, sprite largo 22
  }
}

/* I trattini della rabbia attorno alla testa.
   Prima erano sbuffi di vapore bianco: si vedevano sul buio della prima
   scena e sparivano del tutto sul bianco della scena finale, che e' proprio
   dove servono. Un rosso scuro invece si legge su qualsiasi fondo. */
function sbuffiRabbia(P, cx, cy, dyTesta, q, t){
  if (q < 0.5) return;
  const c = '#b32d1c';
  // pulsano: fermi sembravano graffi disegnati sopra il personaggio.
  // Corti: a quattro pixel diventavano antenne
  const lungo = 1 + Math.floor(q * 1.4) + (Math.floor(t / 7) % 2);
  const partenze = [[5, 1, -1, -1], [16, 1, 1, -1], [3, 6, -1, 0], [18, 6, 1, 0]];
  for (const [sx, sy, dx, dy] of partenze)
    for (let i = 1; i <= lungo; i++)
      P.punto(cx + sx + dx * i, cy + dyTesta + sy + dy * i, c);
}

function attore(P, px, py, stato){
  const o = Object.assign({ azione:'fermo', t:0, occhialiQ:0, ombra:true }, stato);
  const cx = Math.round(px - LARG_PERS / 2), cy = Math.round(py - ALT_PERS);
  const t = o.t;

  const sv = o.azione === 'svapo' ? fasiSvapo(t) : null;
  const onda = (f, p) => -Math.round(Math.max(0, Math.sin(f * 2 * Math.PI / p)) * 1.4);
  let dyTesta  = sv ? sv.dyTesta  : onda(t, 96);
  let dyTronco = sv ? sv.dyTronco : onda(t - 14, 96);

  let gSx = 0, gDx = 0;
  if (o.azione === 'cammina'){
    const p = passiDi(t);
    gSx = p.sinistra; gDx = p.destra;
    dyTesta = p.rimbalzo; dyTronco = p.rimbalzo;
  }

  if (o.ombra){
    const largo = 15;
    for (let i = 0; i < 4; i++){
      const w = largo - Math.abs(i - 1.5) * 4;
      for (let x = 0; x < w; x++)
        P.punto(cx + LARG_PERS / 2 - w / 2 + x, py - 2 + i, 'rgba(12,9,8,0.34)');
    }
  }

  tingiPelle(o.rabbia);

  VESTE = o.pigiama ? VESTITI.notte : VESTITI.giorno;
  const V = o.pigiama ? PEZZI_P : PEZZI;
  sprite(P, V.zampe,  cx, cy + Y_ZAMPE + gSx, 0, 10);
  sprite(P, V.zampe,  cx, cy + Y_ZAMPE + gDx, 11, 21);
  sprite(P, V.bacino, cx, cy + Y_BACINO + Math.min(gSx, gDx));
  sprite(P, V.tronco, cx, cy + Y_TRONCO + dyTronco);
  sprite(P, V.testa,  cx, cy + dyTesta);

  if (sv && sv.guance){
    P.punto(cx + 6,  cy + 10 + dyTesta, C.S);
    P.punto(cx + 15, cy + 10 + dyTesta, C.S);
  }

  // in pigiama gli occhiali non li porta: e' a casa sua
  if (!o.pigiama){
    const q = Math.max(0, Math.min(1, o.occhialiQ));
    sprite(P, SPR.occhiali, cx + Math.round(4 + q), cy + Math.round(6 - 5 * q) + dyTesta);
  }

  if (o.azione === 'fianchi')  pugniSuiFianchi(P, cx, cy, dyTronco);
  if (o.azione === 'conserte') braccioConserte(P, cx, cy, dyTronco);
  if (o.azione === 'sbuffa')   bracciaAllargate(P, cx, cy, dyTronco, t);
  if (o.azione === 'telefono'){
    alTelefono(P, cx, cy, dyTronco, t);
    for (const [da, a, battuta] of BATTUTE)
      if (t >= da && t < a) fumetto(P, cx + 17, cy - 7 + dyTesta, battuta, null, o.largTela || 0);
  }
  if (sv){
    manoSulFianco(P, cx, cy, dyTronco);
    if (sv.alzata) braccioSvapo(P, cx, cy, sv.mano, dyTronco, sv.led);
    fumo(P, cx, cy + dyTesta, sv.tFumo);
  }

  if (o.rabbia){
    cigliaArrabbiate(P, cx, cy, dyTesta, o.rabbia);
    sbuffiRabbia(P, cx, cy, dyTesta, o.rabbia, t);
  }
  // la tavolozza torna com'era: nessun altro deve accorgersi della rabbia
  tingiPelle(0);

  return { cx, cy, dyTesta };
}

/* Lo stesso sprite girato di un quarto: la testa finisce a sinistra e il
   corpo si distende. Per un uomo rigido su un divano funziona, e costa
   molto meno che disegnare un secondo personaggio. */
function spriteGirato(P, righe, ox, oy, chiavi){
  const A = righe.length;
  for (let y = 0; y < A; y++)
    for (let x = 0; x < righe[y].length; x++){
      const ch = righe[y][x];
      if (ch === '.') continue;
      P.punto(ox + (A - 1 - y), oy + x, (chiavi && chiavi[ch]) || C[ch]);
    }
}

/* La nuvoletta della piroetta: polvere che gira e si allarga.
   Serve a nascondere il cambio d'abito, come nei cartoni. */
function polvere(P, cx, cy, t, durata){
  const q = t / durata;
  if (q < 0 || q > 1) return;
  const forza = Math.sin(Math.PI * Math.min(1, q * 1.25));
  for (let i = 0; i < 22; i++){
    const giri = t * 0.22 + i * (Math.PI * 2 / 22);
    const raggio = (7 + 17 * forza) * (0.68 + 0.32 * Math.sin(i * 2.1));
    const x = cx + Math.cos(giri) * raggio;
    const y = cy - 18 + Math.sin(giri) * raggio * 0.78 - forza * 2;
    const r = 2.4 + 4 * forza;
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++){
        if (dx * dx + dy * dy > r * r) continue;
        const chiaro = (dx + dy) % 3 === 0;
        P.punto(x + dx, y + dy, chiaro ? 'rgba(226,214,192,0.92)' : 'rgba(190,176,154,0.82)');
      }
  }
}

/* --------------------------------------------------------------------------
   IL SALOTTO — divano a L, televisore, tavolino
   -------------------------------------------------------------------------- */
const ARREDO = {
  divano:   { sinistra:'#4e2f2a', destra:'#6d4038', cima:'#7f4c41', filo:'#95604f' },
  cuscino:  { sinistra:'#5a3730', destra:'#7d4b40', cima:'#8f5b4c', filo:'#a56b58' },
  mobile:   { sinistra:'#1d1c1b', destra:'#2a2927', cima:'#343230', filo:'#454340' },
  tavolino: { sinistra:'#161514', destra:'#232220', cima:'#2c2a28', filo:'#3d3a37' }
};

function televisore(P, acceso, tremore, fase){
  const dx = tremore ? (fase % 6 < 3 ? 0 : 1) : 0;
  const dy = tremore ? (fase % 4 < 2 ? 0 : 1) : 0;
  const Q = { punto(x, y, c){ P.punto(x + dx, y + dy, c); } };

  scatola(Q, 5, 2, 5, 3, 7, ARREDO.mobile);              // il mobiletto
  const base = vertice(5, 2);
  const largo = 30, alto = 19;
  const x0 = base[0] - 4, y0 = base[1] - 25;
  for (let y = 0; y < alto; y++)
    for (let x = 0; x < largo; x++){
      const cornice = (x < 2 || x >= largo - 2 || y < 2 || y >= alto - 3);
      let c = cornice ? '#131211' : '#05060a';
      if (acceso && !cornice){
        // luce che scorre: la televisione non e' mai di un colore solo
        const onda = Math.sin(y * 0.7 + fase * 0.35) * 0.5 + 0.5;
        const banda = ((y + Math.floor(fase / 3)) % 7 === 0);
        c = banda ? '#e8ecf5' : (onda > 0.55 ? '#7f9dc4' : '#41597e');
      }
      Q.punto(x0 + x + Math.floor((alto - y) / 3), y0 + y, c);
    }
  if (acceso){
    const cx = x0 + largo / 2, cy = y0 + alto / 2;
    for (let i = 1; i <= 3; i++)
      poligono(Q, [
        [cx, cy - 14 * i], [cx + 30 * i, cy], [cx, cy + 14 * i], [cx - 30 * i, cy]
      ], 'rgba(150,190,240,0.045)');
  }
}

/* 44 x 24 — semi sdraiato di profilo, guarda verso sinistra (la TV).
   La testa sta a destra sul cuscino e la schiena e' sollevata: in una
   vista laterale il vecchio trucco di ruotare lo sprite non regge piu',
   perche' la faccia finirebbe rivolta al soffitto. */
SPR.semiSdraiato = [
  R(['.',38],['o',7],['.',7]),
  R(['.',36],['o',1],['l',9],['o',1],['.',5]),
  R(['.',35],['o',1],['l',11],['o',1],['.',4]),
  R(['.',34],['o',1],['l',12],['h',1],['o',1],['.',3]),
  R(['.',34],['o',1],['l',11],['h',2],['o',1],['.',3]),
  R(['.',33],['o',1],['s',11],['H',2],['h',1],['o',1],['.',3]),
  R(['.',33],['o',1],['s',4],['e',1],['s',6],['H',1],['h',2],['o',1],['.',3]),
  R(['.',32],['o',1],['s',1],['S',1],['s',10],['H',1],['h',2],['o',1],['.',3]),
  R(['.',32],['o',1],['s',2],['b',8],['h',3],['o',1],['.',5]),
  R(['.',33],['o',1],['b',9],['h',2],['o',1],['.',6]),
  R(['.',32],['o',1],['p',3],['S',2],['b',4],['o',1],['.',9]),
  R(['.',29],['o',1],['p',9],['o',1],['.',12]),
  R(['.',26],['o',1],['p',12],['o',1],['.',12]),
  R(['.',23],['o',1],['p',15],['o',1],['.',12]),
  R(['.',21],['o',1],['p',17],['o',1],['.',12]),
  R(['.',19],['o',1],['p',19],['o',1],['.',12]),
  R(['.',17],['o',1],['p',21],['o',1],['.',12]),
  R(['.',16],['o',1],['p',22],['o',1],['.',12]),
  R(['.',13],['o',1],['r',6],['p',17],['o',1],['.',14]),
  R(['.',10],['o',1],['r',11],['p',12],['o',1],['.',17]),
  R(['.',8],['o',1],['r',15],['p',6],['o',1],['.',21]),
  R(['.',6],['o',1],['r',17],['o',1],['.',27]),
  R(['.',5],['o',1],['r',16],['o',1],['.',29]),
  R(['.',4],['o',1],['r',13],['o',1],['.',33]),
  R(['.',2],['o',1],['z',4],['r',8],['o',1],['.',36]),
  R(['.',1],['o',1],['z',6],['Z',2],['o',1],['.',41]),
  R(['o',1],['z',7],['Z',2],['o',1],['.',41]),
  R(['.',1],['o',9],['.',42])
];

/* Sdraiato sul divano. Il corpo e' lo stesso, girato di un quarto.
   Le braccia e la testa vengono ritoccate sopra, perche' un uomo steso
   non tiene le braccia lungo i fianchi come uno in piedi. */
function sdraiato(P, px, py, o){
  VESTE = VESTITI.notte;
  const s = Object.assign({ t:0, dorme:false, braccioSu:false }, o);
  const respiro = (Math.floor(s.t / (s.dorme ? 70 : 48)) % 2) ? -1 : 0;
  const ox = Math.round(px), oy = Math.round(py) + respiro;

  spriteGirato(P, PIGIAMA, ox, oy);

  // la testa e' l'ultima colonna dello sprite girato: qui si aggiunge
  // il cuscino sotto la nuca e, se dorme, gli occhiali tolti
  const tx = ox + ALT_PERS - 1;
  if (s.dorme){
    for (let i = 0; i < 3; i++)
      fumettoZeta(P, tx - 6 + i * 5, oy - 8 - i * 5, i, s.t);
  }
  if (s.braccioSu){
    for (let y = 6; y <= 9; y++) P.punto(ox + 14, oy + y, C.p);
    for (let y = 5; y <= 8; y++) P.punto(ox + 15, oy + y, C.P);
    P.punto(ox + 16, oy + 5, C.l); P.punto(ox + 16, oy + 6, C.s);
  }
}

/* --------------------------------------------------------------------------
   GERARDO SDRAIATO — costruito con volumi, non con una matrice di pixel.
   Un corpo disteso e' fatto di forme tonde che si raccordano: capsule per
   gli arti, ellissi per testa e busto. Disegnarlo riga per riga produceva
   una sagoma affusolata senza snodi, che infatti sembrava una crisalide.
   -------------------------------------------------------------------------- */
/* Sdraiato ricavato DALLO STESSO corpo della prima scena, in pigiama.
   Il tronco e le gambe vengono girati di un quarto; la testa resta
   frontale, appoggiata sul cuscino, perche' e' la parte che lo rende
   riconoscibile e ruotandola guarderebbe il soffitto. */
function gerardoSdraiato(P, ox, oy, s){
  const o = Object.assign({ t:0, dorme:false, braccio:'pancia' }, s);
  const respiro = (Math.floor(o.t / (o.dorme ? 80 : 54)) % 2) ? -1 : 0;
  const y0 = oy + respiro;

  // ombra di contatto sotto tutta la figura
  for (let x = 3; x < 32; x++) P.punto(ox + x, y0 + 13, 'rgba(24,12,8,0.34)');

  sprite(P, SPR.sdraiato, ox, y0);

  // il braccio si alza per la svapata o per il telecomando
  if (o.braccio !== 'pancia'){
    const mx = ox + 24, my = y0 + 3;
    for (let i = 0; i < 4; i++) P.punto(mx + 2, my + 2 + i, C.p);
    P.punto(mx, my, C.l); P.punto(mx + 1, my, C.s); P.punto(mx, my + 1, C.S);
    if (o.braccio === 'svapo')  sprite(P, SPR.svapo, mx, my - 4);
    if (o.braccio === 'canale') sprite(P, SPR.telecomando, mx - 1, my - 5);
  }

  // filo di luce della televisione, che arriva da sinistra
  for (let y = 7; y < 12; y++) P.punto(ox + 2, y0 + y, 'rgba(150,190,240,0.4)');

  if (o.dorme)
    for (let i = 0; i < 3; i++) fumettoZeta(P, ox + 44 + i * 4, y0 + 1 - i * 4, i, o.t);
  return { mx: ox + 24, my: y0 + 3, tx: ox + 34, ty: y0 + 2 };
}

function ellisse(P, cx, cy, rx, ry, c){
  for (let y = Math.round(cy - ry); y <= Math.round(cy + ry); y++)
    for (let x = Math.round(cx - rx); x <= Math.round(cx + rx); x++){
      const dx = (x - cx) / rx, dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) P.punto(x, y, c);
    }
}

// segmento con spessore: e' la forma di un braccio o di una gamba
function capsula(P, x1, y1, x2, y2, r, c){
  const passi = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1)));
  for (let i = 0; i <= passi; i++){
    const q = i / passi;
    ellisse(P, x1 + (x2 - x1) * q, y1 + (y2 - y1) * q, r, r, c);
  }
}

/* Vecchia versione a matrice, tenuta finche' non e' rimossa ovunque. */
function semiSdraiato(P, px, py, o){
  const s = Object.assign({ t:0, dorme:false, braccio:'pancia' }, o);
  const respiro = (Math.floor(s.t / (s.dorme ? 78 : 52)) % 2) ? -1 : 0;
  const ox = Math.round(px), oy = Math.round(py) + respiro;

  sprite(P, SPR.semiSdraiato, ox, oy);

  // gli occhi si chiudono quando dorme: due trattini al posto della lente
  if (s.dorme){
    for (let i = 0; i < 3; i++) fumettoZeta(P, ox + 44 + i * 5, oy - 4 - i * 5, i, s.t);
  }

  // il braccio: sulla pancia, oppure alzato con qualcosa in mano
  const alzato = s.braccio !== 'pancia';
  const mx = alzato ? ox + 26 : ox + 24;
  const my = alzato ? oy + 6  : oy + 13;
  for (let i = 0; i <= 6; i++){
    const q = i / 6;
    P.punto(Math.round(ox + 22 + (mx - ox - 22) * q), Math.round(oy + 14 + (my - oy - 14) * q), C.p);
    P.punto(Math.round(ox + 22 + (mx - ox - 22) * q), Math.round(oy + 15 + (my - oy - 14) * q), C.q);
  }
  P.punto(mx, my, C.l); P.punto(mx + 1, my, C.s); P.punto(mx, my + 1, C.S);

  if (s.braccio === 'svapo')  sprite(P, SPR.svapo, mx, my - 4);
  if (s.braccio === 'canale') sprite(P, SPR.telecomando, mx - 1, my - 5);
  return { mx, my, ox, oy };
}

/* --------------------------------------------------------------------------
   ADDORMENTATO SUL DIVANO — lo sprite in piedi, messo in orizzontale.
   E' la soluzione piu' semplice e anche la piu' coerente: e' lo stesso
   personaggio, nessun disegno nuovo da far combaciare con gli altri.
   -------------------------------------------------------------------------- */
function dormeOrizzontale(P, ox, oy, t){
  VESTE = VESTITI.notte;
  const H = PIGIAMA.length;                   // 34: diventa la lunghezza

  // ombra di contatto lungo tutto il corpo
  for (let x = 3; x < H - 2; x++) P.punto(ox + x, oy + 22, 'rgba(22,11,7,0.34)');

  // il corpo girato di un quarto: testa a destra
  for (let y = 0; y < H; y++)
    for (let x = 0; x < PIGIAMA[y].length; x++){
      const ch = PIGIAMA[y][x];
      if (ch === '.') continue;
      P.punto(ox + (H - 1 - y), oy + x, C[ch]);
    }

  // occhi chiusi: due trattini al posto delle pupille
  P.punto(ox + H - 8, oy + 7,  C.o); P.punto(ox + H - 8, oy + 8,  C.o);
  P.punto(ox + H - 8, oy + 13, C.o); P.punto(ox + H - 8, oy + 14, C.o);

  palloncino(P, ox + H - 11, oy + 11, t);
  for (let i = 0; i < 3; i++) fumettoZeta(P, ox + H + 1 + i * 4, oy - 3 - i * 4, i, t);
}

/* Il palloncino di saliva che si gonfia e si sgonfia: nei cartoni e' il
   segno che qualcuno dorme davvero della grossa. */
function palloncino(P, x, y, t){
  const ciclo = 130, q = (t % ciclo) / ciclo;
  // gonfia lento, scoppia e riparte
  const r = q < 0.72 ? 0.6 + (q / 0.72) * 3.4 : (q < 0.80 ? 4.4 : 0.4);
  if (r < 0.9) return;
  const R = Math.round(r);
  for (let dy = -R; dy <= R; dy++)
    for (let dx = -R; dx <= R; dx++){
      const d = dx * dx + dy * dy;
      if (d > R * R) continue;
      const bordo = d > (R - 1) * (R - 1);
      P.punto(x - dx, y + dy, bordo ? 'rgba(236,244,255,0.85)' : 'rgba(210,228,250,0.30)');
    }
  if (R >= 3) P.punto(x - R + 1, y - 1, '#ffffff');     // riflesso
  if (q >= 0.72 && q < 0.80){                            // lo schiocco
    for (const [a, b] of [[-1,-4],[2,-4],[-3,1],[3,2],[0,5]])
      P.punto(x + a, y + b, 'rgba(236,244,255,0.55)');
  }
}

function fumettoZeta(P, x, y, i, t){
  const su = Math.sin(t / 26 + i) * 1.5;
  const Z = ["ooo","..o",".o.","o..","ooo"];
  Z.forEach((riga, ry) => {
    for (let rx = 0; rx < 3; rx++)
      if (riga[rx] === 'o') P.punto(x + rx, y + ry + su, 'rgba(240,236,226,' + (0.85 - i * 0.22) + ')');
  });
}

function salotto(P, opz){
  const o = Object.assign({ fase:0, tv:false, tremore:false }, opz);

  scatola(P, 0, -1, COL - 1, -1, MURO_A, TINTE.parete);
  scatola(P, -1, 0, -1, RIG - 1, MURO_A, TINTE.parete);
  pavimento(P, COL, RIG, TINTE.pavimento);

  for (let r = 2; r <= 4; r++)
    for (let c = 2; c <= 4; c++)
      piastrella(P, c, r, (c + r) % 2 === 0 ? TINTE.tappeto.chiaro : TINTE.tappeto.scuro);

  // divano a L: il lato lungo contro la parete di sinistra,
  // il lato corto verso il fondo. Lui sta sempre sul corto.
  scatola(P, 0, 1, 0, 4, 15, ARREDO.divano);             // spalliera lunga
  scatola(P, 1, 1, 1, 4,  7, ARREDO.cuscino);            // seduta lunga
  scatola(P, 1, 0, 4, 0, 15, ARREDO.divano);             // spalliera corta
  scatola(P, 2, 1, 4, 1,  7, ARREDO.cuscino);            // seduta corta

  scatola(P, 2, 3, 3, 4, 4, ARREDO.tavolino);            // tavolino nero
  televisore(P, o.tv, o.tremore, o.fase);
}

// dove appoggia la schiena, sulla parte corta della L
const POSTO = { x: 30, y: 6 };

/* --------------------------------------------------------------------------
   SCENA — il salotto: pavimento, le due pareti di fondo, il divano
   -------------------------------------------------------------------------- */
const TINTE = {
  pavimento: { chiaro:'#8b6c4c', scuro:'#7b5d40', fuga:'#654a33' },
  parete:    { sinistra:'#43392f', destra:'#5b4d3f', cima:'#6f5e4c', filo:'#8a7660' },
  divano:    { sinistra:'#5a3129', destra:'#7b463a', cima:'#8d5546', filo:'#a3headers' },
  tavolino:  { sinistra:'#4a3628', destra:'#63472f', cima:'#7a5836', filo:'#8f6a44' },
  tappeto:   { chiaro:'#7d5544', scuro:'#6d4739' }
};
TINTE.divano.filo = '#a3695a';

const COL = 7, RIG = 7;

function scena(P, opz){
  const o = Object.assign({ fase: 0, colonna: 3, riga: 3, occhialiAlzati: false, azione: null }, opz);

  // pareti di fondo, costruite con la stessa primitiva dell'arredo
  scatola(P, 0, -1, COL - 1, -1, MURO_A, TINTE.parete);
  scatola(P, -1, 0, -1, RIG - 1, MURO_A, TINTE.parete);

  pavimento(P, COL, RIG, TINTE.pavimento);

  // tappeto sotto i piedi
  for (let r = 2; r <= 4; r++)
    for (let c = 2; c <= 4; c++)
      piastrella(P, c, r, (c + r) % 2 === 0 ? TINTE.tappeto.chiaro : TINTE.tappeto.scuro);

  // il divano: spalliera contro la parete, seduta davanti
  scatola(P, 0, 1, 0, 3, 17, TINTE.divano);
  scatola(P, 1, 1, 1, 3,  7, TINTE.divano);
  scatola(P, 4, 4, 5, 5,  6, TINTE.tavolino);

  personaggio(P, o.colonna, o.riga, { fase: o.fase, occhialiAlzati: o.occhialiAlzati, azione: o.azione });
  atmosfera(P);
}

/* Luce e ombra sopra ogni cosa: e' quello che tiene insieme la scena.
   Un alone caldo al centro, i bordi che si spengono. */
function atmosfera(P){
  const centro = vertice(3, 3);
  for (let anello = 5; anello >= 1; anello--){
    const rx = anello * 34, ry = anello * 17;
    poligono(P, [
      [centro[0], centro[1] - ry], [centro[0] + rx, centro[1]],
      [centro[0], centro[1] + ry], [centro[0] - rx, centro[1]]
    ], anello > 3 ? 'rgba(10,6,14,0.10)' : 'rgba(255,206,140,0.045)');
  }
}

/* -------------------------------------------------------------------------- */
const API = { C, SPR, CORPO, LARG_PERS, ALT_PERS, TILE_L, TILE_A, MURO_A, COL, RIG,
              proietta, vertice, poligono, piastrella, scatola,
              scena, personaggio, attore, pavimento, sprite, ombreggia, TINTE,
              SVAPO, SBUFFO, TELEFONATA, BATTUTE, fasiSvapo, fumo, fumetto, passiDi, GLIFI,
              tingiPelle, mescola, cigliaArrabbiate, sbuffiRabbia, PELLE_ROSSA,
              PIGIAMA, PEZZI_P, polvere, sdraiato, semiSdraiato, gerardoSdraiato, ellisse, capsula,
              dormeOrizzontale, palloncino, salotto, televisore, spriteGirato, ARREDO, POSTO };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.ARTE = API;

})(typeof self !== 'undefined' ? self : this);






























