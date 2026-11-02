"""Eccezioni base condivise da tutti i domini.

Sottoclassare ``HTTPException`` con status e messaggio dichiarati sulla classe
permette agli endpoint di sollevare ``PostNotFound()`` invece di ripetere
``HTTPException(404, "...")`` con testi ogni volta leggermente diversi. Il vantaggio
si vede quando devi cambiare un messaggio o uno status: un punto solo.

Ogni dominio deriva le proprie eccezioni da queste, in ``src/{dominio}/exceptions.py``.
"""

from typing import Any

from fastapi import HTTPException, status


class APIError(HTTPException):
    """Base di tutte le eccezioni applicative."""

    STATUS_CODE: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    DETAIL: str = "Errore interno del server."

    def __init__(
        self,
        detail: str | None = None,
        headers: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            status_code=self.STATUS_CODE,
            detail=detail or self.DETAIL,
            headers=headers,
        )


class BadRequest(APIError):
    STATUS_CODE = status.HTTP_400_BAD_REQUEST
    DETAIL = "Richiesta non valida."


class NotAuthenticated(APIError):
    STATUS_CODE = status.HTTP_401_UNAUTHORIZED
    DETAIL = "Autenticazione richiesta."

    def __init__(self, detail: str | None = None) -> None:
        # Un 401 senza WWW-Authenticate e' formalmente incompleto e confonde i client.
        super().__init__(detail=detail, headers={"WWW-Authenticate": "Bearer"})


class PermissionDenied(APIError):
    STATUS_CODE = status.HTTP_403_FORBIDDEN
    DETAIL = "Permessi insufficienti."


class NotFound(APIError):
    STATUS_CODE = status.HTTP_404_NOT_FOUND
    DETAIL = "Risorsa non trovata."


class Conflict(APIError):
    STATUS_CODE = status.HTTP_409_CONFLICT
    DETAIL = "La risorsa e' in conflitto con lo stato attuale."
