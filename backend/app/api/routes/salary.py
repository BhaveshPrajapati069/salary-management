from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.employee import Employee
from app.schemas.salary import (
    SalaryCreate,
    SalaryHistoryResponse,
    SalaryResponse,
    SalaryUpdate,
)
from app.services.salary_service import SalaryService
from app.models.salary_history import SalaryHistory

router = APIRouter(
    prefix="/employees",
    tags=["Salary"],
)


@router.post(
    "/{employee_id}/salary",
    response_model=SalaryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_salary(
    employee_id: int,
    data: SalaryCreate,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    try:
        return SalaryService.create_salary(
            db=db,
            employee=employee,
            base_salary=data.base_salary,
            currency=data.currency,
            effective_from=data.effective_from,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )
        
@router.patch(
    "/{employee_id}/salary",
    response_model=SalaryResponse,
)
def update_salary(
    employee_id: int,
    data: SalaryUpdate,
    db: Session = Depends(get_db),
):
    employee = (
        db.query(Employee)
        .filter(Employee.id == employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    try:
        return SalaryService.update_salary(
            db=db,
            employee=employee,
            new_salary=data.new_salary,
            effective_date=data.effective_date,
            reason=data.reason,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

@router.get(
    "/{employee_id}/salary",
    response_model=SalaryResponse,
)
def get_current_salary(
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
            status_code=404,
            detail="Employee not found",
        )

    salary = SalaryService.get_current_salary(
        db=db,
        employee=employee,
    )

    if not salary:
        raise HTTPException(
            status_code=404,
            detail="No active salary found",
        )

    return salary

@router.get(
    "/{employee_id}/salary/history",
    response_model=list[SalaryHistoryResponse],
)
def get_salary_history(
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
            status_code=404,
            detail="Employee not found",
        )

    return (
        db.query(SalaryHistory)
        .filter(
            SalaryHistory.employee_id == employee_id
        )
        .order_by(
            SalaryHistory.effective_date.desc()
        )
        .all()
    )                