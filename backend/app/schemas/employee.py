from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class EmployeeBase(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: EmailStr
    country_id: int
    department_id: int
    designation: str
    employment_status: str
    joining_date: date


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    country_id: int | None = None
    department_id: int | None = None
    designation: str | None = None
    employment_status: str | None = None
    joining_date: date | None = None


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EmployeeListResponse(BaseModel):
    items: list[EmployeeResponse]
    total: int
    page: int
    page_size: int    