from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = PROJECT_ROOT / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from database import SessionLocal  # noqa: E402
from models.empresa import Empresa  # noqa: E402


EMPRESAS = [
    "Performa Extreme",
    "SIG do Brasil",
    "CBA Armas",
]


def seed_empresas() -> None:
    with SessionLocal() as db:
        for nome in EMPRESAS:
            exists = db.query(Empresa).filter(Empresa.nome == nome).first()
            if exists:
                print(f"Empresa {nome} ja existe")
                continue
            db.add(Empresa(nome=nome, ativa=True))
            print(f"Empresa {nome} criada")
        db.commit()


if __name__ == "__main__":
    seed_empresas()
    print("Empresas populadas com sucesso.")
