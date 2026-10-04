import { useState } from "react";
import {
  createCountry,
} from "../services/countryService";
import {
  createDepartment,
} from "../services/departmentService";

function ReferenceDataModal({
  type,
  onSuccess,
  onCancel,
}) {
  const isCountry = type === "country";

  const [form, setForm] = useState({
    name: "",
    code: "",
    currency: "INR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        `${isCountry ? "Country" : "Department"} name is required.`
      );
      return;
    }

    if (isCountry && !form.code.trim()) {
      setError("Country code is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let result;

      if (isCountry) {
        result = await createCountry({
          name: form.name.trim(),
          code: form.code.trim().toUpperCase(),
          currency: form.currency.trim().toUpperCase(),
        });
      } else {
        result = await createDepartment({
          name: form.name.trim(),
        });
      }

      onSuccess?.(result);
    } catch (err) {
      console.error("Reference data error:", err);
      console.error("Backend response:", err.response?.data);

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
          `Unable to create ${
            isCountry ? "country" : "department"
          }.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reference-modal-overlay">
      <div className="reference-modal">

        <div className="reference-modal-header">
          <div>
            <h3>
              {isCountry
                ? "Add Country"
                : "Add Department"}
            </h3>

            <p>
              {isCountry
                ? "Add a new country to the system"
                : "Add a new department to the system"}
            </p>
          </div>

          <button
            type="button"
            className="reference-modal-close"
            onClick={onCancel}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="reference-modal-body">

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                {isCountry
                  ? "Country Name"
                  : "Department Name"}
              </label>

              <input
                type="text"
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                placeholder={
                  isCountry
                    ? "e.g. India"
                    : "e.g. Engineering"
                }
                autoFocus
                required
              />
            </div>

            {isCountry && (
              <>
                <div className="mb-3">
                  <label className="form-label">
                    Country Code
                  </label>

                  <input
                    type="text"
                    name="code"
                    className="form-control"
                    value={form.code}
                    onChange={handleChange}
                    placeholder="e.g. IN"
                    maxLength={2}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Currency
                  </label>

                  <input
                    type="text"
                    name="currency"
                    className="form-control"
                    value={form.currency}
                    onChange={handleChange}
                    placeholder="e.g. INR"
                    maxLength={3}
                    required
                  />
                </div>
              </>
            )}

          </div>

          <div className="reference-modal-footer">

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isCountry
                ? "Add Country"
                : "Add Department"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default ReferenceDataModal;