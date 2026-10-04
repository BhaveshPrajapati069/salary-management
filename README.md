
# Salary Management System

A full-stack employee and salary management application built with
**FastAPI**, **SQLAlchemy**, **PostgreSQL**, and **React.js**.

## Features

### Employee Management

- Add employees
- View employee directory
- Search by employee code, name, email, or designation
- View employee details
- Edit employee information
- Manage Active, Inactive, and Terminated status
- Manage joining date
- Responsive employee directory
- Delete is not exposed in the dashboard UI

### Salary Management

- Create an employee’s initial salary
- Update salary
- Set effective date
- Add salary-change reason
- View current salary
- View salary history
- Display salary currency and salary change percentage

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- Uvicorn

### Frontend

- React.js
- React Router
- Axios
- Bootstrap
- CSS

## Project Structure

```text
salary-management/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── routers/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmployeeForm.jsx
│   │   │   └── SalaryForm.jsx
│   │   ├── pages/
│   │   │   ├── Employees.jsx
│   │   │   └── EmployeeEdit.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── employeeService.js
│   │   │   └── salaryService.js
│   │   └── ...
│   └── package.json
└── README.md
```

## Backend Setup

### 1. Create and activate a virtual environment

Windows:

```bash
python -m venv venv
```

Git Bash:

```bash
source venv/Scripts/activate
```

Command Prompt:

```cmd
venv\Scripts\activate
```

PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure PostgreSQL

Create a database:

```sql
CREATE DATABASE salary_management;
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/salary_management
```

Replace the username, password, host, port, and database name with your
local configuration.

### 4. Start FastAPI

```bash
uvicorn app.main:app --reload
```

API:

```text
http://127.0.0.1:8000
```

Swagger:

```text
http://127.0.0.1:8000/docs
```

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite normally starts the frontend at:

```text
http://localhost:5173
```

## API Endpoints

### Employees

```http
GET    /employees/
GET    /employees/{employee_id}
POST   /employees/
PATCH  /employees/{employee_id}
DELETE /employees/{employee_id}
```

Employee listing supports pagination and search:

```http
GET /employees/?page=1&page_size=20&search=bhavesh
```

### Salary

```http
POST  /employees/{employee_id}/salary
PATCH /employees/{employee_id}/salary
GET   /employees/{employee_id}/salary/history
```

## Example: Create Employee

```json
{
  "employee_code": "EMP001",
  "first_name": "Bhavesh",
  "last_name": "Prajapati",
  "email": "bhavesh@example.com",
  "country_id": 1,
  "department_id": 1,
  "designation": "Python AI Developer",
  "employment_status": "active",
  "joining_date": "2026-10-03"
}
```

## Example: Create Salary

```json
{
  "base_salary": 650000,
  "currency": "INR",
  "effective_from": "2026-11-04"
}
```

## Example: Update Salary

```json
{
  "new_salary": 700000,
  "effective_date": "2027-01-01",
  "reason": "Annual salary revision"
}
```

## Employee Workflow

```text
Employees
   |
   +-- Search
   |
   +-- Add Employee
   |
   +-- View Employee
          |
          +-- Edit Employee
          |
          +-- Current Salary
          |
          +-- Update Salary
          |
          +-- Salary History
```

## Frontend Components

### EmployeeForm

Handles employee creation with:

- Employee code
- First name
- Last name
- Email
- Country ID
- Department ID
- Designation
- Employment status
- Joining date

### EmployeeEdit

Loads an employee by ID, displays the existing values, and updates the
employee through the `PATCH /employees/{employee_id}` endpoint.

### SalaryForm

Supports both:

- **Create mode:** base salary, currency, effective date
- **Update mode:** new salary, effective date, reason

Salary values are validated on the frontend before submission.

## Search

The employee directory filters employees by:

- Employee code
- Full name
- Email
- Designation

The results update while the user types.

## Error Handling

FastAPI/Pydantic validation errors are converted into readable frontend
messages.

The frontend handles:

- Validation errors
- API errors
- Loading states
- Empty employee lists
- Salary validation errors

## Development

Run backend:

```bash
cd backend
source venv/Scripts/activate
uvicorn app.main:app --reload
```

Run frontend in another terminal:

```bash
cd frontend
npm run dev
```

Use Swagger UI to test backend APIs:

```text
http://127.0.0.1:8000/docs
```

## Recommended .gitignore

```gitignore
venv/
__pycache__/
*.pyc
.env
.env.*
node_modules/
dist/
.vscode/
.idea/
.DS_Store
Thumbs.db
```

## Future Enhancements

- Authentication and role-based access
- Department management
- Country management
- Payroll calculation
- Payslip generation
- Attendance management
- Leave management
- Dashboard statistics
- Excel/CSV export
- Salary history filters
- Server-side search
- Docker deployment
- Production deployment

## License

This project is intended for development and internal project use.
