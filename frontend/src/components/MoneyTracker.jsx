import { useEffect, useState } from "react";
import { getTransactions, addTransaction, deleteTransaction } from "../api";

export default function MoneyTracker() {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("borrow"); // borrow, loan, return
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await getTransactions();
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) return alert("Please fill all fields");

    try {
      await addTransaction({
        type,
        amount: Number(amount),
        description,
        date: new Date(),
      });
      setAmount("");
      setDescription("");
      fetchTransactions();
    } catch (err) {
      console.error("Failed to add transaction", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this transaction?")) return;
    try {
      await deleteTransaction(id);
      fetchTransactions();
    } catch (err) {
      console.error("Failed to delete transaction", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Money Tracker</h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded"
          required
        >
          <option value="borrow">Borrow</option>
          <option value="loan">Loan</option>
          <option value="return">Return</option>
        </select>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="p-2 border rounded"
          required
          min="1"
        />

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="p-2 border rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add Transaction
        </button>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
        {transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Type</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(({ id, type, amount, description, date }) => {
                const amountNum = Number(amount);
                return (
                  <tr key={id} className="text-center">
                    <td className="border p-2 capitalize">{type}</td>
                    <td className="border p-2">
                      {isNaN(amountNum) ? "$0.00" : `$${amountNum.toFixed(2)}`}
                    </td>
                    <td className="border p-2">{description}</td>
                    <td className="border p-2">
                      {new Date(date).toLocaleDateString()}
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => handleDelete(id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
