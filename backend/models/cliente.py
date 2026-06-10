from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base


class Cliente(Base):
    __tablename__ = "clientes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    empresa_id: Mapped[int] = mapped_column(Integer, ForeignKey("empresas.id"), nullable=False)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    cpf_cnpj: Mapped[str | None] = mapped_column(String(18))
    email: Mapped[str | None] = mapped_column(String(200))
    telefone: Mapped[str | None] = mapped_column(String(20))
    telefone_celular: Mapped[str | None] = mapped_column(String(20))
    telefone_comercial: Mapped[str | None] = mapped_column(String(20))
    whatsapp: Mapped[str | None] = mapped_column(String(20))
    emails_cobranca: Mapped[str | None] = mapped_column(Text)
    tipo_pessoa: Mapped[str | None] = mapped_column(String(20))
    cpf: Mapped[str | None] = mapped_column(String(14))
    cnpj: Mapped[str | None] = mapped_column(String(18))
    endereco_rua: Mapped[str | None] = mapped_column(String(300))
    endereco_bairro: Mapped[str | None] = mapped_column(String(100))
    endereco_cidade: Mapped[str | None] = mapped_column(String(100))
    endereco_estado: Mapped[str | None] = mapped_column(String(2))
    endereco_cep: Mapped[str | None] = mapped_column(String(10))
    total_compras: Mapped[int | None] = mapped_column(Integer, default=0)
    valor_total_comprado: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), default=0)
    ultima_compra: Mapped[date | None] = mapped_column(Date)
    curva_abc: Mapped[str | None] = mapped_column(String(1))
    perfil_publico: Mapped[str | None] = mapped_column(String(3))
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    empresa = relationship("Empresa", back_populates="clientes")
    vendas = relationship("Venda", back_populates="cliente")
    contas_receber = relationship("ContaReceber", back_populates="cliente")
