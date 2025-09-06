import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const API_BASE = import.meta.env.VITE_API_URL || window._env_.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Attach Cognito Access token to Authorization header
api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Error attaching token:", err);
  }
  return config;
});

// =====================
// 🔹 Profile APIs
// =====================
export async function getProfile() {
  const res = await api.get("/api/profile");
  return res.data;
}

export async function updateProfile(updates) {
  const res = await api.put("/api/profile", updates);
  return res.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);
  const res = await api.put("/api/profile/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteAvatar() {
  const res = await api.delete("/api/profile/avatar");
  return res.data;
}

// =====================
// Transactions APIs (unchanged)
// =====================
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

// =====================
// 🔹 Contact API
// =====================
export async function submitContact(data) {
  const res = await api.post("/api/contact", data);
  return res.data;
}

export default api;

// import axios from "axios";
// import { fetchAuthSession } from "aws-amplify/auth";

// // Flask backend endpoint
// const API_BASE = import.meta.env.VITE_API_URL || window._env_.VITE_API_URL;

// // Axios instance
// const api = axios.create({
//   baseURL: API_BASE,
// });

// // ✅ Attach Cognito ID token to Authorization header
// api.interceptors.request.use(async (config) => {
//   try {
//     const session = await fetchAuthSession();
//     const token = session.tokens?.idToken?.toString();
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   } catch (err) {
//     console.error("Error attaching token:", err);
//   }
//   return config;
// });

// export async function getTransactions() {
//   const res = await api.get("/api/transactions");
//   return res.data;
// }

// export async function addTransaction(transaction) {
//   const res = await api.post("/api/transactions", transaction);
//   return res.data;
// }

// export async function updateTransaction(id, updates) {
//   const res = await api.put(`/api/transactions/${id}`, updates);
//   return res.data;
// }

// export async function deleteTransaction(id) {
//   const res = await api.delete(`/api/transactions/${id}`);
//   return res.data;
// }

// export async function markPaid(id) {
//   const res = await api.put(`/api/transactions/${id}/mark-paid`);
//   return res.data;
// }

// export async function deleteTransactionsByPerson(person) {
//   const res = await api.delete(
//     `/api/transactions/person/${encodeURIComponent(person)}`
//   );
//   return res.data;
// }

// export default api;
