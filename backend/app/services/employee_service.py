from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.country import Country
from app.models.department import Department
from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate, EmployeeUpdate


class EmployeeService:

    @staticmethod
    def create_employee(
        db: Session,
        data: EmployeeCreate,
    ) -> Employee:

        # Check employee code
        existing_employee = (
            db.query(Employee)
            .filter(Employee.employee_code == data.employee_code)
            .first()
        )

        if existing_employee:
            raise ValueError("Employee code already exists")

        # Check email
        existing_email = (
            db.query(Employee)
            .filter(Employee.email == data.email)
            .first()
        )

        if existing_email:
            raise ValueError("Employee email already exists")

        # Check country
        country = (
            db.query(Country)
            .filter(Country.id == data.country_id)
            .first()
        )

        if not country:
            raise ValueError("Country not found")

        # Check department
        department = (
            db.query(Department)
            .filter(Department.id == data.department_id)
            .first()
        )

        if not department:
            raise ValueError("Department not found")

        employee = Employee(
            employee_code=data.employee_code,
            first_name=data.first_name,
            last_name=data.last_name,
            email=data.email,
            country_id=data.country_id,
            department_id=data.department_id,
            designation=data.designation,
            employment_status=data.employment_status,
            joining_date=data.joining_date,
        )

        db.add(employee)

        try:
            db.commit()
            db.refresh(employee)
        except IntegrityError:
            db.rollback()
            raise ValueError("Unable to create employee")

        return employee

    @staticmethod
    def update_employee(
        db: Session,
        employee: Employee,
        data: EmployeeUpdate,
    ) -> Employee:

        update_data = data.model_dump(exclude_unset=True)

        if "email" in update_data:
            existing_email = (
                db.query(Employee)
                .filter(
                    Employee.email == update_data["email"],
                    Employee.id != employee.id,
                )
                .first()
            )

            if existing_email:
                raise ValueError("Employee email already exists")

        if "country_id" in update_data:
            country = (
                db.query(Country)
                .filter(Country.id == update_data["country_id"])
                .first()
            )

            if not country:
                raise ValueError("Country not found")

        if "department_id" in update_data:
            department = (
                db.query(Department)
                .filter(
                    Department.id == update_data["department_id"]
                )
                .first()
            )

            if not department:
                raise ValueError("Department not found")

        for field, value in update_data.items():
            setattr(employee, field, value)

        try:
            db.commit()
            db.refresh(employee)
        except IntegrityError:
            db.rollback()
            raise ValueError("Unable to update employee")

        return employee    