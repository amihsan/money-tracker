import { useEffect, useState, useMemo } from "react";
import { PlusCircle, Trash2, CheckCircle2, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  getTransactions,
  addTransaction as apiAdd,
  deleteTransaction as apiDelete,
  markPaid as apiPaid,
} from "../api/api";

export default function Dashboard({ user }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    type: "borrowed",
    person: "",
    amount: "",
    transactionDate: null,
    deadline: null,
  });

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      try {
        const data = await getTransactions();
        setTransactions(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTransaction = async () => {
    if (!form.person || !form.amount || !form.deadline || !form.transactionDate)
      return;

    try {
      const newTx = await apiAdd({
        type: form.type,
        person: form.person,
        amount: parseFloat(form.amount),
        transactionDate: form.transactionDate?.toISOString().split("T")[0],
        deadline: form.deadline?.toISOString().split("T")[0],
      });
      setTransactions([...transactions, newTx]);
      setForm({
        type: "borrowed",
        person: "",
        amount: "",
        transactionDate: null,
        deadline: null,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markPaid = async (id) => {
    try {
      const updated = await apiPaid(id);
      setTransactions(
        transactions.map((t) => (t.transaction_id === id ? updated : t))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await apiDelete(id);
      setTransactions(transactions.filter((t) => t.transaction_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const totals = useMemo(() => {
    const borrowed = transactions
      .filter((t) => t.type === "borrowed" && t.status !== "paid")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const lent = transactions
      .filter((t) => t.type === "lent" && t.status !== "paid")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const paid = transactions.filter((t) => t.status === "paid").length;
    return { borrowed: borrowed || 0, lent: lent || 0, paid };
  }, [transactions]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <h2 className="text-2xl font-semibold mb-2">You’re not logged in</h2>
        <p className="text-gray-500">Please log in to access the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full max-w-full px-2 sm:px-4">
      {/* Welcome Message */}
      {
        <div className="mb-6 p-6 bg-indigo-50 border border-indigo-200 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2">
            Welcome back, {user.signInDetails?.loginId || user.username}!
          </h2>
          <p className="text-gray-700">
            Here’s your financial overview. You can add new transactions below
            and manage existing ones.
          </p>
        </div>
      }

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl shadow">
          <h2 className="text-sm text-gray-600">Total Borrowed</h2>
          <p className="text-xl font-bold text-red-700">
            € {Number(totals.borrowed || 0).toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow">
          <h2 className="text-sm text-gray-600">Total Lent</h2>
          <p className="text-xl font-bold text-green-700">
            € {Number(totals.lent || 0).toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl shadow">
          <h2 className="text-sm text-gray-600">Completed</h2>
          <p className="text-xl font-bold text-indigo-700">
            {totals.paid} Paid
          </p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="mb-6 p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Add Transaction
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {/* Type Select */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="p-2 border rounded-lg w-full"
          >
            <option value="borrowed">Borrowed From</option>
            <option value="lent">Lent To</option>
          </select>

          {/* Person Input */}
          <input
            type="text"
            name="person"
            value={form.person}
            onChange={handleChange}
            placeholder="Person"
            className="p-2 border rounded-lg w-full"
          />

          {/* Amount Input */}
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount (€)"
            className="p-2 border rounded-lg w-full"
          />

          {/* Transaction Date Picker */}
          <div className="relative w-full">
            <DatePicker
              selected={form.transactionDate}
              onChange={(date) => setForm({ ...form, transactionDate: date })}
              placeholderText="Transaction Date"
              dateFormat="yyyy-MM-dd"
              className="p-2 border rounded-lg w-full pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" />
          </div>

          {/* Deadline Date Picker */}
          <div className="relative w-full">
            <DatePicker
              selected={form.deadline}
              onChange={(date) => setForm({ ...form, deadline: date })}
              placeholderText="Deadline"
              dateFormat="yyyy-MM-dd"
              className="p-2 border rounded-lg w-full pl-10"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 pointer-events-none" />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={addTransaction}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Add
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow border overflow-x-auto">
        {loading ? (
          <p className="p-4 text-gray-500">Loading transactions...</p>
        ) : (
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Person</th>
                <th className="p-3">Amount (€)</th>
                <th className="p-3">Transaction Date</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr
                  key={t.transaction_id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 capitalize">{t.type}</td>
                  <td className="p-3">{t.person}</td>
                  <td className="p-3">€ {Number(t.amount || 0).toFixed(2)}</td>
                  <td className="p-3">{t.transactionDate}</td>
                  <td className="p-3">{t.deadline}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        t.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 flex gap-3">
                    {t.status !== "paid" && (
                      <button
                        onClick={() => markPaid(t.transaction_id)}
                        className="group relative text-green-600 hover:text-green-800 transition"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                          Mark as Paid
                        </span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteTransaction(t.transaction_id)}
                      className="group relative text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap">
                        Delete
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-gray-500">
                    No transactions yet. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
