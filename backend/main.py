from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import uvicorn
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import create_all_tables
from routers.auth import router as auth_router
from routers.clientes import router as clientes_router
from routers.clientes_crm import router as clientes_crm_router
from routers.comercial import router as comercial_router
from routers.dashboard import router as dashboard_router
from routers.financeiro import router as financeiro_router
from routers.financeiro_expandido import router as financeiro_expandido_router
from routers.sync import router as sync_router
from routers.vendas import router as vendas_router
from scheduler import scheduler, start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    create_all_tables()
    start_scheduler()
    yield
    if scheduler.running:
        scheduler.shutdown(wait=False)


app = FastAPI(
    title="RIG Financeiro 2.0 API",
    version="2.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter(prefix="/api/v1")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": "2.0.0"}


app.include_router(router)
app.include_router(auth_router, prefix="/api/v1")
app.include_router(sync_router, prefix="/api/v1")
app.include_router(dashboard_router, prefix="/api/v1")
app.include_router(financeiro_router, prefix="/api/v1")
app.include_router(financeiro_expandido_router, prefix="/api/v1")
app.include_router(vendas_router, prefix="/api/v1")
app.include_router(clientes_router, prefix="/api/v1")
app.include_router(comercial_router, prefix="/api/v1")
app.include_router(clientes_crm_router, prefix="/api/v1")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.environment == "development",
    )
