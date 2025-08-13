import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000"; // Your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${Cookies.get("id_token") || ""}`,
    "Content-Type": "application/json",
  },
});

// Money tracker API
export const getTransactions = () => api.get("/api/transactions");

export const addTransaction = (transaction) =>
  api.post("/api/transactions", transaction);

export const updateTransaction = (id, updates) =>
  api.put(`/api/transactions/${id}`, updates);

export const deleteTransaction = (id) => api.delete(`/api/transactions/${id}`);

export default api;
