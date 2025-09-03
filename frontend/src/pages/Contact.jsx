import { useState } from "react";
import { Mail, Phone, MapPin, Send, AlertCircle } from "lucide-react";
import { submitContact } from "../api/api"; // your API function
import { useAuthenticator } from "@aws-amplify/ui-react";

export default function Contact() {
  const { user } = useAuthenticator((ctx) => [ctx.user]);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return; // safety check

    setLoading(true);
    try {
      await submitContact(form); // token handled internally
      setSubmitted(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Failed to submit contact form:", err);
      alert("Failed to submit form. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  // Render for non-logged-in users
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 via-teal to-teal-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-lg">
          <AlertCircle className="mx-auto w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login Required</h2>
          <p className="text-gray-700 mb-4">
            You must be logged in to Contact us. Please log in to continue.
          </p>
        </div>
      </div>
    );
  }

  // Render for logged-in users
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-teal to-teal-100 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row transform transition-all duration-500 hover:scale-[1.01]">
        {/* Left info panel */}
        <div className="md:w-1/2 p-8 bg-teal-600 text-white flex flex-col justify-center gap-6">
          <h2 className="text-3xl font-bold">Contact Us</h2>
          <p className="text-indigo-100">
            We'd love to hear from you! Fill out the form and we'll get back to
            you promptly.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 hover:text-indigo-300 transition">
              <Mail className="w-5 h-5" />
              <span>contact@moneytracker.me</span>
            </div>
            <div className="flex items-center gap-3 hover:text-indigo-300 transition">
              <Phone className="w-5 h-5" />
              <span>+49 17645686988</span>
            </div>
            <div className="flex items-center gap-3 hover:text-indigo-300 transition">
              <MapPin className="w-5 h-5" />
              <span>Vettersstraße 54/720, 09126 Chemnitz, Germany</span>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="md:w-1/2 p-8">
          {submitted ? (
            <div className="text-center p-6 bg-green-50 border border-green-200 rounded-xl shadow-md animate-fadeIn">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                Thank you!
              </h3>
              <p className="text-green-700">
                Your message has been submitted successfully.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  rows="5"
                  className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
                  placeholder="Your message..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-5 py-3 rounded-xl hover:bg-indigo-700 flex items-center gap-2 justify-center shadow-md transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />{" "}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
