// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <footer className="w-full bg-teal-100 shadow-md p-4 text-gray-700 text-center">
      <p className="text-sm">
        &copy; {currentYear}{" "}
        <span className="font-bold">Ihsan@Money Tracker</span>. All rights
        reserved.
      </p>
    </footer>
  );
};

export default Footer;
