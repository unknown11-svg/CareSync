import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./patient_form.css";

const PatientForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        middleName: '',
        dateOfBirth: '',
        gender: '',
        identityNumber: '',
        preferredLanguage: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        province: '',
        zipCode: '',
        emergencyName: '',
        emergencyRelationship: '',
        emergencyPhone: '',
        emergencyAddress: '',
        insuranceProvider: '',
        policyNumber: '',
        groupNumber: '',
        subscriberName: '',
        allergies: '',
        medications: '',
        medicalConditions: '',
        previousSurgeries: '',
        familyHistory: '',
        
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/patients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit form");
            }

            const data = await response.json();
            console.log("Patient saved:", data);

            alert("Patient registered successfully!");
            navigate("/patient-files");
        } catch (err) {
            console.error("Error:", err);
            alert("Error submitting form. Please try again.");
        }
    };


    return (
        <form onSubmit={handleSubmit}>
        <div className="patient-form-container">
            <div className="form-header">
                <h1>CARESYNC PATIENT REGISTRATION FORM</h1>
                <p className="form-subtitle">Please fill out all required fields completely and accurately</p>
            </div>

            <div className="patient-form">
                {/* Personal Information Section */}
                <section className="form-section">
                    <h2 className="section-title">Personal Information</h2>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="middleName">Middle Name</label>
                            <input
                                type="text"
                                id="middleName"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date of Birth *</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="gender">Gender *</label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="ssn">Identity/Passport Number*</label>
                            <input
                                type="text"
                                id="identityNumber"
                                name="identityNumber"
                                value={formData.identityNumber}
                                onChange={handleInputChange}
                                placeholder="XXXXXX-XXXX-XXX"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                       <div className="form-group">
                            <label htmlFor="preferredLanguage">Preferred Language</label>
                            <select
                                id="preferredLanguage"
                                name="preferredLanguage"
                                value={formData.preferredLanguage}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Language</option>
                                <option value="english">English</option>
                                <option value="xhosa">IsiXhosa</option>
                                <option value="zulu">IsiZulu</option>
                                <option value="tswana">SeTswana</option>
                                <option value="sotho">SeSotho</option>
                                <option value="venda">TshiVenda</option>
                                <option value="tsonga">XiTsonga</option>
                                <option value="pedi">SePedi</option>
                                <option value="ndebele">IsiNdebele</option>
                                <option value="afrikaans">Afrikaans</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Contact Information Section */}
                <section className="form-section">
                    <h2 className="section-title">Contact Information</h2>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="(XXX) XXX-XXXX"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="example@email.com"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="address">Street Address *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City *</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="state">Province *</label>
                            <input
                                type="text"
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="zipCode">ZIP Code *</label>
                            <input
                                type="text"
                                id="zipCode"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </section>

                {/* Emergency Contact Section */}
                <section className="form-section">
                    <h2 className="section-title">Emergency Contact</h2>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="emergencyName">Contact Name *</label>
                            <input
                                type="text"
                                id="emergencyName"
                                name="emergencyName"
                                value={formData.emergencyName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="emergencyRelationship">Relationship *</label>
                            <input
                                type="text"
                                id="emergencyRelationship"
                                name="emergencyRelationship"
                                value={formData.emergencyRelationship}
                                onChange={handleInputChange}
                                placeholder="e.g., Spouse, Parent, Sibling"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="emergencyPhone">Contact Phone *</label>
                            <input
                                type="tel"
                                id="emergencyPhone"
                                name="emergencyPhone"
                                value={formData.emergencyPhone}
                                onChange={handleInputChange}
                                placeholder="(XXX) XXX-XXXX"
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="emergencyAddress">Address</label>
                            <input
                                type="text"
                                id="emergencyAddress"
                                name="emergencyAddress"
                                value={formData.emergencyAddress}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </section>

                {/* Insurance Information Section */}
                <section className="form-section">
                    <h2 className="section-title">Insurance Information</h2>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="insuranceProvider">Insurance Provider</label>
                            <input
                                type="text"
                                id="insuranceProvider"
                                name="insuranceProvider"
                                value={formData.insuranceProvider}
                                onChange={handleInputChange}
                                placeholder="e.g., Blue Cross Blue Shield"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="policyNumber">Policy Number</label>
                            <input
                                type="text"
                                id="policyNumber"
                                name="policyNumber"
                                value={formData.policyNumber}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="groupNumber">Group Number</label>
                            <input
                                type="text"
                                id="groupNumber"
                                name="groupNumber"
                                value={formData.groupNumber}
                                onChange={handleInputChange}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="subscriberName">Subscriber Name</label>
                            <input
                                type="text"
                                id="subscriberName"
                                name="subscriberName"
                                value={formData.subscriberName}
                                onChange={handleInputChange}
                                placeholder="If different from patient"
                            />
                        </div>
                    </div>
                </section>

                {/* Medical History Section */}
                <section className="form-section">
                    <h2 className="section-title">Medical History</h2>
                    
                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="allergies">Allergies *</label>
                            <textarea
                                id="allergies"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleInputChange}
                                placeholder="List any known allergies (medications, foods, environmental). If none, write 'None'"
                                rows="3"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="medications">Current Medications *</label>
                            <textarea
                                id="medications"
                                name="medications"
                                value={formData.medications}
                                onChange={handleInputChange}
                                placeholder="List all current medications, dosages, and frequency. If none, write 'None'"
                                rows="3"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="medicalConditions">Medical Conditions *</label>
                            <textarea
                                id="medicalConditions"
                                name="medicalConditions"
                                value={formData.medicalConditions}
                                onChange={handleInputChange}
                                placeholder="List any chronic conditions, diseases, or ongoing health issues. If none, write 'None'"
                                rows="3"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="previousSurgeries">Previous Surgeries *</label>
                            <textarea
                                id="previousSurgeries"
                                name="previousSurgeries"
                                value={formData.previousSurgeries}
                                onChange={handleInputChange}
                                placeholder="List any previous surgeries with approximate dates. If none, write 'None'"
                                rows="2"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group full-width">
                            <label htmlFor="familyHistory">Family Medical History *</label>
                            <textarea
                                id="familyHistory"
                                name="familyHistory"
                                value={formData.familyHistory}
                                onChange={handleInputChange}
                                placeholder="List significant family medical history (heart disease, diabetes, cancer, etc.). If none, write 'None'"
                                rows="3"
                                required
                            />
                        </div>
                    </div>
                </section>
               
                  
                {/* Form Actions */}
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate("/patient-files")}>
                        Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                        Register Patient
                    </button>
                </div>

                {/* Form Footer */}
                <div className="form-footer">
                    <p><strong>Notice:</strong> All information provided will be kept confidential in accordance with HPCSA regulations.</p>
                    <p>Fields marked with * are required.</p>
                </div>
            </div>
        </div>
    </form>
    );
};

export default PatientForm;