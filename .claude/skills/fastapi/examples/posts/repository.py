"""Accesso ai dati.

Questo file e' il punto di innesto della persistenza. Il service dipende dal Protocol,
non dall'implementazione: sostituire il dizionario in memoria con SQLAlchemy significa
scrivere una seconda classe qui e cambiare una riga in ``dependencies.py``, senza
toccare ne' i router ne' la logica di business.

Per la versione con database vedi ``references/database.md``.
"""

from dataclasses import dataclass, field, replace
from datetime import UTC, datetime
from typing import Protocol
from uuid import UUID, uuid4

from src.posts.constants import PostStatus


@dataclass(frozen=True, slots=True)
class Post:
    """Entita' di dominio.

    Volutamente separata dagli schemi Pydantic: gli schemi descrivono il contratto
    HTTP, questa descrive cosa e' un post per l'applicazione. Con un ORM, qui ci
    sarebbe il modello SQLAlchemy.
    """

    id: UUID
    title: str
    body: str
    author_id: UUID
    status: PostStatus
    created_at: datetime
    updated_at: datetime
    tags: list[str] = field(default_factory=list)


class PostRepository(Protocol):
    """Contratto di persistenza.

    Un Protocol invece di una classe base astratta: le implementazioni non devono
    ereditare nulla, e i test possono passare un finto repository senza importare
    questo modulo.
    """

    async def get(self, post_id: UUID) -> Post | None: ...

    async def list(self, *, limit: int, offset: int) -> tuple[list[Post], int]: ...

    async def get_by_title(self, title: str) -> Post | None: ...

    async def add(self, post: Post) -> Post: ...

    async def update(self, post: Post) -> Post: ...

    async def delete(self, post_id: UUID) -> None: ...


class InMemoryPostRepository:
    """Implementazione senza database, adatta a prototipi e test.

    Non e' thread-safe ne' condivisa tra processi: va bene finche' l'applicazione gira
    in un worker solo. Appena servono persistenza o piu' worker, sostituiscila.
    """

    def __init__(self) -> None:
        self._rows: dict[UUID, Post] = {}

    async def get(self, post_id: UUID) -> Post | None:
        return self._rows.get(post_id)

    async def list(self, *, limit: int, offset: int) -> tuple[list[Post], int]:
        ordered = sorted(self._rows.values(), key=lambda p: p.created_at, reverse=True)
        return ordered[offset : offset + limit], len(ordered)

    async def get_by_title(self, title: str) -> Post | None:
        needle = title.casefold()
        return next((p for p in self._rows.values() if p.title.casefold() == needle), None)

    async def add(self, post: Post) -> Post:
        self._rows[post.id] = post
        return post

    async def update(self, post: Post) -> Post:
        refreshed = replace(post, updated_at=datetime.now(UTC))
        self._rows[refreshed.id] = refreshed
        return refreshed

    async def delete(self, post_id: UUID) -> None:
        self._rows.pop(post_id, None)


def new_post(*, title: str, body: str, author_id: UUID, tags: list[str]) -> Post:
    """Factory: id e timestamp li genera il dominio, non il client."""
    now = datetime.now(UTC)  # sempre timezone-aware: i naive datetime si confrontano male
    return Post(
        id=uuid4(),
        title=title,
        body=body,
        author_id=author_id,
        status=PostStatus.DRAFT,
        created_at=now,
        updated_at=now,
        tags=tags,
    )
