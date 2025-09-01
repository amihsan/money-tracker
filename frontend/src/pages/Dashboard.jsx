import { useEffect, useState, useMemo } from "react";
import { PlusCircle, Trash2, CheckCircle2, Calendar, Info } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import DatePickerCell from "../components/DatePickerCell";

import {
  getTransactions,
  deleteTransactionsByPerson,
  addTransaction as apiAdd,
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
        setTransactions(
          (data || []).map((t) => ({ ...t, hidden: false, status: "unpaid" }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addTransaction = async () => {
    if (!form.person || !form.amount) {
      alert("Please enter person and amount.");
      return;
    }
    try {
      const newTx = await apiAdd({
        type: form.type,
        person: form.person,
        amount: parseFloat(form.amount),
        transactionDate: form.transactionDate
          ? form.transactionDate.toISOString().split("T")[0]
          : null,
        deadline: form.deadline
          ? form.deadline.toISOString().split("T")[0]
          : null,
      });
      setTransactions([
        ...transactions,
        { ...newTx, hidden: false, status: "unpaid" },
      ]);
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

  const markPaid = (person) => {
    if (!personSummary[person]) return;
    const s = personSummary[person];
    if (s.netBorrowed === 0 && s.netLent === 0) {
      setTransactions(
        transactions.map((t) =>
          t.person === person ? { ...t, status: "paid" } : t
        )
      );
    } else {
      alert("Cannot mark as paid until Net Borrowed and Net Lent are 0.");
    }
  };

  const hideTransaction = (id) => {
    setTransactions(
      transactions.map((t) =>
        t.transaction_id === id ? { ...t, hidden: true } : t
      )
    );
  };

  const personSummary = useMemo(() => {
    const summary = {};
    transactions.forEach((t) => {
      if (!summary[t.person]) {
        summary[t.person] = {
          borrowed: 0,
          returned: 0,
          lent: 0,
          returnFromLent: 0,
          netBorrowed: 0,
          netLent: 0,
          status: "unpaid",
        };
      }
      if (t.type === "borrowed")
        summary[t.person].borrowed += Number(t.amount || 0);
      if (t.type === "returned")
        summary[t.person].returned += Number(t.amount || 0);
      if (t.type === "lent") summary[t.person].lent += Number(t.amount || 0);
      if (t.type === "returnFromLent")
        summary[t.person].returnFromLent += Number(t.amount || 0);
    });

    Object.keys(summary).forEach((person) => {
      const s = summary[person];
      const totalBorrow = s.borrowed - s.returned;
      const totalLent = s.lent - s.returnFromLent;

      if (totalBorrow >= totalLent) {
        s.netBorrowed = totalBorrow - totalLent;
        s.netLent = 0;
      } else {
        s.netBorrowed = 0;
        s.netLent = totalLent - totalBorrow;
      }

      s.status =
        s.netBorrowed === 0 &&
        s.netLent === 0 &&
        transactions.filter((t) => t.person === person && t.status === "paid")
          .length > 0
          ? "paid"
          : "unpaid";
    });

    return summary;
  }, [transactions]);

  const totals = useMemo(() => {
    let netBorrowed = 0,
      netLent = 0;
    Object.values(personSummary).forEach((s) => {
      netBorrowed += s.netBorrowed;
      netLent += s.netLent;
    });
    return { netBorrowed, netLent };
  }, [personSummary]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 p-4">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          You’re not logged in
        </h2>
        <p className="text-gray-500 text-center">
          Please log in to access the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 w-full max-w-full px-2 sm:px-4 bg-teal-100">
      {/* Welcome Message */}
      <div className="mb-6 p-4 sm:p-6 bg-indigo-200 border border-indigo-200 rounded-xl shadow text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700 mb-2">
          Welcome back, {user.signInDetails?.loginId || user.username}!
        </h2>
        <p className="text-gray-700 text-sm sm:text-base">
          Here’s your financial overview. You can add new transactions below and
          manage existing ones.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-red-200 border border-red-200 rounded-xl shadow text-center sm:text-left">
          <h2 className="text-sm sm:text-base text-gray-600">Total Borrowed</h2>
          <p className="text-xl sm:text-2xl font-bold text-red-700">
            € {totals.netBorrowed.toFixed(2)}
          </p>
        </div>
        <div className="p-4 bg-green-200 border border-green-200 rounded-xl shadow text-center sm:text-left">
          <h2 className="text-sm sm:text-base text-gray-600">Total Lent</h2>
          <p className="text-xl sm:text-2xl font-bold text-green-700">
            € {totals.netLent.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="mb-6 p-4 sm:p-6 bg-white rounded-xl shadow border">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700 text-center sm:text-left">
          Add Transaction
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3  ">
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="p-2 border rounded-lg w-full text-sm sm:text-base h-10 sm:h-10"
          >
            <option value="borrowed">Borrowed From</option>
            <option value="lent">Lent To</option>
            <option value="returned">Returned To</option>
            <option value="returnFromLent">Return From Lent</option>
          </select>

          <input
            type="text"
            name="person"
            value={form.person}
            onChange={handleChange}
            placeholder="Person"
            className="p-2 border rounded-lg w-full text-sm sm:text-base h-10 sm:h-10"
          />

          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount (€)"
            className="p-2 border rounded-lg w-full text-sm sm:text-base h-10 sm:h-10"
          />
          {/* Transaction Date */}
          <DatePickerCell
            value={form.transactionDate}
            onChange={(date) => setForm({ ...form, transactionDate: date })}
            placeholder="Transaction Date"
            tooltip="(optional) Select the date when this transaction occurred"
          />

          {/* Deadline */}
          <DatePickerCell
            value={form.deadline}
            onChange={(date) => setForm({ ...form, deadline: date })}
            placeholder="Deadline"
            tooltip="(optional) Select the payment deadline for this transaction"
          />
        </div>
        <button
          onClick={addTransaction}
          className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          Add
        </button>
      </div>

      {/* Person Summary Table */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-indigo-600 mb-4 text-center">
          Transactions by Person
        </h2>
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm sm:text-base">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-2 sm:p-3">Person</th>
                <th className="p-2 sm:p-3">Borrowed</th>
                <th className="p-2 sm:p-3">Returned</th>
                <th className="p-2 sm:p-3">Lent</th>
                <th className="p-2 sm:p-3">Return From Lent</th>
                <th className="p-2 sm:p-3">Total Borrowed</th>
                <th className="p-2 sm:p-3">Total Lent</th>
                <th className="p-2 sm:p-3">Status</th>
                <th className="p-2 sm:p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(personSummary).map(([person, s]) => (
                <tr
                  key={person}
                  className="border-b hover:bg-gray-50 transition text-sm sm:text-base"
                >
                  <td className="p-2 sm:p-3">{person}</td>
                  <td className="p-2 sm:p-3 text-red-700">
                    € {s.borrowed.toFixed(2)}
                  </td>
                  <td className="p-2 sm:p-3 text-green-700">
                    € {s.returned.toFixed(2)}
                  </td>
                  <td className="p-2 sm:p-3 text-yellow-700">
                    € {s.lent.toFixed(2)}
                  </td>
                  <td className="p-2 sm:p-3 text-teal-700">
                    € {s.returnFromLent.toFixed(2)}
                  </td>
                  <td className="p-2 sm:p-3">€ {s.netBorrowed.toFixed(2)}</td>
                  <td className="p-2 sm:p-3">€ {s.netLent.toFixed(2)}</td>
                  <td className="p-2 sm:p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        s.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 flex gap-2">
                    <button
                      onClick={() => markPaid(person)}
                      className={`${
                        s.netBorrowed === 0 && s.netLent === 0
                          ? "text-green-600 hover:text-green-800"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      title="Mark as Paid"
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {s.status === "paid" && (
                      <button
                        onClick={async () => {
                          try {
                            await deleteTransactionsByPerson(person);
                            setTransactions(
                              transactions.filter((t) => t.person !== person)
                            );
                          } catch (err) {
                            console.error(err);
                            alert(
                              "Failed to delete transactions for " + person
                            );
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete all transactions for this person"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-green-600 mb-4 text-center">
          Transaction History
        </h2>
        <div className="bg-white rounded-xl shadow border overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm sm:text-base">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-2 sm:p-3">Type</th>
                <th className="p-2 sm:p-3">Person</th>
                <th className="p-2 sm:p-3">Amount</th>
                <th className="p-2 sm:p-3">Transaction Date</th>
                <th className="p-2 sm:p-3">Deadline</th>
                <th className="p-2 sm:p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.filter((t) => !t.hidden).length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                transactions
                  .filter((t) => !t.hidden)
                  .map((t) => (
                    <tr
                      key={t.transaction_id}
                      className="border-b hover:bg-gray-50 transition text-sm sm:text-base"
                    >
                      <td
                        className={`p-2 sm:p-3 font-semibold ${
                          t.type === "borrowed"
                            ? "text-red-700"
                            : t.type === "lent"
                            ? "text-yellow-700"
                            : t.type === "returned"
                            ? "text-green-700"
                            : "text-teal-700"
                        }`}
                      >
                        {t.type.replace(/([A-Z])/g, " $1")}
                      </td>
                      <td className="p-2 sm:p-3">{t.person}</td>
                      <td className="p-2 sm:p-3">
                        € {Number(t.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-2 sm:p-3">{t.transactionDate || "-"}</td>
                      <td className="p-2 sm:p-3">{t.deadline || "-"}</td>
                      <td className="p-2 sm:p-3 flex gap-2">
                        <button
                          onClick={() => hideTransaction(t.transaction_id)}
                          className="text-red-600 hover:text-red-800"
                          title="Hide Transaction"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
