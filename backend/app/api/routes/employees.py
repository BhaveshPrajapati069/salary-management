from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.employee import Employee
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeListResponse,
    EmployeeResponse,
    EmployeeUpdate,
)
from app.services.employee_service import EmployeeService


router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
)


# ============================================================
# GET EMPLOYEES
# Search + Pagination
# ============================================================

@router.get(
    "/",
    response_model=EmployeeListResponse,
)
def get_employees(
    page: int = 1,
    page_size: int = 100,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    # Validate page
    if page < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page must be greater than or equal to 1",
        )

    # Validate page size
    if page_size < 1 or page_size > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page size must be between 1 and 100",
        )

    query = db.query(Employee)

    # --------------------------------------------------------
    # Search
    # --------------------------------------------------------

    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Employee.employee_code.ilike(search_value),
                Employee.first_name.ilike(search_value),
                Employee.last_name.ilike(search_value),
                Employee.email.ilike(search_value),
            )
        )

    # --------------------------------------------------------
    # Total records
    # --------------------------------------------------------

    total = query.count()

    # --------------------------------------------------------
    # Pagination
    # --------------------------------------------------------

    employees = (
        query
        .order_by(Employee.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": employees,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


# ============================================================
# GET SINGLE EMPLOYEE
# ============================================================

@router.get(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def get_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return employee


# ============================================================
# CREATE EMPLOYEE
# ============================================================

@router.post(
    "/",
    response_model=EmployeeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_employee(
    data: EmployeeCreate,
    db: Session = Depends(get_db),
):
    try:
        return EmployeeService.create_employee(
            db,
            data,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ============================================================
# UPDATE EMPLOYEE
# ============================================================

@router.patch(
    "/{employee_id}",
    response_model=EmployeeResponse,
)
def update_employee(
    employee_id: int,
    data: EmployeeUpdate,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    try:
        return EmployeeService.update_employee(
            db,
            employee,
            data,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )


# ============================================================
# DELETE EMPLOYEE
# ============================================================

@router.delete(
    "/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    db.delete(employee)
    db.commit()

    return None