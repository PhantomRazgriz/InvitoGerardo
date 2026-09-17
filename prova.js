/* ==========================================================================
   SELETTORE DELLE SCENE — solo per le prove, NON fa parte dell'invito

   Serve a saltare dritti alla scena che si sta lavorando, senza rifare
   ogni volta tutto il percorso dall'inizio.

   NON PUO' FINIRE NEL RILASCIO, per due ragioni indipendenti:

   1. Si spegne da solo. Compare soltanto se la pagina arriva da un
      indirizzo locale (localhost, 192.168.x, un file aperto a mano). Sul
      sito pubblicato l'elenco qui sotto non trova corrispondenza e lo
      script esce subito, senza toccare niente.
   2. Sta tutto in questo file. Per farlo sparire del tutto basta togliere
      la riga <script src="prova.js"> da index.html e cancellarlo.

   La prima ragione da sola basterebbe; la seconda c'e' perche' dimenticarsi
   di togliere una cosa e' la piu' facile delle sviste.

   Si puo' anche arrivare diritti a una scena con l'indirizzo, comodo dal
   telefono:   http://192.168.1.9:5173/?scena=mappa
   ========================================================================== */
(function(){
"use strict";

const LOCALE = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(location.hostname)
  || /^192\.168\./.test(location.hostname)
  || /^10\./.test(location.hostname)
  || /^172\.(1[6-9]|2\d|3[01])\./.test(location.hostname)
  || /^100\./.test(location.hostname)          // rete Tailscale
  || location.protocol === 'file:';

if (!LOCALE){
  // sul sito pubblicato non deve esistere: nessun pannello, nessun tasto
  return;
}

/* --------------------------------------------------------------------------
   I SALTI
   Ogni voce porta la scena nello stato in cui la si vuole guardare, non
   al suo inizio: le prove servono per il punto difficile, e il punto
   difficile sta quasi sempre in fondo.
   -------------------------------------------------------------------------- */
function scopri(){ document.getElementById('salta').style.display = ''; }

const SALTI = [
  ['1', 'buio', 'la prima scena dall\u2019inizio', () => {
    location.href = location.pathname;          // ripartire da zero: ricarico
  }],

  ['2', 'salotto', 'entra e accende la TV', () => {
    scopri(); entraInSalotto();
  }],
  ['3', 'volume 70', 'la TV che trema, subito', () => {
    scopri(); entraInSalotto(); tSalotto = SC.fineVolume - 1;
  }],

  ['4', 'facile', 'il tubo che perde', () => {
    scopri(); entraInFacile();
  }],
  ['5', 'torre', 'la Torre di Pisa', () => {
    scopri(); entraInFacile();
    passoFacile = 7; tPasso = 0; mostraFrase(window.FACILE.PASSI[7].frase);
  }],
  ['6', 'congedo', 'devi andare via / VABBUO\u2019', () => {
    scopri(); entraInFacile();
    const u = window.FACILE.PASSI.length - 1;
    passoFacile = u; tPasso = 0; mostraFrase(window.FACILE.PASSI[u].frase);
  }],

  ['7', 'mappa', 'i tre ingrandimenti', () => {
    scopri(); entraInMappa();
  }],
  ['8', 'arrivo', 'data e luogo a schermo', () => {
    scopri(); entraInMappa();
    livelloMappa = window.MAPPA.LIVELLI.length - 1;
    tMappa = fineAggancio();
    strettaLibera = false;
    mostraFrase(1);
  }],

  ['9', 'caduta', 'cade e sbotta', () => {
    scopri(); entraInCaduta();
  }],
  ['0', 'domanda', 'seduto, in attesa', () => {
    scopri(); entraInScelta(); tScelta = 80;
  }],
  ['s', 'ramo s\u00ec', 'coriandoli e ballo', () => {
    scopri(); entraInScelta(); tScelta = 80; premuto('si');
  }],
  ['n', 'ramo no', 'due rifiuti gi\u00e0 dati: il terzo apre la porta', () => {
    scopri(); entraInScelta(); tScelta = 80;
    rifiuti = 2; tRifiuto = 9999;
    document.getElementById('no').className = 'duro2';
    document.getElementById('testo').innerHTML = DOMANDE[2];
  }]
];

/* --------------------------------------------------------------------------
   IL PANNELLO
   Lo stile sta qui dentro e non nel foglio della pagina: cosi' l'invito
   non porta in giro regole che non gli servono.
   -------------------------------------------------------------------------- */
const stile = document.createElement('style');
stile.textContent = `
  #prova{
    /* sotto l'interruttore del suono, che sta nello stesso angolo */
    position:fixed; top:64px; left:10px; z-index:20;
    display:flex; flex-wrap:wrap; gap:4px; max-width:min(420px, 62vw);
    font:12px/1 system-ui, sans-serif;
  }
  #prova .capo{
    flex:0 0 100%; color:#6f6558; letter-spacing:.08em;
    text-transform:uppercase; font-size:10px; margin-bottom:2px;
  }
  #prova button{
    font:inherit; color:#b9ae9e; background:rgba(14,12,10,.86);
    border:1px solid #3a332c; border-radius:6px;
    padding:6px 8px; cursor:pointer;
  }
  #prova button:hover{ color:#f2ece2; border-color:#6d6153 }
  #prova button b{ color:#d9a93a; font-weight:700; margin-right:5px }
  #prova.chiuso .voce{ display:none }
`;
document.head.appendChild(stile);

const pannello = document.createElement('div');
pannello.id = 'prova';

const capo = document.createElement('div');
capo.className = 'capo';
capo.textContent = 'prove \u2014 non va online';
pannello.appendChild(capo);

const perTasto = new Map();
for (const [tasto, nome, aiuto, vai] of SALTI){
  const b = document.createElement('button');
  b.className = 'voce';
  b.innerHTML = '<b>' + tasto + '</b>' + nome;
  b.title = aiuto + '  (tasto ' + tasto + ')';
  b.addEventListener('click', e => { e.stopPropagation(); vai(); });
  // il tocco non deve arrivare alla scena sotto, o fa avanzare il racconto
  b.addEventListener('pointerdown', e => e.stopPropagation());
  pannello.appendChild(b);
  perTasto.set(tasto, vai);
}

const chiudi = document.createElement('button');
chiudi.innerHTML = '<b>\u00b7</b>';
chiudi.title = 'mostra o nasconde l\u2019elenco';
chiudi.addEventListener('pointerdown', e => e.stopPropagation());
chiudi.addEventListener('click', e => {
  e.stopPropagation();
  pannello.classList.toggle('chiuso');
});
pannello.insertBefore(chiudi, capo.nextSibling);

document.body.appendChild(pannello);

/* I tasti: provare a mano con il mouse, dieci volte di fila, e' la ragione
   per cui poi non si prova piu'. */
addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  const vai = perTasto.get(e.key.toLowerCase());
  if (!vai) return;
  e.preventDefault();
  e.stopPropagation();
  vai();
}, true);          // in cattura: prima che la pagina legga il tasto

/* L'indirizzo con ?scena=nome, per arrivarci diritti dal telefono. */
const chiesta = new URLSearchParams(location.search).get('scena');
if (chiesta){
  const trovata = SALTI.find(([tasto, nome]) =>
    tasto === chiesta || nome.toLowerCase().replace(/\s+/g, '') === chiesta.toLowerCase());
  // la prima voce ricarica la pagina: saltarla evita un giro infinito
  if (trovata && trovata[1] !== 'buio') setTimeout(trovata[3], 60);
}

console.log('%cselettore delle scene attivo', 'color:#d9a93a');
console.log('  tasti: ' + SALTI.map(s => s[0]).join(' ') +
            '   oppure ?scena=' + SALTI.map(s => s[1].replace(/\s+/g, '')).join(' / '));
console.log('  non compare sul sito pubblicato');

})();

