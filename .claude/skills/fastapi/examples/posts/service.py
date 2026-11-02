"""Logica di business del dominio.

Regola guida: questo file non importa nulla da FastAPI. Non conosce richieste, header,
status code. Questo lo rende testabile senza client HTTP e riusabile da un worker
Celery, da un comando CLI o da un consumer di code senza modifiche.

Le eccezioni di dominio sono l'eccezione a questa regola (ereditano da HTTPException
per comodita'); se il servizio deve girare anche fuori da un contesto HTTP, sostituisci
la gerarchia con eccezioni pure e traducile in un exception handler.
"""

from dataclasses import replace
from uuid import UUID

from src.posts.constants import PostStatus
from src.posts.exceptions import AlreadyPublished, SlugAlreadyExists
from src.posts.repository import Post, PostRepository, new_post
from src.posts.schemas import PostCreate, PostUpdate


class PostService:
    def __init__(self, repository: PostRepository) -> None:
        # Il repository arriva dall'esterno (dependency injection): il service non sa
        # se dietro c'e' un dizionario, Postgres o un mock.
        self._repo = repository

    async def get_by_id(self, post_id: UUID) -> Post | None:
        return await self._repo.get(post_id)

    async def list(self, *, limit: int, offset: int) -> tuple[list[Post], int]:
        return await self._repo.list(limit=limit, offset=offset)

    async def create(self, payload: PostCreate, *, author_id: UUID) -> Post:
        # Le regole che dipendono dallo stato del sistema stanno qui, non negli schemi:
        # Pydantic valida la forma del dato, non l'unicita'.
        if await self._repo.get_by_title(payload.title) is not None:
            raise SlugAlreadyExists()

        return await self._repo.add(
            new_post(
                title=payload.title,
                body=payload.body,
                author_id=author_id,
                tags=payload.tags,
            )
        )

    async def update(self, post: Post, payload: PostUpdate) -> Post:
        # exclude_unset distingue "campo assente" da "campo messo esplicitamente a
        # null": senza, una PATCH parziale azzererebbe i campi non inviati.
        changes = payload.model_dump(exclude_unset=True)
        if not changes:
            return post

        if "title" in changes:
            existing = await self._repo.get_by_title(changes["title"])
            if existing is not None and existing.id != post.id:
                raise SlugAlreadyExists()

        return await self._repo.update(replace(post, **changes))

    async def publish(self, post: Post) -> Post:
        if post.status is PostStatus.PUBLISHED:
            raise AlreadyPublished()

        return await self._repo.update(replace(post, status=PostStatus.PUBLISHED))

    async def delete(self, post: Post) -> None:
        await self._repo.delete(post.id)
