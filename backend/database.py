from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from config import settings
from models.base import Base
from models.cliente import Cliente  # noqa: F401
from models.empresa import Empresa  # noqa: F401
from models.financeiro import ContaFinanceira, ContaPagar, ContaReceber, OAuthToken, SyncLog  # noqa: F401
from models.venda import ItemVenda, Venda  # noqa: F401

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_all_tables() -> None:
    Base.metadata.create_all(bind=engine)
