import React, { useState } from 'react';
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
    numberOfFamilyMembers: 0,
    governmentAidHistory: '',
    isDraft: false,
    email: '',
  });
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { title: 'Application Type', fields: ['applicationType'] },
    { title: 'Personal Information', fields: ['fullName', 'nationalIdNumber', 'permanentAddress', 'contactNumber'] },
    { title: 'Income Details', fields: ['monthlyIncome'] },
    ...(formData.applicationType === 'Loan'
      ? [
          { title: 'Loan Details', fields: ['loanAmount', 'loanPurpose', 'loanDuration'] },
          { title: 'Employment Details', fields: ['currentOccupation', 'employerName', 'employerContact'] },
          { title: 'Document Checklist', fields: ['email'] },
        ]
      : formData.applicationType === 'Samurdhi'
      ? [
          { title: 'Family & Aid Details', fields: ['numberOfFamilyMembers', 'governmentAidHistory'] },
          { title: 'Document Checklist', fields: ['email'] },
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
      case 'email':
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : '';
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const dataToSend = { ...formData };
      const url =
        formData.applicationType === 'Loan'
          ? 'http://localhost:5000/api/microfinance/loans'
          : 'http://localhost:5000/api/microfinance/samurdhi';

      await axios.post(url, dataToSend, {
        headers: { 'Content-Type': 'application/json' },
      });

      resetForm();
      setPreview(false);
      setStep(1);
      navigate('/loan-dashboard');
    } catch (error) {
      setError('Failed to submit application: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      const dataToSend = { ...formData, isDraft: true };
      const url =
        formData.applicationType === 'Loan'
          ? 'http://localhost:5000/api/microfinance/loans'
          : 'http://localhost:5000/api/microfinance/samurdhi';

      await axios.post(url, dataToSend, {
        headers: { 'Content-Type': 'application/json' },
      });

      resetForm();
      setStep(1);
      navigate('/');
    } catch (error) {
      setError('Failed to save draft: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
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
      numberOfFamilyMembers: 0,
      governmentAidHistory: '',
      isDraft: false,
      email: '',
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
      style: {
        borderRadius: '12px',
        border: error ? '1px solid #EF5350' : '1px solid #E0E0E0',
        padding: '14px',
        fontSize: '1rem',
        color: '#333333',
        backgroundColor: '#FAFAFA',
        transition: 'all 0.3s ease',
      },
    };

    const LabelStyle = ({ children }) => (
      <label className="form-label mb-2" style={{ color: '#333333', fontWeight: 500, fontSize: '0.95rem' }}>
        {children}
      </label>
    );

    switch (field) {
      case 'applicationType':
        return (
          <div className="mb-4">
            <LabelStyle>Application Type</LabelStyle>
            <div className="d-flex gap-3 mb-2">
              <div 
                className={`card p-4 text-center flex-grow-1 ${formData.applicationType === 'Loan' ? 'active-card' : ''}`} 
                style={{ 
                  cursor: 'pointer', 
                  borderRadius: '16px',
                  backgroundColor: formData.applicationType === 'Loan' ? '#5D3FD3' : '#FFFFFF',
                  color: formData.applicationType === 'Loan' ? '#FFFFFF' : '#333333',
                  boxShadow: formData.applicationType === 'Loan' ? '0 10px 15px -3px rgba(93, 63, 211, 0.3)' : '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleChange({ target: { name: 'applicationType', value: 'Loan' } })}
              >
                <div className="mb-3">
                  <i className="fas fa-money-bill-wave" style={{ fontSize: '2rem' }}></i>
                </div>
                <h5>Loan Application</h5>
                <p className="small mb-0">For personal or business financial needs</p>
              </div>
              <div 
                className={`card p-4 text-center flex-grow-1 ${formData.applicationType === 'Samurdhi' ? 'active-card' : ''}`}
                style={{ 
                  cursor: 'pointer', 
                  borderRadius: '16px',
                  backgroundColor: formData.applicationType === 'Samurdhi' ? '#5D3FD3' : '#FFFFFF',
                  color: formData.applicationType === 'Samurdhi' ? '#FFFFFF' : '#333333',
                  boxShadow: formData.applicationType === 'Samurdhi' ? '0 10px 15px -3px rgba(93, 63, 211, 0.3)' : '0 2px 10px rgba(0,0,0,0.05)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => handleChange({ target: { name: 'applicationType', value: 'Samurdhi' } })}
              >
                <div className="mb-3">
                  <i className="fas fa-hands-helping" style={{ fontSize: '2rem' }}></i>
                </div>
                <h5>Samurdhi Benefits</h5>
                <p className="small mb-0">Government welfare assistance program</p>
              </div>
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'fullName':
        return (
          <div className="mb-4">
            <LabelStyle>Full Name</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-user"></i>
              </span>
              <input type="text" {...commonProps} style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'nationalIdNumber':
        return (
          <div className="mb-4">
            <LabelStyle>National ID Number</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-id-card"></i>
              </span>
              <input type="text" {...commonProps} maxLength="12" style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'permanentAddress':
        return (
          <div className="mb-4">
            <LabelStyle>Address</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-home"></i>
              </span>
              <textarea {...commonProps} rows="3" style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'contactNumber':
        return (
          <div className="mb-4">
            <LabelStyle>Contact Number</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-phone"></i>
              </span>
              <input type="tel" {...commonProps} maxLength="12" placeholder="+947xxxxxxxx or 07xxxxxxxx" style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'monthlyIncome':
        return (
          <div className="mb-4">
            <LabelStyle>Monthly Income (LKR)</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-coins"></i>
              </span>
              <input type="number" {...commonProps} min="0" step="0.01" style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'loanAmount':
        return (
          <div className="mb-4">
            <LabelStyle>Loan Amount (LKR)</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-money-bill"></i>
              </span>
              <input 
                type="range" 
                min="1000" 
                max="1000000" 
                step="1000"
                value={formData.loanAmount} 
                onChange={handleChange}
                name="loanAmount"
                className="form-range"
                style={{ padding: '10px 15px' }}
              />
              <span className="input-group-text" style={{ backgroundColor: '#FAFAFA', color: '#333', borderRadius: '0 12px 12px 0', minWidth: '120px', justifyContent: 'center' }}>
                {parseFloat(formData.loanAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <small>1,000</small>
              <small>1,000,000</small>
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'loanPurpose':
        return (
          <div className="mb-4">
            <LabelStyle>Loan Purpose</LabelStyle>
            <div className="d-flex flex-wrap gap-2">
              {['Personal', 'Business', 'Medical', 'Education', 'Other'].map(purpose => (
                <div
                  key={purpose}
                  className={`purpose-option py-2 px-3 ${formData.loanPurpose === purpose ? 'active' : ''}`}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '12px',
                    border: formData.loanPurpose === purpose ? '2px solid #5D3FD3' : '1px solid #E0E0E0',
                    backgroundColor: formData.loanPurpose === purpose ? '#EDE7F6' : '#FFFFFF',
                    color: formData.loanPurpose === purpose ? '#5D3FD3' : '#333333',
                    fontWeight: formData.loanPurpose === purpose ? '500' : '400',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handleChange({ target: { name: 'loanPurpose', value: purpose } })}
                >
                  {purpose}
                </div>
              ))}
            </div>
            {error && <div className="invalid-feedback d-block mt-2" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'loanDuration':
        return (
          <div className="mb-4">
            <LabelStyle>Repayment Duration (Months)</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-calendar"></i>
              </span>
              <input 
                type="range" 
                min="1" 
                max="240" 
                step="1"
                value={formData.loanDuration} 
                onChange={handleChange}
                name="loanDuration"
                className="form-range"
                style={{ padding: '10px 15px' }}
              />
              <span className="input-group-text" style={{ backgroundColor: '#FAFAFA', color: '#333', borderRadius: '0 12px 12px 0', minWidth: '80px', justifyContent: 'center' }}>
                {formData.loanDuration || 0} {(formData.loanDuration === '1') ? 'month' : 'months'}
              </span>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <small>1 month</small>
              <small>240 months</small>
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'currentOccupation':
        return (
          <div className="mb-4">
            <LabelStyle>Job Type</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-briefcase"></i>
              </span>
              <input type="text" {...commonProps} style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'employerName':
        return (
          <div className="mb-4">
            <LabelStyle>Employer</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-building"></i>
              </span>
              <input type="text" {...commonProps} style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'employerContact':
        return (
          <div className="mb-4">
            <LabelStyle>Employer Contact</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-phone-office"></i>
              </span>
              <input type="tel" {...commonProps} maxLength="12" placeholder="+947xxxxxxxx or 07xxxxxxxx" style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'numberOfFamilyMembers':
        return (
          <div className="mb-4">
            <LabelStyle>Number of Dependents</LabelStyle>
            <div className="d-flex align-items-center gap-3">
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                style={{ borderRadius: '12px', width: '40px', height: '40px', padding: '0' }}
                onClick={() => {
                  const newValue = Math.max(0, parseInt(formData.numberOfFamilyMembers || 0) - 1);
                  handleChange({ target: { name: 'numberOfFamilyMembers', value: newValue } });
                }}
              >
                <i className="fas fa-minus"></i>
              </button>
              <input 
                type="number" 
                {...commonProps} 
                min="0" 
                style={{ ...commonProps.style, textAlign: 'center' }} 
              />
              <button 
                type="button" 
                className="btn btn-outline-secondary" 
                style={{ borderRadius: '12px', width: '40px', height: '40px', padding: '0' }}
                onClick={() => {
                  const newValue = parseInt(formData.numberOfFamilyMembers || 0) + 1;
                  handleChange({ target: { name: 'numberOfFamilyMembers', value: newValue } });
                }}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'governmentAidHistory':
        return (
          <div className="mb-4">
            <LabelStyle>Previous Samurdhi Benefits</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-history"></i>
              </span>
              <input type="text" {...commonProps} style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      case 'email':
        return (
          <div className="mb-4">
            <LabelStyle>Email for Appointment</LabelStyle>
            <div className="input-group">
              <span className="input-group-text" style={{ backgroundColor: '#5D3FD3', color: 'white', borderRadius: '12px 0 0 12px', border: 'none' }}>
                <i className="fas fa-envelope"></i>
              </span>
              <input type="email" {...commonProps} placeholder="your.email@example.com" style={{ ...commonProps.style, borderRadius: '0 12px 12px 0' }} />
            </div>
            {error && <div className="invalid-feedback d-block" style={{ color: '#EF5350' }}>{error}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  const renderDocumentChecklist = () => {
    const loanDocuments = [
      {
        title: 'National Identity Card (NIC)',
        description: 'To confirm your identity.',
        note: 'Bring an original and one photocopy.',
        icon: 'id-card'
      },
      {
        title: 'Recent Utility Bill',
        description: 'To verify your home address.',
        note: 'Bring an original and one photocopy.',
        icon: 'file-invoice'
      },
      {
        title: 'Proof of Income',
        description: 'Salary slip, bank statement, or self-employment proof.',
        note: 'Bring an original and one photocopy.',
        icon: 'money-check-alt'
      },
      {
        title: 'Loan Purpose Statement',
        description: "A brief letter describing why you're requesting the loan.",
        note: 'Bring an original and one photocopy.',
        icon: 'file-alt'
      },
    ];

    const samurdhiDocuments = [
      {
        title: 'National Identity Card (NIC)',
        description: 'To confirm your identity.',
        note: 'Bring an original and one photocopy.',
        icon: 'id-card'
      },
      {
        title: 'Proof of Residence',
        description: 'To verify your home address.',
        note: 'Bring an original and one photocopy.',
        icon: 'home'
      },
      {
        title: 'Income Certificate',
        description: 'Issued by the Grama Niladhari or relevant authority.',
        note: 'Bring an original and one photocopy.',
        icon: 'certificate'
      },
      {
        title: 'Family Details Document',
        description: 'Including dependents and household info.',
        note: 'Bring an original and one photocopy.',
        icon: 'users'
      },
    ];

    return (
      <div className="mt-5 mb-4">
        <h5 style={{ color: '#5D3FD3', fontWeight: 600, marginBottom: '15px' }}>Required Documents</h5>
        <div className="alert" style={{
          backgroundColor: '#EDE7F6',
          border: 'none',
          borderRadius: '12px',
          padding: '16px',
          position: 'relative',
          marginBottom: '25px'
        }}>
          <i className="fas fa-info-circle me-2" style={{ color: '#5D3FD3' }}></i>
          <span style={{ color: '#333333' }}>
            To complete your {formData.applicationType} application, please bring all required documents to our office. Document verification ensures your application can be processed faster and more securely.
          </span>
        </div>
        
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {(formData.applicationType === 'Loan' ? loanDocuments : samurdhiDocuments).map((doc, index) => (
            <div key={index} className="col">
              <div className="card h-100" style={{ 
                border: 'none', 
                backgroundColor: '#FFFFFF', 
                borderRadius: '16px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                overflow: 'hidden'
              }}>
                <div className="p-1" style={{ backgroundColor: '#5D3FD3', height: '6px' }}></div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '12px', 
                      backgroundColor: '#EDE7F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '12px'
                    }}>
                      <i className={`fas fa-${doc.icon}`} style={{ color: '#5D3FD3', fontSize: '1.2rem' }}></i>
                    </div>
                    <h6 className="card-title mb-0" style={{ color: '#333333', fontWeight: 600 }}>
                      {doc.title}
                    </h6>
                  </div>
                  <p className="card-text" style={{ color: '#666666', fontSize: '0.9rem' }}>{doc.description}</p>
                  <div className="d-flex align-items-center mt-3">
                    <span className="badge" style={{ backgroundColor: '#A8E6CF', color: '#333333', padding: '6px 12px', borderRadius: '8px', fontWeight: '500' }}>
                      <i className="fas fa-check-circle me-1"></i> {doc.note}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const nextStep = () => {
    if (validateStep() && step < steps.length) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const renderFields = (fields) =>
    fields.map((field) => (
      <div key={field}>
        {field === 'email' && renderDocumentChecklist()}
        {renderField(field)}
      </div>
    ));

  const renderProgressBar = () => {
    const progress = ((step - 1) / (steps.length - 1)) * 100;
    
    return (
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span style={{ color: '#5D3FD3', fontWeight: 600 }}>Progress</span>
          <span className="badge" style={{ backgroundColor: '#EDE7F6', color: '#5D3FD3', padding: '4px 12px', borderRadius: '12px' }}>
          <span>{Math.round(progress)}%</span>
          </span>
        </div>
        <div className="progress" style={{ height: '8px', backgroundColor: '#E0E0E0', borderRadius: '10px', overflow: 'hidden' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ 
              width: `${progress}%`, 
              backgroundColor: '#5D3FD3',
              transition: 'width 0.5s ease'
            }} 
            aria-valuenow={progress} 
            aria-valuemin="0" 
            aria-valuemax="100">
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    const sections = [
      { title: 'Application Details', fields: ['applicationType'] },
      { title: 'Personal Information', fields: ['fullName', 'nationalIdNumber', 'permanentAddress', 'contactNumber', 'email'] },
      { title: 'Financial Information', fields: ['monthlyIncome'] },
      ...(formData.applicationType === 'Loan' 
        ? [
            { title: 'Loan Details', fields: ['loanAmount', 'loanPurpose', 'loanDuration'] },
            { title: 'Employment Details', fields: ['currentOccupation', 'employerName', 'employerContact'] },
          ]
        : formData.applicationType === 'Samurdhi'
          ? [{ title: 'Family Information', fields: ['numberOfFamilyMembers', 'governmentAidHistory'] }]
          : []
      )
    ];

    const formatFieldValue = (key, value) => {
      if (key === 'loanAmount' || key === 'monthlyIncome') {
        return `LKR ${parseFloat(value || 0).toLocaleString()}`;
      } else if (key === 'loanDuration') {
        return `${value} ${parseInt(value) === 1 ? 'Month' : 'Months'}`;
      } else if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      } else {
        return value || 'Not provided';
      }
    };

    const formatFieldLabel = (key) => {
      return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    };

    return (
      <div className="preview-container">
        <div className="p-4 mb-4 text-center" style={{ backgroundColor: '#EDE7F6', borderRadius: '16px' }}>
          <h2 style={{ color: '#5D3FD3', fontWeight: 600 }}>Application Summary</h2>
          <p className="mb-0">Please review your information carefully before submission</p>
        </div>

        {sections.map((section, index) => (
          <div key={index} className="card mb-4 shadow-sm" style={{ borderRadius: '16px', border: 'none' }}>
            <div className="card-header py-3" style={{ backgroundColor: '#5D3FD3', borderRadius: '16px 16px 0 0', borderBottom: 'none' }}>
              <h5 className="mb-0" style={{ color: '#FFFFFF', fontWeight: 500 }}>{section.title}</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {section.fields.map((field) => (
                  formData[field] ? (
                    <div key={field} className="col-md-6">
                      <div className="p-3" style={{ backgroundColor: '#F8F9FA', borderRadius: '12px' }}>
                        <div style={{ color: '#666666', fontSize: '0.85rem', marginBottom: '4px' }}>
                          {formatFieldLabel(field)}
                        </div>
                        <div style={{ fontWeight: 500, color: '#333333' }}>
                          {formatFieldValue(field, formData[field])}
                        </div>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container-fluid" style={{ backgroundColor: '#F5F5F5', minHeight: '100vh', fontFamily: "'Poppins', sans-serif", color: '#333333', marginTop:'100px' }}>
      {/* Import Fonts and Icons */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css');

          .form-control:focus {
            border-color: #5D3FD3 !important;
            box-shadow: 0 0 0 0.25rem rgba(93, 63, 211, 0.25) !important;
          }
          
          .btn-primary {
            background-color: #5D3FD3;
            border-color: #5D3FD3;
            color: #FFFFFF;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(93, 63, 211, 0.2);
            padding: 10px 24px;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .btn-primary:hover, .btn-primary:focus {
            background-color: #4B31A8;
            border-color: #4B31A8;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(93, 63, 211, 0.3);
          }
          
          .btn-secondary {
            background-color: #FFFFFF;
            border-color: #E0E0E0;
            color: #5D3FD3;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            padding: 10px 24px;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .btn-secondary:hover, .btn-secondary:focus {
            background-color: #F5F5F5;
            border-color: #5D3FD3;
            color: #4B31A8;
            transform: translateY(-2px);
          }
          
          .btn-warning {
            background-color: #FFB74D;
            border-color: #FFB74D;
            color: #FFFFFF;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(255, 183, 77, 0.2);
            padding: 10px 24px;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .btn-warning:hover, .btn-warning:focus {
            background-color: #FFA726;
            border-color: #FFA726;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(255, 183, 77, 0.3);
          }
          
          .btn-success {
            background-color: #66BB6A;
            border-color: #66BB6A;
            color: #FFFFFF;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(102, 187, 106, 0.2);
            padding: 10px 24px;
            font-weight: 500;
            transition: all 0.3s ease;
          }
          
          .btn-success:hover, .btn-success:focus {
            background-color: #4CAF50;
            border-color: #4CAF50;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(102, 187, 106, 0.3);
          }
          
          .form-range {
            height: 6px;
          }
          
          .form-range::-webkit-slider-thumb {
            background: #5D3FD3;
            box-shadow: 0 0 5px rgba(93, 63, 211, 0.3);
            transition: all 0.2s ease;
            height: 18px;
            width: 18px;
          }
          
          .form-range::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
          
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            opacity: 0;
          }
          
          /* Animated step transition */
          .step-content {
            animation: fadeIn 0.5s ease;
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .active-sidebar-step {
            background-color: #FFFFFF;
            color: #5D3FD3;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            transform: translateX(5px);
          }
          
          .sidebar-step {
            transition: all 0.3s ease;
            border-radius: 12px;
            padding: 12px 15px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            cursor: pointer;
          }
          
          .sidebar-step:hover {
            background-color: rgba(255,255,255,0.1);
          }
          
          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
        `}
      </style>

      <div className="row min-vh-100">
        {/* Sidebar */}
        <div className="col-md-3 p-0" style={{ position: 'fixed', height: '100vh', overflowY: 'auto', background: 'linear-gradient(135deg, #5D3FD3 0%, #6E48E5 100%)' }}>
          <div className="p-4">
            <div className="d-flex align-items-center mb-5">
            </div>
            
            <div className="mb-5">
              <h5 style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 400, fontSize: '0.95rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Application Steps</h5>
              <ul className="list-unstyled mb-0">
                {steps.map((s, index) => (
                  <li 
                    key={s.title} 
                    className={`sidebar-step ${step === index + 1 ? 'active-sidebar-step' : ''}`}
                    onClick={() => {
                      if (index < step) setStep(index + 1);
                    }}
                  >
                    <div 
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        backgroundColor: step > index + 1 ? '#A8E6CF' : step === index + 1 ? '#5D3FD3' : 'rgba(255,255,255,0.2)',
                        color: step > index + 1 ? '#333333' : step === index + 1 ? '#FFFFFF' : '#FFFFFF',
                        border: step === index + 1 ? '2px solid #FFFFFF' : 'none',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {step > index + 1 ? <i className="fas fa-check"></i> : index + 1}
                    </div>
                    <span style={{ color: step === index + 1 ? '#333333' : '#FFFFFF' }}>{s.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-auto">
              <div className="card" style={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body p-4">
                  <h6 style={{ color: '#FFFFFF', fontWeight: 600, marginBottom: '10px' }}>Need Help?</h6>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem', marginBottom: '15px' }}>
                    If you have questions about the application process, our support team is here to help.
                  </p>
                  <div className="d-flex align-items-center">
                    <button className="btn btn-sm" style={{ backgroundColor: '#FFFFFF', color: '#5D3FD3', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                      <i className="fas fa-phone-alt me-2"></i> Contact Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 ms-md-auto p-0">
          <div className="p-5">
            {error && (
              <div className="alert d-flex align-items-center" role="alert" style={{ 
                borderRadius: '12px', 
                backgroundColor: '#FFEBEE', 
                border: 'none',
                padding: '16px',
                marginBottom: '20px',
                boxShadow: '0 4px 10px rgba(239, 83, 80, 0.1)'
              }}>
                <i className="fas fa-exclamation-circle me-3" style={{ color: '#EF5350', fontSize: '1.5rem' }}></i>
                <div style={{ color: '#D32F2F' }}>{error}</div>
                <button type="button" className="btn-close ms-auto" onClick={() => setError('')} style={{ color: '#EF5350' }}></button>
              </div>
            )}
            
            {renderProgressBar()}
            
            {preview ? (
              <>
                {renderPreview()}
                <div className="d-flex gap-3 mt-4 justify-content-end">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setPreview(false)}
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-arrow-left me-2"></i> Edit Information
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i> Submit Application
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                <div className="card shadow-sm" style={{ 
                  backgroundColor: '#FFFFFF', 
                  borderRadius: '20px', 
                  border: 'none',
                  overflow: 'hidden'
                }}>
                  <div className="card-header py-4" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0F0F0' }}>
                    <h3 className="mb-0" style={{ color: '#333333', fontWeight: 600 }}>{steps[step - 1].title}</h3>
                    <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                      {step === 1 && "Select the type of financial assistance you're applying for"}
                      {step === 2 && "Please provide your personal identification details"}
                      {step === 3 && "Enter your financial information"}
                      {formData.applicationType === 'Loan' && step === 4 && "Specify your loan requirements"}
                      {formData.applicationType === 'Loan' && step === 5 && "Tell us about your employment"}
                      {(formData.applicationType === 'Loan' && step === 6) || (formData.applicationType === 'Samurdhi' && step === 4) && "Review required documents and provide email for appointment"}
                      {formData.applicationType === 'Samurdhi' && step === 3 && "Provide information about your family"}
                    </p>
                  </div>
                  <div className="card-body p-4">
                    <div className="step-content">
                      {renderFields(steps[step - 1].fields)}
                    </div>
                  </div>
                </div>
                
                <div className="d-flex justify-content-between mt-4">
                  <div>
                    {step > 1 && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={prevStep}
                      >
                        <i className="fas fa-arrow-left me-2"></i> Previous
                      </button>
                    )}
                  </div>
                  <div className="d-flex gap-3">
                    {step === steps.length && (
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handleSaveDraft}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-save me-2"></i> Save Draft
                      </button>
                    )}
                    
                    {step < steps.length ? (
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting}
                      >
                        Next <i className="fas fa-arrow-right ms-2"></i>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => validateStep() && setPreview(true)}
                        disabled={isSubmitting}
                      >
                        <i className="fas fa-eye me-2"></i> Preview Application
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationForm;