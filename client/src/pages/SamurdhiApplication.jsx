/*import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ApplicationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    residentId: 'RES123',
    applicationType: '',
    fullName: '',
    nationalIdNumber: '',
    permanentAddress: '',
    contactNumber: '',
    monthlyIncome: '',
    loanAmount: '',
    loanPurpose: '',
    loanDuration: '',
    currentOccupation: '',
    employerName: '',
    employerContact: '',
    proofOfIncome: '',
    bankStatement: '',
    numberOfFamilyMembers: 0,
    governmentAidHistory: '',
    lowIncomeProof: '',
    isDraft: false,
  });

  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [mergedDocument, setMergedDocument] = useState(null); // Merged document state

  const handleMergedDocumentChange = (e) => {
    const file = e.target.files[0];
    setMergedDocument(file);
  };

  const steps = [
    { title: 'Application Type', fields: ['applicationType'] },
    { title: 'Personal Information', fields: ['fullName', 'nationalIdNumber', 'permanentAddress', 'contactNumber'] },
    { title: 'Income Details', fields: ['monthlyIncome'] },
    ...(formData.applicationType === 'Loan'
      ? [
          { title: 'Loan Details', fields: ['loanAmount', 'loanPurpose', 'loanDuration'] },
          { title: 'Employment Details', fields: ['currentOccupation', 'employerName', 'employerContact'] },
          { title: 'Financial Documents', fields: ['proofOfIncome', 'bankStatement'] },
        ]
      : formData.applicationType === 'Samurdhi'
      ? [
          { title: 'Family & Aid Details', fields: ['numberOfFamilyMembers', 'governmentAidHistory'] },
          { title: 'Supporting Documents', fields: ['lowIncomeProof'] },
        ]
      : []),
  ];

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        return value.length < 2 ? 'Full name must be at least 2 characters' : '';
      case 'nationalIdNumber':
        return !/^\d{12}$/.test(value) ? 'National ID must be exactly 12 digits' : '';
      case 'permanentAddress':
        return value.length < 10 ? 'Address must be at least 10 characters' : '';
      case 'contactNumber':
        return !/^(?:\+94|0)[1-9]\d{8}$/.test(value) ? 'Invalid phone number format' : '';
      case 'monthlyIncome':
        return (!value || parseFloat(value) <= 0) ? 'Must be greater than 0' : '';
      case 'loanAmount':
        const loanAmt = parseFloat(value);
        return (!value || loanAmt < 1000 || loanAmt > 1000000) ? 'Loan amount must be between 1,000 and 1,000,000' : '';
      case 'loanPurpose':
        return !value ? 'Please select a loan purpose' : '';
      case 'loanDuration':
        const months = parseInt(value);
        return (!months || months < 1 || months > 240) ? 'Duration must be between 1 and 240 months' : '';
      case 'numberOfFamilyMembers':
        return (!value || value < 0) ? 'Must be 0 or greater' : '';
      default:
        return value === '' ? 'This field is required' : '';
    }
  };

  const validateStep = () => {
    const currentFields = steps[step - 1].fields;
    const newErrors = {};
    currentFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    const error = validateField(name, newValue);
    setValidationErrors((prev) => ({ ...prev, [name]: error || undefined }));
  }

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setValidationErrors((prev) => ({ ...prev, [name]: 'File size must not exceed 5MB' }));
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: file }));
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== '' && formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (mergedDocument) {
        formDataToSend.append('mergedDocument', mergedDocument);
      }

      const url =
        formData.applicationType === 'Loan'
          ? 'http://localhost:5000/api/microfinance/loans/upload-merged'
          : 'http://localhost:5000/api/microfinance/samurdhi';

      await axios.post(url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      resetForm();
      setPreview(false);
      setStep(1);
      navigate('/');
    } catch (error) {
      setError('Failed to submit application: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      residentId: 'RES123',
      applicationType: '',
      fullName: '',
      nationalIdNumber: '',
      permanentAddress: '',
      contactNumber: '',
      monthlyIncome: '',
      loanAmount: '',
      loanPurpose: '',
      loanDuration: '',
      currentOccupation: '',
      employerName: '',
      employerContact: '',
      proofOfIncome: '',
      bankStatement: '',
      numberOfFamilyMembers: 0,
      governmentAidHistory: '',
      lowIncomeProof: '',
      isDraft: false,
    });
    setValidationErrors({});
  };

  const renderField = (field) => {
    const error = validationErrors[field]; 
    const commonProps = {
      name: field,
      value: formData[field],
      onChange: handleChange,
      required: true,
      className: `form-control ${error ? 'is-invalid' : ''}`,
    };

    switch (field) {
      case 'applicationType':
        return (
          <div className="mb-3">
            <label className="form-label">Application Type</label>
            <select {...commonProps}>
              <option value="">Select Application Type</option>
              <option value="Loan">Loan</option>
              <option value="Samurdhi">Samurdhi</option>
            </select>
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'fullName':
        return (
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input type="text" {...commonProps} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'nationalIdNumber':
        return (
          <div className="mb-3">
            <label className="form-label">National ID Number</label>
            <input type="text" {...commonProps} maxLength="12" />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'permanentAddress':
        return (
          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea {...commonProps} rows="3" />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'contactNumber':
        return (
          <div className="mb-3">
            <label className="form-label">Contact Number</label>
            <input type="tel" {...commonProps} maxLength="12" placeholder="+947xxxxxxxx or 07xxxxxxxx" />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'monthlyIncome':
        return (
          <div className="mb-3">
            <label className="form-label">Monthly Income</label>
            <input type="number" {...commonProps} min="0" step="0.01" />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'loanAmount':
        return (
          <div className="mb-3">
            <label className="form-label">Loan Amount</label>
            <input type="number" {...commonProps} min="1000" max="1000000" />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'loanPurpose':
        return (
          <div className="mb-3">
            <label className="form-label">Loan Purpose</label>
            <select {...commonProps}>
              <option value="">Select Loan Purpose</option>
              <option value="Personal">Personal</option>
              <option value="Business">Business</option>
              <option value="Medical">Medical</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'loanDuration':
        return (
          <div className="mb-3">
            <label className="form-label">Repayment Duration (Months)</label>
            <input type="number" {...commonProps} min="1" max="240" />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'currentOccupation':
        return (
          <div className="mb-3">
            <label className="form-label">Job Type</label>
            <input type="text" {...commonProps} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'employerName':
        return (
          <div className="mb-3">
            <label className="form-label">Employer</label>
            <input type="text" {...commonProps} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'employerContact':
        return (
          <div className="mb-3">
            <label className="form-label">Employer Contact</label>
            <input type="tel" {...commonProps} maxLength="12" placeholder="+947xxxxxxxx or 07xxxxxxxx" />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'proofOfIncome':
        return (
          <div className="mb-3">
            <label className="form-label">Salary Slip</label>
            <input type="file" name={field} onChange={handleMergedDocumentChange} accept=".pdf,.jpg,.jpeg,.png" className="form-control" />
            {error && <div className="text-danger">{error}</div>}
          </div>
        );
      case 'bankStatement':
        return (
          <div className="mb-3">
            <label className="form-label">Bank Statements</label>
            <input type="file" name={field} onChange={handleMergedDocumentChange} accept=".pdf,.jpg,.jpeg,.png" className="form-control" />
            {error && <div className="text-danger">{error}</div>}
          </div>
        );
      case 'numberOfFamilyMembers':
        return (
          <div className="mb-3">
            <label className="form-label">Number of Dependents</label>
            <input type="number" {...commonProps} min="0" />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'governmentAidHistory':
        return (
          <div className="mb-3">
            <label className="form-label">Previous Samurdhi Benefits</label>
            <input type="text" {...commonProps} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'lowIncomeProof':
        return (
          <div className="mb-3">
            <label className="form-label">Proof of Low Income</label>
            <input type="file" name={field} onChange={handleMergedDocumentChange} accept=".pdf,.jpg,.jpeg,.png" className="form-control" />
            {error && <div className="text-danger">{error}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  const nextStep = () => {
    if (validateStep() && step < steps.length) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderFields = (fields) =>
    fields.map((field) => <div key={field}>{renderField(field)}</div>);

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        <div className="col-md-3 bg-dark text-white p-4 position-fixed vh-100 overflow-auto">
          <h2 className="mb-4">Application Form</h2>
          <ul className="list-unstyled">
            {steps.map((s, index) => (
              <li
                key={s.title}
                className={`d-flex align-items-center mb-3 p-2 ${step === index + 1 ? 'bg-primary rounded' : ''}`}
              >
                <span className={`badge me-2 ${step > index + 1 ? 'bg-success' : 'bg-secondary'}`}>
                  {step > index + 1 ? '✔' : index + 1}
                </span>
                {s.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-9 ms-md-auto p-4 bg-light">
          {error && <div className="alert alert-danger">{error}</div>}
          {preview ? (
            <div className="card shadow-sm p-4">
              <h2 className="card-title mb-4 text-primary">Preview Your Application</h2>
              <div className="row">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="col-md-6 mb-3">
                    <p>
                      <strong>{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}:</strong>{' '}
                      {value instanceof File
                        ? value.name
                        : typeof value === 'boolean'
                        ? value
                          ? 'Yes'
                          : 'No'
                        : value || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-3">
                <button className="btn btn-secondary" onClick={() => setPreview(false)}>
                  Edit
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="card shadow-sm p-4">
                <h3 className="card-title mb-4 text-primary">{steps[step - 1].title}</h3>
                {renderFields(steps[step - 1].fields)}
              </div>
              <div className="d-flex justify-content-end gap-3 mt-4">
                {step > 1 && (
                  <button type="button" className="btn btn-secondary" onClick={prevStep}>
                    Previous
                  </button>
                )}
                {step < steps.length ? (
                  <button type="button" className="btn btn-primary" onClick={nextStep}>
                    Next
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn btn-warning" onClick={() => setPreview(true)}>
                      Preview
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicationForm;*/
