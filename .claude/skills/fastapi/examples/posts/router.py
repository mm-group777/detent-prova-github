"""Endpoint HTTP del dominio.

Il router fa tre cose e basta: dichiara il contratto (path, schemi, status, errori
possibili), riceve le dipendenze gia' validate, delega al service. Se qui compare un
``if`` che decide qualcosa sul dominio, quel codice e' nel file sbagliato.
"""

from fastapi import APIRouter, status

from src.posts.dependencies import (
    CurrentUser,
    OwnedPost,
    PaginationDep,
    PostServiceDep,
    ValidPost,
)
from src.posts.schemas import PostCreate, PostListResponse, PostResponse, PostUpdate

router = APIRouter(prefix="/posts", tags=["posts"])


@router.get(
    "",
    response_model=PostListResponse,
    summary="Elenca i post",
    description="Ritorna i post ordinati dal piu' recente, con paginazione offset.",
)
async def list_posts(
    service: PostServiceDep,
    pagination: PaginationDep,
) -> PostListResponse:
    items, total = await service.list(limit=pagination.limit, offset=pagination.offset)
    return PostListResponse(
        items=[PostResponse.model_validate(item) for item in items],
        total=total,
        limit=pagination.limit,
        offset=pagination.offset,
    )


@router.post(
    "",
    response_model=PostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crea un post",
    responses={
        status.HTTP_409_CONFLICT: {"description": "Esiste gia' un post con questo titolo"},
    },
)
async def create_post(
    payload: PostCreate,
    service: PostServiceDep,
    author_id: CurrentUser,
) -> PostResponse:
    post = await service.create(payload, author_id=author_id)
    return PostResponse.model_validate(post)


@router.get(
    "/{post_id}",
    response_model=PostResponse,
    summary="Recupera un post",
    responses={status.HTTP_404_NOT_FOUND: {"description": "Post inesistente"}},
)
async def get_post(post: ValidPost) -> PostResponse:
    # Nessun controllo qui: la dipendenza ha gia' caricato il post o sollevato 404.
    return PostResponse.model_validate(post)


@router.patch(
    "/{post_id}",
    response_model=PostResponse,
    summary="Aggiorna un post",
    responses={
        status.HTTP_403_FORBIDDEN: {"description": "Non sei l'autore"},
        status.HTTP_404_NOT_FOUND: {"description": "Post inesistente"},
        status.HTTP_409_CONFLICT: {"description": "Titolo gia' in uso"},
    },
)
async def update_post(
    payload: PostUpdate,
    post: OwnedPost,
    service: PostServiceDep,
) -> PostResponse:
    updated = await service.update(post, payload)
    return PostResponse.model_validate(updated)


@router.post(
    "/{post_id}/publish",
    response_model=PostResponse,
    summary="Pubblica un post",
    description="Transizione di stato esplicita: lo stato non e' un campo modificabile via PATCH.",
    responses={
        status.HTTP_403_FORBIDDEN: {"description": "Non sei l'autore"},
        status.HTTP_409_CONFLICT: {"description": "Post gia' pubblicato"},
    },
)
async def publish_post(post: OwnedPost, service: PostServiceDep) -> PostResponse:
    published = await service.publish(post)
    return PostResponse.model_validate(published)


@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Elimina un post",
    responses={
        status.HTTP_403_FORBIDDEN: {"description": "Non sei l'autore"},
        status.HTTP_404_NOT_FOUND: {"description": "Post inesistente"},
    },
)
async def delete_post(post: OwnedPost, service: PostServiceDep) -> None:
    # 204 significa nessun corpo: non ritornare {"ok": true} con questo status.
    await service.delete(post)
