from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.department import Department
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)

router = APIRouter(
    prefix="/departments",
    tags=["Departments"],
)


@router.get(
    "/",
    response_model=list[DepartmentResponse],
)
def get_departments(
    db: Session = Depends(get_db),
):
    return (
        db.query(Department)
        .order_by(Department.name)
        .all()
    )


@router.get(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    department = (
        db.query(Department)
        .filter(Department.id == department_id)
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    return department


@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    data: DepartmentCreate,
    db: Session = Depends(get_db),
):
    department = Department(
        name=data.name.strip(),
    )

    db.add(department)

    try:
        db.commit()
        db.refresh(department)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department already exists.",
        )

    return department


@router.patch(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update_department(
    department_id: int,
    data: DepartmentUpdate,
    db: Session = Depends(get_db),
):
    department = (
        db.query(Department)
        .filter(Department.id == department_id)
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    if data.name is not None:
        department.name = data.name.strip()

    try:
        db.commit()
        db.refresh(department)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department already exists.",
        )

    return department


@router.delete(
    "/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
):
    department = (
        db.query(Department)
        .filter(Department.id == department_id)
        .first()
    )

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    employee_count = len(department.employees)

    if employee_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Cannot delete this department because "
                "employees are assigned to it."
            ),
        )

    db.delete(department)
    db.commit()

    return None