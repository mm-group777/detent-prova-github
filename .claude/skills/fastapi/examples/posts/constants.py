"""Costanti e messaggi di errore del dominio.

Tenere i messaggi qui invece che inline negli endpoint significa averne uno solo per
condizione di errore: i test possono asserire sul valore dell'enum invece che su una
stringa copiata a mano, e cambiare la formulazione non richiede di cercare in tutto
il progetto.
"""

from enum import StrEnum


class ErrorCode(StrEnum):
    POST_NOT_FOUND = "Post non trovato."
    SLUG_ALREADY_EXISTS = "Esiste gia' un post con questo slug."
    NOT_POST_OWNER = "Non sei l'autore di questo post."
    ALREADY_PUBLISHED = "Il post e' gia' pubblicato."


class PostStatus(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


MAX_TITLE_LENGTH = 200
MAX_TAGS = 10
