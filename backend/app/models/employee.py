from datetime import date, datetime

from app.models.salary_history import SalaryHistory
from app.models.salary_record import SalaryRecord
from sqlalchemy import Date, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.country import Country
from app.models.department import Department


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)

    employee_code: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    country_id: Mapped[int] = mapped_column(
        ForeignKey("countries.id"),
        nullable=False,
        index=True,
    )

    department_id: Mapped[int] = mapped_column(
        ForeignKey("departments.id"),
        nullable=False,
        index=True,
    )

    designation: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    employment_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )

    joining_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    country: Mapped["Country"] = relationship(
        back_populates="employees"
    )

    department: Mapped["Department"] = relationship(
        back_populates="employees"
    )

    salary_records: Mapped[list["SalaryRecord"]] = relationship(
        back_populates="employee"
    )

    salary_history: Mapped[list["SalaryHistory"]] = relationship(
        back_populates="employee"
    )