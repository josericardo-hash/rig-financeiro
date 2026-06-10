from __future__ import annotations

import csv
import io
from datetime import date

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from analytics import kpi_comercial as kpi
from database import get_db

router = APIRouter(prefix="/comercial", tags=["comercial"])


@router.get("/produtos")
def produtos(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.vendas_por_produto(db, empresa_id, data_inicio, data_fim)


@router.get("/produtos/tipo")
def produtos_tipo(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.vendas_por_tipo_produto(db, empresa_id, data_inicio, data_fim)


@router.get("/produtos/{produto_nome}/clientes")
def produto_clientes(produto_nome: str, empresa_id: int | None = None, perfil: str | None = None, data_inicio: date | None = None, data_fim: date | None = None, db: Session = Depends(get_db)):
    return kpi.clientes_por_produto(db, empresa_id, produto_nome, perfil, data_inicio, data_fim)


@router.get("/geo/estados")
def geo_estados(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.vendas_por_estado(db, empresa_id, data_inicio, data_fim)


@router.get("/geo/cidades")
def geo_cidades(estado: str, empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.vendas_por_cidade(db, empresa_id, estado, data_inicio, data_fim)


@router.get("/geo/cidade-detalhe")
def geo_cidade_detalhe(estado: str, cidade: str, empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.detalhe_cidade(db, empresa_id, estado, cidade, data_inicio, data_fim)


@router.get("/b2b-b2c")
def b2b_b2c(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.vendas_b2b_b2c(db, empresa_id, data_inicio, data_fim)


@router.get("/top-produtos")
def top_produtos(perfil: str, empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.top_produtos_por_publico(db, empresa_id, perfil, data_inicio, data_fim)


@router.get("/curva-abc/clientes")
def abc_clientes(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.curva_abc_clientes(db, empresa_id, data_inicio, data_fim)


@router.get("/curva-abc/produtos")
def abc_produtos(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.curva_abc_produtos(db, empresa_id, data_inicio, data_fim)


@router.get("/sazonalidade")
def sazonalidade(empresa_id: int | None = None, db: Session = Depends(get_db)):
    return kpi.sazonalidade_vendas(db, empresa_id)


@router.get("/concentracao")
def concentracao(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.concentracao_clientes(db, empresa_id, data_inicio, data_fim)


@router.get("/campanha")
def campanha(empresa_id: int | None = None, produto_nome: str | None = None, perfil: str | None = None, estado: str | None = None, curva_abc: str | None = None, db: Session = Depends(get_db)):
    return kpi.lista_campanha(db, empresa_id, produto_nome, perfil, estado, curva_abc)


class ExportRequest(BaseModel):
    filtros: dict = {}
    formato: str = "csv"


@router.post("/campanha/exportar")
def campanha_exportar(payload: ExportRequest, db: Session = Depends(get_db)):
    data = kpi.lista_campanha(db, payload.filtros.get("empresa_id"), payload.filtros.get("produto_nome"), payload.filtros.get("perfil"), payload.filtros.get("estado"), payload.filtros.get("curva_abc"))
    if payload.formato == "json":
        return data
    output = io.StringIO()
    fieldnames = ["nome", "perfil", "email", "whatsapp", "telefone", "cidade", "estado", "produto_top", "valor_total", "curva_abc"]
    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    writer.writerows(data)
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=campanha.csv"})
