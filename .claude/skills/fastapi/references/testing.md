# Test

## Client asincrono dal primo test

`httpx.AsyncClient` con `ASGITransport` parla direttamente con l'app: nessun server da
avviare, nessuna porta, e i test esercitano lo stesso percorso async della produzione.

```python
import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
```

Serve `pytest-asyncio` (o `anyio`). Con pytest-asyncio conviene impostare
`asyncio_mode = "auto"` in `pyproject.toml` per non dover marcare ogni test.

Non usare `async_asgi_testclient`: non e' mantenuto. Il `TestClient` sincrono di
Starlette va bene solo per progetti interamente sincroni.

## Sostituire le dipendenze, non monkeypatchare

FastAPI espone `dependency_overrides` proprio per questo. Sostituisci al confine —
autenticazione, client esterni, orologio — e lascia intatto tutto il resto: un test che
patcha un modulo interno smette di verificare il comportamento reale e si rompe al primo
refactor.

```python
@pytest.fixture(autouse=True)
def _fake_auth():
    app.dependency_overrides[current_user_id] = lambda: TEST_USER_ID
    yield
    app.dependency_overrides.pop(current_user_id, None)
```

Ripulisci sempre l'override alla fine (`pop` o `clear`): `app` e' un oggetto globale e
un override dimenticato inquina i test successivi in modo che sembra casuale.

## Isolamento dello stato

Ogni test deve poter girare da solo e in ordine qualsiasi. Se l'app tiene stato in
memoria (repository in-memory, cache), ricrealo in una fixture `autouse`. Se c'e' un
database, ogni test gira in una transazione che viene annullata alla fine, oppure su uno
schema effimero.

## Cosa vale la pena testare

| Testa                                        | Non testare                               |
| -------------------------------------------- | ----------------------------------------- |
| Status code e forma della risposta            | Che Pydantic validi i tipi                |
| Regole di business (unicita', permessi, stati)| Che FastAPI faccia il routing             |
| I rami di errore, non solo il percorso felice | Getter e setter senza logica              |
| I confini: paginazione, liste vuote, limiti   | Il framework, in generale                 |

I test sui rami di errore sono quelli che ripagano di piu': il percorso felice lo
esercita chiunque apra l'app, i 403 e i 409 no.

## Asserzioni

Asserisci sui codici di errore dell'enum, non su stringhe copiate a mano: se un
messaggio cambia, il test deve fallire solo se cambia il *comportamento*.

```python
assert response.json()["detail"] == ErrorCode.SLUG_ALREADY_EXISTS
```

## Test dei service senza HTTP

Il service non importa FastAPI, quindi si testa direttamente — piu' veloce e con
asserzioni piu' precise di quanto permetta un giro completo via HTTP. Usa i test HTTP
per il contratto, quelli diretti per la logica.

```python
async def test_publish_rejects_second_call():
    service = PostService(InMemoryPostRepository())
    post = await service.create(PostCreate(title="x", body="y"), author_id=uuid4())
    await service.publish(post)

    with pytest.raises(AlreadyPublished):
        await service.publish(post)
```
