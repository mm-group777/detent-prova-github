---
name: fastapi
description: Convenzioni di produzione per progetti FastAPI - struttura per dominio, async corretto, Pydantic v2, dipendenze come validatori, gestione errori e test. Usa SEMPRE questa skill quando l'utente crea, scaffolda, struttura o estende un progetto o un servizio FastAPI, quando aggiunge router/endpoint/schemi Pydantic/dipendenze, e anche quando dice solo "fammi un'API in Python", "backend REST", "microservizio", "aggiungi un endpoint" senza nominare FastAPI. Usala anche per decidere tra async def e def e per organizzare la configurazione.
---

# FastAPI Best Practices

Convenzioni per scrivere servizi FastAPI mantenibili in produzione. Ispirate alle
convenzioni pubbliche di `zhanymkanov/fastapi-best-practices`, riscritte e adattate
per uso agentico.

Genera i file seguendo la struttura sotto, partendo dagli scheletri in `examples/`. Non copiare gli
esempi alla lettera: sono un modello di forma, non di contenuto. Adatta nomi, campi e logica al dominio
reale.

## Stack e versioni minime

Gli esempi assumono queste versioni. Se il progetto ne usa di più vecchie, segnalalo
prima di generare codice che non girerebbe.

| Dipendenza        | Minimo | Nota                                                    |
| ----------------- | ------ | ------------------------------------------------------- |
| Python            | 3.11   | serve per `StrEnum` e la sintassi `X \| Y`              |
| FastAPI           | 0.115  | `Annotated[T, Depends(...)]` è la forma corretta        |
| Pydantic          | 2.7    | le API v1 (`.dict()`, `json_encoders`) non esistono più |
| pydantic-settings | 2.4    | pacchetto separato da Pydantic v2 in poi                |
| httpx             | 0.27   | `ASGITransport` per i test in-process                   |
| PyJWT             | 2.9    | preferiscilo a `python-jose`, non più mantenuto         |
| ruff              | 0.6    | sostituisce black, isort, autoflake                     |

Il database **non** fa parte del default. Genera un progetto senza persistenza a meno
che l'utente non la chieda; quando serve, leggi `references/database.md` e aggancia lo
strato dati al repository, non ai router.

## Struttura del progetto

Organizza per dominio (bounded context), non per tipo di file. Un pacchetto per
dominio, ognuno autosufficiente.

```
src/
├── {dominio}/           # es. auth/, posts/, billing/
│   ├── router.py        # endpoint HTTP, nient'altro
│   ├── schemas.py       # modelli Pydantic (input/output)
│   ├── service.py       # logica di business
│   ├── repository.py    # accesso ai dati (in-memory o DB)
│   ├── dependencies.py  # dipendenze delle rotte
│   ├── constants.py     # costanti e codici di errore
│   ├── exceptions.py    # eccezioni del dominio
│   └── config.py        # BaseSettings del dominio (se ne servono)
├── config.py            # BaseSettings globale
├── exceptions.py        # eccezioni base condivise
└── main.py              # app FastAPI + lifespan
```

Il flusso è sempre `router → service → repository`. Un router che costruisce query o
manipola dati grezzi è un errore: sposta la logica nel service.

Per gli import tra domini usa il nome del modulo, mai `import *` né percorsi profondi:

```python
from src.auth import service as auth_service
from src.posts.constants import ErrorCode as PostsErrorCode
```

Serve a rendere ovvia la provenienza di un simbolo e a poter spostare un dominio senza
inseguire import sparsi.

## Async: la regola che rompe più progetti

FastAPI gestisce sia rotte `async def` che `def`, ma non allo stesso modo. Le rotte
sincrone girano in un threadpool; le `async def` girano sull'event loop e FastAPI si
fida che dentro non ci sia niente di bloccante. Se quella fiducia viene tradita —
`time.sleep`, `requests.get`, un driver DB sincrono dentro una `async def` — l'event
loop si ferma e **tutte** le richieste di quel worker si accodano.

| La rotta fa                             | Usa                                            |
| --------------------------------------- | ---------------------------------------------- |
| I/O non bloccante (`await`)             | `async def`                                    |
| I/O bloccante, nessun client async       | `def` (sincrona, gira nel threadpool)          |
| Misto                                    | `async def` + `run_in_threadpool` per il pezzo |
| Calcolo pesante (> ~50 ms di CPU)        | worker esterno (Celery / Arq / RQ)             |

```python
from fastapi.concurrency import run_in_threadpool

@router.get("/report")
async def build_report():
    # libreria sincrona dentro una rotta async: incapsulala
    return await run_in_threadpool(legacy_client.fetch_report, "monthly")
```

Il threadpool di Starlette è limitato (40 thread di default): non rendere tutto
sincrono "per sicurezza", satureresti il pool e rallenteresti anche le rotte sane.

## Pydantic

Usa i validatori integrati prima di scrivere validazione a mano. `Field`, `EmailStr`,
`AnyUrl` e `StrEnum` coprono la maggior parte dei casi e finiscono automaticamente
nello schema OpenAPI, cosa che un `if` dentro il service non fa.

```python
class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=64, pattern=r"^[a-z0-9_-]+$")
    email: EmailStr
    age: int = Field(ge=18)
```

Non scrivere mai `Field(ge=18, default=None)`: il vincolo e il default si contraddicono.
Decidi se il campo è obbligatorio (`Field(ge=18)`) oppure opzionale
(`int | None = Field(default=None, ge=18)`).

Per la serializzazione custom usa `@field_serializer`: `json_encoders` è deprecato in v2.

Separa gli schemi per direzione: `PostCreate`, `PostUpdate`, `PostResponse`. Un modello
unico riusato per input e output prima o poi espone un campo interno.

## Configurazione

Una `BaseSettings` per dominio, più una globale per ciò che è davvero trasversale
(nome app, environment, CORS). Un settings-oggetto unico gonfio costringe ogni dominio
a conoscere le variabili di tutti gli altri, e rende impossibile capire cosa serve
davvero per far partire un modulo.

```python
class AuthConfig(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AUTH_", env_file=".env", extra="ignore")

    JWT_SECRET: str
    JWT_ALG: str = "HS256"
    JWT_EXP_MINUTES: int = 15
```

Niente valori di default per i segreti: se manca `JWT_SECRET` l'app deve rifiutarsi di
partire, non partire con una chiave finta.

## Dipendenze

Le dipendenze non servono solo a iniettare: sono il posto giusto per **validare**.
Una dipendenza che carica una risorsa e solleva se non esiste toglie tre righe di
boilerplate da ogni endpoint che la usa.

```python
async def valid_post_id(post_id: UUID, service: PostServiceDep) -> Post:
    post = await service.get_by_id(post_id)
    if post is None:
        raise PostNotFound()
    return post

PostDep = Annotated[Post, Depends(valid_post_id)]
```

Regole pratiche:

- Usa sempre la forma `Annotated[T, Depends(...)]`, non `arg: T = Depends(...)`.
  Definisci un alias di tipo (`PostDep`) e riusalo: gli endpoint restano leggibili.
- Concatena le dipendenze invece di duplicarne il corpo — `valid_owned_post` dipende da
  `valid_post_id` più il token utente.
- Le dipendenze sono **cachate per richiesta**: la stessa `Depends(x)` invocata cinque
  volte nella stessa richiesta esegue `x` una volta sola. Sfruttalo, non aggirarlo.
- Preferisci dipendenze `async def`: quelle sincrone finiscono nel threadpool anche per
  un controllo banale.
- Se due endpoint devono condividere una dipendenza, dai lo stesso nome alla variabile
  di path (`/profiles/{profile_id}` e `/creators/{profile_id}`).

## Errori

Definisci una gerarchia di eccezioni che sottoclassa `HTTPException`, con status e
messaggio di default sulla classe. Gli endpoint sollevano `PostNotFound()`, non
`HTTPException(404, "...")` ripetuto ovunque con testi leggermente diversi.

I messaggi utente stanno in `constants.py` come `StrEnum`, così sono uno solo per
codice, cercabili e riusabili nei test.

Non avvolgere il corpo di un endpoint in `try/except Exception`: nasconde i bug veri e
trasforma i 500 in risposte silenziosamente sbagliate. Cattura l'eccezione specifica.

## Documentazione degli endpoint

Ogni rotta dichiara `response_model`, `status_code`, `summary` e le risposte di errore
possibili. È il contratto che generi per chi consuma l'API — e per gli agenti che
leggeranno l'OpenAPI dopo di te.

```python
@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crea un post",
    responses={
        status.HTTP_409_CONFLICT: {"description": "Slug già esistente"},
    },
)
```

Nasconde la documentazione fuori dagli ambienti non fidati impostando `openapi_url=None`
quando l'environment è produzione.

## File di esempio

In `examples/` c'è un servizio minimo completo e funzionante, senza database. Usalo
come punto di partenza per lo scaffolding: leggi il file corrispondente prima di
scrivere quel tipo di file da zero.

| File                          | Cosa mostra                                                |
| ----------------------------- | ---------------------------------------------------------- |
| `examples/main.py`            | app, lifespan, docs per environment, handler errori         |
| `examples/config.py`          | `BaseSettings` globale, enum environment                    |
| `examples/exceptions.py`      | gerarchia di eccezioni base                                 |
| `examples/posts/router.py`    | endpoint documentati, dipendenze `Annotated`                |
| `examples/posts/schemas.py`   | schemi separati per input/output, `field_serializer`        |
| `examples/posts/service.py`   | logica di business, nessuna dipendenza da FastAPI           |
| `examples/posts/repository.py`| punto di innesto del DB (implementazione in-memory)         |
| `examples/posts/dependencies.py` | dipendenze come validatori, catena di dipendenze         |
| `examples/posts/constants.py` | codici di errore come `StrEnum`                             |
| `examples/posts/exceptions.py`| eccezioni di dominio                                        |
| `examples/tests/conftest.py`  | client httpx async, override delle dipendenze               |
| `examples/tests/test_posts.py.example` | test di un CRUD completo                           |

Il file di prova d'esempio porta il suffisso `.example` perché gli strumenti di prova
del cliente (pytest) non lo raccolgano da `.claude/skills`: nel progetto si copia senza
il suffisso, come `tests/test_posts.py`.

Il service riceve il repository dall'esterno: è ciò che rende il passaggio a un
database una modifica di un file solo.

## Reference

Leggi questi file quando il caso specifico si presenta, non prima:

- `references/database.md` — quando il progetto ha bisogno di persistenza: SQLAlchemy
  2.0 async, sessione come dipendenza, convenzioni di naming, migrazioni Alembic.
- `references/testing.md` — quando scrivi o rivedi i test: client async, override,
  cosa non mockare.
