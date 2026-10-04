import api from "./api";

// Create initial salary
export const createSalary = async (employeeId, salaryData) => {
  const response = await api.post(
    `/employees/${employeeId}/salary`,
    salaryData
  );

  return response.data;
};

// Get current active salary
export const getCurrentSalary = async (employeeId) => {
  const response = await api.get(
    `/employees/${employeeId}/salary`
  );

  return response.data;
};

// Update current salary
export const updateSalary = async (employeeId, salaryData) => {
  const response = await api.patch(
    `/employees/${employeeId}/salary`,
    salaryData
  );

  return response.data;
};

// Get salary history
export const getSalaryHistory = async (employeeId) => {
  const response = await api.get(
    `/employees/${employeeId}/salary/history`
  );

  return response.data;
};