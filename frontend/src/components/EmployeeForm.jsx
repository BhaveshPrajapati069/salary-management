import { useEffect, useState } from "react";

import { createEmployee } from "../services/employeeService";

import {
  getCountries,
  createCountry,
} from "../services/countryService";

import {
  getDepartments,
  createDepartment,
} from "../services/departmentService";

import "./EmployeeForm.css";

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

function EmployeeForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState(initialForm);

  const [countries, setCountries] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingMasterData, setLoadingMasterData] = useState(true);

  const [error, setError] = useState("");

  // Country modal
  const [showCountryForm, setShowCountryForm] = useState(false);

  const [countryForm, setCountryForm] = useState({
    name: "",
    code: "",
    currency: "INR",
  });

  const [savingCountry, setSavingCountry] = useState(false);

  // Department modal
  const [showDepartmentForm, setShowDepartmentForm] =
    useState(false);

  const [departmentForm, setDepartmentForm] = useState({
    name: "",
  });

  const [savingDepartment, setSavingDepartment] =
    useState(false);

  /* =========================================================
     LOAD COUNTRIES + DEPARTMENTS
  ========================================================= */

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setLoadingMasterData(true);
      setError("");

      const [countryResponse, departmentResponse] =
        await Promise.all([
          getCountries(),
          getDepartments(),
        ]);

      const countryList =
        countryResponse?.items ??
        countryResponse?.data ??
        countryResponse ??
        [];

      const departmentList =
        departmentResponse?.items ??
        departmentResponse?.data ??
        departmentResponse ??
        [];

      setCountries(
        Array.isArray(countryList)
          ? countryList
          : []
      );

      setDepartments(
        Array.isArray(departmentList)
          ? departmentList
          : []
      );
    } catch (err) {
      console.error(
        "Load country/department error:",
        err
      );

      setError(
        "Unable to load countries or departments."
      );
    } finally {
      setLoadingMasterData(false);
    }
  };

  /* =========================================================
     COMMON CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     CREATE EMPLOYEE
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!form.country_id) {
        setError("Please select a country.");
        return;
      }

      if (!form.department_id) {
        setError("Please select a department.");
        return;
      }

      const payload = {
        employee_code: form.employee_code.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),

        country_id: Number(form.country_id),
        department_id: Number(form.department_id),

        designation: form.designation.trim(),

        employment_status:
          form.employment_status,

        joining_date: form.joining_date,
      };

      console.log(
        "Creating employee:",
        payload
      );

      await createEmployee(payload);

      setForm({
        ...initialForm,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(
        "Create employee error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => {
              const field =
                item.loc?.at(-1);

              return `${field}: ${item.msg}`;
            })
            .join(", ")
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Unable to create employee."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     COUNTRY
  ========================================================= */

  const handleCountryChange = (event) => {
    const { name, value } = event.target;

    setCountryForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateCountry = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSavingCountry(true);
      setError("");

      const payload = {
        name: countryForm.name.trim(),
        code: countryForm.code
          .trim()
          .toUpperCase(),
        currency: countryForm.currency
          .trim()
          .toUpperCase(),
      };

      if (!payload.name) {
        setError(
          "Country name is required."
        );
        return;
      }

      if (!payload.code) {
        setError(
          "Country code is required."
        );
        return;
      }

      if (!payload.currency) {
        setError(
          "Currency is required."
        );
        return;
      }

      const response =
        await createCountry(payload);

      const createdCountry =
        response?.data ??
        response;

      console.log(
        "Created country:",
        createdCountry
      );

      // Add newly created country
      setCountries((previous) => [
        ...previous,
        createdCountry,
      ]);

      // Automatically select new country
      setForm((previous) => ({
        ...previous,
        country_id:
          createdCountry.id,
      }));

      // Reset modal
      setCountryForm({
        name: "",
        code: "",
        currency: "INR",
      });

      setShowCountryForm(false);
    } catch (err) {
      console.error(
        "Create country error:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => {
              const field =
                item.loc?.at(-1);

              return `${field}: ${item.msg}`;
            })
            .join(", ")
        );
      } else if (
        typeof detail === "string"
      ) {
        setError(detail);
      } else {
        setError(
          "Unable to create country."
        );
      }
    } finally {
      setSavingCountry(false);
    }
  };

  /* =========================================================
     DEPARTMENT
  ========================================================= */

  const handleDepartmentChange = (
    event
  ) => {
    const { name, value } =
      event.target;

    setDepartmentForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateDepartment =
    async (event) => {
      event.preventDefault();

      try {
        setSavingDepartment(true);
        setError("");

        const payload = {
          name: departmentForm.name.trim(),
        };

        if (!payload.name) {
          setError(
            "Department name is required."
          );
          return;
        }

        const response =
          await createDepartment(
            payload
          );

        const createdDepartment =
          response?.data ??
          response;

        console.log(
          "Created department:",
          createdDepartment
        );

        // Add new department
        setDepartments((previous) => [
          ...previous,
          createdDepartment,
        ]);

        // Automatically select new department
        setForm((previous) => ({
          ...previous,
          department_id:
            createdDepartment.id,
        }));

        // Reset modal
        setDepartmentForm({
          name: "",
        });

        setShowDepartmentForm(false);
      } catch (err) {
        console.error(
          "Create department error:",
          err
        );

        console.error(
          "Backend response:",
          err.response?.data
        );

        const detail =
          err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map((item) => {
                const field =
                  item.loc?.at(-1);

                return `${field}: ${item.msg}`;
              })
              .join(", ")
          );
        } else if (
          typeof detail === "string"
        ) {
          setError(detail);
        } else {
          setError(
            "Unable to create department."
          );
        }
      } finally {
        setSavingDepartment(false);
      }
    };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loadingMasterData) {
    return (
      <div className="employee-form-card">
        <div className="employee-form-header">
          <div>
            <h3>Add Employee</h3>

            <p>
              Add a new employee to your
              organization
            </p>
          </div>
        </div>

        <div className="employee-form-loading">
          <div className="spinner-border text-primary" />

          <p>
            Loading countries and
            departments...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <div className="employee-form-card">

        {/* HEADER */}

        <div className="employee-form-header">
          <div>
            <h3>Add Employee</h3>

            <p>
              Add a new employee to your
              organization
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="employee-form-error">
            <span>!</span>

            <div>{error}</div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              ×
            </button>
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="employee-form"
        >

          <div className="employee-form-grid">

            {/* EMPLOYEE CODE */}

            <div className="form-field">
              <label>
                Employee Code
                <span>*</span>
              </label>

              <input
                type="text"
                name="employee_code"
                value={
                  form.employee_code
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. EMP004"
                required
              />

              <small>
                Unique employee
                identification code
              </small>
            </div>

            {/* FIRST NAME */}

            <div className="form-field">
              <label>
                First Name
                <span>*</span>
              </label>

              <input
                type="text"
                name="first_name"
                value={
                  form.first_name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter first name"
                required
              />
            </div>

            {/* LAST NAME */}

            <div className="form-field">
              <label>
                Last Name
                <span>*</span>
              </label>

              <input
                type="text"
                name="last_name"
                value={
                  form.last_name
                }
                onChange={
                  handleChange
                }
                placeholder="Enter last name"
                required
              />
            </div>

            {/* EMAIL */}

            <div className="form-field full-width">
              <label>
                Email
                <span>*</span>
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={
                  handleChange
                }
                placeholder="employee@example.com"
                required
              />
            </div>

            {/* COUNTRY */}

            <div className="form-field">

              <div className="form-label-row">
                <label>
                  Country
                  <span>*</span>
                </label>

                <button
                  type="button"
                  className="add-master-btn"
                  onClick={() => {
                    setError("");
                    setShowCountryForm(
                      true
                    );
                  }}
                >
                  + Add Country
                </button>
              </div>

              <select
                name="country_id"
                value={
                  form.country_id
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select country
                </option>

                {countries.map(
                  (country) => (
                    <option
                      key={country.id}
                      value={
                        country.id
                      }
                    >
                      {country.name}
                      {country.code
                        ? ` (${country.code})`
                        : ""}
                    </option>
                  )
                )}
              </select>

              <small>
                Select employee country
              </small>
            </div>

            {/* DEPARTMENT */}

            <div className="form-field">

              <div className="form-label-row">
                <label>
                  Department
                  <span>*</span>
                </label>

                <button
                  type="button"
                  className="add-master-btn"
                  onClick={() => {
                    setError("");
                    setShowDepartmentForm(
                      true
                    );
                  }}
                >
                  + Add Department
                </button>
              </div>

              <select
                name="department_id"
                value={
                  form.department_id
                }
                onChange={
                  handleChange
                }
                required
              >
                <option value="">
                  Select department
                </option>

                {departments.map(
                  (department) => (
                    <option
                      key={
                        department.id
                      }
                      value={
                        department.id
                      }
                    >
                      {
                        department.name
                      }
                    </option>
                  )
                )}
              </select>

              <small>
                Select employee department
              </small>
            </div>

            {/* DESIGNATION */}

            <div className="form-field full-width">
              <label>
                Designation
                <span>*</span>
              </label>

              <input
                type="text"
                name="designation"
                value={
                  form.designation
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Python AI Developer"
                required
              />
            </div>

            {/* STATUS */}

            <div className="form-field">
              <label>
                Employment Status
                <span>*</span>
              </label>

              <select
                name="employment_status"
                value={
                  form.employment_status
                }
                onChange={
                  handleChange
                }
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

            {/* JOINING DATE */}

            <div className="form-field">
              <label>
                Joining Date
                <span>*</span>
              </label>

              <input
                type="date"
                name="joining_date"
                value={
                  form.joining_date
                }
                onChange={
                  handleChange
                }
                required
              />

              <small>
                Employee joining date
              </small>
            </div>

          </div>

          {/* ACTIONS */}

          <div className="employee-form-actions">

            <button
              type="button"
              className="secondary-btn"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Creating...
                </>
              ) : (
                <>
                  <span>+</span>
                  Create Employee
                </>
              )}
            </button>

          </div>

        </form>
      </div>

      {/* =====================================================
          COUNTRY MODAL
      ===================================================== */}

      {showCountryForm && (
        <div
          className="master-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowCountryForm(false);
            }
          }}
        >
          <div className="master-modal">

            <div className="master-modal-header">

              <div>
                <h3>
                  Add Country
                </h3>

                <p>
                  Create a new country
                  for employees
                </p>
              </div>

              <button
                type="button"
                className="master-modal-close"
                onClick={() =>
                  setShowCountryForm(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleCreateCountry
              }
            >

              <div className="form-field">
                <label>
                  Country Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    countryForm.name
                  }
                  onChange={
                    handleCountryChange
                  }
                  placeholder="e.g. India"
                  required
                  autoFocus
                />
              </div>

              <div className="modal-two-columns">

                <div className="form-field">
                  <label>
                    Country Code
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="code"
                    value={
                      countryForm.code
                    }
                    onChange={
                      handleCountryChange
                    }
                    placeholder="IN"
                    maxLength={2}
                    required
                  />

                  <small>
                    2-letter code
                  </small>
                </div>

                <div className="form-field">
                  <label>
                    Currency
                    <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="currency"
                    value={
                      countryForm.currency
                    }
                    onChange={
                      handleCountryChange
                    }
                    placeholder="INR"
                    maxLength={3}
                    required
                  />

                  <small>
                    3-letter currency
                  </small>
                </div>

              </div>

              <div className="master-modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setShowCountryForm(
                      false
                    )
                  }
                  disabled={
                    savingCountry
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    savingCountry
                  }
                >
                  {savingCountry
                    ? "Creating..."
                    : "Create Country"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          DEPARTMENT MODAL
      ===================================================== */}

      {showDepartmentForm && (
        <div
          className="master-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowDepartmentForm(false);
            }
          }}
        >
          <div className="master-modal">

            <div className="master-modal-header">

              <div>
                <h3>
                  Add Department
                </h3>

                <p>
                  Create a new department
                  for employees
                </p>
              </div>

              <button
                type="button"
                className="master-modal-close"
                onClick={() =>
                  setShowDepartmentForm(
                    false
                  )
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleCreateDepartment
              }
            >

              <div className="form-field">
                <label>
                  Department Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    departmentForm.name
                  }
                  onChange={
                    handleDepartmentChange
                  }
                  placeholder="e.g. Engineering"
                  required
                  autoFocus
                />
              </div>

              <div className="master-modal-actions">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    setShowDepartmentForm(
                      false
                    )
                  }
                  disabled={
                    savingDepartment
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    savingDepartment
                  }
                >
                  {savingDepartment
                    ? "Creating..."
                    : "Create Department"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}

export default EmployeeForm;