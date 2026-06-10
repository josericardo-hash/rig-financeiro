from __future__ import annotations

import base64
from datetime import datetime, timedelta
from urllib.parse import urlencode
from uuid import uuid4

import httpx
from cryptography.fernet import Fernet, InvalidToken
from sqlalchemy.orm import Session

from config import settings
from database import SessionLocal
from models.financeiro import OAuthToken

AUTH_BASE_URL = "https://auth.contaazul.com"
AUTHORIZATION_URL = f"{AUTH_BASE_URL}/login"
TOKEN_URL = f"{AUTH_BASE_URL}/oauth2/token"


class ContaAzulAuthError(RuntimeError):
    pass


class ContaAzulAuth:
    def __init__(self, db: Session | None = None) -> None:
        self.db = db
        self._fernet = Fernet(self._fernet_key())

    def get_authorization_url(self) -> str:
        params = {
            "response_type": "code",
            "client_id": settings.contaazul_client_id,
            "redirect_uri": settings.contaazul_redirect_uri,
            "state": str(uuid4()),
            "scope": "openid profile aws.cognito.signin.user.admin",
        }
        return f"{AUTHORIZATION_URL}?{urlencode(params)}"

    def exchange_code_for_token(self, code: str, empresa_id: int) -> dict:
        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": settings.contaazul_redirect_uri,
        }
        token_data = self._post_token(payload)
        self._save_token_pair(empresa_id, token_data)
        return token_data

    def refresh_token(self, empresa_id: int) -> str:
        with self._session_scope() as db:
            token = db.query(OAuthToken).filter(OAuthToken.empresa_id == empresa_id).first()
            if token is None:
                raise ContaAzulAuthError(f"Token Conta Azul nao encontrado para empresa_id={empresa_id}.")

            refresh_token = self._decrypt(token.refresh_token_enc)
            token_data = self._post_token(
                {
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                }
            )
            self._save_token_pair(empresa_id, token_data, db=db)
            return token_data["access_token"]

    def get_valid_token(self, empresa_id: int) -> str:
        with self._session_scope() as db:
            token = db.query(OAuthToken).filter(OAuthToken.empresa_id == empresa_id).first()
            if token is None:
                raise ContaAzulAuthError(f"Token Conta Azul nao encontrado para empresa_id={empresa_id}.")

            if token.expires_at and token.expires_at > datetime.utcnow() + timedelta(minutes=5):
                return self._decrypt(token.access_token_enc)

        return self.refresh_token(empresa_id)

    def _post_token(self, payload: dict[str, str]) -> dict:
        credentials = f"{settings.contaazul_client_id}:{settings.contaazul_client_secret}"
        basic_token = base64.b64encode(credentials.encode("utf-8")).decode("ascii")
        headers = {
            "Authorization": f"Basic {basic_token}",
            "Content-Type": "application/x-www-form-urlencoded",
        }
        with httpx.Client(timeout=30) as client:
            response = client.post(TOKEN_URL, data=payload, headers=headers)
        if response.status_code >= 400:
            raise ContaAzulAuthError(f"Falha OAuth Conta Azul: {response.status_code} - {response.text}")
        return response.json()

    def _save_token_pair(self, empresa_id: int, token_data: dict, db: Session | None = None) -> None:
        owns_session = db is None
        session = db or SessionLocal()
        try:
            token = session.query(OAuthToken).filter(OAuthToken.empresa_id == empresa_id).first()
            if token is None:
                token = OAuthToken(empresa_id=empresa_id)
                session.add(token)

            expires_in = int(token_data.get("expires_in", 3600))
            token.access_token_enc = self._encrypt(token_data["access_token"])
            token.refresh_token_enc = self._encrypt(token_data.get("refresh_token", ""))
            token.expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            token.updated_at = datetime.utcnow()
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            if owns_session:
                session.close()

    def _session_scope(self):
        if self.db is not None:
            return _ExistingSessionContext(self.db)
        return SessionLocal()

    def _encrypt(self, value: str) -> str:
        return self._fernet.encrypt(value.encode("utf-8")).decode("ascii")

    def _decrypt(self, value: str) -> str:
        try:
            return self._fernet.decrypt(value.encode("ascii")).decode("utf-8")
        except InvalidToken as exc:
            raise ContaAzulAuthError("Token armazenado nao pode ser descriptografado.") from exc

    @staticmethod
    def _fernet_key() -> bytes:
        raw = settings.secret_key.encode("utf-8")
        try:
            Fernet(raw)
            return raw
        except ValueError:
            digest = base64.urlsafe_b64encode(raw.ljust(32, b"0")[:32])
            return digest


class _ExistingSessionContext:
    def __init__(self, db: Session) -> None:
        self.db = db

    def __enter__(self) -> Session:
        return self.db

    def __exit__(self, exc_type, exc, traceback) -> bool:
        return False
