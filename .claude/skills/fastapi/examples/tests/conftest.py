"""Fixture condivise.

Client asincrono dal primo test: partire con il TestClient sincrono significa doverlo
sostituire il giorno che serve testare qualcosa di concorrente, e nel frattempo i test
non esercitano lo stesso percorso di codice della produzione.
"""

from collections.abc import AsyncIterator, Iterator
from uuid import UUID

import pytest
from httpx import ASGITransport, AsyncClient

from src.main import app
from src.posts.dependencies import current_user_id, get_post_service
from src.posts.repository import InMemoryPostRepository
from src.posts.service import PostService

TEST_USER_ID = UUID("11111111-1111-1111-1111-111111111111")


@pytest.fixture
async def client() -> AsyncIterator[AsyncClient]:
    # ASGITransport parla direttamente con l'app: nessuna porta aperta, nessun server
    # da avviare, i test restano veloci e isolati.
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture(autouse=True)
def _isolated_storage() -> Iterator[None]:
    """Ogni test parte da un repository pulito.

    Lo stato condiviso tra test e' la causa numero uno di suite che passano da sole e
    falliscono in ordine diverso.
    """
    service = PostService(InMemoryPostRepository())
    app.dependency_overrides[get_post_service] = lambda: service
    yield
    app.dependency_overrides.pop(get_post_service, None)


@pytest.fixture(autouse=True)
def _authenticated_user() -> Iterator[None]:
    """Sostituisce l'autenticazione, non la aggira.

    ``dependency_overrides`` e' il meccanismo previsto da FastAPI: non serve
    monkeypatchare moduli interni ne' generare token veri nei test.
    """
    app.dependency_overrides[current_user_id] = lambda: TEST_USER_ID
    yield
    app.dependency_overrides.pop(current_user_id, None)
