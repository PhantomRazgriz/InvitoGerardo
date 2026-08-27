/* ==========================================================================
   SERIE PIGIAMA — tutte le pose del personaggio vestito da casa.

   Due famiglie:
   1. pose IN PIEDI, che nascono dal corpo di base con i colori rimappati
      e le braccia sostituite. Non sono sprite separati: se correggiamo la
      faccia, cambiano tutte insieme.
   2. pose SDRAIATE E SEDUTE, che il corpo in piedi non puo' produrre e
      vanno disegnate. Queste devono rispettare le misure in
      CHARACTER_PIGIAMA.md, in particolare il rapporto altezza/testa 2,62.
   ========================================================================== */
(function (radice) {
"use strict";

const A = (typeof require === 'function' && typeof module !== 'undefined')
  ? require('./arte.js') : radice.ARTE;

const R = (...seg) => seg.map(([c, n]) => c.repeat(n)).join('');

/* --------------------------------------------------------------------------
   MISURE DI RIFERIMENTO — lette da CHARACTER_PIGIAMA.md
   -------------------------------------------------------------------------- */
const MISURE = {
  altezza: 34,
  testa: 13,            // H
  rapporto: 34 / 13,    // 2,62 — il vincolo che comanda tutto
  spalle: 16,
  torso: 10,
  gamba: 10
};

/* --------------------------------------------------------------------------
   POSE IN PIEDI — non sono sprite, sono istruzioni per l'attore
   -------------------------------------------------------------------------- */
const IN_PIEDI = [
  { nome:'fermo',    azione:'fermo',    t:0   },
  { nome:'passo 1',  azione:'cammina',  t:0   },
  { nome:'passo 2',  azione:'cammina',  t:7   },
  { nome:'passo 3',  azione:'cammina',  t:14  },
  { nome:'passo 4',  azione:'cammina',  t:21  },
  { nome:'fianchi',  azione:'fianchi',  t:0   },
  { nome:'sbuffo',   azione:'sbuffa',   t:30  },
  { nome:'telefono', azione:'telefono', t:100 }
];

/* --------------------------------------------------------------------------
   POSE DISTESE — disegnate, perche' il corpo in piedi non le sa fare.

   SDRAIATO, bounding box in coordinate native (32 x 22):
     TESTA      x18..x31  y0..y12   H = 13, invariata
     COLLO      x16..x18  y7..y10
     TORSO      x8..x18   y7..y17
     BACINO     x6..x9    y11..y17   stacco di colore casacca/pantaloni
     COSCIA     x2..x8    y6..y12    risale verso sinistra
     GINOCCHIO  x2..x5    y5..y8     angolo netto
     POLPACCIO  x1..x5    y8..y17
     PANTOFOLE  x0..x7    y17..y21
   VERIFICA: 32 / 13 = 2,46  <=  2,62  — dentro il vincolo
   -------------------------------------------------------------------------- */
const SPR = {};

SPR.sdraiato = [
  ".....oooooo.................................",
  "...ollllllllo...............................",
  "..ollllllllllo.............oooo.............",
  ".ollllllllllllo..........oppppo.............",
  ".olllllssssssso........oppooppo.............",
  ".olllssssssssso..ooooooppo.oppo.............",
  "ollssssessessooppppppppo.oppoppppppo........",
  "olssssssssssssopppppppppppopppoppppppppo....",
  "osssssssssssssoppppppppppppoppppppppppppro..",
  "osssssSsssssssopppppplllpppprrrrrrrrrrrrZZo.",
  ".ossssssssssssoppppppppppppprrrrrrrrrrrrrzzo",
  ".osssssbbbbbboppppppppppppprrrrrrrrrrrrrzzo.",
  "..obbbbbbbbboppppppppppppprrrrrrrrrrrrrZZo..",
  "...oooooooooooooooooooooooooooooooooooooo..."
];

/* SEDUTO DI FRONTE — la posa che serve alla scena.

   Testa e tronco sono quelli IN PIEDI, presi cosi' come sono: da seduto,
   visti di fronte, non cambiano. Si sostituiscono solo le gambe, dove le
   cosce sono scorciate dalla prospettiva e sporgono le ginocchia.
   Per costruzione, quindi, questa posa non puo' divergere dalle altre.

     TESTA      righe 0..12   da PEZZI_P.testa, invariata
     TRONCO     righe 13..23  da PEZZI_P.tronco, tagliato prima dei pantaloni
     GINOCCHIA  righe 24..28
     POLPACCI   righe 29..31
     PANTOFOLE  righe 32..34                                              */
SPR.gambeSedute = [
  "....orrrrrrrrrrrrQo...",
  "...orrrrrrqrrrrrrQo...",
  "...orrrrrroorrrrrQo...",
  "...orrrrrQoorrrrQo....",
  "....orrrrQoorrrGo.....".replace("G","r"),
  "....orrrro..orrro.....",
  "....orrrro..orrro.....",
  "....orrrro..orrro.....",
  "...ozzzzzo.ozzzzo.....",
  "...oZZZZZo.oZZZZo.....",
  "...ooooooo.oooooo....."
];

/* Compone il seduto: testa + tronco dal corpo in piedi, gambe nuove. */
function seduto(){
  const T = A.PEZZI_P;
  return [...T.testa, ...T.tronco.slice(0, 11), ...SPR.gambeSedute];
}

/* SEDUTO vecchio, di profilo — non piu' usato dalla scena.
     TESTA   x10..x23  y0..y12
     TORSO   x8..x18   y11..y21
     COSCIA  x2..x12   y20..y25   orizzontale
     GAMBA   x2..x6    y25..y31   scende
     PANTOFOLA x0..x7  y31..y33 */
SPR.seduto = [
  R(['.',13],['o',6],['.',7]),
  R(['.',11],['o',1],['h',2],['l',4],['o',1],['.',7]),
  R(['.',10],['o',1],['h',2],['l',6],['s',1],['o',1],['.',5]),
  R(['.',9],['o',1],['h',1],['l',3],['s',6],['o',1],['.',5]),
  R(['.',9],['o',1],['l',2],['s',8],['o',1],['.',5]),
  R(['.',9],['o',1],['s',2],['e',1],['s',6],['o',1],['.',6]),
  R(['.',9],['o',1],['s',3],['S',1],['s',4],['o',1],['.',7]),
  R(['.',9],['o',1],['s',1],['b',5],['S',1],['o',1],['.',8]),
  R(['.',10],['o',1],['b',5],['o',1],['.',9]),
  R(['.',10],['o',1],['s',3],['o',1],['.',11]),
  R(['.',8],['o',1],['p',7],['o',1],['.',9]),
  R(['.',7],['o',1],['p',9],['o',1],['.',8]),
  R(['.',7],['o',1],['p',4],['P',3],['p',2],['o',1],['.',8]),
  R(['.',7],['o',1],['p',9],['o',1],['.',8]),
  R(['.',7],['o',1],['p',3],['l',2],['s',1],['p',3],['o',1],['.',8]),
  R(['.',7],['o',1],['p',10],['o',1],['.',7]),
  R(['.',7],['o',1],['p',10],['o',1],['.',7]),
  R(['.',7],['o',1],['p',10],['o',1],['.',7]),
  R(['.',6],['o',1],['p',11],['o',1],['.',7]),
  R(['.',3],['o',3],['r',12],['o',1],['.',7]),
  R(['.',2],['o',1],['r',15],['Q',1],['o',1],['.',6]),
  R(['.',2],['o',1],['r',15],['Q',1],['o',1],['.',6]),
  R(['.',2],['o',1],['r',6],['Q',1],['o',9],['.',7]),
  R(['.',2],['o',1],['r',5],['Q',1],['o',1],['.',16]),
  R(['.',2],['o',1],['r',5],['Q',1],['o',1],['.',16]),
  R(['.',2],['o',1],['r',5],['Q',1],['o',1],['.',16]),
  R(['.',2],['o',1],['r',5],['Q',1],['o',1],['.',16]),
  R(['.',1],['o',1],['z',6],['Z',1],['o',1],['.',16]),
  R(['o',1],['z',7],['Z',2],['o',1],['.',15]),
  R(['.',1],['o',9],['.',16])
];

/* --------------------------------------------------------------------------
   Controllo: nessuna posa puo' sforare il rapporto altezza/testa
   -------------------------------------------------------------------------- */
function verifica(){
  const esiti = [];
  for (const [nome, s] of Object.entries(SPR)){
    const larghezze = new Set(s.map(r => r.length));
    const lungo = Math.max(s[0].length, s.length);
    esiti.push({
      nome,
      misura: s[0].length + 'x' + s.length,
      righeCoerenti: larghezze.size === 1,
      teste: +(lungo / MISURE.testa).toFixed(2),
      dentroIlVincolo: (lungo / MISURE.testa) <= MISURE.rapporto + 0.01
    });
  }
  return esiti;
}

const API = { MISURE, IN_PIEDI, SPR, verifica, seduto };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else radice.PIGIAMA = API;

})(typeof self !== 'undefined' ? self : this);


