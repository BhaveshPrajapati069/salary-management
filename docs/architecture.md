# Salary Management System - Architecture

## 1. Overview

The Salary Management System is a REST API built using FastAPI and PostgreSQL.

The system manages:

- Employees
- Countries
- Departments
- Employee salaries
- Salary history

The application follows a layered architecture to keep API handling, business logic, and database operations separated.

The main goals are:

- Maintainable code
- Clear separation of responsibilities
- Testability
- Data integrity
- Simple and pragmatic design
- Easy future extension

---

## 2. Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic

### Database

- PostgreSQL

### Database Migrations

- Alembic

### Testing

- Pytest
- FastAPI TestClient

### Version Control

- Git
- GitHub

---

## 3. High-Level Architecture

```text
                    Client
                      |
                      v
                FastAPI Router
                      |
                      v
              Pydantic Schemas
                      |
                      v
                Service Layer
                      |
                      v
                SQLAlchemy ORM
                      |
                      v
                  PostgreSQL
```

The application is organized as a modular monolith.

Each layer has a specific responsibility.

---

## 4. Project Structure

```text
backend/
│
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── employees.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── exceptions.py
│   │   └── logging_config.py
│   │
│   ├── models/
│   │   ├── country.py
│   │   ├── department.py
│   │   ├── employee.py
│   │   ├── salary.py
│   │   └── salary_history.py
│   │
│   ├── schemas/
│   │   ├── employee.py
│   │   └── salary.py
│   │
│   ├── services/
│   │   ├── employee_service.py
│   │   └── salary_service.py
│   │
│   └── main.py
│
├── alembic/
│
├── tests/
│
└── requirements.txt
```

---

## 5. API Layer

The API layer is responsible for handling HTTP requests.

Responsibilities include:

- Defining API endpoints
- Receiving request parameters
- Request validation
- Dependency injection
- Returning API responses
- HTTP status codes

The API layer should not contain complex business logic.

For example:

```text
POST /api/v1/employees/
```

The router receives the request and delegates the operation to the employee service.

---

## 6. Schema Layer

Pydantic schemas define the API contract.

They are responsible for:

- Request validation
- Response serialization
- Type validation

Examples:

```text
EmployeeCreate
EmployeeUpdate
EmployeeResponse

SalaryCreate
SalaryUpdate
SalaryResponse
```

This prevents invalid request data from reaching the business logic.

---

## 7. Service Layer

The service layer contains the application's business rules.

Examples include:

- Creating employees
- Checking duplicate employee codes
- Checking duplicate email addresses
- Updating employees
- Creating salary records
- Updating salaries
- Creating salary history
- Preventing multiple active salary records
- Validating salary values

Keeping these rules in services prevents business logic from being duplicated across API endpoints.

---

## 8. Model Layer

SQLAlchemy models represent database tables.

Main models include:

```text
Country
Department
Employee
SalaryRecord
SalaryHistory
```

The models define:

- Columns
- Relationships
- Primary keys
- Foreign keys
- Indexes
- Database constraints

---

## 9. Database Layer

The database layer is responsible for PostgreSQL connectivity.

SQLAlchemy is used for:

- Database engine creation
- Connection management
- Sessions
- ORM operations

Alembic is used to manage database schema changes.

Example migration flow:

```text
SQLAlchemy Model Change
          |
          v
Alembic Migration
          |
          v
PostgreSQL Schema
```

Database credentials are loaded through environment variables and are not stored directly in source code.

---

## 10. Employee Creation Flow

The employee creation flow is:

```text
Client
  |
  | POST /api/v1/employees/
  v
FastAPI Router
  |
  v
Pydantic Validation
  |
  v
Employee Service
  |
  +--> Validate Country
  |
  +--> Validate Department
  |
  +--> Check Employee Code
  |
  +--> Check Email
  |
  v
SQLAlchemy
  |
  v
PostgreSQL
  |
  v
Employee Response
```

---

## 11. Salary Creation Flow

Salary creation follows this flow:

```text
Client
  |
  | POST /employees/{id}/salary
  v
FastAPI Router
  |
  v
Pydantic Validation
  |
  v
Salary Service
  |
  +--> Validate Employee
  |
  +--> Validate Salary > 0
  |
  +--> Check Active Salary
  |
  v
SQLAlchemy
  |
  v
PostgreSQL
```

Only one active salary record is allowed for an employee.

---

## 12. Salary Update and History

When an employee's salary is updated, the system keeps a history of the change.

Example:

```text
Current Salary
     |
     | Update
     v
New Salary
     |
     +------> Salary History
```

The history records the previous and new salary values along with the relevant effective dates.

The salary update and history creation should be handled as one transaction.

```text
BEGIN TRANSACTION
        |
        v
Update Salary
        |
        v
Create Salary History
        |
        v
COMMIT
```

If an operation fails:

```text
ROLLBACK
```

This prevents the salary and salary history from becoming inconsistent.

---

## 13. Data Integrity

Data integrity is enforced at two levels.

### Application Level

Business validation is performed before database operations.

Examples:

- Salary must be greater than zero
- Employee code must be unique
- Email must be unique
- An employee cannot have multiple active salaries

### Database Level

PostgreSQL provides the final integrity boundary using:

- Primary keys
- Foreign keys
- Unique constraints
- Check constraints

For example:

```text
base_salary > 0
```

is enforced at the application level and database level.

---

## 14. Error Handling

The application uses centralized exception handling.

The flow is:

```text
Service Layer
     |
     v
Application Exception
     |
     v
Global Exception Handler
     |
     v
JSON Error Response
```

This keeps error responses consistent across the API.

Example:

```json
{
    "error": {
        "message": "Employee not found"
    }
}
```

---

## 15. Pagination and Search

Employee listing supports pagination.

Example:

```text
GET /api/v1/employees/?page=1&page_size=20
```

The API performs pagination at the database level rather than loading all records into application memory.

Employee search can also be performed using fields such as:

- Employee code
- First name
- Last name
- Email

Example:

```text
GET /api/v1/employees/?search=rahul
```

---

## 16. Database Indexing

Indexes are used on frequently queried fields.

Examples include:

```text
employees.employee_code
employees.email
employees.last_name
employees.employment_status
employees.country_id
employees.department_id
```

Indexes are intended to improve lookup and filtering performance.

Indexes are not added indiscriminately because they also introduce storage and write overhead.

---

## 17. Health Check

The application exposes:

```text
GET /health
```

The health endpoint verifies that the application can communicate with PostgreSQL.

Example response:

```json
{
    "status": "ok",
    "database": "connected"
}
```

---

## 18. Testing Architecture

The application uses automated tests to verify important business behavior.

Tests cover:

- Employee creation
- Employee retrieval
- Employee update
- Employee deletion
- Duplicate employee validation
- Salary creation
- Salary update
- Salary history
- Active salary validation
- Salary validation
- Pagination
- Search
- Health check

The goal is to test both successful operations and important business rules.

---

## 19. Architectural Decision: Modular Monolith

The current system uses a modular monolithic architecture instead of microservices.

This decision was made because the current domain is relatively focused.

A modular monolith provides:

- Simpler development
- Easier testing
- Lower operational complexity
- Easier local setup
- Straightforward deployment

The internal modules remain separated so that individual components can be extracted later if the system grows.

Microservices were not introduced prematurely because the current requirements do not justify the additional operational complexity.

---

## 20. Future Improvements

Possible future improvements include:

- Authentication and authorization
- Role-based access control
- Audit logging
- Salary approval workflow
- Redis caching
- Background processing
- Bulk employee import
- Advanced filtering
- CI/CD pipeline
- Application metrics
- Distributed tracing
- Containerized deployment

These features are outside the current scope unless required by the business requirements.
