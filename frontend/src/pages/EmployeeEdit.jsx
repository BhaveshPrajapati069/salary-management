import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getEmployee,
  updateEmployee,
  getCountries,
  createCountry,
  getDepartments,
  createDepartment,
} from "../services/employeeService";

import "./EmployeeEdit.css";

const initialForm = {
  employee_code: "",
  first_name: "",
  last_name: "",
  email: "",
  country_id: "",
  department_id: "",
  designation: "",
  employment_status: "active",
  joining_date: "",
};

function EmployeeEdit() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);

  const [countries, setCountries] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal
  const [modalType, setModalType] = useState(null);

  const [masterForm, setMasterForm] = useState({
    name: "",
    code: "",
    currency: "INR",
  });

  const [masterLoading, setMasterLoading] = useState(false);

  /* =========================================================
     LOAD EMPLOYEE + COUNTRIES + DEPARTMENTS
  ========================================================= */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          employee,
          countryData,
          departmentData,
        ] = await Promise.all([
          getEmployee(employeeId),
          getCountries(),
          getDepartments(),
        ]);

        setCountries(countryData);
        setDepartments(departmentData);

        setForm({
          employee_code: employee.employee_code ?? "",
          first_name: employee.first_name ?? "",
          last_name: employee.last_name ?? "",
          email: employee.email ?? "",
          country_id: String(employee.country_id ?? ""),
          department_id: String(employee.department_id ?? ""),
          designation: employee.designation ?? "",
          employment_status:
            employee.employment_status ?? "active",
          joining_date: employee.joining_date ?? "",
        });
      } catch (err) {
        console.error("Load employee error:", err);
        console.error("Backend response:", err.response?.data);

        setError("Unable to load employee information.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeId]);

  /* =========================================================
     HANDLE FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================================
     UPDATE EMPLOYEE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        employee_code: form.employee_code.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        country_id: Number(form.country_id),
        department_id: Number(form.department_id),
        designation: form.designation.trim(),
        employment_status: form.employment_status,
        joining_date: form.joining_date,
      };

      if (!payload.country_id) {
        setError("Please select a country.");
        return;
      }

      if (!payload.department_id) {
        setError("Please select a department.");
        return;
      }

      await updateEmployee(employeeId, payload);

      setSuccess("Employee updated successfully.");

      setTimeout(() => {
        navigate(`/employees/${employeeId}`);
      }, 700);
    } catch (err) {
      console.error("Update employee error:", err);
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
        setError("Unable to update employee.");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     MASTER FORM CHANGE
  ========================================================= */

  const handleMasterChange = (event) => {
    const { name, value } = event.target;

    setMasterForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     OPEN COUNTRY MODAL
  ========================================================= */

  const openCountryModal = () => {
    setMasterForm({
      name: "",
      code: "",
      currency: "INR",
    });

    setModalType("country");
    setError("");
  };

  /* =========================================================
     OPEN DEPARTMENT MODAL
  ========================================================= */

  const openDepartmentModal = () => {
    setMasterForm({
      name: "",
      code: "",
      currency: "INR",
    });

    setModalType("department");
    setError("");
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (masterLoading) return;

    setModalType(null);

    setMasterForm({
      name: "",
      code: "",
      currency: "INR",
    });
  };

  /* =========================================================
     CREATE COUNTRY / DEPARTMENT
  ========================================================= */

  const handleMasterSubmit = async (event) => {
    event.preventDefault();

    try {
      setMasterLoading(true);
      setError("");

      if (modalType === "country") {
        const payload = {
          name: masterForm.name.trim(),
          code: masterForm.code.trim().toUpperCase(),
          currency: masterForm.currency.trim().toUpperCase(),
        };

        if (!payload.name || !payload.code || !payload.currency) {
          setError("Please fill all country fields.");
          return;
        }

        const newCountry = await createCountry(payload);

        const updatedCountries = [
          ...countries,
          newCountry,
        ];

        setCountries(updatedCountries);

        // Automatically select new country
        if (newCountry?.id) {
          setForm((previous) => ({
            ...previous,
            country_id: String(newCountry.id),
          }));
        }

        setSuccess("Country created successfully.");
      }

      if (modalType === "department") {
        const payload = {
          name: masterForm.name.trim(),
        };

        if (!payload.name) {
          setError("Department name is required.");
          return;
        }

        const newDepartment =
          await createDepartment(payload);

        const updatedDepartments = [
          ...departments,
          newDepartment,
        ];

        setDepartments(updatedDepartments);

        // Automatically select new department
        if (newDepartment?.id) {
          setForm((previous) => ({
            ...previous,
            department_id: String(newDepartment.id),
          }));
        }

        setSuccess("Department created successfully.");
      }

      setMasterForm({
        name: "",
        code: "",
        currency: "INR",
      });

      setModalType(null);
    } catch (err) {
      console.error(
        "Create master data error:",
        err
      );

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
          modalType === "country"
            ? "Unable to create country."
            : "Unable to create department."
        );
      }
    } finally {
      setMasterLoading(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="employee-edit-page">
        <div className="employee-edit-loading">
          <div className="spinner-border text-primary" />
          <p>Loading employee...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="employee-edit-page">
      <div className="employee-edit-wrapper">

        {/* HEADER */}
        <div className="employee-edit-header">

          <div>
            <div className="employee-edit-breadcrumb">
              Employees
              <span>/</span>
              Edit Employee
            </div>

            <h1>Edit Employee</h1>

            <p>
              Update employee information and
              employment details.
            </p>
          </div>

          <button
            type="button"
            className="employee-back-btn"
            onClick={() =>
              navigate(`/employees/${employeeId}`)
            }
            disabled={saving}
          >
            ← Back
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="employee-edit-alert employee-edit-alert-error">
            <div className="alert-icon">!</div>

            <div>
              <strong>Something went wrong</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="employee-edit-alert employee-edit-alert-success">
            <div className="alert-icon">✓</div>

            <div>
              <strong>Success</strong>
              <p>{success}</p>
            </div>
          </div>
        )}

        {/* CARD */}
        <div className="employee-edit-card">

          {/* CARD HEADER */}
          <div className="employee-edit-card-header">

            <div className="employee-edit-card-icon">
              👤
            </div>

            <div>
              <h2>Employee Information</h2>

              <p>
                Update the employee's personal
                and employment information.
              </p>
            </div>

          </div>

          <form onSubmit={handleSubmit}>

            {/* PERSONAL INFORMATION */}
            <div className="employee-section">

              <div className="employee-section-title">
                <h3>Personal Information</h3>
                <span>Required fields *</span>
              </div>

              <div className="employee-form-grid">

                {/* Employee Code */}
                <div className="employee-field">
                  <label>
                    Employee Code
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="employee_code"
                    value={form.employee_code}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* First Name */}
                <div className="employee-field">
                  <label>
                    First Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="employee-field">
                  <label>
                    Last Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="employee-field">
                  <label>
                    Email
                    <span>*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

            </div>

            {/* EMPLOYMENT INFORMATION */}
            <div className="employee-section">

              <div className="employee-section-title">
                <h3>Employment Information</h3>
              </div>

              <div className="employee-form-grid">

                {/* Country */}
                <div className="employee-field">

                  <div className="form-label-row">
                    <label>
                      Country
                      <span>*</span>
                    </label>

                    <button
                      type="button"
                      className="add-master-btn"
                      onClick={openCountryModal}
                      disabled={saving}
                    >
                      + Add Country
                    </button>
                  </div>

                  <select
                    name="country_id"
                    value={form.country_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Country
                    </option>

                    {countries.map((country) => (
                      <option
                        key={country.id}
                        value={country.id}
                      >
                        {country.name} (
                        {country.code})
                      </option>
                    ))}
                  </select>

                </div>

                {/* Department */}
                <div className="employee-field">

                  <div className="form-label-row">
                    <label>
                      Department
                      <span>*</span>
                    </label>

                    <button
                      type="button"
                      className="add-master-btn"
                      onClick={openDepartmentModal}
                      disabled={saving}
                    >
                      + Add Department
                    </button>
                  </div>

                  <select
                    name="department_id"
                    value={form.department_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select Department
                    </option>

                    {departments.map(
                      (department) => (
                        <option
                          key={department.id}
                          value={department.id}
                        >
                          {department.name}
                        </option>
                      )
                    )}
                  </select>

                </div>

                {/* Designation */}
                <div className="employee-field">
                  <label>
                    Designation
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Status */}
                <div className="employee-field">
                  <label>
                    Employment Status
                    <span>*</span>
                  </label>

                  <select
                    name="employment_status"
                    value={form.employment_status}
                    onChange={handleChange}
                    required
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                    <option value="terminated">
                      Terminated
                    </option>
                  </select>
                </div>

                {/* Joining Date */}
                <div className="employee-field">
                  <label>
                    Joining Date
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="joining_date"
                    value={form.joining_date}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div className="employee-form-footer">

              <button
                type="button"
                className="employee-cancel-btn"
                onClick={() =>
                  navigate(`/employees/${employeeId}`)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="employee-save-btn"
                disabled={saving}
              >
                {saving && (
                  <span className="button-spinner" />
                )}

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>
        </div>
      </div>

      {/* =====================================================
          COUNTRY / DEPARTMENT MODAL
      ===================================================== */}

      {modalType && (
        <div
          className="master-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="master-modal">

            <div className="master-modal-header">

              <div>
                <h3>
                  {modalType === "country"
                    ? "Add Country"
                    : "Add Department"}
                </h3>

                <p>
                  Create a new{" "}
                  {modalType === "country"
                    ? "country"
                    : "department"}{" "}
                  for employees.
                </p>
              </div>

              <button
                type="button"
                className="master-modal-close"
                onClick={closeModal}
                disabled={masterLoading}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleMasterSubmit}>

              <div className="modal-two-columns">

                {/* Name */}
                <div className="form-field full-width">
                  <label>
                    Name
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={masterForm.name}
                    onChange={handleMasterChange}
                    placeholder={
                      modalType === "country"
                        ? "e.g. India"
                        : "e.g. Engineering"
                    }
                    required
                  />
                </div>

                {/* Country fields */}
                {modalType === "country" && (
                  <>
                    <div className="form-field">
                      <label>
                        Country Code
                        <span>*</span>
                      </label>

                      <input
                        type="text"
                        name="code"
                        value={masterForm.code}
                        onChange={handleMasterChange}
                        placeholder="IN"
                        maxLength={2}
                        required
                      />
                    </div>

                    <div className="form-field">
                      <label>
                        Currency
                        <span>*</span>
                      </label>

                      <input
                        type="text"
                        name="currency"
                        value={masterForm.currency}
                        onChange={handleMasterChange}
                        placeholder="INR"
                        maxLength={3}
                        required
                      />
                    </div>
                  </>
                )}

              </div>

              {error && (
                <div className="employee-form-error mt-3">
                  <span>!</span>

                  <div>{error}</div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="master-modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                  disabled={masterLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={masterLoading}
                >
                  {masterLoading && (
                    <span className="button-spinner" />
                  )}

                  {masterLoading
                    ? "Creating..."
                    : modalType === "country"
                    ? "Create Country"
                    : "Create Department"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeeEdit;