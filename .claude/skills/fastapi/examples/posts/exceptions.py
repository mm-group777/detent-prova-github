"""Eccezioni specifiche del dominio posts.

Ogni classe fissa solo il messaggio: lo status arriva dalla base condivisa, quindi non
puo' capitare che due parti del codice rispondano 404 e 400 alla stessa condizione.
"""

from src.exceptions import Conflict, NotFound, PermissionDenied
from src.posts.constants import ErrorCode


class PostNotFound(NotFound):
    DETAIL = ErrorCode.POST_NOT_FOUND


class SlugAlreadyExists(Conflict):
    DETAIL = ErrorCode.SLUG_ALREADY_EXISTS


class AlreadyPublished(Conflict):
    DETAIL = ErrorCode.ALREADY_PUBLISHED


class NotPostOwner(PermissionDenied):
    DETAIL = ErrorCode.NOT_POST_OWNER
