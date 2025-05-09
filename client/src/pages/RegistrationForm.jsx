import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const RegistrationForm = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "Male",
    nationality: "",
    identificationNumber: "",
    maritalStatus: "",
    phoneNumber: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: "",
    },
    currentAddress: "",
    villageAddress: "",
    previousAddress: "",
    familyMembers: [{ name: "", relationship: "", age: "" }],
    numberOfDependents: 0,
    dependentsInfo: [{ dob: "", id: "" }],
    employmentStatus: "",
    occupation: "",
    profilePhoto: null,
    profilePhotoPreview: "",
    employerName: "",
    employerContact: "",
    annualIncome: "",
    medicalHistory: "",
    allergies: "",
    disabilities: "",
    criminalRecord: {
      hasRecord: false,
      details: "",
    },
    vehicleInfo: "",
    reasonForMoving: "",
    preferredHousingType: "",
    servicesRequired: [],
    communityParticipation: "",
    dataConsent: false,
    digitalSignature: "",
    behavior: {
      villageContribution: "",
      livingConditions: "",
      illegalActivities: { hasRecord: false },
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Calculate max date for DOB (18 years ago from today)
  const calculateMaxDOB = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const maxDOB = calculateMaxDOB();

  // Calculate min date for DOB (100 years ago from today)
  const calculateMinDOB = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  };

  const minDOB = calculateMinDOB();

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number (exactly 10 digits)
  const validatePhoneNumber = (phoneNumber) => {
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    return digitsOnly.length === 10;
  };

  // Validate NIC (Sri Lankan ID)
  const validateNIC = (nic) => {
    // New format (12 digits)
    if (nic.length === 12 && /^\d+$/.test(nic)) {
      return true;
    }
    // Old format (9 digits + V/v)
    if (nic.length === 10 && /^\d{9}[Vv]$/.test(nic)) {
      return true;
    }
    return false;
  };

  // Validate password (at least 6 characters)
  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Validate age (positive number, max 100)
  const validateAge = (age) => {
    const num = parseInt(age, 10);
    return !isNaN(num) && num > 0 && num <= 100;
  };

  // Validate number of dependents (0-20)
  const validateDependents = (num) => {
    const intNum = parseInt(num, 10);
    return !isNaN(intNum) && intNum >= 0 && intNum <= 20;
  };

  // Validate all required fields on the current page
  const validateCurrentPage = () => {
    const errors = {};
    let isValid = true;

    if (currentPage === 1) {
      if (!userData.firstName.trim()) {
        errors.firstName = "First name is required";
        isValid = false;
      }
      if (!userData.lastName.trim()) {
        errors.lastName = "Last name is required";
        isValid = false;
      }
      if (!userData.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required";
        isValid = false;
      }
      if (!userData.gender) {
        errors.gender = "Gender is required";
        isValid = false;
      }
      if (!userData.nationality.trim()) {
        errors.nationality = "Nationality is required";
        isValid = false;
      }
      if (!userData.identificationNumber.trim()) {
        errors.identificationNumber = "ID number is required";
        isValid = false;
      } else if (!validateNIC(userData.identificationNumber)) {
        errors.identificationNumber = "Please enter a valid NIC (12 digits or 9 digits with V)";
        isValid = false;
      }
      if (!userData.maritalStatus) {
        errors.maritalStatus = "Marital status is required";
        isValid = false;
      }
      if (userData.dependentsInfo.some(dep => dep.id && !validateNIC(dep.id))) {
        errors.dependentsInfo = "All dependents must have a valid NIC (12 digits or 9 digits with V)";
        isValid = false;
      }
    }

    if (currentPage === 2) {
      if (!userData.phoneNumber) {
        errors.phoneNumber = "Phone number is required";
        isValid = false;
      } else if (!validatePhoneNumber(userData.phoneNumber)) {
        errors.phoneNumber = "Phone number must be 10 digits";
        isValid = false;
      }
      if (!userData.email) {
        errors.email = "Email is required";
        isValid = false;
      } else if (!validateEmail(userData.email)) {
        errors.email = "Please enter a valid email address";
        isValid = false;
      }
      if (!userData.password) {
        errors.password = "Password is required";
        isValid = false;
      } else if (!validatePassword(userData.password)) {
        errors.password = "Password must be at least 6 characters";
        isValid = false;
      }
      if (!userData.emergencyContact.name.trim()) {
        errors['emergencyContact.name'] = "Emergency contact name is required";
        isValid = false;
      }
      if (!userData.emergencyContact.relationship.trim()) {
        errors['emergencyContact.relationship'] = "Relationship is required";
        isValid = false;
      }
      if (!userData.emergencyContact.phone) {
        errors['emergencyContact.phone'] = "Phone number is required";
        isValid = false;
      } else if (!validatePhoneNumber(userData.emergencyContact.phone)) {
        errors['emergencyContact.phone'] = "Phone number must be 10 digits";
        isValid = false;
      }
    }

    if (currentPage === 3) {
      if (!userData.currentAddress.trim()) {
        errors.currentAddress = "Current address is required";
        isValid = false;
      }
      if (!userData.villageAddress.trim()) {
        errors.villageAddress = "Village address is required";
        isValid = false;
      }
    }

    if (currentPage === 4) {
      if (userData.familyMembers.some(member => !member.name.trim())) {
        errors.familyMembers = "All family members must have a name";
        isValid = false;
      }
      if (userData.familyMembers.some(member => !member.relationship.trim())) {
        errors.familyMembers = "All family members must have a relationship";
        isValid = false;
      }
      if (userData.familyMembers.some(member => !member.age || !validateAge(member.age))) {
        errors.familyMembers = "All family members must have a valid age (1-100)";
        isValid = false;
      }
      if (userData.numberOfDependents && !validateDependents(userData.numberOfDependents)) {
        errors.numberOfDependents = "Number of dependents must be between 0 and 20";
        isValid = false;
      }
      if (userData.dependentsInfo.some(dep => dep.dob && new Date(dep.dob) > new Date())) {
        errors.dependentsInfo = "Dependent date of birth cannot be in the future";
        isValid = false;
      }
    }

    if (currentPage === 8) {
      if (!userData.dataConsent) {
        errors.dataConsent = "You must agree to the data collection policy";
        isValid = false;
      }
      if (!userData.digitalSignature.trim()) {
        errors.digitalSignature = "Digital signature is required";
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[name];
      setFieldErrors(newErrors);
    }

    // For number fields, prevent negative values and values over 100
    if (name === "age" || name === "numberOfDependents" || name.includes("age")) {
      if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
        setUserData({
          ...userData,
          [name]: value,
        });
      }
      return;
    }

    // For phone number fields, limit to 10 digits
    if (name === "phoneNumber" || name === "phone" || name === "employerContact") {
      if (value === "" || /^\d{0,10}$/.test(value)) {
        setUserData({
          ...userData,
          [name]: value,
        });
      }
      return;
    }

    // For all other fields
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (fieldErrors[`emergencyContact.${name}`]) {
      const newErrors = { ...fieldErrors };
      delete newErrors[`emergencyContact.${name}`];
      setFieldErrors(newErrors);
    }

    // For phone number, limit to 10 digits
    if (name === "phone") {
      if (value === "" || /^\d{0,10}$/.test(value)) {
        setUserData({
          ...userData,
          emergencyContact: {
            ...userData.emergencyContact,
            [name]: value,
          },
        });
      }
      return;
    }

    setUserData({
      ...userData,
      emergencyContact: {
        ...userData.emergencyContact,
        [name]: value,
      },
    });
  };

  const handleFamilyMemberChange = (index, e) => {
    const { name, value } = e.target;

    // Clear family members error when user starts typing
    if (fieldErrors.familyMembers) {
      const newErrors = { ...fieldErrors };
      delete newErrors.familyMembers;
      setFieldErrors(newErrors);
    }

    // For age field, prevent negative values and values over 100
    if (name === "age") {
      if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
        const updatedFamilyMembers = [...userData.familyMembers];
        updatedFamilyMembers[index][name] = value;
        setUserData({
          ...userData,
          familyMembers: updatedFamilyMembers,
        });
      }
      return;
    }

    const updatedFamilyMembers = [...userData.familyMembers];
    updatedFamilyMembers[index][name] = value;
    setUserData({
      ...userData,
      familyMembers: updatedFamilyMembers,
    });
  };

  const handleDependentChange = (index, e) => {
  const { name, value } = e.target;

  // Clear dependentsInfo error when user starts typing
  if (fieldErrors.dependentsInfo) {
    const newErrors = { ...fieldErrors };
    delete newErrors.dependentsInfo;
    setFieldErrors(newErrors);
  }

  const updatedDependents = [...userData.dependentsInfo];
  
  // For ID field, apply the same validation as the main ID field
  if (name === "id") {
    // If value matches ID format (12 digits or 9 digits + V/v)
    if (value === "" || /^\d{0,12}$/i.test(value) || /^\d{0,9}[Vv]?$/i.test(value)) {
      updatedDependents[index][name] = value;
    }
  } else {
    updatedDependents[index][name] = value;
  }
  
  setUserData({
    ...userData,
    dependentsInfo: updatedDependents,
  });
};

  const handleAddFamilyMember = () => {
    setUserData({
      ...userData,
      familyMembers: [
        ...userData.familyMembers,
        { name: "", relationship: "", age: "" },
      ],
    });
  };

  const handleRemoveFamilyMember = (index) => {
    const updatedFamilyMembers = [...userData.familyMembers];
    updatedFamilyMembers.splice(index, 1);
    setUserData({
      ...userData,
      familyMembers: updatedFamilyMembers,
    });
  };

  const handleAddDependent = () => {
    setUserData({
      ...userData,
      dependentsInfo: [...userData.dependentsInfo, { dob: "", id: "" }],
    });
  };

  const handleRemoveDependent = (index) => {
    const updatedDependents = [...userData.dependentsInfo];
    updatedDependents.splice(index, 1);
    setUserData({
      ...userData,
      dependentsInfo: updatedDependents,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (!validateCurrentPage()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();

      // Add all simple fields
      const simpleFields = [
        "firstName",
        "lastName",
        "email",
        "password",
        "dateOfBirth",
        "gender",
        "nationality",
        "identificationNumber",
        "maritalStatus",
        "phoneNumber",
        "currentAddress",
        "villageAddress",
        "previousAddress",
        "numberOfDependents",
        "employmentStatus",
        "occupation",
        "employerName",
        "employerContact",
        "annualIncome",
        "medicalHistory",
        "allergies",
        "disabilities",
        "vehicleInfo",
        "reasonForMoving",
        "preferredHousingType",
        "communityParticipation",
        "dataConsent",
        "digitalSignature",
      ];

      simpleFields.forEach((field) => {
        if (userData[field] !== undefined && userData[field] !== null) {
          formData.append(field, userData[field]);
        }
      });

      // Add nested objects as JSON strings
      formData.append(
        "emergencyContact",
        JSON.stringify(userData.emergencyContact)
      );
      formData.append("familyMembers", JSON.stringify(userData.familyMembers));
      formData.append(
        "dependentsInfo",
        JSON.stringify(userData.dependentsInfo)
      );
      formData.append(
        "criminalRecord",
        JSON.stringify(userData.criminalRecord)
      );
      formData.append("behavior", JSON.stringify(userData.behavior));
      formData.append(
        "servicesRequired",
        JSON.stringify(userData.servicesRequired)
      );

      // Add profile photo if exists
      if (userData.profilePhoto) {
        formData.append("profilePhoto", userData.profilePhoto);
      }

      const response = await api.post("http://localhost:5000/api/admin/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.message) {
        setSuccess("User registered successfully!");
        setTimeout(() => {
          navigate("/admin");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to register user. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!validateCurrentPage()) {
      return;
    }

    if (currentPage < 8) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Clear field errors when page changes
  useEffect(() => {
    setFieldErrors({});
  }, [currentPage]);

  return (
    <div className="container mt-5">
      <div className="card shadow-lg">
        <div className="card-header bg-primary text-white">
          <h2 className="text-center mb-0">Register New User</h2>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError("")}
              ></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show">
              {success}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccess("")}
              ></button>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                <React.Fragment key={step}>
                  <div className="text-center">
                    <div
                      className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${currentPage >= step ? "bg-primary text-white" : "bg-light text-muted"}`}
                      style={{
                        width: "40px",
                        height: "40px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                      onClick={() => currentPage > step && setCurrentPage(step)}
                    >
                      {step}
                    </div>
                    <small className="d-block mt-1">
                      {step === 1 && "Personal"}
                      {step === 2 && "Contact"}
                      {step === 3 && "Address"}
                      {step === 4 && "Family"}
                      {step === 5 && "Occupation"}
                      {step === 6 && "Health"}
                      {step === 7 && "Legal"}
                      {step === 8 && "Consent"}
                    </small>
                  </div>
                  {step < 8 && (
                    <div
                      className={`flex-grow-1 ${currentPage > step ? "bg-primary" : "bg-light"}`}
                      style={{ height: "2px" }}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Page 1 - Personal Information */}
            {currentPage === 1 && (
              <div className="card p-4 mb-4 border-0 shadow-sm">
                <h3 className="text-center mb-4 text-primary">
                  <i className="bi bi-person-fill me-2"></i>Personal Information
                </h3>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name*</label>
                    <input
                      type="text"
                      className={`form-control ${fieldErrors.firstName ? "is-invalid" : ""}`}
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    {fieldErrors.firstName && (
                      <div className="invalid-feedback">{fieldErrors.firstName}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name*</label>
                    <input
                      type="text"
                      className={`form-control ${fieldErrors.lastName ? "is-invalid" : ""}`}
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                    {fieldErrors.lastName && (
                      <div className="invalid-feedback">{fieldErrors.lastName}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date of Birth*</label>
                    <input
                      type="date"
                      className={`form-control ${fieldErrors.dateOfBirth ? "is-invalid" : ""}`}
                      name="dateOfBirth"
                      value={userData.dateOfBirth}
                      onChange={handleInputChange}
                      max={maxDOB}
                      min={minDOB}
                      required
                    />
                    {fieldErrors.dateOfBirth && (
                      <div className="invalid-feedback">{fieldErrors.dateOfBirth}</div>
                    )}
                    <small className="text-muted">Must be at least 18 years old</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Gender*</label>
                    <select
                      className={`form-select ${fieldErrors.gender ? "is-invalid" : ""}`}
                      name="gender"
                      value={userData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {fieldErrors.gender && (
                      <div className="invalid-feedback">{fieldErrors.gender}</div>
                    )}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Nationality*</label>
                    <input
                      type="text"
                      className={`form-control ${fieldErrors.nationality ? "is-invalid" : ""}`}
                      name="nationality"
                      value={userData.nationality}
                      onChange={handleInputChange}
                      required
                    />
                    {fieldErrors.nationality && (
                      <div className="invalid-feedback">{fieldErrors.nationality}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">ID Number*</label>
                    <input
                      type="text"
                      className={`form-control ${fieldErrors.identificationNumber ? "is-invalid" : ""}`}
                      name="identificationNumber"
                      value={userData.identificationNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits and V/v, max 12 characters
                        if (/^[0-9Vv]{0,12}$/i.test(value)) {
                          handleInputChange(e);
                        }
                      }}
                      maxLength="12"
                      required
                    />
                    {fieldErrors.identificationNumber && (
                      <div className="invalid-feedback">{fieldErrors.identificationNumber}</div>
                    )}
                    <small className="text-muted">Format: 123456789V or 123456789012</small>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Marital Status*</label>
                    <select
                      className={`form-select ${fieldErrors.maritalStatus ? "is-invalid" : ""}`}
                      name="maritalStatus"
                      value={userData.maritalStatus}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                    {fieldErrors.maritalStatus && (
                      <div className="invalid-feedback">{fieldErrors.maritalStatus}</div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Profile Photo</label>
                    <input
                      type="file"
                      className="form-control"
                      name="profilePhoto"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setUserData({
                          ...userData,
                          profilePhoto: file,
                          profilePhotoPreview: file
                            ? URL.createObjectURL(file)
                            : "",
                        });
                      }}
                    />
                    {userData.profilePhotoPreview && (
                      <div className="mt-2 text-center">
                        <img
                          src={userData.profilePhotoPreview}
                          alt="Preview"
                          style={{
                            width: "150px",
                            height: "150px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                          className="img-thumbnail"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Page 2 - Contact Information */}
            {currentPage === 2 && (
              <div className="card p-4 mb-4 border-0 shadow-sm">
                <h3 className="text-center mb-4 text-primary">
                  <i className="bi bi-telephone-fill me-2"></i>Contact Information
                </h3>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number*</label>
                    <input
                      type="tel"
                      className={`form-control ${fieldErrors.phoneNumber ? "is-invalid" : ""}`}
                      name="phoneNumber"
                      value={userData.phoneNumber}
                      onChange={handleInputChange}
                      maxLength="10"
                      required
                    />
                    {fieldErrors.phoneNumber && (
                      <div className="invalid-feedback">{fieldErrors.phoneNumber}</div>
                    )}
                    <small className="text-muted">Must contain exactly 10 digits</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address*</label>
                    <input
                      type="email"
                      className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {fieldErrors.email && (
                      <div className="invalid-feedback">{fieldErrors.email}</div>
                    )}
                    <small className="text-muted">
                      Must be a valid email format (example@domain.com)
                    </small>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Password*</label>
                  <input
                    type="password"
                    className={`form-control ${fieldErrors.password ? "is-invalid" : ""}`}
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    required
                  />
                  {fieldErrors.password && (
                    <div className="invalid-feedback">{fieldErrors.password}</div>
                  )}
                  <small className="text-muted">Must be at least 6 characters</small>
                </div>

                <h4 className="mt-4 mb-3 text-primary">
                  <i className="bi bi-person-plus-fill me-2"></i>Emergency Contact Information*
                </h4>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className={`form-control ${fieldErrors['emergencyContact.name'] ? "is-invalid" : ""}`}
                      name="name"
                      value={userData.emergencyContact.name}
                      onChange={handleEmergencyContactChange}
                      required
                    />
                    {fieldErrors['emergencyContact.name'] && (
                      <div className="invalid-feedback">{fieldErrors['emergencyContact.name']}</div>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Relationship</label>
                    <input
                      type="text"
                      className={`form-control ${fieldErrors['emergencyContact.relationship'] ? "is-invalid" : ""}`}
                      name="relationship"
                      value={userData.emergencyContact.relationship}
                      onChange={handleEmergencyContactChange}
                      required
                    />
                    {fieldErrors['emergencyContact.relationship'] && (
                      <div className="invalid-feedback">{fieldErrors['emergencyContact.relationship']}</div>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className={`form-control ${fieldErrors['emergencyContact.phone'] ? "is-invalid" : ""}`}
                      name="phone"
                      value={userData.emergencyContact.phone}
                      onChange={handleEmergencyContactChange}
                      maxLength="10"
                      required
                    />
                    {fieldErrors['emergencyContact.phone'] && (
                      <div className="invalid-feedback">{fieldErrors['emergencyContact.phone']}</div>
                    )}
                    <small className="text-muted">Must contain exactly 10 digits</small>
                  </div>
                </div>
              </div>
            )}

            {/* Page 3 - Address Information */}
            {currentPage === 3 && (
              <div className="card p-4 mb-4 border-0 shadow-sm">
                <h3 className="text-center mb-4 text-primary">
                  <i className="bi bi-house-fill me-2"></i>Address Information
                </h3>
                <div className="mb-3">
                  <label className="form-label">Current Address*</label>
                  <input
                    type="text"
                    className={`form-control ${fieldErrors.currentAddress ? "is-invalid" : ""}`}
                    name="currentAddress"
                    value={userData.currentAddress}
                    onChange={handleInputChange}
                    required
                  />
                  {fieldErrors.currentAddress && (
                    <div className="invalid-feedback">{fieldErrors.currentAddress}</div>
                  )}
                </div>
                  <div className="mb-3">
                    <label className="form-label">Village Address*</label>
                    <input
                      type="text"
                      className={`form-control ${fieldErrors.villageAddress ? "is-invalid" : ""}`}
                      name="villageAddress"
                      value={userData.villageAddress}
                      onChange={(e) => {
                        const { name, value } = e.target;
                        
                        // Clear error for this field when user starts typing
                        if (fieldErrors[name]) {
                          const newErrors = { ...fieldErrors };
                          delete newErrors[name];
                          setFieldErrors(newErrors);
                        }
                        
                        // Set the value directly without any restrictions
                        setUserData({
                          ...userData,
                          [name]: value,
                        });
                      }}
                      required
                    />
                    {fieldErrors.villageAddress && (
                      <div className="invalid-feedback">{fieldErrors.villageAddress}</div>
                    )}
                  </div>
                <div className="mb-3">
                  <label className="form-label">Previous Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="previousAddress"
                    value={userData.previousAddress}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Page 4 - Family Details */}
            {currentPage === 4 && (
              <div className="card p-4 mb-4 border-0 shadow-sm">
                <h3 className="text-center mb-4 text-primary">
                  <i className="bi bi-people-fill me-2"></i>Family Details
                </h3>

                <h4 className="mb-3 text-primary">Family Members</h4>
                {userData.familyMembers.map((member, index) => (
                  <div key={index} className="card mb-3 p-3 border-0 shadow-sm">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className={`form-control ${fieldErrors.familyMembers ? "is-invalid" : ""}`}
                          name="name"
                          value={member.name}
                          onChange={(e) => handleFamilyMemberChange(index, e)}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Relationship</label>
                        <input
                          type="text"
                          className={`form-control ${fieldErrors.familyMembers ? "is-invalid" : ""}`}
                          name="relationship"
                          value={member.relationship}
                          onChange={(e) => handleFamilyMemberChange(index, e)}
                        />
                      </div>
                      <div className="col-md-3 mb-3">
                        <label className="form-label">Age</label>
                        <input
                          type="number"
                          className={`form-control ${fieldErrors.familyMembers ? "is-invalid" : ""}`}
                          name="age"
                          value={member.age}
                          onChange={(e) => {
                            // Prevent negative values
                            const value = e.target.value;
                            if (value === '' || parseInt(value) >= 0) {
                              handleFamilyMemberChange(index, e);
                            }
                          }}
                          onKeyDown={(e) => {
                            // Prevent the minus sign from being entered
                            if (e.key === '-' || e.keyCode === 189) {
                              e.preventDefault();
                            }
                          }}
                          min="0"
                          max="100"
                        />
                        {fieldErrors.familyMembers && (
                          <div className="invalid-feedback">
                            Please enter a valid age between 0 and 100.
                          </div>
                        )}
                      </div>
                      <div className="col-md-1 d-flex align-items-end mb-3">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveFamilyMember(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {fieldErrors.familyMembers && (
                  <div className="alert alert-danger">{fieldErrors.familyMembers}</div>
                )}

                <button
                  type="button"
                  className="btn btn-outline-primary mb-4"
                  onClick={handleAddFamilyMember}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Family Member
                </button>

                <div className="mb-3">
                  <label className="form-label">Number of Dependents</label>
                  <input
                    type="number"
                    className={`form-control ${fieldErrors.numberOfDependents ? "is-invalid" : ""}`}
                    name="numberOfDependents"
                    value={userData.numberOfDependents}
                    onChange={(e) => {
                      // Prevent negative values
                      const value = e.target.value;
                      if (value === '' || parseInt(value) >= 0) {
                        handleInputChange(e);
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent the minus sign from being entered
                      if (e.key === '-' || e.keyCode === 189) {
                        e.preventDefault();
                      }
                    }}
                    min="0"
                    max="20"
                  />
                  {fieldErrors.numberOfDependents && (
                    <div className="invalid-feedback">{fieldErrors.numberOfDependents}</div>
                  )}
                </div>

                <h4 className="mb-3 text-primary">Dependents' Information</h4>
                {userData.dependentsInfo.map((dependent, index) => (
                  <div key={index} className="card mb-3 p-3 border-0 shadow-sm">
                    <div className="row">
                      <div className="col-md-5 mb-3">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className={`form-control ${fieldErrors.dependentsInfo ? "is-invalid" : ""}`}
                          name="dob"
                          value={dependent.dob}
                          onChange={(e) => {
                            const updatedDependents = [...userData.dependentsInfo];
                            updatedDependents[index].dob = e.target.value;
                            setUserData({
                              ...userData,
                              dependentsInfo: updatedDependents,
                            });
                          }}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="col-md-5 mb-3">
                        <label className="form-label">ID Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="id"
                          value={dependent.id}
                          onChange={(e) => handleDependentChange(index, e)}
                          maxLength="12"
                        />
                        <small className="form-text text-muted">
                          Enter either 12 digits or 9 digits followed by V
                        </small>
                      </div>
                      <div className="col-md-2 d-flex align-items-end mb-3">
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => handleRemoveDependent(index)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {fieldErrors.dependentsInfo && (
                  <div className="alert alert-danger">{fieldErrors.dependentsInfo}</div>
                )}

                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={handleAddDependent}
                >
                  <i className="bi bi-plus-circle me-2"></i>Add Dependent
                </button>
              </div>
            )}

            {/* Page 5 - Occupational Information */}
            {currentPage === 5 && (
              <div className="card p-4 mb-4 border-0 shadow-sm">
                <h3 className="text-center mb-4 text-primary">
                  <i className="bi bi-briefcase-fill me-2"></i>Occupational Information
                </h3>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Employment Status</label>
                    <select
                      className="form-select"
                      name="employmentStatus"
                      value={userData.employmentStatus}
                      onChange={handleInputChange}
                    >
                      <option value="">Select</option>
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Student">Student</option>
                      <option value="Retired">Retired</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Occupation</label>
                    <input
                      type="text"
                      className="form-control"
                      name="occupation"
                      value={userData.occupation}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Employer Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="employerName"
                      value={userData.employerName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Employer Contact</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="employerContact"
                      value={userData.employerContact}
                      onChange={handleInputChange}
                      maxLength="10"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Annual Income</label>
                  <input
                    type="number"
                    className="form-control"
                    name="annualIncome"
                    value={userData.annualIncome}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow positive numbers up to 1,000,000,000
                      if (value === '' || (Number(value) >= 0 && Number(value) <= 1000000000)) {
                        handleInputChange(e);
                      }
                    }}
                    min="0"
                    max="1000000000"
                    step="1"
                  />
                  <small className="text-muted">Maximum: 1,000,000,000</small>
                </div>
              </div>
            )}

            {/* Page 6 - Health Information */}
            {currentPage === 6 && (
              <div className="card p-4 mb-4 border-0 shadow-sm">
                <h3 className="text-center mb-4 text-primary">
                  <i className="bi bi-heart-pulse-fill me-2"></i>Health and Safety Information
                </h3>
                <div className="mb-3">
                  <label className="form-label">Medical History</label>
                  <textarea
                    className="form-control"
                    name="medicalHistory"
                    value={userData.medicalHistory}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Allergies</label>
                  <textarea
                    className="form-control"
                    name="allergies"
                    value={userData.allergies}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Disabilities</label>
                  <textarea
                    className="form-control"
                    name="disabilities"
                    value={userData.disabilities}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Page 7 - Legal Information */}
            {currentPage === 7 && (
              <div className="card p-4 mb-4 border-0 shadow-sm">
                <h3 className="text-center mb-4 text-primary">
                  <i className="bi bi-shield-lock-fill me-2"></i>Legal and Community Information
                </h3>

                <div className="mb-3">
                  <label className="form-label">Criminal Record</label>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="hasRecord"
                      checked={userData.criminalRecord.hasRecord}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          criminalRecord: {
                            ...userData.criminalRecord,
                            hasRecord: e.target.checked,
                          },
                        })
                      }
                    />
                    <label className="form-check-label">
                      Do you have a criminal record?
                    </label>
                  </div>
                  {userData.criminalRecord.hasRecord && (
                    <textarea
                      className="form-control mt-2"
                      name="details"
                      value={userData.criminalRecord.details}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          criminalRecord: {
                            ...userData.criminalRecord,
                            details: e.target.value,
                          },
                        })
                      }
                      placeholder="Provide details about your criminal record"
                      rows="3"
                    />
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Vehicle Information</label>
                  <input
                    type="text"
                    className="form-control"
                    name="vehicleInfo"
                    value={userData.vehicleInfo}
                    onChange={handleInputChange}
                    placeholder="Make, model, and license plate number"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Reason for Moving</label>
                  <textarea
                    className="form-control"
                    name="reasonForMoving"
                    value={userData.reasonForMoving}
                    onChange={handleInputChange}
                    rows="3"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Preferred Housing Type</label>
                  <select
                    className="form-select"
                    name="preferredHousingType"
                    value={userData.preferredHousingType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select</option>
                    <option value="Bungalow">Bungalow</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Cottage">Cottage</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Services Required</label>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="servicesRequired"
                          value="Water"
                          checked={userData.servicesRequired.includes("Water")}
                          onChange={(e) => {
                            const updatedServices =
                              userData.servicesRequired.includes(e.target.value)
                                ? userData.servicesRequired.filter(
                                    (service) => service !== e.target.value
                                  )
                                : [...userData.servicesRequired, e.target.value];
                            setUserData({
                              ...userData,
                              servicesRequired: updatedServices,
                            });
                          }}
                        />
                        <label className="form-check-label">Water</label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="servicesRequired"
                          value="Electricity"
                          checked={userData.servicesRequired.includes(
                            "Electricity"
                          )}
                          onChange={(e) => {
                            const updatedServices =
                              userData.servicesRequired.includes(e.target.value)
                                ? userData.servicesRequired.filter(
                                    (service) => service !== e.target.value
                                  )
                                : [...userData.servicesRequired, e.target.value];
                            setUserData({
                              ...userData,
                              servicesRequired: updatedServices,
                            });
                          }}
                        />
                        <label className="form-check-label">Electricity</label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="servicesRequired"
                          value="Internet"
                          checked={userData.servicesRequired.includes("Internet")}
                          onChange={(e) => {
                            const updatedServices =
                              userData.servicesRequired.includes(e.target.value)
                                ? userData.servicesRequired.filter(
                                    (service) => service !== e.target.value
                                  )
                                : [...userData.servicesRequired, e.target.value];
                            setUserData({
                              ...userData,
                              servicesRequired: updatedServices,
                            });
                          }}
                        />
                        <label className="form-check-label">Internet</label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          name="servicesRequired"
                          value="Medical"
                          checked={userData.servicesRequired.includes("Medical")}
                          onChange={(e) => {
                            const updatedServices =
                              userData.servicesRequired.includes(e.target.value)
                                ? userData.servicesRequired.filter(
                                    (service) => service !== e.target.value
                                  )
                                : [...userData.servicesRequired, e.target.value];
                            setUserData({
                              ...userData,
                              servicesRequired: updatedServices,
                            });
                          }}
                        />
                        <label className="form-check-label">Medical</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Community Participation</label>
                  <textarea
                    className="form-control"
                    name="communityParticipation"
                    value={userData.communityParticipation}
                    onChange={handleInputChange}
                    placeholder="Are you willing to participate in community activities?"
                    rows="3"
                  />
                </div>
              </div>
            )}

            {/* Page 8 - Consent and Behavior */}
            {currentPage === 8 && (
              <div className="card p-4 mb-4 border-0 shadow-sm">
                <h3 className="text-center mb-4 text-primary">
                  <i className="bi bi-check-circle-fill me-2"></i>Consent and User Behaviors
                </h3>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className={`form-check-input ${fieldErrors.dataConsent ? "is-invalid" : ""}`}
                      name="dataConsent"
                      checked={userData.dataConsent}
                      onChange={(e) =>
                        setUserData({ ...userData, dataConsent: e.target.checked })
                      }
                      required
                    />
                    <label className="form-check-label">
                      I agree to the collection and storage of my personal
                      information in accordance with village policies.*
                    </label>
                    {fieldErrors.dataConsent && (
                      <div className="invalid-feedback d-block">{fieldErrors.dataConsent}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Digital Signature*</label>
                  <input
                    type="text"
                    className={`form-control ${fieldErrors.digitalSignature ? "is-invalid" : ""}`}
                    name="digitalSignature"
                    value={userData.digitalSignature}
                    onChange={handleInputChange}
                    placeholder="Type your full name as digital signature"
                    required
                  />
                  {fieldErrors.digitalSignature && (
                    <div className="invalid-feedback">{fieldErrors.digitalSignature}</div>
                  )}
                </div>

                <h4 className="mt-4 mb-3 text-primary">User Behaviors</h4>
                <div className="mb-3">
                  <label className="form-label">Behavior Towards the Village</label>
                  <textarea
                    className="form-control"
                    name="villageContribution"
                    value={userData.behavior.villageContribution}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        behavior: {
                          ...userData.behavior,
                          villageContribution: e.target.value,
                        },
                      })
                    }
                    placeholder="How do you contribute to the community?"
                    rows="3"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Living Conditions</label>
                  <textarea
                    className="form-control"
                    name="livingConditions"
                    value={userData.behavior.livingConditions}
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        behavior: {
                          ...userData.behavior,
                          livingConditions: e.target.value,
                        },
                      })
                    }
                    placeholder="Describe how you maintain your living space."
                    rows="3"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Illegal Activities</label>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="hasRecord"
                      checked={userData.behavior.illegalActivities.hasRecord}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          behavior: {
                            ...userData.behavior,
                            illegalActivities: {
                              ...userData.behavior.illegalActivities,
                              hasRecord: e.target.checked,
                            },
                          },
                        })
                      }
                    />
                    <label className="form-check-label">
                      Have you ever been involved in any illegal activities?
                    </label>
                  </div>
                  {userData.behavior.illegalActivities.hasRecord && (
                    <textarea
                      className="form-control mt-2"
                      name="details"
                      value={userData.behavior.illegalActivities.details}
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          behavior: {
                            ...userData.behavior,
                            illegalActivities: {
                              ...userData.behavior.illegalActivities,
                              details: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Provide details about any illegal activities"
                      rows="3"
                    />
                  )}
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              {currentPage > 1 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handlePrevious}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left me-2"></i>Previous
                </button>
              )}

              {currentPage < 8 ? (
                <button
                  type="button"
                  className="btn btn-primary ms-auto"
                  onClick={handleNext}
                  disabled={loading || Object.keys(fieldErrors).length > 0}
                >
                  Next<i className="bi bi-arrow-right ms-2"></i>
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-success ms-auto"
                  disabled={loading || Object.keys(fieldErrors).length > 0}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Registering...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>Submit Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;