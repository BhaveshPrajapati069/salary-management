// frontend/src/pages/Employees.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEmployees } from "../services/employeeService";
import EmployeeForm from "../components/EmployeeForm";

import "./Employees.css";

function Employees() {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalEmployees, setTotalEmployees] = useState(0);

  const [pageSize] = useState(100);

  /* =========================================================
     LOAD EMPLOYEES
  ========================================================= */

  const loadEmployees = async (
    page = currentPage,
    searchValue = search
  ) => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees({
        page,
        page_size: pageSize,
        search: searchValue.trim() || undefined,
      });

      setEmployees(data?.items ?? []);

      setTotalEmployees(data?.total ?? 0);

    } catch (err) {
      console.error("Employees error:", err);

      console.error(
        "Backend response:",
        err.response?.data
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load employees."
      );

      setEmployees([]);
      setTotalEmployees(0);

    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadEmployees(1, "");
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearch(value);
    setCurrentPage(1);

    loadEmployees(1, value);
  };

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);

    loadEmployees(1, "");
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.ceil(
    totalEmployees / pageSize
  );

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    loadEmployees(page, search);
  };

  /* =========================================================
     PAGE NUMBERS
  ========================================================= */

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const pages = [];

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      currentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let page = start; page <= end; page++) {
      pages.push(page);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  /* =========================================================
     EMPLOYEE INITIALS
  ========================================================= */

  const getInitials = (employee) => {
    const first =
      employee.first_name?.charAt(0) ?? "";

    const last =
      employee.last_name?.charAt(0) ?? "";

    return `${first}${last}`.toUpperCase();
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "employee-status active";

      case "inactive":
        return "employee-status inactive";

      case "terminated":
        return "employee-status terminated";

      default:
        return "employee-status default";
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "UNKNOWN";

    return status.toUpperCase();
  };

  /* =========================================================
     DISPLAY RANGE
  ========================================================= */

  const startRecord =
    totalEmployees === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(
    currentPage * pageSize,
    totalEmployees
  );

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading && employees.length === 0) {
    return (
      <div className="employees-page">
        <div className="employees-loading">
          <div className="loading-spinner" />

          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="employees-page">
      <div className="employees-wrapper">

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="employees-header">

          <div className="employees-title-section">

            <div className="page-icon">
              👥
            </div>

            <div>
              <h1>Employees</h1>

              <p>
                Manage your employees, departments and
                salaries
              </p>
            </div>

          </div>

          <button
            className="add-employee-btn"
            onClick={() => setShowForm(true)}
          >
            <span className="add-icon">
              +
            </span>

            <span>
              Add Employee
            </span>
          </button>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="employee-error">

            <span className="error-icon">
              !
            </span>

            <span>
              {error}
            </span>

            <button
              onClick={() =>
                loadEmployees(
                  currentPage,
                  search
                )
              }
            >
              Retry
            </button>

          </div>
        )}

        {/* =====================================================
            ADD FORM
        ===================================================== */}

        {showForm && (
          <div className="employee-form-wrapper">

            <EmployeeForm
              onSuccess={() => {
                setShowForm(false);

                setCurrentPage(1);

                loadEmployees(1, search);
              }}
              onCancel={() => {
                setShowForm(false);
              }}
            />

          </div>
        )}

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="employee-search-card">

          <div className="search-header">

            <div>
              <h3>
                Find an employee
              </h3>

              <p>
                Search by employee code, name,
                email or designation
              </p>
            </div>

            {search && (
              <span className="search-result-count">
                {totalEmployees} result
                {totalEmployees !== 1
                  ? "s"
                  : ""}
              </span>
            )}

          </div>

          <div className="search-input-wrapper">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search employee code, name or email..."
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* =====================================================
            DIRECTORY
        ===================================================== */}

        <div className="employee-directory">

          {/* DIRECTORY HEADER */}

          <div className="directory-header">

            <div className="directory-title">

              <div className="directory-icon">
                👤
              </div>

              <div>

                <h2>
                  Employee Directory
                </h2>

                <p>
                  {search
                    ? `Showing ${totalEmployees} matching employee${
                        totalEmployees !== 1
                          ? "s"
                          : ""
                      }`
                    : "All employees in your organization"}
                </p>

              </div>

            </div>

            <div className="employee-count">

              <strong>
                {totalEmployees}
              </strong>

              <span>
                {totalEmployees === 1
                  ? "Employee"
                  : "Employees"}
              </span>

            </div>

          </div>

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {employees.length === 0 ? (

            <div className="empty-employees">

              <div className="empty-icon">
                👥
              </div>

              <h3>
                No employees found
              </h3>

              <p>
                {search
                  ? "Try changing your search criteria."
                  : "Add your first employee to get started."}
              </p>

              {search ? (

                <button
                  className="secondary-btn"
                  onClick={clearSearch}
                >
                  Clear Search
                </button>

              ) : (

                <button
                  className="add-employee-btn"
                  onClick={() =>
                    setShowForm(true)
                  }
                >
                  <span className="add-icon">
                    +
                  </span>

                  Add Employee
                </button>

              )}

            </div>

          ) : (

            <>
              {/* ===============================================
                  TABLE
              =============================================== */}

              <div className="employee-table-wrapper">

                <table className="employee-table">

                  <thead>
                    <tr>

                      <th>
                        EMPLOYEE
                      </th>

                      <th>
                        EMAIL
                      </th>

                      <th>
                        DEPARTMENT
                      </th>

                      <th>
                        DESIGNATION
                      </th>

                      <th>
                        STATUS
                      </th>

                      <th className="action-column">
                        ACTION
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {employees.map(
                      (employee) => (

                        <tr
                          key={employee.id}
                        >

                          {/* EMPLOYEE */}

                          <td>

                            <div className="employee-profile">

                              <div className="employee-avatar">
                                {getInitials(
                                  employee
                                )}
                              </div>

                              <div className="employee-name">

                                <strong>
                                  {
                                    employee.first_name
                                  }{" "}
                                  {
                                    employee.last_name
                                  }
                                </strong>

                                <span>
                                  {
                                    employee.employee_code
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* EMAIL */}

                          <td>

                            <span className="employee-email">
                              {
                                employee.email ||
                                "-"
                              }
                            </span>

                          </td>

                          {/* DEPARTMENT */}

                          <td>

                            <span className="department-text">

                              {
                                employee
                                  .department
                                  ?.name ??
                                employee.department_id ??
                                "-"
                              }

                            </span>

                          </td>

                          {/* DESIGNATION */}

                          <td>

                            <span className="designation-text">

                              {
                                employee.designation ||
                                "-"
                              }

                            </span>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={getStatusClass(
                                employee.employment_status
                              )}
                            >

                              <span className="status-dot" />

                              {getStatusLabel(
                                employee.employment_status
                              )}

                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="action-column">

                            <button
                              className="view-employee-btn"
                              onClick={() =>
                                navigate(
                                  `/employees/${employee.id}`
                                )
                              }
                            >
                              <span>
                                View
                              </span>

                              <span className="arrow">
                                →
                              </span>
                            </button>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              {/* ===============================================
                  PAGINATION
              =============================================== */}

              {totalPages > 1 && (

                <div className="employee-pagination">

                  <div className="pagination-info">

                    Showing{" "}
                    <strong>
                      {startRecord}
                    </strong>
                    {" – "}
                    <strong>
                      {endRecord}
                    </strong>
                    {" of "}
                    <strong>
                      {totalEmployees}
                    </strong>
                    {" employees"}

                  </div>

                  <div className="pagination-controls">

                    {/* PREVIOUS */}

                    <button
                      className="pagination-btn pagination-prev"
                      disabled={currentPage === 1}
                      onClick={() =>
                        handlePageChange(
                          currentPage - 1
                        )
                      }
                    >
                      ← Previous
                    </button>

                    {/* PAGE NUMBERS */}

                    <div className="pagination-pages">

                      {getPageNumbers().map(
                        (page, index) => {

                          if (page === "...") {
                            return (
                              <span
                                key={`dots-${index}`}
                                className="pagination-dots"
                              >
                                ...
                              </span>
                            );
                          }

                          return (
                            <button
                              key={page}
                              className={`pagination-page ${
                                currentPage === page
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                handlePageChange(
                                  page
                                )
                              }
                            >
                              {page}
                            </button>
                          );
                        }
                      )}

                    </div>

                    {/* NEXT */}

                    <button
                      className="pagination-btn pagination-next"
                      disabled={
                        currentPage === totalPages
                      }
                      onClick={() =>
                        handlePageChange(
                          currentPage + 1
                        )
                      }
                    >
                      Next →
                    </button>

                  </div>

                </div>

              )}

              {/* LOADING OVERLAY */}

              {loading && (
                <div className="employees-table-loading">
                  <div className="loading-spinner" />
                  <span>
                    Loading...
                  </span>
                </div>
              )}

            </>
          )}

        </div>

      </div>
    </div>
  );
}

export default Employees;