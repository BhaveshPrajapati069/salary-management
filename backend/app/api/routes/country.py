from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.country import Country
from app.schemas.country import (
    CountryCreate,
    CountryResponse,
    CountryUpdate,
)

router = APIRouter(
    prefix="/countries",
    tags=["Countries"],
)


@router.get(
    "/",
    response_model=list[CountryResponse],
)
def get_countries(
    db: Session = Depends(get_db),
):
    return (
        db.query(Country)
        .order_by(Country.name)
        .all()
    )


@router.get(
    "/{country_id}",
    response_model=CountryResponse,
)
def get_country(
    country_id: int,
    db: Session = Depends(get_db),
):
    country = (
        db.query(Country)
        .filter(Country.id == country_id)
        .first()
    )

    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found",
        )

    return country


@router.post(
    "/",
    response_model=CountryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_country(
    data: CountryCreate,
    db: Session = Depends(get_db),
):
    country = Country(
        name=data.name.strip(),
        code=data.code.strip().upper(),
        currency=data.currency.strip().upper(),
    )

    db.add(country)

    try:
        db.commit()
        db.refresh(country)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Country name or code already exists.",
        )

    return country


@router.patch(
    "/{country_id}",
    response_model=CountryResponse,
)
def update_country(
    country_id: int,
    data: CountryUpdate,
    db: Session = Depends(get_db),
):
    country = (
        db.query(Country)
        .filter(Country.id == country_id)
        .first()
    )

    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found",
        )

    if data.name is not None:
        country.name = data.name.strip()

    if data.code is not None:
        country.code = data.code.strip().upper()

    if data.currency is not None:
        country.currency = data.currency.strip().upper()

    try:
        db.commit()
        db.refresh(country)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Country name or code already exists.",
        )

    return country


@router.delete(
    "/{country_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_country(
    country_id: int,
    db: Session = Depends(get_db),
):
    country = (
        db.query(Country)
        .filter(Country.id == country_id)
        .first()
    )

    if not country:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Country not found",
        )

    employee_count = len(country.employees)

    if employee_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Cannot delete this country because "
                "employees are assigned to it."
            ),
        )

    db.delete(country)
    db.commit()

    return None