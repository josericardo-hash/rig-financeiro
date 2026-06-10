from __future__ import annotations

import json

from sqlalchemy.orm import Session

from connectors.conta_azul.client import ContaAzulClient
from connectors.conta_azul.sync_utils import finish_sync_log, get_nested, start_sync_log
from models.cliente import Cliente
from models.financeiro import SyncLog


def sync_clientes(empresa_id: int, db: Session) -> SyncLog:
    sync_log = start_sync_log(db, "clientes", empresa_id)
    processed = 0
    try:
        client = ContaAzulClient(db=db)
        clientes = client.get_paginated("/v1/cliente", empresa_id)
        for item in clientes:
            cliente_id = item.get("id") or item.get("uuid")
            if not cliente_id:
                continue

            cliente = db.get(Cliente, str(cliente_id))
            if cliente is None:
                cliente = Cliente(id=str(cliente_id), empresa_id=empresa_id, nome="")
                db.add(cliente)

            cliente.empresa_id = empresa_id
            cliente.nome = item.get("nome") or item.get("razao_social") or cliente.nome
            cliente.cpf_cnpj = item.get("cpf_cnpj") or item.get("documento")
            cliente.email = item.get("email") or get_nested(item, "contato", "email")
            cliente.telefone = item.get("telefone") or get_nested(item, "contato", "telefone")
            cobranca = item.get("contato_cobranca_faturamento") or {}
            enderecos = item.get("enderecos") or []
            endereco = enderecos[0] if enderecos else {}
            tipo_pessoa = item.get("tipo_pessoa", "")
            cliente.telefone_celular = item.get("telefone_celular", "")
            cliente.telefone_comercial = item.get("telefone_comercial", "")
            cliente.whatsapp = cobranca.get("whatsapp", "")
            cliente.emails_cobranca = json.dumps(cobranca.get("emails", []), ensure_ascii=False)
            cliente.tipo_pessoa = tipo_pessoa
            cliente.cpf = item.get("cpf", "")
            cliente.cnpj = item.get("cnpj", "")
            cliente.endereco_rua = endereco.get("rua") or endereco.get("logradouro") or ""
            cliente.endereco_bairro = endereco.get("bairro", "")
            cliente.endereco_cidade = endereco.get("cidade", "")
            cliente.endereco_estado = endereco.get("estado", "")
            cliente.endereco_cep = endereco.get("cep", "")
            cliente.perfil_publico = "B2B" if tipo_pessoa == "Jurídica" else "B2C"
            cliente.ativo = bool(item.get("ativo", True))
            processed += 1

            if processed % 100 == 0:
                db.commit()

        db.commit()
        return finish_sync_log(db, sync_log, "sucesso", processed)
    except Exception as exc:
        db.rollback()
        return finish_sync_log(db, sync_log, "erro", processed, str(exc))
