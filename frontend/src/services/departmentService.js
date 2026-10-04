import api from "./api";

export const getDepartments = async () => {
  const response = await api.get("/departments/");
  return response.data;
};

export const createDepartment = async (payload) => {
  const response = await api.post("/departments/", payload);
  return response.data;
};

export const updateDepartment = async (departmentId, payload) => {
  const response = await api.patch(
    `/departments/${departmentId}`,
    payload
  );
  return response.data;
};

export const deleteDepartment = async (departmentId) => {
  await api.delete(`/departments/${departmentId}`);
};