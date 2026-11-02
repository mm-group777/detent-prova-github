---
name: design-implement
description: "Costruire l'interfaccia definitiva fedele alla bozza in DESIGN/ e al design_language del contratto frontend: token, shell, schermate, stati visivi, responsive e prova visiva nel browser. Usare in ogni task frontend con impatto visivo, nello scaffold della UI e nei task di rifinitura."
---

# Design-implement — la resa visiva è parte del fatto

La bozza in `DESIGN/` è la decisione visiva del prodotto; `blueprint/frontend.yaml → design_language` la traduce in contratto. Il tuo mandato è una UI che regge il confronto con la bozza: una pagina che funziona ma è spoglia è un task frontend a metà, e nessun test verde lo compensa.

## Due errori uguali e contrari

- **Copiare la bozza.** `DESIGN/` non è codice di produzione: stack, qualità e licenze possono essere inadatti. Si ricostruisce in `frontend/` con la tecnologia approvata; gli asset (immagini, icone, font) si portano solo con condizioni d'uso note. `DESIGN/` resta immutabile.
- **Ignorare la bozza.** Se una schermata esiste in `DESIGN/`, layout, gerarchia e tono sono decisioni già prese: non inventare un design alternativo. Le divergenze necessarie (vincoli tecnici, stati mancanti, responsive) si scelgono in coerenza col `design_language` e si annotano in `CONTEXT.md`.

## Ordine di costruzione

1. **Token prima dei componenti.** Palette, tipografia, scala di spaziatura, raggi e ombre vivono in un solo posto (variabili CSS o tema del framework), con i valori di `design_language`. I componenti riferiscono i token: un esadecimale o una dimensione inventata dentro un componente è un difetto.
2. **Shell prima delle pagine.** Layout portante, navigazione, griglia: la struttura che ogni schermata eredita. Confrontala con la bozza per prima — un errore qui deforma ogni pagina successiva.
3. **Una schermata alla volta.** Parti dal file indicato dal `design_ref` della route e ricostruisci in quest'ordine: struttura e gerarchia → spaziature e allineamenti → tipografia → colori → interazioni. Le rifiniture per ultime, la struttura mai per ultima.
4. **Stati disegnati, non solo gestiti.** `loading`, `empty`, `error`, `success` sono schermate da progettare (skeleton, messaggio curato, azione di recupero), non `if` con testo nudo. Se la bozza non li mostra, derivali dai token e annota la scelta.
5. **Responsive e accessibilità.** Breakpoint del contratto, contrasto sufficiente, focus visibile, label sui campi, navigazione da tastiera sul flusso principale.

## Moduli e caricamenti asincroni

Un modulo non si smonta e non si resetta quando finisce un caricamento asincrono (controllo della sessione, dati iniziali): ciò che la persona ha scritto nei primi istanti deve restare.

- Niente segnaposto (skeleton, spinner, testo di attesa) che sostituisce il modulo dopo che è comparso: il modulo resta montato e il caricamento si mostra accanto o dentro.
- Niente `key` (o equivalente del framework) legata allo stato della sessione o del caricamento: cambiarla rimonta il modulo e azzera i campi.
- I valori iniziali si impostano una volta sola, al primo montaggio: un dato che arriva dopo non fa il reset né riscrive i campi già toccati.
- Se il modulo dipende dalla sessione, compare solo dopo il controllo: prima lo stato di caricamento, poi il modulo, mai un modulo che compare e viene sostituito.
- Lo spec di una schermata con un modulo scrive subito dopo l'apertura, senza aspettare la fine del caricamento, e a caricamento finito controlla che il testo scritto sia ancora lì.
- L'attributo `pattern` dei campi lo compila Chrome con il flag `v`: dentro una classe di caratteri il trattino va protetto con la barra (`[A-Za-z0-9\-]`), perché `[A-Za-z0-9-]` e `[-A-Za-z0-9]` sono entrambi non validi, e lo stesso vale per `( ) [ ] { } / | \`. Un pattern non valido scrive un errore in console al primo invio del modulo e rende rossa la journey.

## Prova visiva (MCP playwright)

Prima di dichiarare fatto: apri la pagina reale nel browser e, accanto, la schermata di riferimento della bozza; screenshot di entrambe e confronto onesto su layout, gerarchia, spaziature, tipografia, colori e componenti ricorrenti. Poi percorri il flusso con click veri e guarda anche gli stati (lista vuota, errore forzato, caricamento). Lo screenshot convince te; il gate resta lo spec della journey (`playwright-e2e`).
