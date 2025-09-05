import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css'
import PatientFiles from "./dashboards/hospital/patient_files.jsx";
import PatientForm from "./dashboards/hospital/patient_form.jsx";
import PatientFile from "./dashboards/patient/patient_file.jsx";

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<PatientFiles/>} />
        <Route path="/my-file" element={<PatientFile/>} />
        <Route path="/patient-files" element={<PatientFiles/>} />
        <Route path="/patient-form" element={<PatientForm/>} />
      </Routes>
    </Router>
  );
}

export default App;
