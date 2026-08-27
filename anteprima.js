/* Genera i PNG di controllo. Uso:
     node anteprima.js              tutte le anteprime
     node anteprima.js personaggio  solo il personaggio
*/
const fs = require("fs");
const zlib = require("zlib");
const A = require("./arte.js");
const S = require("./salotto.js");

/* --- PNG minimale, senza dipendenze --- */
const TAB = (() => { const t = [];
  for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t; })();
function pezzo(tipo, dati){
  const len = Buffer.alloc(4); len.writeUInt32BE(dati.length);
  const corpo = Buffer.concat([Buffer.from(tipo, "ascii"), dati]);
  let c = 0xffffffff;
  for (const b of corpo) c = TAB[(c ^ b) & 0xff] ^ (c >>> 8);
  const crc = Buffer.alloc(4); crc.writeUInt32BE((c ^ 0xffffffff) >>> 0);
  return Buffer.concat([len, corpo, crc]);
}
function scriviPng(rgba, L, H, file){
  const righe = [];
  for (let y = 0; y < H; y++)
    righe.push(Buffer.from([0]), Buffer.from(rgba.buffer, y * L * 4, L * 4));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(L, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 6;
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    pezzo("IHDR", ihdr), pezzo("IDAT", zlib.deflateSync(Buffer.concat(righe), {level:9})),
    pezzo("IEND", Buffer.alloc(0))
  ]));
}

/* --- tela con un pittore che sa solo mettere punti --- */
function tela(L, H, scala, fondo){
  const rgba = new Uint8Array(L * scala * H * scala * 4);
  const cache = {};
  function tinta(c){
    if (cache[c]) return cache[c];
    let v;
    if (c[0] === '#') v = [parseInt(c.slice(1,3),16), parseInt(c.slice(3,5),16), parseInt(c.slice(5,7),16), 255];
    else { const m = c.match(/[\d.]+/g); v = [+m[0], +m[1], +m[2], Math.round((m[3] ?? 1) * 255)]; }
    return cache[c] = v;
  }
  const P = {
    punto(x, y, colore){
      if (!colore) return;
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= L || y >= H) return;
      const [r, g, b, a] = tinta(colore), k = a / 255;
      for (let iy = 0; iy < scala; iy++) for (let ix = 0; ix < scala; ix++){
        const i = ((y * scala + iy) * L * scala + (x * scala + ix)) * 4;
        rgba[i]   = Math.round(rgba[i]   * (1 - k) + r * k);
        rgba[i+1] = Math.round(rgba[i+1] * (1 - k) + g * k);
        rgba[i+2] = Math.round(rgba[i+2] * (1 - k) + b * k);
        rgba[i+3] = 255;
      }
    }
  };
  if (fondo) for (let y = 0; y < H; y++) for (let x = 0; x < L; x++) P.punto(x, y, fondo);
  return { P, salva: file => scriviPng(rgba, L * scala, H * scala, file) };
}

fs.mkdirSync("anteprime", { recursive: true });
const quale = process.argv[2];

if (!quale || quale === "personaggio"){
  const scala = 8, marg = 3;
  const t = tela(A.LARG_PERS + marg * 2, A.ALT_PERS + marg * 2 + 3, scala, '#2b2622');
  A.sprite(t.P, A.CORPO, marg, marg);
  A.sprite(t.P, A.SPR.occhiali, marg + A.SPR.occhialiX, marg + A.SPR.occhialiY);
  t.salva("anteprime/personaggio.png");
  console.log(`personaggio ${A.LARG_PERS}x${A.ALT_PERS} -> anteprime/personaggio.png`);
}

if (!quale || quale === "social"){
  // l'immagine che compare nell'anteprima del link su WhatsApp
  const L = 300, H = 158, scala = 4;
  const t = tela(L, H, scala, '#14110f');
  const P = { punto(x, y, c){ t.P.punto(x + L / 2, y + 40, c); } };
  A.scena(P, { fase: 196, colonna: 3, riga: 3, azione: 'svapo' });
  t.salva("anteprime/social.png");
  console.log(`social ${L * scala}x${H * scala} -> anteprime/social.png`);
}

if (!quale || quale === "pose"){
  const casi = [
    ['fermo',     0, 0], ['cammina',   7, 0], ['cammina',  21, 0], ['fianchi',   0, 0],
    ['fermo',     0, 1], ['sbuffa',   14, 0], ['sbuffa',   40, 0], ['sbuffa',   70, 0],
    ['telefono', 20, 0], ['telefono', 90, 0], ['telefono',180, 0], ['telefono',270, 0]
  ];
  const cL = 40, cA = 46, col = 4, scala = 5;
  const t = tela(cL * col, cA * Math.ceil(casi.length / col), scala, '#221d1a');
  casi.forEach(([azione, fase, occhialiQ], n) => {
    const gx = (n % col) * cL, gy = Math.floor(n / col) * cA;
    const P = { punto(x, y, c){
      if (x < 1 || x > cL - 2 || y < 1 || y > cA - 2) return;
      t.P.punto(x + gx, y + gy, c);
    } };
    for (let x = 0; x < cL; x++){ t.P.punto(x + gx, gy, '#2f2823'); t.P.punto(x + gx, gy + cA - 1, '#2f2823'); }
    for (let y = 0; y < cA; y++){ t.P.punto(gx, y + gy, '#2f2823'); t.P.punto(gx + cL - 1, y + gy, '#2f2823'); }
    A.attore(P, cL / 2, cA - 5, { azione, t: fase, occhialiQ });
  });
  t.salva("anteprime/pose.png");
  console.log(`pose: ${casi.length} -> anteprime/pose.png`);
}

if (!quale || quale === "apertura"){
  // la scena d'apertura: fondo nero, lui solo, il "Mh"
  const L = 150, H = 76, SUOLO = 68, scala = 5;
  const t = tela(L, H, scala, '#0b0a09');
  for (let i = 0; i < 5; i++){
    const w = 34 - i * 5;
    for (let x = 0; x < w; x++)
      t.P.punto(L / 2 - w / 2 + x, SUOLO + i - 1, 'rgba(120,96,70,' + (0.05 - i * 0.008) + ')');
  }
  A.attore(t.P, L / 2, SUOLO, { azione: 'fermo', t: 0, occhialiQ: 0 });
  A.fumetto(t.P, L / 2 + 10, SUOLO - 44, 'Mh');
  t.salva("anteprime/apertura.png");
  console.log(`apertura -> anteprime/apertura.png`);
}

if (!quale || quale === "sala"){
  const t = tela(S.LARG, S.ALT, 5, '#000');
  S.disegna(t.P, { fase: 8, tv: true, tremore: true });
  A.gerardoSdraiato(t.P, S.POSTO.x, S.POSTO.y, { t: 30, dorme: false, braccio: 'canale' });
  t.salva("anteprime/sala.png");
  console.log(`sala ${S.LARG}x${S.ALT} -> anteprime/sala.png`);
}

if (quale === "salotto"){
  const L = 300, H = 210, scala = 4;
  const t = tela(L, H, scala, '#0b0a09');
  const P = { punto(x, y, c){ t.P.punto(x + L / 2 - 10, y + 74, c); } };
  A.salotto(P, { fase: 12, tv: true, tremore: true });
  A.sdraiato(P, A.POSTO.x, A.POSTO.y, { t: 0, dorme: false, braccioSu: true });
  t.salva("anteprime/salotto.png");
  console.log(`salotto -> anteprime/salotto.png`);
}

if (!quale || quale === "pigiama"){
  const casi = [['fermo', 0], ['cammina', 7], ['fianchi', 0], ['svapo', 100]];
  const cL = 40, cA = 46, scala = 5;
  const t = tela(cL * casi.length, cA, scala, '#221d1a');
  casi.forEach(([azione, fase], n) => {
    const gx = n * cL;
    const P = { punto(x, y, c){
      if (x < 1 || x > cL - 2 || y < 1 || y > cA - 2) return;
      t.P.punto(x + gx, y, c);
    } };
    A.attore(P, cL / 2, cA - 5, { azione, t: fase, occhialiQ: 0, pigiama: true });
  });
  t.salva("anteprime/pigiama.png");
  console.log(`pigiama -> anteprime/pigiama.png`);
}

if (quale === "posa"){
  // un solo fotogramma, molto ingrandito, per giudicare i dettagli
  const istante = Number(process.argv[3] || 100);
  const cell_L = 46, cell_A = 50, scala = 12;
  const t = tela(cell_L, cell_A, scala, '#221d1a');
  const Q = { punto(x, y, c){ t.P.punto(x + 11, y + 40, c); } };
  A.personaggio(Q, 0, 0, { fase: istante, azione: 'svapo' });
  t.salva("anteprime/posa.png");
  console.log(`posa al fotogramma ${istante} -> anteprime/posa.png`);
}

if (!quale || quale === "svapo"){
  // contact sheet: i fotogrammi chiave dell'animazione, in griglia
  // passo fitto sulle transizioni: e' li' che si vede se il gesto e' fluido
  const istanti = [
    0, 40, 46, 52, 58, 64,
    70, 76, 82, 100, 120, 132,
    138, 144, 150, 156, 170, 186,
    192, 198, 208, 224, 250, 300
  ];
  const cell_L = 60, cell_A = 56, col = 6, scala = 3;
  const rig = Math.ceil(istanti.length / col);
  const t = tela(cell_L * col, cell_A * rig, scala, '#221d1a');

  // il personaggio in cella (0,0) viene proiettato con la testa sopra lo zero:
  // qui lo si rimette dentro il riquadro
  const OFF_X = 14, OFF_Y = 44;

  istanti.forEach((istante, n) => {
    const gx = (n % col) * cell_L, gy = Math.floor(n / col) * cell_A;
    const P = { punto(x, y, c){ t.P.punto(x + gx, y + gy, c); } };
    for (let x = 0; x < cell_L; x++){ P.punto(x, 0, '#2f2823'); P.punto(x, cell_A - 1, '#2f2823'); }
    for (let y = 0; y < cell_A; y++){ P.punto(0, y, '#2f2823'); P.punto(cell_L - 1, y, '#2f2823'); }
    const Q = { punto(x, y, c){
      if (x + OFF_X < 1 || x + OFF_X > cell_L - 2 || y + OFF_Y < 1 || y + OFF_Y > cell_A - 2) return;
      P.punto(x + OFF_X, y + OFF_Y, c);
    } };
    A.personaggio(Q, 0, 0, { fase: istante, azione: 'svapo' });
  });
  t.salva("anteprime/svapo.png");
  console.log(`svapo: ${istanti.length} fotogrammi -> anteprime/svapo.png`);
}

if (!quale || quale === "scena"){
  const scala = 4;
  const L = 260, H = 190;
  const t = tela(L, H, scala, '#191614');
  const P = {
    punto(x, y, c){ t.P.punto(x + L / 2, y + 50, c); }
  };
  A.scena(P, { fase: 0, colonna: 3, riga: 3 });
  t.salva("anteprime/scena.png");
  console.log(`scena ${L}x${H} -> anteprime/scena.png`);
}






