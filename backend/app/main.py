from fastapi import FastAPI

from app.api.routes.employees import router as employee_router
from app.api.routes.salary import router as salary_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.country import router as country_router
from app.api.routes.department import router as department_router

app = FastAPI(
    title="Salary Management API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    employee_router,
    prefix="/api/v1",
)

app.include_router(
    salary_router,
    prefix="/api/v1",
)

app.include_router(
    country_router,
    prefix="/api/v1",
)

app.include_router(
    department_router,
    prefix="/api/v1",
)