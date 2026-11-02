"""Configurazione globale dell'applicazione.

Qui sta solo cio' che e' davvero trasversale. Ogni dominio che ha bisogno di
configurazione propria dichiara la sua ``BaseSettings`` in ``src/{dominio}/config.py``
con un ``env_prefix`` dedicato: cosi' e' immediato capire quali variabili servono a
quale modulo, e un dominio si puo' spostare senza portarsi dietro mezzo config.
"""

from enum import StrEnum

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(StrEnum):
    LOCAL = "local"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


class AppConfig(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",  # variabili sconosciute nel .env non fanno esplodere l'avvio
        frozen=True,  # la configurazione non si modifica a runtime
    )

    APP_NAME: str = "api"
    VERSION: str = "0.1.0"
    ENVIRONMENT: Environment = Environment.LOCAL

    # Lista vuota = CORS disattivato. Non mettere ["*"] come default: e' il tipo di
    # comodita' locale che finisce in produzione senza che nessuno se ne accorga.
    CORS_ORIGINS: list[str] = Field(default_factory=list)

    PAGE_SIZE_DEFAULT: int = Field(default=20, ge=1, le=100)


settings = AppConfig()
