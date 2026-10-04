from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class SalaryCreate(BaseModel):
    base_salary: Decimal
    currency: str
    effective_from: date


class SalaryUpdate(BaseModel):
    new_salary: Decimal
    effective_date: date
    reason: str | None = None


class SalaryResponse(BaseModel):
    id: int
    employee_id: int
    base_salary: Decimal
    currency: str
    effective_from: date
    effective_to: date | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SalaryHistoryResponse(BaseModel):
    id: int
    employee_id: int
    old_salary: Decimal
    new_salary: Decimal
    currency: str
    change_percentage: Decimal
    effective_date: date
    reason: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)