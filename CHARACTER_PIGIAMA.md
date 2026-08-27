# CHARACTER_PIGIAMA — fonte di verità

Misure estratte dallo sprite del personaggio **in pigiama, in piedi**
(`SPR.corpo` rimappato da `vestiDaNotte()` in `arte.js`).

Da qui in poi ogni posa nuova legge queste misure. Non si stimano a occhio.

---

## Palette completa

| car | hex | dove |
|---|---|---|
| `o` | `#241f1f` | contorno, unico per tutta la figura |
| `l` | `#e9bcac` | incarnato in luce — calotta |
| `s` | `#d29383` | incarnato base |
| `S` | `#a76b5d` | incarnato in ombra |
| `b` | `#b3877c` | barba corta |
| `m` | `#8a4b4a` | bocca |
| `e` | `#3a2a26` | occhi |
| `h` | `#a8a29a` | capelli — grigio argento |
| `H` | `#d5d0c8` | capelli in luce |
| `p` | `#3f4a6b` | **casacca** pigiama |
| `P` | `#55628c` | casacca in luce |
| `q` | `#2c3450` | casacca in ombra |
| `Q` | `#1e2438` | ombra profonda |
| `r` | `#2d3550` | **pantaloni** pigiama — più scuri della casacca |
| `z` | `#6d6154` | pantofola |
| `Z` | `#4b4239` | pantofola in ombra |

I due blu: casacca `#3f4a6b`, pantaloni `#2d3550`. **Distinguibili**: vanno
tenuti separati o il corpo diventa una macchia unica.

---

## Misure, in pixel nativi

| grandezza | valore |
|---|---|
| altezza totale | **34** |
| **H — altezza testa** (riga 0 → mento riga 12) | **13** |
| **rapporto altezza / H** | **2,62** |
| larghezza testa | 14 |
| larghezza spalle | 16 (righe 15-22) |
| collo | 1 riga (13), largo 6 |
| altezza torso (14 → 23) | 10 |
| altezza gamba, anca→pantofola (24 → 33) | 10 |
| altezza pantofola | 3 |

---

## Il vincolo che comanda tutto

> **Rapporto altezza / H = 2,62.** Il personaggio è **tozzo**: sta in poco più
> di due teste e mezzo. La testa è grossa e va tenuta grossa.

Conseguenza per la posa sdraiata:

- lunghezza totale del corpo disteso **≤ 2,62 × 13 = 34 px**
- con le **ginocchia piegate** deve stare **sotto** quella cifra, non sopra:
  un corpo raccolto occupa meno spazio, non di più
- la testa resta **13 px**. Non si rimpicciolisce per far entrare il corpo:
  semmai si piegano di più le gambe
- coscia + polpaccio insieme **non superano l'altezza del torso** (10 px)

### Errore commesso in precedenza

Lo sprite sdraiato era lungo **44 px = 3,4 teste**: allungato del 30% oltre il
consentito. Da lì la sagoma a salame, la testa che sembrava piccola e il
personaggio che occupava tutto il divano.

---

## Guardaroba

Testa **scoperta**: niente cappellino, niente occhiali da sole — quelli
appartengono alla scena di apertura, non a questa.
Capelli chiari e radi che seguono il cranio. Casacca blu con **maniche lunghe
fino al polso**, mani scoperte. Pantaloni del blu più scuro. Pantofole.
