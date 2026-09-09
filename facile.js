/* ==========================================================================
   TERZA SCENA — "per lui e' tutto facile"

   Tre giri con lo stesso schema: entra il problema, lui pesca il pezzo
   giusto da una scatola, nuvola di polvere, "Voilàt", risolto.
   La ripetizione identica e' cio' che fa ridere; il terzo giro rompe la
   scala, non lo schema.

   1. una sedia con la gamba spezzata
   2. un muro costruito a metà
   3. la Torre di Pisa, che pende

   Gli oggetti non sono disegnati due volte in due stati: hanno un parametro
   di completezza fra 0 e 1, cosi' la riparazione e' un'animazione e non uno
   scambio di immagini.
   ========================================================================== */
(function (radice) {
"use strict";

const A = (typeof require === 'function' && typeof module !== 'undefined')
  ? require('./arte.js') : radice.ARTE;

const LARG = 88, ALT = 68, SUOLO = 58;

const T = {
  fondo:'#0b0a09',
  legno:'#7a4b28', legnoLuce:'#96613a', legnoOmbra:'#553219', legnoCupo:'#3a2211',
  mattone:'#8a5340', mattoneLuce:'#a3684f', mattoneOmbra:'#5e372a', calce:'#c4b8a4',
  pietra:'#c9bfa6', pietraLuce:'#ded5bd', pietraOmbra:'#9a8f76', pietraCupo:'#6e6553',
  scatola:'#6b5136', scatolaLuce:'#82653f', scatolaOmbra:'#4a3724',
  metallo:'#8a8f99', metalloLuce:'#a8adb8', metalloOmbra:'#5c616b',
  acqua:'#4a7ba8', acquaLuce:'#6fa3cc', fascetta:'#b09a2e',
  // la seconda persona: entra spenta, esce da operaio
  tuta:'#54524d', tutaLuce:'#6b6963', tutaOmbra:'#3a3835',
  capelli:'#4a3b2e', capelliLuce:'#635043',
  gilet:'#e07a2c', giletLuce:'#f29a45', giletOmbra:'#a8541a',
  casco:'#e8e2d0', cascoLuce:'#ffffff', cascoOmbra:'#b0aa98',
  attrezzo:'#d8c24a'
};

const rett = (P, x, y, w, h, c) => {
  for (let iy = 0; iy < h; iy++)
    for (let ix = 0; ix < w; ix++) P.punto(x + ix, y + iy, c);
};

/* --------------------------------------------------------------------------
   1. IL TUBO CHE PERDE
   La sedia non funzionava: a questa scala una sedia e' fatta di aste da un
   pixel e non si legge come sedia. Un tubo con la goccia si riconosce dalla
   silhouette, e la riparazione si vede da lontano: la goccia smette.
   -------------------------------------------------------------------------- */
function tubo(P, x, y, q, t){
  const perde = q < 0.6;

  // il tubo verticale che scende dall'alto, poi la curva e il rubinetto
  rett(P, x + 6, y - 30, 5, 22, T.metallo);
  rett(P, x + 6, y - 30, 2, 22, T.metalloLuce);
  rett(P, x + 10, y - 30, 1, 22, T.metalloOmbra);
  // flangia a metà: dà scala e dice "tubo" invece di "asta"
  rett(P, x + 4, y - 22, 9, 3, T.metalloOmbra);
  rett(P, x + 4, y - 22, 9, 1, T.metalloLuce);
  // gomito e bocchetta
  rett(P, x + 6, y - 10, 10, 5, T.metallo);
  rett(P, x + 6, y - 10, 10, 2, T.metalloLuce);
  rett(P, x + 14, y - 8, 4, 6, T.metalloOmbra);

  // la fascetta con cui la ripara: compare quando e' sistemato
  if (!perde){
    rett(P, x + 4, y - 14, 9, 3, T.fascetta);
    rett(P, x + 4, y - 14, 9, 1, '#d8c24a');
  }

  if (perde){
    // la goccia cade e la pozza si allarga
    const g = (t % 46) / 46;
    const gy = y - 2 + Math.round(g * 12);
    P.punto(x + 15, gy, T.acqua);
    P.punto(x + 15, gy + 1, T.acquaLuce);
    const largo = 8 + Math.round((1 - q) * 6);
    rett(P, x + 15 - largo / 2, y + 11, largo, 2, T.acqua);
    rett(P, x + 15 - largo / 2 + 1, y + 11, largo - 2, 1, T.acquaLuce);
  }
}

/* --------------------------------------------------------------------------
   2. IL MURO — la completezza e' quante file di mattoni sono state posate
   -------------------------------------------------------------------------- */
function muro(P, x, y, q){
  const file = 11, posate = Math.round(file * (0.42 + 0.58 * q));
  for (let f = 0; f < posate; f++){
    const yy = y - f * 3;
    const sfalso = (f % 2) * 5;
    for (let m = 0; m < 3; m++){
      const mx = x + sfalso + m * 10;
      if (mx > x + 26) continue;
      const largo = Math.min(9, x + 27 - mx);
      rett(P, mx, yy, largo, 2, f === posate - 1 ? T.mattoneLuce : T.mattone);
      rett(P, mx, yy + 2, largo, 1, T.calce);
    }
    if (sfalso) rett(P, x, yy, 4, 2, T.mattoneOmbra);
  }
  // i mattoni ancora da posare, in terra accanto
  if (q < 0.9){
    const restano = Math.round((1 - q) * 4);
    for (let i = 0; i < restano; i++)
      rett(P, x + 29 + (i % 2) * 5, y + 14 - Math.floor(i / 2) * 3, 8, 2, T.mattoneOmbra);
  }
}

/* --------------------------------------------------------------------------
   3. LA TORRE — un solo disegno. La pendenza e' un parametro: cosi' il
   raddrizzamento e' un'animazione, non uno scambio di immagini.
   -------------------------------------------------------------------------- */
function torre(P, x, y, pendenza){
  const alt = 46, largo = 14;
  for (let i = 0; i < alt; i++){
    const yy = y - i;
    const spinta = Math.round(pendenza * (i / alt) * 9);   // pende verso destra
    const piano = i % 7;
    const xx = x + spinta;

    rett(P, xx, yy, largo, 1, piano === 0 ? T.pietraOmbra : T.pietra);
    P.punto(xx, yy, T.pietraLuce);                          // spigolo in luce
    P.punto(xx + largo - 1, yy, T.pietraCupo);              // spigolo in ombra
    // le colonnine degli ordini
    if (piano > 1 && piano < 6)
      for (let c = 2; c < largo - 2; c += 3) P.punto(xx + c, yy, T.pietraCupo);
  }
  // la cella campanaria in cima
  const cima = Math.round(pendenza * 9);
  rett(P, x + cima + 2, y - alt - 4, largo - 4, 4, T.pietraLuce);
  rett(P, x + cima + 4, y - alt - 6, 2, 2, T.pietraOmbra);
  // base
  rett(P, x - 1, y + 1, largo + 2, 2, T.pietraOmbra);
}

/* --------------------------------------------------------------------------
   LA SECONDA PERSONA
   Stessa struttura del corpo di Gerardo, cosi' appartiene allo stesso mondo,
   ma con i capelli e una tuta spenta al posto della testa pelata. Entra
   curva e grigia; esce con caschetto, gilet e la schiena dritta.

   Il cambio di postura conta piu' del cambio d'abito: da triste ha le spalle
   basse e la testa incassata, da operaio si raddrizza di due pixel.
   -------------------------------------------------------------------------- */
function persona(P, x, y, operaio, t, cammina){
  const su = cammina ? ((Math.floor(t / 7) % 2) ? -1 : 0) : 0;
  const curvo = operaio ? 0 : 2;                    // di quanto e' incassato
  const c = {
    pelle:'#d6a184', pelleLuce:'#ecc0a6', pelleOmbra:'#a8755a',
    tuta: operaio ? T.tuta : T.tuta,
    luce: operaio ? T.tutaLuce : T.tutaOmbra
  };
  const ty = y - 30 + curvo + su;                   // testa
  const by = y - 19 + curvo + su;                   // busto

  // gambe, sempre uguali
  rett(P, x + 3, y - 8, 4, 8, T.tutaOmbra);
  rett(P, x + 9, y - 8, 4, 8, T.tutaOmbra);
  rett(P, x + 2, y, 6, 2, '#2e2c29');
  rett(P, x + 8, y, 6, 2, '#2e2c29');

  // busto
  rett(P, x + 2, by, 12, 12, c.tuta);
  rett(P, x + 2, by, 12, 2, c.luce);
  rett(P, x + 2, by + 10, 12, 2, T.tutaOmbra);
  if (operaio){                                      // il gilet
    rett(P, x + 2, by + 2, 12, 7, T.gilet);
    rett(P, x + 2, by + 2, 12, 1, T.giletLuce);
    rett(P, x + 6, by + 2, 4, 7, c.tuta);            // apertura davanti
    rett(P, x + 2, by + 6, 12, 2, T.giletOmbra);     // banda riflettente
    rett(P, x + 2, by + 6, 12, 1, '#f6e6b0');
  }

  // braccia: da triste pendono, da operaio una sta sul fianco
  rett(P, x, by + 1, 2, 9, c.tuta);
  rett(P, x + 14, by + 1, 2, operaio ? 6 : 9, c.tuta);
  if (operaio){ rett(P, x + 14, by + 7, 3, 2, c.tuta); rett(P, x + 13, by + 9, 2, 2, c.pelle); }
  else { rett(P, x, by + 10, 2, 2, c.pelle); rett(P, x + 14, by + 10, 2, 2, c.pelle); }

  // testa
  rett(P, x + 3, ty, 10, 11, c.pelle);
  rett(P, x + 3, ty + 1, 4, 8, c.pelleLuce);
  rett(P, x + 12, ty + 1, 1, 9, c.pelleOmbra);
  if (operaio){
    rett(P, x + 2, ty - 3, 12, 4, T.casco);          // caschetto
    rett(P, x + 2, ty - 3, 12, 1, T.cascoLuce);
    rett(P, x + 1, ty + 1, 14, 2, T.casco);          // visiera
    rett(P, x + 1, ty + 2, 14, 1, T.cascoOmbra);
  } else {
    rett(P, x + 3, ty - 2, 10, 4, T.capelli);        // capelli
    rett(P, x + 4, ty - 2, 5, 1, T.capelliLuce);
  }
  // occhi e bocca: la piega della bocca e' tutto quello che serve
  const oy = ty + 5;
  P.punto(x + 5, oy, '#3a2a22'); P.punto(x + 10, oy, '#3a2a22');
  if (operaio){
    P.punto(x + 6, oy + 3, '#8a4b46'); P.punto(x + 7, oy + 4, '#8a4b46');
    P.punto(x + 8, oy + 4, '#8a4b46'); P.punto(x + 9, oy + 3, '#8a4b46');
  } else {
    P.punto(x + 6, oy + 4, '#8a4b46'); P.punto(x + 7, oy + 3, '#8a4b46');
    P.punto(x + 8, oy + 3, '#8a4b46'); P.punto(x + 9, oy + 4, '#8a4b46');
  }
}

/* --------------------------------------------------------------------------
   LA SCATOLA DEI PEZZI — quella da cui esce sempre il ricambio giusto,
   perche' ce l'aveva. Da trent'anni.
   -------------------------------------------------------------------------- */
function scatola(P, x, y, aperta){
  rett(P, x, y, 15, 9, T.scatola);
  rett(P, x, y, 15, 2, T.scatolaLuce);
  rett(P, x, y + 7, 15, 2, T.scatolaOmbra);
  if (aperta){
    rett(P, x + 1, y - 3, 13, 3, T.scatolaOmbra);      // coperchio alzato
    rett(P, x + 3, y - 6, 2, 4, T.attrezzo);           // spunta il metro giallo
    rett(P, x + 8, y - 5, 3, 3, '#7a7f8c');
  } else {
    rett(P, x, y - 2, 15, 2, T.scatolaLuce);
  }
}

/* --------------------------------------------------------------------------
   LA SEQUENZA — a passi, non a tempo.

   Ogni passo ha la sua animazione: la compie e poi ASPETTA il tocco.
   Cosi' il ritmo lo decide chi guarda, e la battuta non scappa a chi legge
   piano. La regola del tre resta: e' l'attesa fra i passi a costruirla.
   -------------------------------------------------------------------------- */
const PASSI = [
  { frase:0 },                                                    // solo il testo
  { cosa:'tubo',  modo:'entra',  durata:52, frase:1 },
  { cosa:'tubo',  modo:'ripara', durata:96 },
  { cosa:'muro',  modo:'entra',  durata:48, frase:2 },
  { cosa:'muro',  modo:'ripara', durata:88 },
  // qui il problema non e' un oggetto: e' una persona
  { cosa:'persona', modo:'entra',  durata:70, frase:3 },
  { cosa:'persona', modo:'ripara', durata:168, frase:4, ritardoFrase:96 },
  { cosa:'torre', modo:'entra',  durata:60, frase:5 },
  { cosa:'torre', modo:'ripara', durata:110, frase:6, ritardoFrase:70 },
  /* Il congedo. Serve a togliere lui di scena prima di parlare della festa:
     finche' e' inquadrato, l'invito resta una cosa che riguarda lui, e le
     informazioni pratiche non sono per lui. Se ne va di sua volonta', con
     l'unica parola che avrebbe detto davvero. */
  { cosa:'congedo', modo:'esce', durata:150, frase:7 }
];

const X_POSTO = 52;          // dove si fermano gli oggetti
const morbido = q => q * q * (3 - 2 * q);

/* Stato del disegno per un dato passo e per il tempo trascorso dentro
   quel passo. Se t supera la durata resta fermo sul fotogramma finale. */
function stato(passo, t){
  const p = PASSI[Math.max(0, Math.min(PASSI.length - 1, passo))];
  const vuoto = { cosa:null, xOgg:200, q:1, pesca:false, polvere:-1, durataPolvere:1,
                  dice:false, finito:true };
  if (!p.cosa) return Object.assign(vuoto, { finito: true });

  const fine = t >= p.durata;

  /* Gli si dice che deve andare via: ci pensa un attimo, non discute, e
     se ne va camminando verso destra. Il "vabbuo'" arriva dopo una pausa,
     perche' e' una resa, non una risposta pronta. */
  if (p.cosa === 'congedo'){
    const parlaDa = 26, parlaA = 70, partenza = 76;
    const camm = t > partenza
      ? Math.min(1, (t - partenza) / (p.durata - partenza)) : 0;
    return Object.assign({}, vuoto, {
      diceLui: (t >= parlaDa && t < parlaA) ? "VABBUO'" : false,
      // passo costante: chi se ne va non rallenta arrivando al bordo, e con
      // l'attenuazione morbida sembrava ripensarci proprio mentre usciva
      xLui: 22 + camm * 82,
      camminaLui: camm > 0 && camm < 1,
      finito: fine
    });
  }

  if (p.modo === 'entra'){
    const q = Math.min(1, t / p.durata);
    return { cosa:p.cosa, xOgg: 96 - morbido(q) * (96 - X_POSTO), q:0,
             pesca:false, polvere:-1, durataPolvere:1,
             // la persona, arrivata, dice la sua
             dice: p.cosa === 'persona' && q > 0.9 ? 'SONO TRISTE' : false,
             cammina: q < 0.98, finito: fine };
  }

  /* La persona non si "ripara" come un tubo: Gerardo dice una parola,
     poi la nuvola, e ne esce vestito da lavoro. Il tempo e' piu' lungo
     perche' la battuta ha bisogno di stare in piedi da sola. */
  if (p.cosa === 'persona'){
    const parla = 26, nuvolaDa = 46, nuvolaA = 92;
    const q = t < nuvolaDa ? 0 : Math.min(1, (t - nuvolaDa) / (nuvolaA - nuvolaDa));
    return {
      cosa:'persona', xOgg: X_POSTO, q,
      pesca:false,
      polvere: (t >= nuvolaDa && t < nuvolaA) ? t - nuvolaDa : -1,
      durataPolvere: nuvolaA - nuvolaDa,
      diceLui: t >= parla && t < nuvolaDa + 8 ? 'LAVORA' : false,
      dice:false,
      // sistemato, se ne va felice verso destra
      // resta in vista un momento da operaio, prima di andarsene
      esce: t > nuvolaA + 46 ? Math.min(1, (t - nuvolaA - 46) / 40) : 0,
      cammina: t > nuvolaA + 46,
      finito: fine
    };
  }

  // modo "ripara": pesca il pezzo, nuvola, e sotto la nuvola si sistema
  const inizioPolvere = 22, finePolvere = p.durata - 18;
  const q = t < inizioPolvere ? 0
          : Math.min(1, (t - inizioPolvere) / (finePolvere - inizioPolvere));
  return {
    cosa: p.cosa, xOgg: X_POSTO, q,
    pesca: t < inizioPolvere + 8,
    polvere: (t >= inizioPolvere && t < finePolvere) ? t - inizioPolvere : -1,
    durataPolvere: finePolvere - inizioPolvere,
    dice: t >= finePolvere - 6,
    finito: fine
  };
}

const API = { LARG, ALT, SUOLO, T, PASSI, X_POSTO, stato, tubo, muro, torre, scatola, persona, rett };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.FACILE = API;

})(typeof self !== 'undefined' ? self : this);


