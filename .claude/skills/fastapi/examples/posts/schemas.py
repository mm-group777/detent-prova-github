"""Modelli Pydantic del dominio.

Uno schema per direzione: quello che il client puo' mandare non e' quello che il client
puo' vedere. Riusare un modello unico per input e output e' il modo piu' rapido per
ritrovarsi con un campo interno esposto o con un client che riesce a scrivere un campo
calcolato dal server.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator

from src.posts.constants import MAX_TAGS, MAX_TITLE_LENGTH, PostStatus


class PostBase(BaseModel):
    """Base comune: qui vanno le impostazioni condivise, non i campi."""

    model_config = ConfigDict(
        from_attributes=True,  # permette la costruzione da oggetti ORM/dataclass
        str_strip_whitespace=True,
        extra="forbid",  # un campo non previsto e' un errore del client, non silenzio
    )


class PostCreate(PostBase):
    title: str = Field(min_length=1, max_length=MAX_TITLE_LENGTH)
    body: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list, max_length=MAX_TAGS)

    # Lo stato iniziale lo decide il server: non e' un campo di input.
    # Per pubblicare esiste un endpoint dedicato.

    @field_validator("tags")
    @classmethod
    def _normalize_tags(cls, value: list[str]) -> list[str]:
        # I validator servono per normalizzare cio' che i vincoli dichiarativi non
        # coprono. Tutto il resto (lunghezze, pattern, range) sta in Field.
        return sorted({tag.strip().lower() for tag in value if tag.strip()})


class PostUpdate(PostBase):
    """PATCH: ogni campo e' opzionale, ma i vincoli restano quando il campo c'e'.

    Nota la forma corretta per un campo opzionale con vincolo:
    ``str | None = Field(default=None, min_length=1)``. Scrivere
    ``Field(min_length=1, default=None)`` mette il vincolo in contraddizione con il
    default ed e' un errore ricorrente.
    """

    title: str | None = Field(default=None, min_length=1, max_length=MAX_TITLE_LENGTH)
    body: str | None = Field(default=None, min_length=1)
    tags: list[str] | None = Field(default=None, max_length=MAX_TAGS)


class PostResponse(PostBase):
    id: UUID
    title: str
    body: str
    tags: list[str]
    status: PostStatus
    author_id: UUID
    created_at: datetime
    updated_at: datetime

    @field_serializer("created_at", "updated_at", when_used="json")
    def _serialize_datetime(self, value: datetime) -> str:
        # ``json_encoders`` non esiste piu' in Pydantic v2: la serializzazione custom
        # passa da field_serializer (o da un tipo annotato con PlainSerializer).
        return value.isoformat(timespec="seconds")


class PostListResponse(PostBase):
    """Le liste tornano un oggetto, non un array nudo.

    Un array in cima alla risposta non e' estendibile: il giorno che serve aggiungere
    il totale o un cursore, e' un breaking change per tutti i client.
    """

    items: list[PostResponse]
    total: int
    limit: int
    offset: int
