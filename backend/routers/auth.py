from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from connectors.conta_azul.auth import ContaAzulAuth
from database import get_db
from models.cliente import Cliente
from models.empresa import Empresa
from models.financeiro import ContaPagar, ContaReceber, OAuthToken
from models.venda import Venda

router = APIRouter(prefix="/auth", tags=["auth"])


class ManualTokenRequest(BaseModel):
    empresa_id: int
    code: str


@router.get("/contaazul/url")
def contaazul_authorization_url(empresa_id: int = Query(...), db: Session = Depends(get_db)) -> dict[str, str | int]:
    auth = ContaAzulAuth(db=db)
    return {"empresa_id": empresa_id, "authorization_url": auth.get_authorization_url()}


@router.get("/contaazul/callback")
def contaazul_callback(
    code: str,
    state: str | None = None,
    empresa_id: int = Query(...),
    db: Session = Depends(get_db),
) -> RedirectResponse:
    auth = ContaAzulAuth(db=db)
    auth.exchange_code_for_token(code, empresa_id)
    return RedirectResponse(url=f"http://localhost:5173/configuracoes?contaazul=sucesso&empresa_id={empresa_id}")


@router.post("/contaazul/manual-token")
def contaazul_manual_token(payload: ManualTokenRequest, db: Session = Depends(get_db)) -> dict[str, str | bool]:
    empresa = db.query(Empresa).filter(Empresa.id == payload.empresa_id).one_or_none()
    if empresa is None:
        raise HTTPException(status_code=404, detail="Empresa nao encontrada.")

    auth = ContaAzulAuth(db=db)
    auth.exchange_code_for_token(payload.code.strip(), payload.empresa_id)
    return {"success": True, "empresa": empresa.nome}


@router.get("/status")
def status_integracao(db: Session = Depends(get_db)) -> list[dict]:
    empresas = db.query(Empresa).order_by(Empresa.id).all()
    output = []
    for empresa in empresas:
        token = db.query(OAuthToken).filter(OAuthToken.empresa_id == empresa.id).one_or_none()
        token_valido = bool(token and token.expires_at > datetime.utcnow())
        output.append({
            "empresa_id": empresa.id,
            "empresa_nome": empresa.nome,
            "oauth_configurado": token is not None,
            "token_valido": token_valido,
            "token_expira_em": token.expires_at.isoformat() if token else None,
            "ultimo_sync": token.updated_at.isoformat() if token else None,
            "registros_no_banco": {
                "vendas": db.query(Venda).filter(Venda.empresa_id == empresa.id).count(),
                "clientes": db.query(Cliente).filter(Cliente.empresa_id == empresa.id).count(),
                "car": db.query(ContaReceber).filter(ContaReceber.empresa_id == empresa.id).count(),
                "cap": db.query(ContaPagar).filter(ContaPagar.empresa_id == empresa.id).count(),
            },
        })
    return output
