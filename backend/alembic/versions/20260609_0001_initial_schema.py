"""initial schema

Revision ID: 20260609_0001
Revises:
Create Date: 2026-06-09 00:00:00
"""

from alembic import op
import sqlalchemy as sa

revision = "20260609_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "empresas",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("nome", sa.String(length=100), nullable=False),
        sa.Column("cnpj", sa.String(length=18), nullable=True),
        sa.Column("ativa", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_empresas")),
        sa.UniqueConstraint("cnpj", name=op.f("uq_empresas_cnpj")),
    )
    op.create_table(
        "clientes",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("empresa_id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(length=200), nullable=False),
        sa.Column("cpf_cnpj", sa.String(length=18), nullable=True),
        sa.Column("email", sa.String(length=100), nullable=True),
        sa.Column("telefone", sa.String(length=20), nullable=True),
        sa.Column("ativo", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], name=op.f("fk_clientes_empresa_id_empresas")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_clientes")),
    )
    op.create_table(
        "contas_pagar",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("empresa_id", sa.Integer(), nullable=False),
        sa.Column("fornecedor_nome", sa.String(length=200), nullable=True),
        sa.Column("descricao", sa.String(length=500), nullable=True),
        sa.Column("categoria_nome", sa.String(length=100), nullable=True),
        sa.Column("centro_custo_nome", sa.String(length=100), nullable=True),
        sa.Column("valor_original", sa.Numeric(15, 2), nullable=True),
        sa.Column("valor_pago", sa.Numeric(15, 2), nullable=True),
        sa.Column("data_vencimento", sa.Date(), nullable=True),
        sa.Column("data_pagamento", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("faixa_aging", sa.String(length=20), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], name=op.f("fk_contas_pagar_empresa_id_empresas")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contas_pagar")),
    )
    op.create_table(
        "contas_receber",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("empresa_id", sa.Integer(), nullable=False),
        sa.Column("cliente_id", sa.String(length=36), nullable=True),
        sa.Column("descricao", sa.String(length=500), nullable=True),
        sa.Column("valor_original", sa.Numeric(15, 2), nullable=True),
        sa.Column("valor_pago", sa.Numeric(15, 2), nullable=True),
        sa.Column("data_vencimento", sa.Date(), nullable=True),
        sa.Column("data_pagamento", sa.Date(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["cliente_id"], ["clientes.id"], name=op.f("fk_contas_receber_cliente_id_clientes")),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], name=op.f("fk_contas_receber_empresa_id_empresas")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_contas_receber")),
    )
    op.create_table(
        "oauth_tokens",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("empresa_id", sa.Integer(), nullable=False),
        sa.Column("access_token_enc", sa.Text(), nullable=False),
        sa.Column("refresh_token_enc", sa.Text(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], name=op.f("fk_oauth_tokens_empresa_id_empresas")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_oauth_tokens")),
        sa.UniqueConstraint("empresa_id", name=op.f("uq_oauth_tokens_empresa_id")),
    )
    op.create_table(
        "sync_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("tipo_sync", sa.String(length=50), nullable=True),
        sa.Column("empresa_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=True),
        sa.Column("registros_processados", sa.Integer(), nullable=False),
        sa.Column("erros", sa.Text(), nullable=True),
        sa.Column("iniciado_em", sa.DateTime(), nullable=False),
        sa.Column("concluido_em", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], name=op.f("fk_sync_logs_empresa_id_empresas")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_sync_logs")),
    )
    op.create_table(
        "vendas",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("numero", sa.Integer(), nullable=True),
        sa.Column("empresa_id", sa.Integer(), nullable=False),
        sa.Column("cliente_id", sa.String(length=36), nullable=True),
        sa.Column("data_venda", sa.Date(), nullable=False),
        sa.Column("situacao", sa.String(length=50), nullable=True),
        sa.Column("valor_bruto", sa.Numeric(15, 2), nullable=True),
        sa.Column("valor_liquido", sa.Numeric(15, 2), nullable=True),
        sa.Column("valor_desconto", sa.Numeric(15, 2), nullable=True),
        sa.Column("valor_frete", sa.Numeric(15, 2), nullable=True),
        sa.Column("custo_total", sa.Numeric(15, 2), nullable=True),
        sa.Column("margem_bruta", sa.Numeric(8, 4), nullable=True),
        sa.Column("qtde_itens", sa.Integer(), nullable=True),
        sa.Column("vendedor_nome", sa.String(length=100), nullable=True),
        sa.Column("data_atualizacao", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["cliente_id"], ["clientes.id"], name=op.f("fk_vendas_cliente_id_clientes")),
        sa.ForeignKeyConstraint(["empresa_id"], ["empresas.id"], name=op.f("fk_vendas_empresa_id_empresas")),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_vendas")),
    )


def downgrade() -> None:
    op.drop_table("vendas")
    op.drop_table("sync_logs")
    op.drop_table("oauth_tokens")
    op.drop_table("contas_receber")
    op.drop_table("contas_pagar")
    op.drop_table("clientes")
    op.drop_table("empresas")
