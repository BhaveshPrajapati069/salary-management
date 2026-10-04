import api from "./api";

/* =========================================================
   EMPLOYEE APIs
========================================================= */

export const getEmployees = async (params = {}) => {
  const response = await api.get("/employees/", {
    params,
  });

  return response.data;
};

export const getEmployee = async (employeeId) => {
  const response = await api.get(
    `/employees/${employeeId}`
  );

  return response.data;
};

export const createEmployee = async (payload) => {
  const response = await api.post(
    "/employees/",
    payload
  );

  return response.data;
};

export const updateEmployee = async (
  employeeId,
  payload
) => {
  const response = await api.patch(
    `/employees/${employeeId}`,
    payload
  );

  return response.data;
};


/* =========================================================
   COUNTRY APIs
========================================================= */

export const getCountries = async () => {
  const response = await api.get("/countries/");

  return response.data;
};

export const createCountry = async (payload) => {
  const response = await api.post(
    "/countries/",
    payload
  );

  return response.data;
};


/* =========================================================
   DEPARTMENT APIs
========================================================= */

export const getDepartments = async () => {
  const response = await api.get("/departments/");

  return response.data;
};

export const createDepartment = async (payload) => {
  const response = await api.post(
    "/departments/",
    payload
  );

  return response.data;
};