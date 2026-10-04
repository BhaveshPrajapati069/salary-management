from decimal import Decimal

from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.salary_history import SalaryHistory
from app.models.salary_record import SalaryRecord
from app.schemas import salary


class SalaryService:

    @staticmethod
    def create_salary(
        db: Session,
        employee: Employee,
        base_salary: Decimal,
        currency: str,
        effective_from,
    ) -> SalaryRecord:
        
        if base_salary <= 0:
            raise ValueError("Salary must be greater than zero")

        current_salary = (
            db.query(SalaryRecord)
            .filter(
                SalaryRecord.employee_id == employee.id,
                SalaryRecord.effective_to.is_(None),
            )
            .first()
        )

        if current_salary:
            raise ValueError(
                "Employee already has an active salary record"
            )

        salary = SalaryRecord(
            employee_id=employee.id,
            base_salary=base_salary,
            currency=currency,
            effective_from=effective_from,
        )

        db.add(salary)
        db.commit()
        db.refresh(salary)

        return salary
    
    @staticmethod
    def update_salary(
        db: Session,
        employee: Employee,
        new_salary: Decimal,
        effective_date,
        reason: str | None = None,
    ) -> SalaryRecord:

        current_salary = (
            db.query(SalaryRecord)
            .filter(
                SalaryRecord.employee_id == employee.id,
                SalaryRecord.effective_to.is_(None),
            )
            .first()
        )

        if not current_salary:
            raise ValueError(
                "Employee does not have an active salary record"
            )

        if new_salary <= 0:
            raise ValueError(
                "Salary must be greater than zero"
            )

        old_salary = current_salary.base_salary

        if old_salary == new_salary:
            raise ValueError(
                "New salary must be different from current salary"
            )

        change_percentage = (
            (new_salary - old_salary)
            / old_salary
            * Decimal("100")
        )

        current_salary.effective_to = effective_date

        new_record = SalaryRecord(
            employee_id=employee.id,
            base_salary=new_salary,
            currency=current_salary.currency,
            effective_from=effective_date,
        )

        history = SalaryHistory(
            employee_id=employee.id,
            old_salary=old_salary,
            new_salary=new_salary,
            currency=current_salary.currency,
            change_percentage=change_percentage,
            effective_date=effective_date,
            reason=reason,
        )

        db.add(new_record)
        db.add(history)

        try:
            db.commit()
            db.refresh(new_record)
        except Exception:
            db.rollback()
            raise

        return new_record

    @staticmethod
    def get_current_salary(
        db: Session,
        employee: Employee,
    ) -> SalaryRecord | None:

        return (
            db.query(SalaryRecord)
            .filter(
                SalaryRecord.employee_id == employee.id,
                SalaryRecord.effective_to.is_(None),
            )
            .order_by(
                SalaryRecord.effective_from.desc()
            )
            .first()
        )