from datetime import date, timedelta
from decimal import Decimal
import random

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.employee import Employee
from app.models.country import Country
from app.models.department import Department
from app.models.salary_record import SalaryRecord
from app.models.salary_history import SalaryHistory


# ============================================================
# CONFIG
# ============================================================

EMPLOYEE_COUNT = 10_000

random.seed(42)


# ============================================================
# SAMPLE DATA
# ============================================================

FIRST_NAMES = [
    "Aarav",
    "Vivaan",
    "Aditya",
    "Arjun",
    "Rahul",
    "Rohan",
    "Karan",
    "Vikram",
    "Amit",
    "Raj",
    "Neha",
    "Priya",
    "Ananya",
    "Sneha",
    "Pooja",
    "Kavya",
    "Riya",
    "Isha",
    "Nisha",
    "Aisha",
]

LAST_NAMES = [
    "Sharma",
    "Patel",
    "Prajapati",
    "Mehta",
    "Shah",
    "Desai",
    "Joshi",
    "Trivedi",
    "Modi",
    "Verma",
    "Gupta",
    "Singh",
    "Kumar",
    "Rao",
    "Kapoor",
]

DESIGNATIONS = [
    "Python Developer",
    "Senior Python Developer",
    "Software Engineer",
    "Senior Software Engineer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "QA Engineer",
    "DevOps Engineer",
    "Data Analyst",
    "Project Manager",
    "HR Executive",
    "UI/UX Designer",
]

DEPARTMENTS = [
    "Engineering",
    "Human Resources",
    "Finance",
    "Sales",
    "Marketing",
    "Operations",
    "IT",
    "Administration",
]

COUNTRIES = [
    {
        "name": "India",
        "code": "IN",
        "currency": "INR",
    },
    {
        "name": "United States",
        "code": "US",
        "currency": "USD",
    },
    {
        "name": "United Kingdom",
        "code": "GB",
        "currency": "GBP",
    },
    {
        "name": "Canada",
        "code": "CA",
        "currency": "CAD",
    },
    {
        "name": "Australia",
        "code": "AU",
        "currency": "AUD",
    },
]


# ============================================================
# HELPERS
# ============================================================

def random_joining_date():
    start = date(2018, 1, 1)
    end = date(2025, 12, 31)

    days = (end - start).days

    return start + timedelta(
        days=random.randint(0, days)
    )


def generate_salary():
    return Decimal(
        random.randint(30000, 150000)
    ).quantize(Decimal("0.01"))


# ============================================================
# COUNTRIES
# ============================================================

def seed_countries(db: Session):
    countries = []

    for country_data in COUNTRIES:
        country = (
            db.query(Country)
            .filter(Country.code == country_data["code"])
            .first()
        )

        if not country:
            country = Country(
                name=country_data["name"],
                code=country_data["code"],
                currency=country_data["currency"],
            )

            db.add(country)
            countries.append(country)

    db.flush()

    # Reload all countries
    return db.query(Country).all()


# ============================================================
# DEPARTMENTS
# ============================================================

def seed_departments(db: Session):
    for department_name in DEPARTMENTS:
        department = (
            db.query(Department)
            .filter(
                Department.name == department_name
            )
            .first()
        )

        if not department:
            db.add(
                Department(
                    name=department_name
                )
            )

    db.flush()

    return db.query(Department).all()


# ============================================================
# CREATE EMPLOYEES
# ============================================================

def seed_employees(
    db: Session,
    countries,
    departments,
):
    print(
        f"Creating {EMPLOYEE_COUNT} employees..."
    )

    employees = []

    for index in range(1, EMPLOYEE_COUNT + 1):

        first_name = random.choice(FIRST_NAMES)
        last_name = random.choice(LAST_NAMES)

        employee_code = f"EMP{index:05d}"

        email = (
            f"{first_name.lower()}."
            f"{last_name.lower()}."
            f"{index}@example.com"
        )

        employee = Employee(
            employee_code=employee_code,
            first_name=first_name,
            last_name=last_name,
            email=email,
            country_id=random.choice(countries).id,
            department_id=random.choice(departments).id,
            designation=random.choice(
                DESIGNATIONS
            ),
            employment_status=random.choices(
                [
                    "active",
                    "inactive",
                    "terminated",
                ],
                weights=[
                    85,
                    10,
                    5,
                ],
            )[0],
            joining_date=random_joining_date(),
        )

        employees.append(employee)

        # Flush every 500 records
        if len(employees) >= 500:
            db.add_all(employees)
            db.flush()

            employees.clear()

            print(
                f"Created {index}/{EMPLOYEE_COUNT} employees"
            )

    if employees:
        db.add_all(employees)
        db.flush()

    print("Employees created successfully.")


# ============================================================
# CREATE SALARIES
# ============================================================

def seed_salaries(db: Session):
    print(
        "Creating current salaries and salary history..."
    )

    employees = db.query(Employee).all()

    salary_records = []
    salary_histories = []

    for index, employee in enumerate(
        employees,
        start=1,
    ):

        # ----------------------------------------------------
        # Determine currency from employee country
        # ----------------------------------------------------

        currency = employee.country.currency

        # ----------------------------------------------------
        # Current salary
        # ----------------------------------------------------

        current_salary = generate_salary()

        effective_from = (
            employee.joining_date
        )

        salary_record = SalaryRecord(
            employee_id=employee.id,
            base_salary=current_salary,
            currency=currency,
            effective_from=effective_from,
            effective_to=None,
        )

        salary_records.append(
            salary_record
        )

        # ----------------------------------------------------
        # Salary history
        # ----------------------------------------------------

        # Previous salary
        old_salary = (
            current_salary * Decimal("0.90")
        ).quantize(
            Decimal("0.01")
        )

        change_percentage = (
            (
                current_salary - old_salary
            )
            / old_salary
            * Decimal("100")
        ).quantize(
            Decimal("0.01")
        )

        history = SalaryHistory(
            employee_id=employee.id,
            old_salary=old_salary,
            new_salary=current_salary,
            currency=currency,
            change_percentage=change_percentage,
            effective_date=effective_from,
            reason="Initial salary",
        )

        salary_histories.append(history)

        # ----------------------------------------------------
        # Flush in batches
        # ----------------------------------------------------

        if len(salary_records) >= 500:

            db.add_all(salary_records)
            db.add_all(salary_histories)

            db.flush()

            salary_records.clear()
            salary_histories.clear()

            print(
                f"Created salary data for "
                f"{index}/{len(employees)} employees"
            )

    if salary_records:
        db.add_all(salary_records)

    if salary_histories:
        db.add_all(salary_histories)

    db.flush()

    print(
        "Salary records and salary history created successfully."
    )


# ============================================================
# MAIN
# ============================================================

def main():

    db = SessionLocal()

    try:

        print("=" * 60)
        print("EMPLOYEE DATABASE SEED")
        print("=" * 60)

        # ----------------------------------------------------
        # Countries
        # ----------------------------------------------------

        countries = seed_countries(db)

        print(
            f"Countries available: {len(countries)}"
        )

        # ----------------------------------------------------
        # Departments
        # ----------------------------------------------------

        departments = seed_departments(db)

        print(
            f"Departments available: {len(departments)}"
        )

        db.commit()

        # ----------------------------------------------------
        # Check existing employees
        # ----------------------------------------------------

        existing_count = (
            db.query(Employee).count()
        )

        if existing_count >= EMPLOYEE_COUNT:

            print(
                f"Database already contains "
                f"{existing_count} employees."
            )

            print(
                "Skipping employee creation."
            )

        else:

            seed_employees(
                db,
                countries,
                departments,
            )

            db.commit()

        # ----------------------------------------------------
        # Salary data
        # ----------------------------------------------------

        salary_count = (
            db.query(SalaryRecord).count()
        )

        if salary_count == 0:

            seed_salaries(db)

            db.commit()

        else:

            print(
                f"Salary records already exist: "
                f"{salary_count}"
            )

        # ----------------------------------------------------
        # Final counts
        # ----------------------------------------------------

        employee_count = (
            db.query(Employee).count()
        )

        salary_count = (
            db.query(SalaryRecord).count()
        )

        history_count = (
            db.query(SalaryHistory).count()
        )

        print()
        print("=" * 60)
        print("SEED COMPLETED")
        print("=" * 60)

        print(
            f"Employees       : {employee_count}"
        )

        print(
            f"Salary Records  : {salary_count}"
        )

        print(
            f"Salary History  : {history_count}"
        )

        print("=" * 60)

    except Exception as exc:

        db.rollback()

        print()
        print("SEED FAILED")
        print(exc)

        raise

    finally:

        db.close()


if __name__ == "__main__":
    main()