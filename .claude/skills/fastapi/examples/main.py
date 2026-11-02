"""Punto di ingresso dell'applicazione.

Qui dentro sta solo il cablaggio: creazione dell'app, middleware, registrazione dei
router e gestione del ciclo di vita. Nessuna logica di business.
"""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import Environment, settings
from src.posts.router import router as posts_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Risorse condivise: aperte all'avvio, chiuse allo spegnimento.

    Qui vanno pool di connessioni, client HTTP riusabili, cache. Aprire un client
    per richiesta e' uno degli sprechi piu' comuni: creane uno solo e mettilo in
    ``app.state``.
    """
    # esempio: app.state.http = httpx.AsyncClient(timeout=10.0)
    yield
    # esempio: await app.state.http.aclose()


def build_app() -> FastAPI:
    """Costruire l'app in una funzione rende banale istanziarla nei test."""
    kwargs: dict[str, Any] = {
        "title": settings.APP_NAME,
        "version": settings.VERSION,
        "lifespan": lifespan,
    }

    # Fuori dagli ambienti fidati la documentazione non deve essere raggiungibile:
    # openapi_url=None disattiva /docs, /redoc e /openapi.json insieme.
    if settings.ENVIRONMENT is Environment.PRODUCTION:
        kwargs["openapi_url"] = None

    app = FastAPI(**kwargs)

    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.CORS_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(posts_router)

    return app


app = build_app()


@app.get("/health", tags=["infra"], summary="Liveness probe")
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.ENVIRONMENT.value}
