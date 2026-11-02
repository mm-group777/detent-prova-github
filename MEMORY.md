# MEMORY: detent-prova-github

Memoria operativa curata e breve, letta a ogni sessione. Non è un log: conserva solo conoscenza durevole e verificata.

## Preferenze e vincoli

- (vuoto)

## Trappole note e soluzioni

- Il progetto non ha applicazione: la suite di review `prova` è provvisoria (`git status --porcelain`, spec `README.md`) e non è un E2E vero; i valori imposti dai controlli del kernel sono dichiarati in `ONBOARDING.yaml` (C06-C13). Non trattarla come collaudo reale.
- `blueprint/database.yaml` ha `migrations.rollback_strategy: undecided` perché nei file non esiste una procedura di ripristino: non inventarne una, la decisione è la voce C05 di `ONBOARDING.yaml`.

## Convenzioni emerse

- (vuoto)

## Candidati trasversali

- (vuoto; formato: [skill:nome] problema → regola verificata)
