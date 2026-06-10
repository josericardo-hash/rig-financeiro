from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class Empresa(Base):
    __tablename__ = "empresas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nome: Mapped[str] = mapped_column(String(100), nullable=False)
    cnpj: Mapped[str | None] = mapped_column(String(18), unique=True)
    ativa: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    clientes = relationship("Cliente", back_populates="empresa")
    vendas = relationship("Venda", back_populates="empresa")
    contas_receber = relationship("ContaReceber", back_populates="empresa")
    contas_pagar = relationship("ContaPagar", back_populates="empresa")
