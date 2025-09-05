import React, { useState } from "react";
import "./patient_file.css";

const PatientFile = () => {
  const [identityNumber, setIdentityNumber] = useState("");
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setPatient(null);

    try {
      const res = await fetch(`http://localhost:5000/patients/${identityNumber}`);
      if (!res.ok) {
        throw new Error("Patient not found");
      }
      const data = await res.json();
      setPatient(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="patient-page">
      {/* Search Section */}
      <div className="search-section">
        <h1>Access My File</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Enter your ID number"
            value={identityNumber}
            onChange={(e) => setIdentityNumber(e.target.value)}
            required
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Results Section */}
      {error && <p className="error">{error}</p>}

      {patient && (
    
    <div className="patient-card">
          <h2>👤 Patient File</h2>
          <div className="patient-form-view">
            <div className="form-group">
              <label>ID Number</label>
              <input type="text" value={patient.identityNumber} readOnly />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" value={patient.firstName} readOnly />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" value={patient.lastName} readOnly />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="text" value={patient.dateOfBirth} readOnly />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <input type="text" value={patient.gender} readOnly />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={patient.phone} readOnly />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="text" value={patient.email || "N/A"} readOnly />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input type="text" value={patient.address} readOnly />
            </div>
            <div className="form-group">
              <label>City</label>
              <input type="text" value={patient.city} readOnly />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input type="text" value={patient.province} readOnly />
            </div>
            <div className="form-group">
              <label>Zip Code</label>
              <input type="text" value={patient.zipCode} readOnly />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientFile;

