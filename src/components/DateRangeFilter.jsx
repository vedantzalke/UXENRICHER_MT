// src/components/DateRangeFilter.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/DateRangeFilter.css";

const DateRangeFilter = ({ startDate, endDate, onChangeStart, onChangeEnd }) => {
  return (
    <div className="date-range-filter">
      <label>From:</label>
      <DatePicker selected={startDate} onChange={onChangeStart} dateFormat="yyyy-MM-dd" />
      <label>To:</label>
      <DatePicker selected={endDate} onChange={onChangeEnd} dateFormat="yyyy-MM-dd" />
    </div>
  );
};

export default DateRangeFilter;
