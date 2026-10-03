
# Architectural and Engineering Trade-offs

## 1. Modular Monolith vs Microservices

### Decision

The application uses a modular monolithic architecture.

### Why

The current system has a focused domain around employee and salary
management. A modular monolith keeps development, testing, and
deployment simple while still maintaining clear boundaries between
modules.

### Benefits

- Lower operational complexity
- Easier local development
- Easier testing
- Simpler deployment
- Clear internal module boundaries

### Trade-off

The application does not provide independent deployment and scaling
of individual modules.

If the system grows significantly, individual modules could be
extracted into services based on actual scaling or business
requirements.

---

## 2. FastAPI

### Decision

FastAPI is used for the REST API.

### Why

FastAPI provides:

- Type-safe request handling
- Pydantic validation
- Automatic OpenAPI documentation
- Dependency injection
- Good support for asynchronous APIs

It also provides a relatively small and explicit framework surface,
which fits the scope of this application.

### Trade-off

The project requires decisions around application structure that are
more opinionated or convention-driven in some larger frameworks.

---

## 3. PostgreSQL

### Decision

PostgreSQL is used as the primary database.

### Why

Salary and employee data require strong relational integrity.

PostgreSQL provides:

- Foreign keys
- Unique constraints
- Check constraints
- Transactions
- Reliable relational data modeling

These capabilities are useful for maintaining employee and salary
consistency.

### Trade-off

A relational database requires explicit schema design and migration
management.

---

## 4. SQLAlchemy ORM

### Decision

SQLAlchemy is used for database access.

### Why

SQLAlchemy provides a clear abstraction over SQL while still allowing
the application to use database-specific capabilities when required.

It also works well with FastAPI and supports explicit transaction
management.

### Trade-off

ORM abstractions can hide some database behavior. Developers still
need to understand SQL, indexes, transactions, and query performance.

---

## 5. Service Layer

### Decision

Business logic is kept in service modules rather than directly in
API route handlers.

### Why

This separates HTTP concerns from business rules.

For example:

```text
API Router
    |
    v
Employee Service
    |
    v
Database

6. Application Validation and Database Constraints
Decision

Important rules are validated at the application level and
protected at the database level where appropriate.

For example:

Application validation
        +
Database constraints
        =
Data integrity
Why

Application validation provides clear API errors.

Database constraints provide protection against invalid data even if
data reaches the database through another code path.

Examples include:

Unique employee code
Unique email
Foreign key relationships
Positive salary values
Trade-off

Some validation rules may exist in more than one layer.

This duplication is intentional because the two layers have different
responsibilities.

7. Alembic Migrations
Decision

Alembic is used for database schema migrations.

Why

Database schema changes should be version controlled and reproducible.

Instead of manually changing the database, migrations provide a
history of schema changes.

Example:

Model Change
     |
     v
Alembic Migration
     |
     v
Database Schema
Trade-off

Developers need to create and maintain migration files as the schema
changes.

The benefit is that database changes become reviewable and repeatable.

8. Database-Level Pagination
Decision

Employee pagination is performed at the database level.

Why

The application should not load every employee into memory before
returning a page.

For example:

GET /api/v1/employees/?page=1&page_size=20

The database returns only the records needed for the requested page.

Benefits
Lower memory usage
Better scalability
Less data transferred between database and application
Trade-off

Pagination requires additional query logic and a count strategy when
total results are returned.

9. Automated Testing
Decision

Pytest is used for automated testing.

Why

The application contains business rules that should be protected
against regressions.

Tests cover both successful and invalid scenarios.

Examples:

Employee CRUD
Duplicate employee validation
Salary creation
Salary updates
Salary history
Multiple active salary prevention
Salary validation
Trade-off

Writing and maintaining tests requires additional development time.

For this assessment, that cost is justified because tests provide
confidence in the implementation and make future changes safer.

10. AI-Assisted Development
Decision

AI tools are used as development assistants.

Why

AI can accelerate:

Boilerplate generation
Debugging
Test case discovery
Documentation
Design exploration

However, generated code is reviewed before being accepted.

Validation Process
AI Suggestion
     |
     v
Review
     |
     v
Compare With Requirements
     |
     v
Implement
     |
     v
Run Tests
     |
     v
Refactor if Required
Trade-off

AI can introduce incorrect assumptions or code that appears valid but
does not match the actual requirements.

Therefore, AI output is treated as a suggestion rather than an
authority.
```
