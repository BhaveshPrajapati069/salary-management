import api from "./api";

export const getCountries = async () => {
  const response = await api.get("/countries/");
  return response.data;
};

export const createCountry = async (payload) => {
  const response = await api.post("/countries/", payload);
  return response.data;
};

export const updateCountry = async (countryId, payload) => {
  const response = await api.patch(
    `/countries/${countryId}`,
    payload
  );
  return response.data;
};

export const deleteCountry = async (countryId) => {
  await api.delete(`/countries/${countryId}`);
};