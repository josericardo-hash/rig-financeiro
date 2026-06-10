from __future__ import annotations

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from analytics import kpi_financeiro_expandido as kpi
from database import get_db

router = APIRouter(prefix="/financeiro", tags=["financeiro-expandido"])


@router.get("/dre")
def dre(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.dre_simplificado(db, empresa_id, data_inicio, data_fim)


@router.get("/dre/comparativo")
def dre_comparativo(mes_atual: date, mes_anterior: date, empresa_id: int | None = None, db: Session = Depends(get_db)):
    return kpi.dre_comparativo(db, empresa_id, mes_atual, mes_anterior)


@router.get("/cap/categorias")
def cap_categorias(empresa_id: int | None = None, data_inicio: date = Query(...), data_fim: date = Query(...), db: Session = Depends(get_db)):
    return kpi.cap_por_categoria(db, empresa_id, data_inicio, data_fim)


@router.get("/cap/calendario")
def cap_calendario(empresa_id: int | None = None, db: Session = Depends(get_db)):
    return kpi.cap_calendario_vencimentos(db, empresa_id)


@router.get("/car/por-vendedor")
def car_vendedor(empresa_id: int | None = None, db: Session = Depends(get_db)):
    return kpi.car_por_vendedor(db, empresa_id)


@router.get("/liquidez")
def liquidez(empresa_id: int | None = None, db: Session = Depends(get_db)):
    return kpi.indice_liquidez(db, empresa_id)


@router.get("/car/evolucao")
def car_evolucao(empresa_id: int | None = None, db: Session = Depends(get_db)):
    return kpi.evolucao_car(db, empresa_id)
