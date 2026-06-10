from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class ContaReceber(Base):
    __tablename__ = "contas_receber"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    cliente_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("clientes.id"))
    descricao: Mapped[str | None] = mapped_column(String(500))
    valor_original: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    valor_pago: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    data_vencimento: Mapped[date | None] = mapped_column(Date)
    data_pagamento: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str | None] = mapped_column(String(50))
    faixa_aging: Mapped[str | None] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="contas_receber")
    cliente = relationship("Cliente", back_populates="contas_receber")


class ContaPagar(Base):
    __tablename__ = "contas_pagar"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    fornecedor_nome: Mapped[str | None] = mapped_column(String(200))
    descricao: Mapped[str | None] = mapped_column(String(500))
    categoria_nome: Mapped[str | None] = mapped_column(String(100))
    centro_custo_nome: Mapped[str | None] = mapped_column(String(100))
    valor_original: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    valor_pago: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    data_vencimento: Mapped[date | None] = mapped_column(Date)
    data_pagamento: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="contas_pagar")


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tipo_sync: Mapped[str | None] = mapped_column(String(50))
    empresa_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("empresas.id"))
    status: Mapped[str | None] = mapped_column(String(20))
    registros_processados: Mapped[int] = mapped_column(Integer, default=0)
    erros: Mapped[str | None] = mapped_column(Text)
    iniciado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    concluido_em: Mapped[datetime | None] = mapped_column(DateTime)


class ContaFinanceira(Base):
    __tablename__ = "contas_financeiras"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    tipo: Mapped[str | None] = mapped_column(String(50))
    saldo_atual: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    ativa: Mapped[bool] = mapped_column(Boolean, default=True)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class OAuthToken(Base):
    __tablename__ = "oauth_tokens"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), unique=True)
    access_token_enc: Mapped[str] = mapped_column(Text, nullable=False)
    refresh_token_enc: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )
