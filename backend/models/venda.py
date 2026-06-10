from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class Venda(Base):
    __tablename__ = "vendas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    numero: Mapped[int | None] = mapped_column(Integer)
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    cliente_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("clientes.id"))
    data_venda: Mapped[date] = mapped_column(Date, nullable=False)
    situacao: Mapped[str | None] = mapped_column(String(50))
    valor_bruto: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    valor_liquido: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    valor_desconto: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    valor_frete: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    custo_total: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    margem_bruta: Mapped[Decimal | None] = mapped_column(Numeric(8, 4))
    qtde_itens: Mapped[int | None] = mapped_column(Integer)
    vendedor_nome: Mapped[str | None] = mapped_column(String(100))
    cliente_cidade: Mapped[str | None] = mapped_column(String(100))
    cliente_estado: Mapped[str | None] = mapped_column(String(2))
    cliente_tipo: Mapped[str | None] = mapped_column(String(2))
    perfil_publico: Mapped[str | None] = mapped_column(String(3))
    data_atualizacao: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    empresa = relationship("Empresa", back_populates="vendas")
    cliente = relationship("Cliente", back_populates="vendas")
    itens = relationship("ItemVenda", back_populates="venda", cascade="all, delete-orphan")


class ItemVenda(Base):
    __tablename__ = "itens_venda"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    venda_id: Mapped[str] = mapped_column(String(36), ForeignKey("vendas.id"), nullable=False)
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    produto_nome: Mapped[str | None] = mapped_column(String(300))
    produto_codigo: Mapped[str | None] = mapped_column(String(50))
    tipo: Mapped[str | None] = mapped_column(String(50))
    quantidade: Mapped[Decimal | None] = mapped_column(Numeric(10, 3))
    valor_unitario: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    valor_total: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    custo_unitario: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    custo_total: Mapped[Decimal | None] = mapped_column(Numeric(15, 2))
    margem_item: Mapped[Decimal | None] = mapped_column(Numeric(8, 4))

    venda = relationship("Venda", back_populates="itens")
