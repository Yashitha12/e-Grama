import React, { useState } from "react";
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phoneNumber) => {
    // Remove any non-digit characters to count only numbers
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    return digitsOnly.length === 10;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Set the updated value first
    setUserData({
      ...userData,
      [name]: value,
    });

    // Validate email if it's the email field and has a value
    if (name === "email" && value && !validateEmail(value)) {
      toast.error("Please enter a valid email address");
    }

    // Validate phone number if it's the phone field and has a value
    if (name === "phoneNumber" && value && !validatePhoneNumber(value)) {
      toast.error("Phone number must contain 10 digits");
    }
  };

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target;

    setUserData({
      ...userData,
      emergencyContact: {
        ...userData.emergencyContact,
        [name]: value,
      },
    });

    // Validate emergency contact phone number
    if (name === "phone" && value && !validatePhoneNumber(value)) {
      toast.error("Emergency contact phone number must contain 10 digits");
    }
  };

  const handleFamilyMemberChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFamilyMembers = [...userData.familyMembers];
    updatedFamilyMembers[index][name] = value;
    setUserData({
      ...userData,
      familyMembers: updatedFamilyMembers,
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

    // Validate email and phone number before submission
    if (!validateEmail(userData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePhoneNumber(userData.phoneNumber)) {
      toast.error("Phone number must contain 10 digits");
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
    // Validate email and phone on page transitions if needed
    if (currentPage === 2) {
      if (userData.email && !validateEmail(userData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      if (userData.phoneNumber && !validatePhoneNumber(userData.phoneNumber)) {
        toast.error("Phone number must contain 10 digits");
        return;
      }

      if (
        userData.emergencyContact.phone &&
        !validatePhoneNumber(userData.emergencyContact.phone)
      ) {
        toast.error("Emergency contact phone number must contain 10 digits");
        return;
      }
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

  // Import toast library
  const toast = {
    error: (message) => {
      // You can replace this with your actual toast library like react-toastify
      alert(message);
    },
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Register New User</h2>

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

      <form onSubmit={handleSubmit}>
        {/* Page 1 - Personal Information */}
        {currentPage === 1 && (
          <div className="card p-4 mb-4">
            <h3 className="text-center mb-4">Personal Information</h3>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">First Name*</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Last Name*</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Date of Birth*</label>
                <input
                  type="date"
                  className="form-control"
                  name="dateOfBirth"
                  value={userData.dateOfBirth}
                  onChange={(e) => {
                    const birthDate = new Date(e.target.value);
                    const today = new Date();

                    // Calculate age
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();

                    // Adjust age if birthday hasn't occurred yet this year
                    if (
                      monthDiff < 0 ||
                      (monthDiff === 0 && today.getDate() < birthDate.getDate())
                    ) {
                      age--;
                    }

                    // Check if user is at least 21 years old
                    if (age < 21) {
                      // Show error message
                      alert("You must be at least 21 years old to register.");
                      return;
                    }

                    // If they're 21+, update the value
                    handleInputChange(e);
                  }}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Gender*</label>
                <select
                  className="form-select"
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nationality*</label>
                <input
                  type="text"
                  className="form-control"
                  name="nationality"
                  value={userData.nationality}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">ID Number*</label>
                <input
                  type="text"
                  className="form-control"
                  name="identificationNumber"
                  value={userData.identificationNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Marital Status*</label>
                <select
                  className="form-select"
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
          <div className="card p-4 mb-4">
            <h3 className="text-center mb-4">Contact Information</h3>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Phone Number*</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phoneNumber"
                  value={userData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
                <small className="text-muted">Must contain 10 digits</small>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Email Address*</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                />
                <small className="text-muted">
                  Must be a valid email format
                </small>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Password*</label>
              <input
                type="password"
                className="form-control"
                name="password"
                value={userData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <h4 className="mt-4 mb-3">Emergency Contact Information*</h4>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={userData.emergencyContact.name}
                  onChange={handleEmergencyContactChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Relationship</label>
                <input
                  type="text"
                  className="form-control"
                  name="relationship"
                  value={userData.emergencyContact.relationship}
                  onChange={handleEmergencyContactChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  value={userData.emergencyContact.phone}
                  onChange={handleEmergencyContactChange}
                  required
                />
                <small className="text-muted">Must contain 10 digits</small>
              </div>
            </div>
          </div>
        )}

        {/* Page 3 - Address Information */}
        {currentPage === 3 && (
          <div className="card p-4 mb-4">
            <h3 className="text-center mb-4">Address Information</h3>
            <div className="mb-3">
              <label className="form-label">Current Address*</label>
              <input
                type="text"
                className="form-control"
                name="currentAddress"
                value={userData.currentAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Village Address*</label>
              <input
                type="text"
                className="form-control"
                name="villageAddress"
                value={userData.villageAddress}
                onChange={handleInputChange}
                required
              />
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
          <div className="card p-4 mb-4">
            <h3 className="text-center mb-4">Family Details</h3>

            <h4 className="mb-3">Family Members</h4>
            {userData.familyMembers.map((member, index) => (
              <div key={index} className="card mb-3 p-3">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={member.name}
                      onChange={(e) => handleFamilyMemberChange(index, e)}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Relationship</label>
                    <input
                      type="text"
                      className="form-control"
                      name="relationship"
                      value={member.relationship}
                      onChange={(e) => handleFamilyMemberChange(index, e)}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Age</label>
                    <input
                      type="number"
                      className="form-control"
                      name="age"
                      value={member.age}
                      onChange={(e) => handleFamilyMemberChange(index, e)}
                    />
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

            <button
              type="button"
              className="btn btn-secondary mb-4"
              onClick={handleAddFamilyMember}
            >
              Add Family Member
            </button>

            <div className="mb-3">
              <label className="form-label">Number of Dependents</label>
              <input
                type="number"
                className="form-control"
                name="numberOfDependents"
                value={userData.numberOfDependents}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <h4 className="mb-3">Dependents' Information</h4>
            {userData.dependentsInfo.map((dependent, index) => (
              <div key={index} className="card mb-3 p-3">
                <div className="row">
                  <div className="col-md-5 mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
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
                    />
                  </div>
                  <div className="col-md-5 mb-3">
                    <label className="form-label">ID Number</label>
                    <input
                      type="text"
                      className="form-control"
                      name="id"
                      value={dependent.id}
                      onChange={(e) => {
                        const updatedDependents = [...userData.dependentsInfo];
                        updatedDependents[index].id = e.target.value;
                        setUserData({
                          ...userData,
                          dependentsInfo: updatedDependents,
                        });
                      }}
                    />
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

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddDependent}
            >
              Add Dependent
            </button>
          </div>
        )}

        {/* Page 5 - Occupational Information */}
        {currentPage === 5 && (
          <div className="card p-4 mb-4">
            <h3 className="text-center mb-4">Occupational Information</h3>
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
                onChange={handleInputChange}
                min="0"
              />
            </div>
          </div>
        )}

        {/* Page 6 - Health Information */}
        {currentPage === 6 && (
          <div className="card p-4 mb-4">
            <h3 className="text-center mb-4">Health and Safety Information</h3>
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
          <div className="card p-4 mb-4">
            <h3 className="text-center mb-4">
              Legal and Community Information
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
          <div className="card p-4 mb-4">
            <h3 className="text-center mb-4">Consent and User Behaviors</h3>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
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
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Digital Signature*</label>
              <input
                type="text"
                className="form-control"
                name="digitalSignature"
                value={userData.digitalSignature}
                onChange={handleInputChange}
                placeholder="Type your full name as digital signature"
                required
              />
            </div>

            <h4 className="mt-4 mb-3">User Behaviors</h4>
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
              Previous
            </button>
          )}

          {currentPage < 8 ? (
            <button
              type="button"
              className="btn btn-primary ms-auto"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success ms-auto"
              disabled={loading}
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
                "Submit Registration"
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
