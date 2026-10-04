// frontend/src/pages/EmployeeDetails.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getEmployee } from "../services/employeeService";

import {
  getCurrentSalary,
  getSalaryHistory,
} from "../services/salaryService";

import SalaryForm from "../components/SalaryForm";

import "./EmployeeDetails.css";

function EmployeeDetails() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [salaryLoading, setSalaryLoading] = useState(false);

  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [editingSalary, setEditingSalary] = useState(false);

  const [error, setError] = useState("");

  /* =========================================================
     LOAD EMPLOYEE
  ========================================================= */

  const loadEmployee = async () => {
    try {
      setLoading(true);
      setError("");

      const employeeData = await getEmployee(employeeId);

      setEmployee(employeeData);
    } catch (err) {
      console.error("Employee error:", err);
      setError("Unable to load employee.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD SALARY
  ========================================================= */

  const loadSalary = async () => {
    try {
      setSalaryLoading(true);

      /* Current Salary */

      try {
        const salary = await getCurrentSalary(employeeId);

        console.log("Current salary:", salary);

        setCurrentSalary(salary);
      } catch (err) {
        console.error("Current salary error:", err);

        setCurrentSalary(null);
      }

      /* Salary History */

      try {
        const history = await getSalaryHistory(employeeId);

        console.log("Salary history:", history);

        const salaryHistoryData =
          history?.items ?? history ?? [];

        setSalaryHistory(
          Array.isArray(salaryHistoryData)
            ? salaryHistoryData
            : []
        );
      } catch (err) {
        console.error("Salary history error:", err);

        setSalaryHistory([]);
      }
    } finally {
      setSalaryLoading(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadEmployee();
    loadSalary();
  }, [employeeId]);

  /* =========================================================
     SALARY CREATED / UPDATED
  ========================================================= */

  const handleSalarySuccess = async () => {
    setShowSalaryForm(false);
    setEditingSalary(false);

    await loadSalary();
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getInitials = () => {
    const first = employee?.first_name?.charAt(0) || "";
    const last = employee?.last_name?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (normalized === "active") {
      return "active";
    }

    if (normalized === "inactive") {
      return "inactive";
    }

    if (normalized === "terminated") {
      return "terminated";
    }

    return "inactive";
  };

  const formatSalary = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return value;
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="employee-details-page">
        <div className="employee-details-wrapper">
          <div className="details-loading">
            <div className="spinner-border" role="status" />
            <p>Loading employee...</p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="employee-details-page">
        <div className="employee-details-wrapper">
          <div className="details-error">
            <h3>Unable to load employee</h3>

            <p>{error}</p>

            <button
              className="details-secondary-btn"
              onClick={() => navigate("/employees")}
            >
              ← Back to Employees
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const statusClass = getStatusClass(
    employee.employment_status
  );

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="employee-details-page">
      <div className="employee-details-wrapper">

        {/* =====================================================
            TOP
        ===================================================== */}

        <div className="details-topbar">
          <button
            className="back-link"
            onClick={() => navigate("/employees")}
          >
            ← Back to Employees
          </button>
        </div>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="employee-hero">

          <div className="employee-hero-left">

            <div className="large-avatar">
              {getInitials()}
            </div>

            <div>

              <div className="employee-title-row">

                <h1>
                  {employee.first_name}{" "}
                  {employee.last_name}
                </h1>

                <span
                  className={`detail-status ${statusClass}`}
                >
                  <span className="status-dot" />

                  {employee.employment_status}
                </span>

              </div>

              <p className="employee-subtitle">
                {employee.designation}
              </p>

              <div className="employee-code">
                Employee Code:{" "}
                <strong>
                  {employee.employee_code}
                </strong>
              </div>

            </div>

          </div>

          <button
            className="edit-employee-btn"
            onClick={() =>
              navigate(
                `/employees/${employeeId}/edit`
              )
            }
          >
            Edit Employee
          </button>

        </section>

        {/* =====================================================
            EMPLOYEE INFORMATION
        ===================================================== */}

        <section className="details-card">

          <div className="details-card-header">

            <div>
              <h2>Employee Information</h2>

              <p>
                Personal and employment information
              </p>
            </div>

          </div>

          <div className="details-card-body">

            <div className="info-grid">

              {/* EMAIL */}

              <div className="info-item">
                <span>Email</span>

                <strong>
                  {employee.email || "-"}
                </strong>
              </div>

              {/* DESIGNATION */}

              <div className="info-item">
                <span>Designation</span>

                <strong>
                  {employee.designation || "-"}
                </strong>
              </div>

              {/* DEPARTMENT */}

              <div className="info-item">
                <span>Department</span>

                <strong>
                  {employee.department?.name ??
                    employee.department_id ??
                    "-"}
                </strong>
              </div>

              {/* COUNTRY */}

              <div className="info-item">
                <span>Country</span>

                <strong>
                  {employee.country?.name ??
                    employee.country_id ??
                    "-"}
                </strong>
              </div>

              {/* STATUS */}

              <div className="info-item">
                <span>Employment Status</span>

                <strong>
                  <span
                    className={`detail-status ${statusClass}`}
                  >
                    <span className="status-dot" />

                    {employee.employment_status}
                  </span>
                </strong>
              </div>

              {/* JOINING DATE */}

              <div className="info-item">
                <span>Joining Date</span>

                <strong>
                  {formatDate(employee.joining_date)}
                </strong>
              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            CURRENT SALARY
        ===================================================== */}

        <section className="details-card">

          <div className="details-card-header">

            <div>
              <h2>Current Salary</h2>

              <p>
                Current active salary information
              </p>
            </div>

            {!showSalaryForm && (
              <button
                className="salary-action-btn"
                onClick={() => {
                  setEditingSalary(
                    Boolean(currentSalary)
                  );

                  setShowSalaryForm(true);
                }}
              >
                {currentSalary
                  ? "Update Salary"
                  : "Add Salary"}
              </button>
            )}

          </div>

          <div className="details-card-body">

            {salaryLoading ? (
              <div className="salary-loading">
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                />

                <span>
                  Loading salary...
                </span>
              </div>
            ) : currentSalary ? (

              <div className="salary-summary">

                {/* MAIN SALARY */}

                <div className="salary-main">

                  <span>
                    Current Salary
                  </span>

                  <strong>
                    {currentSalary.currency}{" "}
                    {formatSalary(
                      currentSalary.base_salary
                    )}
                  </strong>

                </div>

                {/* EFFECTIVE FROM */}

                <div className="salary-detail">

                  <span>
                    Effective From
                  </span>

                  <strong>
                    {formatDate(
                      currentSalary.effective_from
                    )}
                  </strong>

                </div>

                {/* STATUS */}

                <div className="salary-detail">

                  <span>
                    Status
                  </span>

                  <strong className="salary-active">
                    Active
                  </strong>

                </div>

              </div>

            ) : (

              <div className="salary-empty">

                <div className="salary-empty-icon">
                  $
                </div>

                <h3>
                  No active salary
                </h3>

                <p>
                  This employee does not have an
                  active salary record yet.
                </p>

                {!showSalaryForm && (
                  <button
                    className="salary-action-btn"
                    onClick={() => {
                      setEditingSalary(false);
                      setShowSalaryForm(true);
                    }}
                  >
                    Add Salary
                  </button>
                )}

              </div>

            )}

          </div>

        </section>

        {/* =====================================================
            SALARY FORM
        ===================================================== */}

        {showSalaryForm && (
          <section className="details-card">

            <div className="details-card-header">

              <div>
                <h2>
                  {editingSalary
                    ? "Update Salary"
                    : "Add Salary"}
                </h2>

                <p>
                  Manage salary information for this
                  employee
                </p>
              </div>

            </div>

            <div className="details-card-body">

              <SalaryForm
                employeeId={employeeId}
                salary={
                  editingSalary
                    ? currentSalary
                    : null
                }
                onSuccess={
                  handleSalarySuccess
                }
                onCancel={() => {
                  setShowSalaryForm(false);
                  setEditingSalary(false);
                }}
              />

            </div>

          </section>
        )}

        {/* =====================================================
            SALARY HISTORY
        ===================================================== */}

        <section className="details-card">

          <div className="details-card-header">

            <div>
              <h2>Salary History</h2>

              <p>
                Salary changes and effective dates
              </p>
            </div>

            <span className="history-count">
              {salaryHistory.length}{" "}
              {salaryHistory.length === 1
                ? "Record"
                : "Records"}
            </span>

          </div>

          <div className="history-table-wrapper">

            {salaryLoading ? (

              <div className="salary-loading">
                <div
                  className="spinner-border spinner-border-sm"
                  role="status"
                />

                <span>
                  Loading salary history...
                </span>
              </div>

            ) : salaryHistory.length === 0 ? (

              <div className="history-empty">
                No salary history found.
              </div>

            ) : (

              <table className="salary-history-table">

                <thead>
                  <tr>
                    <th>OLD SALARY</th>
                    <th>NEW SALARY</th>
                    <th>CURRENCY</th>
                    <th>CHANGE %</th>
                    <th>EFFECTIVE DATE</th>
                    <th>REASON</th>
                  </tr>
                </thead>

                <tbody>

                  {salaryHistory.map((salary) => {

                    const changePercentage =
                      Number(
                        salary.change_percentage
                      );

                    const changeClass =
                      changePercentage >= 0
                        ? "change-positive"
                        : "change-negative";

                    return (
                      <tr key={salary.id}>

                        <td>
                          {formatSalary(
                            salary.old_salary
                          )}
                        </td>

                        <td>
                          <strong>
                            {formatSalary(
                              salary.new_salary
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className="currency-badge">
                            {salary.currency}
                          </span>
                        </td>

                        <td>
                          <span
                            className={changeClass}
                          >
                            {changePercentage >= 0
                              ? "+"
                              : ""}
                            {Number.isNaN(
                              changePercentage
                            )
                              ? "-"
                              : changePercentage.toFixed(
                                  2
                                )}
                            %
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            salary.effective_date
                          )}
                        </td>

                        <td>
                          {salary.reason || "-"}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            )}

          </div>

        </section>

      </div>
    </div>
  );
}

export default EmployeeDetails;