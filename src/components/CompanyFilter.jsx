// src/components/CompanyFilter.jsx
import React from "react";
import "../styles/CompanyFilter.css";

const CompanyFilter = ({ companies, selectedCompany, onChange }) => {
  return (
    <div className="company-filter">
      <label htmlFor="companyFilter">Company:</label>
      <input
        list="companies"
        id="companyFilter"
        placeholder="Select a company..."
        value={selectedCompany}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id="companies">
        {companies.map((company) => (
          <option key={company} value={company} />
        ))}
      </datalist>
    </div>
  );
};

export default CompanyFilter;
