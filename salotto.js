/* ==========================================================================
   IL SALOTTO — inquadratura da DIETRO la televisione.

   La telecamera sta alle spalle del televisore. In basso, per un terzo
   dello schermo, si vede la sagoma scura del suo retro, controluce; oltre,
   il divano di fronte e lui seduto.

   Perche' questa inquadratura risolve tutto:
   - il personaggio e' SEDUTO DI FRONTE, quindi riusa testa e tronco della
     figura in piedi senza reinventare nulla
   - il retro della TV in primo piano crea profondita' con un solo elemento
   - la luce dello schermo che sfugge ai bordi illumina la scena da davanti,
     ed e' un motivo credibile perche' tutto il resto sia in penombra
   ========================================================================== */
(function (radice) {
"use strict";

const LARG = 124, ALT = 104;
const SOFFITTO = 8;
const MURO = 74;                   // dove la parete incontra il pavimento
const SEDUTA = 62;                 // piano della seduta del divano
const TV_CIMA = 68;                // dove comincia la sagoma della TV: 1/3 in basso

const T = {
  soffitto:'#4e4239', muroAlto:'#453b33', muro:'#3c332c', muroBasso:'#332c26',
  battisc:'#26211c', spigolo:'#5a4e43',

  pavA:'#422517', pavB:'#381f14', pavC:'#4b2a1a', pavD:'#301a11', pavBordo:'#22120a',

  divano:'#6f4c33', divanoTop:'#87603b', divanoLato:'#553827', divanoCupo:'#35231818'.slice(0,7),
  seduta:'#7d5738', sedutaTop:'#946b45',
  cuscino:'#6f8a52', cuscinoTop:'#87a566', cuscinoFiore:'#c9dbb2',

  mobile:'#151413', mobileTop:'#232120',
  tvRetro:'#0d0d0f', tvRetroLuce:'#1b1c20', tvBordo:'#2c2f36',
  tavolo:'#191817', tavoloTop:'#2b2927',

  mensola:'#3f2c1e', mensolaTop:'#553c28',
  quadro:'#332419', quadroInt:'#5c4c39',
  pianta:'#365429', piantaLuce:'#456b34', vaso:'#6b4029',
  paralume:'#c4a86a'
};
T.divanoCupo = '#352318';

const rett = (P, x, y, w, h, c) => {
  for (let iy = 0; iy < h; iy++)
    for (let ix = 0; ix < w; ix++) P.punto(x + ix, y + iy, c);
};
function cima(P, x, y, w, prof, c){
  for (let i = 0; i < prof; i++) rett(P, x + i, y - Math.round(i / 2), w, 1, c);
}
function disco(P, cx, cy, rx, ry, c){
  for (let y = -ry; y <= ry; y++)
    for (let x = -rx; x <= rx; x++)
      if ((x*x)/(rx*rx) + (y*y)/(ry*ry) <= 1) P.punto(cx + x, cy + y, c);
}

/* -------------------------------------------------------------------------- */
function pareti(P){
  rett(P, 0, 0, LARG, ALT, T.muro);
  rett(P, 0, 0, LARG, SOFFITTO, T.soffitto);
  rett(P, 0, SOFFITTO, LARG, 1, T.spigolo);
  rett(P, 0, SOFFITTO + 1, LARG, 14, T.muroAlto);
  rett(P, 0, MURO - 12, LARG, 12, T.muroBasso);
  rett(P, 0, MURO - 3, LARG, 3, T.battisc);
  rett(P, 0, MURO - 4, LARG, 1, T.spigolo);
}

function pavimento(P){
  const tinte = [T.pavA, T.pavB, T.pavC, T.pavD];
  for (let r = 0; r < ALT - MURO; r++){
    const y = MURO + r;
    const passo = 10 + Math.round(r * 0.45);
    for (let x = 0; x < LARG; x++){
      const l = Math.floor((x + r * 4) / passo);
      P.punto(x, y, tinte[Math.abs(l * 5 + r) % 4]);
    }
    for (let x = -passo; x < LARG + passo; x += passo)
      P.punto(Math.round(x - (r * 4) % passo), y, T.pavBordo);
  }
}

function quadro(P, x, y, w, h){
  rett(P, x, y, w, h, T.quadro);
  rett(P, x + 1, y + 1, w - 2, h - 2, T.quadroInt);
}

function mensola(P, x, y, w){
  rett(P, x, y, w, 2, T.mensola);
  rett(P, x, y, w, 1, T.mensolaTop);
  let cx = x + 1;
  const tinte = ['#6b3830','#38505e','#5e5029','#42345000'.slice(0,7),'#4e5c38'];
  for (let i = 0; cx < x + w - 2; i++){
    const h = 3 + (i * 3) % 4, w2 = 1 + (i % 2);
    rett(P, cx, y - h, w2, h, tinte[i % 5]);
    cx += w2 + 1;
  }
}

function pianta(P, x, y){
  rett(P, x, y - 5, 7, 5, T.vaso);
  for (let i = 0; i < 7; i++){
    const a = -0.3 - i * 0.36, r = 4 + (i % 3) * 2;
    disco(P, x + 3 + Math.cos(a) * r, y - 6 + Math.sin(a) * r * 0.9, 2, 2,
          i % 2 ? T.pianta : T.piantaLuce);
  }
}

/* IL DIVANO, DI FRONTE. Su questo lui si siede. */
function divano(P, x){
  const w = 56, yTop = SEDUTA - 16;
  rett(P, x, yTop, w, 16, T.divanoLato);                 // schienale
  rett(P, x, yTop, w, 2, T.divanoTop);
  for (let i = 1; i < 3; i++) rett(P, x + Math.round(i * w / 3), yTop + 2, 1, 14, T.divanoCupo);

  cima(P, x + 6, SEDUTA, w - 12, 5, T.sedutaTop);        // seduta
  rett(P, x + 6, SEDUTA, w - 12, 8, T.seduta);
  rett(P, x + 6, SEDUTA + 8, w - 12, 2, T.divanoCupo);

  for (const bx of [x, x + w - 7]){                      // braccioli
    rett(P, bx, SEDUTA - 7, 7, 15, T.divano);
    cima(P, bx, SEDUTA - 7, 7, 4, T.divanoTop);
  }
  rett(P, x + 4, SEDUTA + 10, 3, 4, T.divanoCupo);
  rett(P, x + w - 6, SEDUTA + 10, 3, 4, T.divanoCupo);
  for (let i = 0; i < 4; i++)
    rett(P, x + 2 - i, MURO + i, w - 4 + i * 2, 1, 'rgba(16,8,4,0.30)');
}

function cuscino(P, x, y){
  for (let i = 0; i < 12; i++){
    const cede = Math.round(Math.sin(i / 12 * Math.PI) * 2);
    rett(P, x + i, y + cede, 1, 9 - cede, T.cuscino);
    rett(P, x + i, y + cede, 1, 1, T.cuscinoTop);
  }
  for (let i = 0; i < 3; i++) P.punto(x + 2 + i * 4, y + 3 + (i % 2) * 3, T.cuscinoFiore);
}

function tavolino(P, x){
  const y = MURO + 5;
  disco(P, x + 9, y, 10, 3, T.tavolo);
  rett(P, x, y, 19, 4, T.tavolo);
  disco(P, x + 9, y - 2, 10, 3, T.tavoloTop);
}

/* --------------------------------------------------------------------------
   IL RETRO DELLA TELEVISIONE — primo piano, controluce.
   Occupa il terzo basso dello schermo. Non si vede lo schermo: si vede la
   luce che ne sfugge attorno, e quella luce e' cio' che illumina la stanza.
   -------------------------------------------------------------------------- */
function televisore(P, acceso, tremore, fase){
  const dy = tremore && acceso ? (fase % 5 < 2 ? 0 : 1) : 0;
  const x0 = 20, x1 = 104, alt = ALT - TV_CIMA;

  if (acceso){
    // Solo il filo di luce sul bordo superiore. L'alone largo NON si
    // disegna pixel per pixel: quattordici rettangoli semitrasparenti
    // grandi come lo schermo costavano 134.000 chiamate per fotogramma,
    // l'ottanta per cento di tutto il lavoro. Adesso lo fa la pagina con
    // un gradiente nativo, che e' una sola operazione.
    for (let i = 0; i < 4; i++)
      rett(P, x0 - 2 - i, TV_CIMA + dy - 1 - i, (x1 - x0) + 4 + i * 2, 1,
           'rgba(190,215,250,' + (0.18 - i * 0.04).toFixed(2) + ')');
  }

  // la sagoma scura del retro, con il bordo appena illuminato
  rett(P, x0, TV_CIMA + dy, x1 - x0, alt, T.tvRetro);
  rett(P, x0, TV_CIMA + dy, x1 - x0, 2, T.tvBordo);
  rett(P, x0, TV_CIMA + dy, 2, alt, T.tvRetroLuce);
  rett(P, x1 - 2, TV_CIMA + dy, 2, alt, T.tvRetroLuce);
  // le prese e le griglie di areazione sul dorso
  for (let i = 0; i < 6; i++)
    rett(P, x0 + 10 + i * 12, TV_CIMA + dy + 6, 6, 2, '#17181c');
  rett(P, x0 + 24, TV_CIMA + dy + 12, 18, 6, '#121316');
  rett(P, x0 + 27, TV_CIMA + dy + 14, 4, 2, '#2a2d34');
}

/* Il telecomando appoggiato sul bracciolo: un rettangolo scuro, basta. */
function telecomando(P, x, y){
  rett(P, x, y, 4, 2, '#141416');
  rett(P, x, y, 4, 1, '#2c2f36');
  P.punto(x + 1, y + 1, '#6b3a3a');
}

/* La barra del volume, come quella dei televisori: cornice, tacche che si
   riempiono, e il numero a destra. Sopra i 70 passa all'arancione, perche'
   e' il momento in cui la stanza comincia a tremare. */
const CIFRE = {
  '0':["ooo","o.o","o.o","o.o","ooo"], '1':[".o.","oo.",".o.",".o.","ooo"],
  '2':["ooo","..o","ooo","o..","ooo"], '3':["ooo","..o","ooo","..o","ooo"],
  '4':["o.o","o.o","ooo","..o","..o"], '5':["ooo","o..","ooo","..o","ooo"],
  '6':["ooo","o..","ooo","o.o","ooo"], '7':["ooo","..o","..o","..o","..o"],
  '8':["ooo","o.o","ooo","o.o","ooo"], '9':["ooo","o.o","ooo","..o","ooo"]
};

function numero(P, x, y, testo, colore){
  let cx = x;
  for (const ch of String(testo)){
    const g = CIFRE[ch];
    if (!g){ cx += 2; continue; }
    g.forEach((riga, ry) => {
      for (let rx = 0; rx < 3; rx++) if (riga[rx] === 'o') P.punto(cx + rx, y + ry, colore);
    });
    cx += 4;
  }
}

function barraVolume(P, valore, forza, scatto){
  if (forza <= 0) return;
  const x0 = 22, y0 = 7, w = 74, h = 9;
  const a = c => 'rgba(' + c + ',' + forza.toFixed(2) + ')';
  const caldo = valore >= 70;

  // cornice: ombra, bordo chiaro, fondo scuro
  rett(P, x0 - 1, y0 + 1, w + 4, h + 3, a('8,9,12'));
  rett(P, x0 - 2, y0 - 2, w + 4, h + 4, a('212,222,238'));
  rett(P, x0 - 1, y0 - 1, w + 2, h + 2, a('20,23,30'));

  // icona dell'altoparlante a sinistra
  const ix = x0 - 12, iy = y0 + 1;
  rett(P, ix + 2, iy + 2, 2, 3, a('212,222,238'));
  for (let i = 0; i < 3; i++) rett(P, ix + 4 + i, iy + 2 - i, 1, 3 + i * 2, a('212,222,238'));
  if (valore >= 40) rett(P, ix + 8, iy + 1, 1, 5, a('150,190,240'));
  if (valore >= 70) rett(P, ix + 10, iy, 1, 7, a('236,140,90'));

  // tacche
  const tacche = 18, piene = Math.round(valore / 100 * tacche + 0.001);
  for (let i = 0; i < tacche; i++){
    const su = i < piene;
    let col = '46,52,66';
    if (su) col = caldo ? (i > tacche - 6 ? '246,150,90' : '236,120,80') : '150,190,240';
    rett(P, x0 + 1 + i * 4, y0 + 1, 3, h - 2, a(col));
    if (su) rett(P, x0 + 1 + i * 4, y0 + 1, 3, 1, a(caldo ? '255,196,150' : '206,228,252'));
  }

  // il numero a destra, e un lampo quando premi
  const col = caldo ? '255,176,120' : '224,234,250';
  numero(P, x0 + w + 5, y0 + 2, valore, a(col));
  if (scatto) rett(P, x0 - 1, y0 - 1, w + 2, h + 2, a('255,255,255').replace(forza.toFixed(2), '0.10'));
}

/* La parte immobile della scena. Non cambia mai un pixel, quindi la pagina
   la disegna una volta sola e poi ne ricopia il risultato. */
function sfondo(P){
  pareti(P);
  quadro(P, 15, 16, 10, 9);
  quadro(P, 28, 14, 7, 11);
  mensola(P, 80, 24, 24);
  pavimento(P);
  pianta(P, 20, MURO - 1);
  divano(P, 34);
  cuscino(P, 39, SEDUTA - 10);
  cuscino(P, 77, SEDUTA - 10);
  tavolino(P, 88);
}

function disegna(P, opz){
  const o = Object.assign({ fase:0, tv:true, tremore:true }, opz);
  sfondo(P);
  televisore(P, o.tv, o.tremore, o.fase);
}

const API = { LARG, ALT, MURO, SEDUTA, SOFFITTO, TV_CIMA, T,
              disegna, sfondo, divano, televisore, tavolino, cuscino, telecomando, barraVolume, numero,
              rett, disco, cima,
              BRACCIOLO: { x: 36, y: SEDUTA - 8 },
              POSTO: { x: 53, y: SEDUTA - 25 } };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.SALOTTO = API;

})(typeof self !== 'undefined' ? self : this);









