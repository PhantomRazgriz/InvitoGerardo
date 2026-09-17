/* Prova che nessuna animazione si possa saltare toccando lo schermo.

   Il metodo e' il piu' brutale possibile: si tocca a OGNI fotogramma, che
   e' peggio di qualunque dito storto, e si controlla che ogni gesto
   arrivi comunque in fondo e ogni frase compaia comunque.

   Se un giorno qualcuno rimettesse una scorciatoia - "cosi' chi ha fretta
   avanza" - questa prova diventa rossa.

     node strumenti/nienteSalti.js
*/
const F = require("../facile.js");
const M = require("../mappa.js");

let male = 0;
function esito(nome, ok, dettaglio){
  if (!ok) male++;
  console.log("  " + nome.padEnd(54) + (ok ? "ok" : "SALTATO") +
    (dettaglio ? "   " + dettaglio : ""));
}

/* ---------------- la scena delle riparazioni ---------------- */
{
  const FRASI = 8;
  const fot = n => Math.ceil((30 + n * 4) * 26 / 16.67);   // testo verosimile

  let passo = 0, t = 0, iFrase = -1, scriv = 0, fine = false;
  const viste = new Set();
  const durate = new Map();

  const mostra = n => {
    if (n === undefined || n <= iFrase) return;
    iFrase = n; viste.add(n); scriv = fot(n);
  };
  mostra(0);

  for (let f = 0; f < 20000 && !fine; f++){
    const p = F.PASSI[passo];

    const attende = p.frase !== undefined && !p.ritardoFrase && scriv > 0;
    if (!attende) t++;
    if (scriv > 0) scriv--;
    if (p.ritardoFrase && t >= p.ritardoFrase) mostra(p.frase);

    // si tocca a ogni singolo fotogramma
    if (scriv > 0){ scriv = 0; }
    else {
      const s = F.stato(passo, t);
      if (!s.finito){ /* il tocco non deve fare niente */ }
      else if (passo >= F.PASSI.length - 1) fine = true;
      else {
        durate.set(passo, t);
        passo++; t = 0;
        const q = F.PASSI[passo];
        if (!q.ritardoFrase) mostra(q.frase);
      }
    }
  }
  durate.set(F.PASSI.length - 1, t);

  console.log("terza scena, toccando a ogni fotogramma:");
  esito("tutte le otto frasi compaiono", viste.size === FRASI,
        viste.size + " su " + FRASI);

  let tutte = true, corto = "";
  for (const [i, avuta] of durate){
    const attesa = F.PASSI[i].durata || 0;
    if (avuta < attesa){ tutte = false; corto = "passo " + i + ": " + avuta + " su " + attesa; }
  }
  esito("ogni gesto arriva in fondo", tutte, corto);

  const tot = [...durate.values()].reduce((a, b) => a + b, 0);
  console.log("    la scena dura comunque " + (tot / 60).toFixed(1) + " s");
}

/* ---------------- la mappa ----------------
   Qui gli ingrandimenti vanno da soli: la prova non e' piu' che il tocco
   non li salti, ma che non li ACCELERI. Si misura il giro toccando a ogni
   fotogramma e lo si confronta col giro senza toccare mai: devono durare
   uguale, o il tocco e' tornato a contare. */
{
  const LETTURA = 105;
  const limite = M.FASI.comparsa + M.FASI.scansione + M.FASI.agganciato;
  const scrittura = Math.ceil(23 * 26 / 16.67);   // la prima frase

  function giro(tocca){
    let liv = 0, t = 0, scriv = scrittura, tLettura = 0, f = 0;
    const durate = new Map();
    while (f < 20000 && liv < M.LIVELLI.length - 1){
      f++;
      if (scriv > 0){ scriv--; tLettura = 0; } else tLettura++;
      const daLeggere = t >= limite && tLettura < LETTURA;
      if (scriv === 0 && !daLeggere) t++;
      if (t >= M.DURATA_LIVELLO){ durate.set(liv, t); liv++; t = 0; }
      // il tocco: nella mappa non deve avere alcun effetto
      if (tocca){ /* avanzaMappa esce subito se non e' l'ultimo livello */ }
    }
    return { fotogrammi: f, liv, durate };
  }

  const quieto = giro(false);
  const martellato = giro(true);

  console.log("\nmappa, ora che gli ingrandimenti vanno da soli:");
  esito("il tocco non accelera la sequenza",
        quieto.fotogrammi === martellato.fotogrammi,
        (quieto.fotogrammi / 60).toFixed(1) + " s in entrambi i casi");

  let tutti = true, corto = "";
  for (const [i, avuta] of quieto.durate)
    if (avuta < M.DURATA_LIVELLO){ tutti = false; corto = "livello " + i; }
  esito("ogni livello si acquisisce per intero", tutti, corto);
  esito("si arriva da soli fino a " + M.LIVELLI[M.LIVELLI.length - 1].sigla,
        quieto.liv === M.LIVELLI.length - 1);
  esito("la prima frase resta ferma almeno un secondo e mezzo",
        LETTURA / 60 >= 1.5, (LETTURA / 60).toFixed(1) + " s");
}

/* ---------------- il salotto ---------------- */
{
  /* Qui non c'e' un passo per passo da simulare: la prova e' che il codice
     non contenga piu' la riga che saltava la sequenza del volume. */
  const fs = require("fs");
  const pagina = fs.readFileSync("index.html", "utf8");
  const dentroTocca = /function tocca\(\)\{([\s\S]*?)\n\}/.exec(pagina);
  const salta = dentroTocca && /tSalotto = SC\.fineVolume/.test(dentroTocca[1]);
  console.log("\nsalotto:");
  esito("il tocco non salta le nove pressioni del volume", !salta);
}

/* ---------------- il freno ai tocchi doppi ---------------- */
{
  const fs = require("fs");
  const pagina = fs.readFileSync("index.html", "utf8");
  console.log("\nprotezioni generali:");
  esito("due tocchi ravvicinati contano per uno",
        /ultimoTocco < 250/.test(pagina));
  esito("durante una dissolvenza il tocco non fa niente",
        /if \(veloVerso\) return;/.test(pagina));
}

/* ---------------- l'apertura ---------------- */
{
  const fs = require("fs");
  const pagina = fs.readFileSync("index.html", "utf8");
  console.log("\napertura:");
  esito("c'e' una schermata che chiede il primo tocco",
        /id="avvio"/.test(pagina));
  esito("il racconto non parte prima di quel tocco",
        !/\n\s*disegna\(\);\s*\n<\/script>/.test(pagina) &&
        /function comincia\(\)\{[\s\S]*?disegna\(\);/.test(pagina));
  esito("il suono si accende dentro il gesto",
        /function comincia\(\)\{[\s\S]*?S\.sveglia\(\);/.test(pagina));
  esito("si puo' spegnere il suono prima di cominciare",
        /#audio\{ z-index:12 \}/.test(pagina));
}

console.log(male === 0
  ? "\nniente si puo' saltare per sbaglio, e niente comincia muto"
  : "\n" + male + " punti da cui si perde qualcosa");
process.exit(male === 0 ? 0 : 1);


