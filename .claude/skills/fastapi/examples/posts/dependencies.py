"""Dipendenze delle rotte.

Il pattern centrale: una dipendenza non si limita a iniettare, **valida**. Caricare la
risorsa e sollevare se non esiste toglie le stesse tre righe da ogni endpoint che
lavora su quella risorsa, e sposta il controllo in un punto solo — cosi' non capita che
un endpoint dimentichi di farlo.
"""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, Query

from src.posts.exceptions import NotPostOwner, PostNotFound
from src.posts.repository import InMemoryPostRepository, Post, PostRepository
from src.posts.service import PostService

# Istanza unica per il processo. Con un database questa riga sparisce: il repository
# viene costruito per richiesta a partire dalla sessione (vedi references/database.md).
_repository: PostRepository = InMemoryPostRepository()


def get_post_service() -> PostService:
    return PostService(_repository)


PostServiceDep = Annotated[PostService, Depends(get_post_service)]


async def current_user_id() -> UUID:
    """Segnaposto per l'autenticazione reale.

    In un progetto vero questa dipendenza decodifica il JWT (con PyJWT, non
    python-jose) e solleva NotAuthenticated se il token manca o e' invalido. Tenerla
    come dipendenza a se' stante permette di sostituirla nei test con
    ``app.dependency_overrides``.
    """
    return UUID("00000000-0000-0000-0000-000000000001")


CurrentUser = Annotated[UUID, Depends(current_user_id)]


async def valid_post_id(post_id: UUID, service: PostServiceDep) -> Post:
    post = await service.get_by_id(post_id)
    if post is None:
        raise PostNotFound()
    return post


ValidPost = Annotated[Post, Depends(valid_post_id)]


async def owned_post(post: ValidPost, user_id: CurrentUser) -> Post:
    """Dipendenza concatenata: riusa valid_post_id invece di ricopiarne il corpo.

    FastAPI risolve la catena una volta sola per richiesta — le dipendenze sono cachate
    per request, quindi usare sia ValidPost che OwnedPost nello stesso endpoint non
    esegue due volte la lettura.
    """
    if post.author_id != user_id:
        raise NotPostOwner()
    return post


OwnedPost = Annotated[Post, Depends(owned_post)]


class Pagination:
    """Parametri di paginazione riusabili.

    Una classe come dipendenza raggruppa parametri che viaggiano sempre insieme:
    l'endpoint dichiara un argomento invece di tre, e i vincoli restano dichiarati una
    volta sola e visibili nell'OpenAPI.
    """

    def __init__(
        self,
        limit: Annotated[int, Query(ge=1, le=100)] = 20,
        offset: Annotated[int, Query(ge=0)] = 0,
    ) -> None:
        self.limit = limit
        self.offset = offset


PaginationDep = Annotated[Pagination, Depends(Pagination)]
