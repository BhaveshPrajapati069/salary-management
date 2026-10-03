
# Database Design — Salary Management System

## 1. Overview

The Salary Management System uses PostgreSQL as the relational database.

The database is designed to support approximately 10,000 employees across multiple countries while keeping employee, salary, and salary history data structured and queryable.

The initial database consists of five core tables:

* `countries`
* `departments`
* `employees`
* `salary_records`
* `salary_history`

The design focuses on data integrity, salary history, efficient filtering, and salary analytics.

---

## 2. Database Choice

### PostgreSQL

PostgreSQL is selected because the application contains strongly related data between employees, departments, countries, and salaries.

It also provides:

* Relational data modeling
* Foreign key constraints
* Transactions
* Aggregation capabilities
* Indexing
* Good support for analytical queries
* Scalability beyond the initial 10,000 employees

SQLite would also satisfy the basic relational database requirement, but PostgreSQL provides a better foundation for the salary analytics and future growth of the application.

---

## 3. Entity Relationship Overview

```text
Country
   │
   │ 1:N
   ▼
Employee ◄──── Department
   │
   ├──────────────► SalaryRecord
   │
   └──────────────► SalaryHistory
```

Relationships:

* One country can have many employees.
* One department can have many employees.
* One employee can have multiple salary records.
* One employee can have multiple salary history records.

---

## 4. Countries

### Table: `countries`

| Column     | Type     | Constraints      |
| ---------- | -------- | ---------------- |
| id         | Integer  | Primary Key      |
| name       | String   | Not Null, Unique |
| code       | String   | Not Null, Unique |
| currency   | String   | Not Null         |
| created_at | DateTime | Not Null         |

### Purpose

Stores the countries supported by the organization.

Example:

```text
India          IN    INR
United States  US    USD
United Kingdom GB    GBP
Germany        DE    EUR
```

---

## 5. Departments

### Table: `departments`

| Column     | Type     | Constraints      |
| ---------- | -------- | ---------------- |
| id         | Integer  | Primary Key      |
| name       | String   | Not Null, Unique |
| created_at | DateTime | Not Null         |

### Purpose

Stores organizational departments.

Example:

```text
Engineering
Finance
Human Resources
Sales
Marketing
Product
Operations
Support
```

---

## 6. Employees

### Table: `employees`

| Column            | Type     | Constraints      |
| ----------------- | -------- | ---------------- |
| id                | Integer  | Primary Key      |
| employee_code     | String   | Not Null, Unique |
| first_name        | String   | Not Null         |
| last_name         | String   | Not Null         |
| email             | String   | Not Null, Unique |
| country_id        | Integer  | Foreign Key      |
| department_id     | Integer  | Foreign Key      |
| designation       | String   | Not Null         |
| employment_status | String   | Not Null         |
| joining_date      | Date     | Not Null         |
| created_at        | DateTime | Not Null         |
| updated_at        | DateTime | Not Null         |

### Purpose

Stores the organization's employee information.

Each employee belongs to:

* One country
* One department

---

## 7. Salary Records

### Table: `salary_records`

| Column         | Type     | Constraints |
| -------------- | -------- | ----------- |
| id             | Integer  | Primary Key |
| employee_id    | Integer  | Foreign Key |
| base_salary    | Numeric  | Not Null    |
| currency       | String   | Not Null    |
| effective_from | Date     | Not Null    |
| effective_to   | Date     | Nullable    |
| created_at     | DateTime | Not Null    |
| updated_at     | DateTime | Not Null    |

### Purpose

Stores salary records over time.

Instead of overwriting an employee's previous salary, a new salary record is created when the salary changes.

Example:

```text
Employee: EMP00001

2024-01-01 → ₹700,000
2025-01-01 → ₹850,000
2026-01-01 → ₹1,000,000
```

This allows the system to retain salary information over time.

---

## 8. Salary History

### Table: `salary_history`

| Column            | Type     | Constraints |
| ----------------- | -------- | ----------- |
| id                | Integer  | Primary Key |
| employee_id       | Integer  | Foreign Key |
| old_salary        | Numeric  | Not Null    |
| new_salary        | Numeric  | Not Null    |
| currency          | String   | Not Null    |
| change_percentage | Numeric  | Not Null    |
| effective_date    | Date     | Not Null    |
| reason            | String   | Nullable    |
| created_at        | DateTime | Not Null    |

### Purpose

Stores salary change events.

Example:

```text
Employee: EMP00001

Old Salary:       ₹850,000
New Salary:       ₹1,000,000
Change:           17.65%
Reason:           Annual increment
Effective Date:   2026-01-01
```

---

## 9. Why Salary Records and Salary History Are Separate

`salary_records` represents the employee's salary timeline.

`salary_history` represents a salary change event.

For example:

```text
Salary Records

2024 → ₹700,000
2025 → ₹850,000
2026 → ₹1,000,000
```

Salary history records the changes:

```text
2025:
₹700,000 → ₹850,000

2026:
₹850,000 → ₹1,000,000
```

This separation allows the system to support both current/historical salary queries and salary-change reporting.

---

## 10. Relationships

### Country → Employee

```text
countries.id
     │
     └──── employees.country_id
```

Relationship:

```text
1 Country → Many Employees
```

### Department → Employee

```text
departments.id
     │
     └──── employees.department_id
```

Relationship:

```text
1 Department → Many Employees
```

### Employee → Salary Record

```text
employees.id
     │
     └──── salary_records.employee_id
```

Relationship:

```text
1 Employee → Many Salary Records
```

### Employee → Salary History

```text
employees.id
     │
     └──── salary_history.employee_id
```

Relationship:

```text
1 Employee → Many Salary History Records
```

---

## 11. Indexing Strategy

Indexes will be added to fields that are frequently used for searching, filtering, joining, or retrieving historical salary information.

### Employees

Indexes:

* `employee_code`
* `email`
* `country_id`
* `department_id`
* `employment_status`
* `last_name`

### Salary Records

Indexes:

* `employee_id`
* `effective_from`

### Salary History

Indexes:

* `employee_id`
* `effective_date`

### Reasoning

The application needs to support employee search, filtering by country and department, and salary history queries.

Indexes should be added based on actual query patterns rather than indexing every column, because indexes also have storage and write-maintenance costs.

---

## 12. Salary Currency

Salary records store the currency along with the salary amount.

For example:

```text
base_salary: 1000000
currency: INR
```

and:

```text
base_salary: 100000
currency: USD
```

The initial version will not directly aggregate salaries across different currencies.

Salary analytics should operate within a currency unless a future version introduces a reliable currency conversion mechanism.

This avoids introducing an external exchange-rate dependency into the initial assessment.

---

## 13. Salary Update Transaction

A salary update should be handled as a database transaction.

The flow is:

```text
HR Manager
    │
    ▼
Update Salary API
    │
    ▼
Validate Request
    │
    ▼
Get Current Salary
    │
    ▼
Create New Salary Record
    │
    ▼
Create Salary History
    │
    ▼
Commit Transaction
```

If any operation fails:

```text
ROLLBACK
```

This prevents the system from having an updated salary without the corresponding salary history.

---

## 14. Data Integrity

The database will use:

* Primary keys
* Foreign keys
* Unique constraints
* Not-null constraints
* Transactions

Examples:

```text
employee_code → UNIQUE
email         → UNIQUE
country_id    → FOREIGN KEY
department_id → FOREIGN KEY
employee_id   → FOREIGN KEY
```

These constraints help prevent invalid or inconsistent data.

---

## 15. Deliberately Excluded Tables

The initial version will not include:

* Payroll
* Tax
* Benefits
* Attendance
* Leave
* Recruitment
* Performance management
* Employee self-service
* Payment/bank integration
* Multi-tenant organization management

These are outside the core salary-management problem and would add complexity without being necessary for the initial assessment.

---

## 16. Future Considerations

If the system grows beyond the initial 10,000 employees, possible future improvements include:

* More advanced indexing
* Read replicas
* Caching
* Partitioning of large historical tables
* Background processing for heavy analytics
* Dedicated analytics infrastructure

These are not required for the initial implementation.

---

## 17. Summary

The database design prioritizes:

1. Clear relational modeling
2. Data integrity
3. Salary history preservation
4. Efficient employee search and filtering
5. Salary analytics
6. Transactional salary updates
7. Simplicity appropriate for the current scope

The design intentionally avoids unnecessary complexity while leaving room for future growth.
