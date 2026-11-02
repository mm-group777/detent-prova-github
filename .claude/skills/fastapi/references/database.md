# Aggiungere un database

Da leggere solo quando il progetto ha bisogno di persistenza. Il default della skill e'
un servizio senza database: non introdurre uno strato dati perche' "prima o poi
servira'".

## Dove si innesta

Gli esempi in `examples/` isolano la persistenza dietro il Protocol `PostRepository`.
Aggiungere un database significa:

1. scrivere una seconda implementazione del Protocol (`SqlPostRepository`);
2. costruirla per richiesta a partire dalla sessione, in `dependencies.py`;
3. non toccare ne' i router ne' il service.

Se ti trovi a modificare un router per aggiungere il DB, l'astrazione e' stata bucata:
torna indietro.

## Setup

Usa SQLAlchemy 2.0 con API asincrona. `encode/databases` e' in manutenzione, non
sceglierlo per progetti nuovi.

```python
# src/database.py
from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from src.config import settings

engine = create_async_engine(
    str(settings.DATABASE_URL),
    pool_pre_ping=True,   # scarta le connessioni morte invece di farle fallire a runtime
    pool_size=10,
    max_overflow=5,
)

SessionFactory = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with SessionFactory() as session:
        yield session
```

`expire_on_commit=False` evita che l'accesso a un attributo dopo il commit scateni una
query implicita — cosa che in un contesto async si traduce in errori difficili da
leggere.

Il collegamento alle dipendenze:

```python
# src/posts/dependencies.py
DbSession = Annotated[AsyncSession, Depends(get_db)]


def get_post_service(session: DbSession) -> PostService:
    return PostService(SqlPostRepository(session))
```

## Sessione e transazione

Una sessione per richiesta, gestita dalla dipendenza. Non aprire sessioni dentro il
service: perderesti la possibilita' di far ricadere piu' operazioni nella stessa
transazione, ed e' il modo piu' rapido per esaurire il pool.

Il commit va fatto in un punto solo — o alla fine dell'handler, o in un middleware
transazionale. Un commit sparso in ogni metodo del repository rende impossibile
annullare un'operazione composta.

## Il driver deve essere async

Un driver sincrono (`psycopg2`, `pymysql`) dentro una rotta `async def` blocca l'event
loop: e' l'errore piu' costoso e piu' silenzioso di tutti, perche' in sviluppo con una
richiesta alla volta non si vede.

| Database  | Driver          | URL                                   |
| --------- | --------------- | ------------------------------------- |
| Postgres  | `asyncpg`       | `postgresql+asyncpg://...`            |
| MySQL     | `aiomysql`      | `mysql+aiomysql://...`                |
| SQLite    | `aiosqlite`     | `sqlite+aiosqlite:///./app.db`        |

## Convenzioni di naming

Coerenza sopra ogni preferenza personale: il costo di uno schema incoerente si paga
ogni volta che qualcuno scrive una join.

- `lower_case_snake` ovunque.
- Tabelle al singolare: `post`, `user`, `post_like`.
- Prefisso per raggruppare i domini: `payment_account`, `payment_bill`.
- Suffisso `_at` per i `datetime`, `_date` per le `date`.
- Stesso nome per la stessa foreign key in tutte le tabelle: se e' `profile_id` in una,
  non puo' essere `user_id` in un'altra.

Fissa anche i nomi dei vincoli, altrimenti li genera il database e le migrazioni
diventano illeggibili:

```python
from sqlalchemy import MetaData

NAMING_CONVENTION = {
    "ix": "%(column_0_label)s_idx",
    "uq": "%(table_name)s_%(column_0_name)s_key",
    "ck": "%(table_name)s_%(constraint_name)s_check",
    "fk": "%(table_name)s_%(column_0_name)s_fkey",
    "pk": "%(table_name)s_pkey",
}
metadata = MetaData(naming_convention=NAMING_CONVENTION)
```

## Query

Fai join, aggregazioni e filtri in SQL. Caricare tre tabelle e incrociarle in Python e'
piu' lento di ordini di grandezza e non scala con i dati.

Pydantic serve a validare la risposta, non a trasformare i dati: se stai scrivendo un
ciclo che ricompone oggetti dopo una query, quella logica appartiene alla query.

Attenzione al problema N+1: una lista di 50 elementi che accede a una relazione lazy
genera 51 query. Usa `selectinload` o una join esplicita.

## Migrazioni (Alembic)

```bash
alembic init -t async migrations
```

Il template `async` e' obbligatorio se l'engine e' async.

Regole:

- Le migrazioni sono statiche e reversibili: niente import di codice applicativo dentro
  una revisione, perche' il codice cambia e la migrazione deve restare eseguibile
  com'era quando e' stata scritta.
- Nomi di file leggibili — in `alembic.ini`:
  ```ini
  file_template = %%(year)d-%%(month).2d-%%(day).2d_%%(slug)s
  ```
- Rileggi sempre la revisione autogenerata prima di committarla: `--autogenerate` sbaglia
  su rinomini, tipi custom e indici parziali.

## Test con database

Non mockare il database nei test di integrazione: i mock divergono dalla realta' e la
divergenza si scopre in produzione. Usa un database effimero (testcontainers, oppure uno
schema dedicato creato e distrutto per sessione di test) e riserva
`dependency_overrides` ad autenticazione e servizi esterni.
