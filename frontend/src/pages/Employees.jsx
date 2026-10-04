// frontend/src/pages/Employees.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getEmployees } from "../services/employeeService";
import EmployeeForm from "../components/EmployeeForm";

import "./Employees.css";

function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();

      setEmployees(data?.items ?? data ?? []);
    } catch (err) {
      console.error("Employees error:", err);
      setError("Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) {
      return true;
    }

    const fullName =
      `${employee.first_name ?? ""} ${employee.last_name ?? ""}`
        .toLowerCase()
        .trim();

    return (
      employee.employee_code
        ?.toLowerCase()
        .includes(searchValue) ||
      fullName.includes(searchValue) ||
      employee.email?.toLowerCase().includes(searchValue) ||
      employee.designation?.toLowerCase().includes(searchValue)
    );
  });

  const getInitials = (employee) => {
    const first = employee.first_name?.charAt(0) ?? "";
    const last = employee.last_name?.charAt(0) ?? "";

    return `${first}${last}`.toUpperCase();
  };

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

  if (loading) {
    return (
      <div className="employees-page">
        <div className="employees-loading">
          <div className="loading-spinner" />
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="employees-page">
      <div className="employees-wrapper">

        {/* ================= PAGE HEADER ================= */}

        <div className="employees-header">

          <div className="employees-title-section">
            <div className="page-icon">
              👥
            </div>

            <div>
              <h1>Employees</h1>

              <p>
                Manage your employees, departments and salaries
              </p>
            </div>
          </div>

          <button
            className="add-employee-btn"
            onClick={() => setShowForm(true)}
          >
            <span className="add-icon">+</span>
            <span>Add Employee</span>
          </button>

        </div>

        {/* ================= ERROR ================= */}

        {error && (
          <div className="employee-error">
            <span className="error-icon">!</span>

            <span>{error}</span>

            <button onClick={loadEmployees}>
              Retry
            </button>
          </div>
        )}

        {/* ================= ADD FORM ================= */}

        {showForm && (
          <div className="employee-form-wrapper">
            <EmployeeForm
              onSuccess={() => {
                setShowForm(false);
                loadEmployees();
              }}
              onCancel={() => {
                setShowForm(false);
              }}
            />
          </div>
        )}

        {/* ================= SEARCH ================= */}

        <div className="employee-search-card">

          <div className="search-header">

            <div>
              <h3>Find an employee</h3>

              <p>
                Search by employee code, name, email or designation
              </p>
            </div>

            {search && (
              <span className="search-result-count">
                {filteredEmployees.length} result
                {filteredEmployees.length !== 1 ? "s" : ""}
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search employee code, name or email..."
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}

          </div>

        </div>

        {/* ================= DIRECTORY ================= */}

        <div className="employee-directory">

          {/* Directory Header */}

          <div className="directory-header">

            <div className="directory-title">

              <div className="directory-icon">
                👤
              </div>

              <div>
                <h2>Employee Directory</h2>

                <p>
                  {search
                    ? `Showing ${filteredEmployees.length} matching employee${
                        filteredEmployees.length !== 1
                          ? "s"
                          : ""
                      }`
                    : "All employees in your organization"}
                </p>
              </div>

            </div>

            <div className="employee-count">
              <strong>{filteredEmployees.length}</strong>

              <span>
                {filteredEmployees.length === 1
                  ? "Employee"
                  : "Employees"}
              </span>
            </div>

          </div>

          {/* ================= EMPTY STATE ================= */}

          {filteredEmployees.length === 0 ? (

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
                  onClick={() => setSearch("")}
                >
                  Clear Search
                </button>
              ) : (
                <button
                  className="add-employee-btn"
                  onClick={() => setShowForm(true)}
                >
                  <span className="add-icon">+</span>
                  Add Employee
                </button>
              )}

            </div>

          ) : (

            /* ================= TABLE ================= */

            <div className="employee-table-wrapper">

              <table className="employee-table">

                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>EMAIL</th>
                    <th>DEPARTMENT</th>
                    <th>DESIGNATION</th>
                    <th>STATUS</th>
                    <th className="action-column">
                      ACTION
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredEmployees.map((employee) => (

                    <tr key={employee.id}>

                      {/* EMPLOYEE */}

                      <td>

                        <div className="employee-profile">

                          <div className="employee-avatar">
                            {getInitials(employee)}
                          </div>

                          <div className="employee-name">

                            <strong>
                              {employee.first_name}{" "}
                              {employee.last_name}
                            </strong>

                            <span>
                              {employee.employee_code}
                            </span>

                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}

                      <td>
                        <span className="employee-email">
                          {employee.email || "-"}
                        </span>
                      </td>

                      {/* DEPARTMENT */}

                      <td>

                        <span className="department-text">

                          {employee.department?.name ??
                            employee.department_id ??
                            "-"}

                        </span>

                      </td>

                      {/* DESIGNATION */}

                      <td>

                        <span className="designation-text">

                          {employee.designation || "-"}

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
                          <span>View</span>
                          <span className="arrow">
                            →
                          </span>
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </div>
  );
}

export default Employees;