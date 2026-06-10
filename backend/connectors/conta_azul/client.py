from __future__ import annotations

import time
from typing import Any

import httpx
from sqlalchemy.orm import Session

from connectors.conta_azul.auth import ContaAzulAuth


class ContaAzulClientError(RuntimeError):
    pass


class ContaAzulClient:
    base_url = "https://api-v2.contaazul.com"

    def __init__(self, db: Session | None = None) -> None:
        self.auth = ContaAzulAuth(db=db)

    def _get_headers(self, empresa_id: int) -> dict[str, str]:
        token = self.auth.get_valid_token(empresa_id)
        return {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    def get(self, endpoint: str, empresa_id: int, params: dict[str, Any] | None = None) -> dict | list:
        url = f"{self.base_url}{endpoint}"
        refreshed_after_401 = False

        for attempt in range(1, 4):
            response = self._request_get(url, empresa_id, params)

            if response.status_code == 429:
                if attempt == 3:
                    raise ContaAzulClientError(f"Rate limit Conta Azul apos 3 tentativas: {endpoint}")
                time.sleep(2)
                continue

            if response.status_code == 401 and not refreshed_after_401:
                self.auth.refresh_token(empresa_id)
                refreshed_after_401 = True
                response = self._request_get(url, empresa_id, params)

            if response.status_code >= 400:
                raise ContaAzulClientError(
                    f"Erro Conta Azul GET {endpoint}: {response.status_code} - {response.text}"
                )

            return response.json()

        raise ContaAzulClientError(f"Falha inesperada ao consultar {endpoint}.")

    def get_paginated(
        self,
        endpoint: str,
        empresa_id: int,
        params: dict[str, Any] | None = None,
    ) -> list[dict]:
        all_items: list[dict] = []
        page = 1
        page_size = 200

        while True:
            request_params = dict(params or {})
            request_params.update({"pagina": page, "tamanho_pagina": page_size})
            payload = self.get(endpoint, empresa_id, request_params)
            items = self._extract_items(payload)
            all_items.extend(items)

            if len(items) < page_size:
                break
            page += 1

        return all_items

    def _request_get(self, url: str, empresa_id: int, params: dict[str, Any] | None) -> httpx.Response:
        with httpx.Client(timeout=60) as client:
            return client.get(url, params=params, headers=self._get_headers(empresa_id))

    @staticmethod
    def _extract_items(payload: dict | list) -> list[dict]:
        if isinstance(payload, list):
            return payload
        for key in ("items", "data", "conteudo", "content"):
            value = payload.get(key)
            if isinstance(value, list):
                return value
        return []
