import React, { forwardRef } from "react";
import DatePicker from "react-datepicker";
import { Calendar, Info } from "lucide-react";

export const DatePickerCell = ({ value, onChange, placeholder, tooltip }) => {
  // Custom input for DatePicker
  const CustomInput = forwardRef(({ value, onClick }, ref) => (
    <div
      onClick={onClick}
      ref={ref}
      className="flex items-center w-full h-full cursor-pointer"
    >
      <Calendar className="mr-2 text-indigo-600 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
      <span className="flex-1 text-sm sm:text-base">
        {value || placeholder}
      </span>
    </div>
  ));

  return (
    <div className="relative w-full h-10 sm:h-10 mb-2">
      <div className="flex items-center border rounded-lg p-2 h-full bg-white">
        <DatePicker
          selected={value}
          onChange={onChange}
          dateFormat="yyyy-MM-dd"
          customInput={<CustomInput />}
        />
        <div className="ml-2 relative flex-shrink-0">
          {/* Tooltip for desktop */}
          <div className="hidden sm:block relative group">
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
            <span className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 p-2 text-xs text-gray-800 bg-indigo-100 border border-indigo-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity text-center pointer-events-none">
              {tooltip}
            </span>
          </div>
          {/* Inline text for mobile */}
          <span className="sm:hidden text-gray-500 text-xs ml-1">
            (optional)
          </span>
        </div>
      </div>
    </div>
  );
};
export default DatePickerCell;
