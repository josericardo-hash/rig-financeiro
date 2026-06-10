"""add geo perfil itens cliente contatos

Revision ID: 20260609_0002
Revises: 20260609_0001
Create Date: 2026-06-09 00:00:02
"""

from alembic import op

revision = "20260609_0002"
down_revision = "20260609_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    cliente_columns = [
        ("telefone_celular", "VARCHAR(20)"),
        ("telefone_comercial", "VARCHAR(20)"),
        ("whatsapp", "VARCHAR(20)"),
        ("emails_cobranca", "TEXT"),
        ("tipo_pessoa", "VARCHAR(20)"),
        ("cpf", "VARCHAR(14)"),
        ("cnpj", "VARCHAR(18)"),
        ("endereco_rua", "VARCHAR(300)"),
        ("endereco_bairro", "VARCHAR(100)"),
        ("endereco_cidade", "VARCHAR(100)"),
        ("endereco_estado", "VARCHAR(2)"),
        ("endereco_cep", "VARCHAR(10)"),
        ("total_compras", "INTEGER"),
        ("valor_total_comprado", "NUMERIC(15,2)"),
        ("ultima_compra", "DATE"),
        ("curva_abc", "VARCHAR(1)"),
        ("perfil_publico", "VARCHAR(3)"),
    ]
    for name, sql_type in cliente_columns:
        op.execute(f"ALTER TABLE clientes ADD COLUMN IF NOT EXISTS {name} {sql_type}")
    op.execute("ALTER TABLE clientes ALTER COLUMN email TYPE VARCHAR(200)")

    venda_columns = [
        ("cliente_cidade", "VARCHAR(100)"),
        ("cliente_estado", "VARCHAR(2)"),
        ("cliente_tipo", "VARCHAR(2)"),
        ("perfil_publico", "VARCHAR(3)"),
    ]
    for name, sql_type in venda_columns:
        op.execute(f"ALTER TABLE vendas ADD COLUMN IF NOT EXISTS {name} {sql_type}")

    op.execute("""
        CREATE TABLE IF NOT EXISTS itens_venda (
            id VARCHAR(36) PRIMARY KEY,
            venda_id VARCHAR(36) NOT NULL REFERENCES vendas(id),
            empresa_id INTEGER NOT NULL REFERENCES empresas(id),
            produto_nome VARCHAR(300),
            produto_codigo VARCHAR(50),
            tipo VARCHAR(50),
            quantidade NUMERIC(10, 3),
            valor_unitario NUMERIC(15, 2),
            valor_total NUMERIC(15, 2),
            custo_unitario NUMERIC(15, 2),
            custo_total NUMERIC(15, 2),
            margem_item NUMERIC(8, 4)
        )
    """)


def downgrade() -> None:
    op.drop_table("itens_venda")
    for name in ("cliente_cidade", "cliente_estado", "cliente_tipo", "perfil_publico"):
        op.execute(f"ALTER TABLE vendas DROP COLUMN IF EXISTS {name}")
    for name in (
        "telefone_celular",
        "telefone_comercial",
        "whatsapp",
        "emails_cobranca",
        "tipo_pessoa",
        "cpf",
        "cnpj",
        "endereco_rua",
        "endereco_bairro",
        "endereco_cidade",
        "endereco_estado",
        "endereco_cep",
        "total_compras",
        "valor_total_comprado",
        "ultima_compra",
        "curva_abc",
        "perfil_publico",
    ):
        op.execute(f"ALTER TABLE clientes DROP COLUMN IF EXISTS {name}")
