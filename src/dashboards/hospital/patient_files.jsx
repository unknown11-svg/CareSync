import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {FaEye,FaPlus} from "react-icons/fa";
import "./patient_files.css";

const PatientFiles = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointment, setAppointment] = useState({
    hospital: "",
    doctor: "",
    date: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://localhost:5000/patients");
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const openModal = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setAppointment({ hospital: "", doctor: "", date: "", reason: "", notes: "" });
  };

  const handleChange = (e) => {
    setAppointment({ ...appointment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:5000/${selectedPatient._id}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointment),
      });
      alert("Appointment added successfully ✨");
      closeModal();
    } catch (err) {
      console.error("Error adding appointment:", err);
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">CareSync</h2>
        <nav className="nav">
          <button onClick={() => navigate("/patient-files")}>Patient Files</button>
          <button onClick={() => navigate("/patient-form")}>
            + New Patient
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="content">
        <div className="header">
          <h1>Patient Files</h1>
        </div>

        {loading ? (
          <p className="loading">Loading patient files...</p>
        ) : (
          <table className="patient-table">
            <thead>
              <tr>
                <th>Identity Number</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Add Appointment</th>
                <th>View File</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient._id}>
                    <td>{patient.identityNumber}</td>
                    <td>{patient.firstName}</td>
                    <td>{patient.lastName}</td>
                    <td>
                      <button
                        onClick={() => openModal(patient)}
                        >
                        <FaPlus size={16} style={{ marginRight: '6px' }} />
                      </button>
                    </td>
                    <td>
                      <button
                        >
                        <FaEye size={16} style={{ marginRight: '6px' }} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              <h2>Add Appointment for {selectedPatient.firstName}</h2>
              <form onSubmit={handleSubmit} className="appointment-form">
                <input
                  type="text"
                  name="hospital"
                  placeholder="Hospital"
                  value={appointment.hospital}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="doctor"
                  placeholder="Doctor"
                  value={appointment.doctor}
                  onChange={handleChange}
                  required
                />
                <input
                  type="date"
                  name="date"
                  value={appointment.date}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="reason"
                  placeholder="Reason"
                  value={appointment.reason}
                  onChange={handleChange}
                  required
                />
                <textarea
                  name="notes"
                  placeholder="Notes"
                  value={appointment.notes}
                  onChange={handleChange}
                />
                <div className="modal-actions">
                  <button type="submit" className="save-btn">
                    Save
                  </button>
                  <button type="button" className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientFiles;