import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

// Flask backend endpoint
const API_BASE = import.meta.env.VITE_API_URL || window._env_.VITE_API_URL;

// Axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Attach Cognito ID token to Authorization header
api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Error attaching token:", err);
  }
  return config;
});

export async function getTransactions() {
  const res = await api.get("/api/transactions");
  return res.data;
}

export async function addTransaction(transaction) {
  const res = await api.post("/api/transactions", transaction);
  return res.data;
}

export async function updateTransaction(id, updates) {
  const res = await api.put(`/api/transactions/${id}`, updates);
  return res.data;
}

export async function deleteTransaction(id) {
  const res = await api.delete(`/api/transactions/${id}`);
  return res.data;
}

export async function markPaid(id) {
  const res = await api.put(`/api/transactions/${id}/mark-paid`);
  return res.data;
}

export async function deleteTransactionsByPerson(person) {
  const res = await api.delete(
    `/api/transactions/person/${encodeURIComponent(person)}`
  );
  return res.data;
}

export default api;
