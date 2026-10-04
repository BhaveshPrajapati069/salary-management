// frontend/src/components/SalaryForm.jsx
import { useEffect, useState } from "react";
import {
  createSalary,
  updateSalary,
} from "../services/salaryService";
import "./SalaryForm.css";

const getDateValue = (value) => {
  if (!value) return "";

  // Handles:
  // 2026-11-04
  // 2026-11-04T00:00:00
  // 2026-11-04T00:00:00.000Z
  return String(value).split("T")[0];
};

function SalaryForm({
  employeeId,
  salary = null,
  onSuccess,
  onCancel,
}) {
  const isEdit = Boolean(salary);

  const [form, setForm] = useState({
    base_salary: "",
    currency: "INR",
    effective_from: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Load salary data when editing.
   */
  useEffect(() => {
    if (salary) {
      setForm({
        base_salary: salary.new_salary ?? "",
        currency: salary.currency ?? "INR",
        effective_from: getDateValue(salary.effective_date),
        reason: "",
      });
    } else {
      setForm({
        base_salary: "",
        currency: "INR",
        effective_from: "",
        reason: "",
      });
    }

    // Do not show old validation when salary changes.
    setError("");
  }, [salary]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    /*
     * IMPORTANT:
     * We intentionally do NOT validate here.
     * Validation appears only after clicking submit.
     */
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous error only when submit is clicked.
    setError("");

    const salaryAmount = Number(form.base_salary);

    /*
     * ============================
     * FRONTEND VALIDATION
     * ============================
     */

    if (!form.base_salary || Number.isNaN(salaryAmount)) {
      setError("Please enter a salary amount.");
      return;
    }

    if (salaryAmount <= 0) {
      setError("Salary must be greater than zero.");
      return;
    }

    if (!form.effective_from) {
      setError("Effective date is required.");
      return;
    }

    if (isEdit && !form.reason.trim()) {
      setError("Please enter the reason for salary change.");
      return;
    }

    if (!isEdit && !form.currency.trim()) {
      setError("Currency is required.");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        /*
         * UPDATE SALARY
         */
        await updateSalary(employeeId, {
          new_salary: salaryAmount,
          effective_date: form.effective_from,
          reason: form.reason.trim(),
        });
      } else {
        /*
         * CREATE FIRST SALARY
         */
        await createSalary(employeeId, {
          base_salary: salaryAmount,
          currency: form.currency.trim().toUpperCase(),
          effective_from: form.effective_from,
        });
      }

      /*
       * Parent page can reload salary/history.
       */
      onSuccess?.();

    } catch (err) {
      console.error("Salary error:", err);
      console.error(
        "Backend response:",
        err.response?.data
      );

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => {
              const field = item.loc?.at(-1);
              return `${field}: ${item.msg}`;
            })
            .join(", ")
        );
      } else if (typeof detail === "string") {
        setError(detail);
      } else {
        setError(
          isEdit
            ? "Unable to update salary."
            : "Unable to create salary."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="salary-form-card">

      {/* ================= HEADER ================= */}

      <div className="salary-form-header">
        <div>
          <h3>
            {isEdit ? "Update Salary" : "Add Salary"}
          </h3>

          <p>
            {isEdit
              ? "Update employee salary and maintain salary history"
              : "Add the employee's initial salary information"}
          </p>
        </div>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="salary-form-error">
          <span className="salary-error-icon">!</span>

          <div>
            <strong>Unable to save salary</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ================= FORM ================= */}

      <form onSubmit={handleSubmit}>

        <div className="salary-form-grid">

          {/* Salary */}

          <div className="salary-field">
            <label htmlFor="base_salary">
              {isEdit ? "New Salary" : "Base Salary"}
              <span>*</span>
            </label>

            <div className="salary-input-wrapper">
              <span className="salary-prefix">
                ₹
              </span>

              <input
                id="base_salary"
                type="number"
                name="base_salary"
                min="0.01"
                step="0.01"
                value={form.base_salary}
                onChange={handleChange}
                placeholder="e.g. 650000"
                disabled={loading}
              />
            </div>

            <small>
              Enter the annual salary amount
            </small>
          </div>

          {/* Currency */}

          {!isEdit && (
            <div className="salary-field">
              <label htmlFor="currency">
                Currency
                <span>*</span>
              </label>

              <input
                id="currency"
                type="text"
                name="currency"
                maxLength="3"
                value={form.currency}
                onChange={handleChange}
                placeholder="INR"
                disabled={loading}
              />

              <small>
                Example: INR, USD, EUR
              </small>
            </div>
          )}

          {/* Effective Date */}

          <div className="salary-field">
            <label htmlFor="effective_from">
              Effective From
              <span>*</span>
            </label>

            <input
              id="effective_from"
              type="date"
              name="effective_from"
              value={form.effective_from}
              onChange={handleChange}
              disabled={loading}
            />

            <small>
              Date from which this salary becomes active
            </small>
          </div>

          {/* Reason */}

          {isEdit && (
            <div className="salary-field salary-field-full">
              <label htmlFor="reason">
                Reason for Salary Change
                <span>*</span>
              </label>

              <input
                id="reason"
                type="text"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="e.g. Annual increment, promotion, performance revision"
                maxLength={255}
                disabled={loading}
              />

              <small>
                Explain why the employee's salary is being changed
              </small>
            </div>
          )}

        </div>

        {/* ================= ACTIONS ================= */}

        <div className="salary-form-actions">

          <button
            type="button"
            className="salary-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="salary-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="salary-spinner" />
                Saving...
              </>
            ) : (
              <>
                {isEdit ? "Update Salary" : "Create Salary"}
              </>
            )}
          </button>

        </div>

      </form>
    </div>
  );
}

export default SalaryForm;