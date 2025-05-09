import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyApplications() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [samurdhiApplications, setSamurdhiApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const loanRes = await axios.get('http://localhost:5000/api/microfinance/loans/RES123');
      const samurdhiRes = await axios.get('http://localhost:5000/api/microfinance/samurdhi/RES123');
      if (Array.isArray(loanRes.data) && Array.isArray(samurdhiRes.data)) {
        setLoans(loanRes.data);
        setSamurdhiApplications(samurdhiRes.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching applications:', error.message, error.response?.data);
      setError('Failed to fetch applications. Please try again later.');
    }
  };

  const handleView = (application, type) => {
    setSelectedApplication({ ...application, type });
    setIsEditing(false);
  };

  const handleEdit = (application, type) => {
    setSelectedApplication({ ...application, type });
    setFormData({
      fullName: application.fullName || '',
      nationalIdNumber: application.nationalIdNumber || '',
      permanentAddress: application.permanentAddress || '',
      contactNumber: application.contactNumber || '',
      monthlyIncome: application.monthlyIncome || '',
      ...(type === 'loan' && {
        loanAmount: application.loanAmount || '',
        loanPurpose: application.loanPurpose || '',
        loanDuration: application.loanDuration || '',
        currentOccupation: application.currentOccupation || '',
        employerName: application.employerName || '',
        employerContact: application.employerContact || '',
      }),
      ...(type === 'samurdhi' && {
        numberOfFamilyMembers: application.numberOfFamilyMembers || 0,
        governmentAidHistory: application.governmentAidHistory || '',
      }),
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleUpdate = async () => {
    try {
      setError('');
      const requiredFields = selectedApplication.type === 'loan'
        ? [
            'fullName',
            'nationalIdNumber',
            'permanentAddress',
            'contactNumber',
            'monthlyIncome',
            'loanAmount',
            'loanPurpose',
            'loanDuration',
            'currentOccupation',
            'employerName',
            'employerContact',
          ]
        : [
            'fullName',
            'nationalIdNumber',
            'permanentAddress',
            'contactNumber',
            'monthlyIncome',
            'numberOfFamilyMembers',
          ];
      for (const field of requiredFields) {
        if (!formData[field] || formData[field] === '') {
          setError(`${field.replace(/([A-Z])/g, ' $1').trim()} is required.`);
          return;
        }
      }

      const dataToSend = { ...formData };

      const url = selectedApplication.type === 'loan'
        ? `http://localhost:5000/api/microfinance/loans/${selectedApplication._id}`
        : `http://localhost:5000/api/microfinance/samurdhi/${selectedApplication._id}`;
      await axios.put(url, dataToSend);
      fetchApplications();
      setIsEditing(false);
      setSelectedApplication(null);
      setFormData(null);
    } catch (error) {
      console.error('Error updating application:', error.response?.data, error.message);
      setError(error.response?.data?.error || 'Failed to update application. Please try again.');
    }
  };

  const handleDelete = async (id, type) => {
    try {
      setError('');
      const url = type === 'loan'
        ? `http://localhost:5000/api/microfinance/loans/${id}`
        : `http://localhost:5000/api/microfinance/samurdhi/${id}`;
      await axios.delete(url);
      fetchApplications();
      setSelectedApplication(null);
      setIsEditing(false);
      setFormData(null);
    } catch (error) {
      console.error('Error deleting application:', error.response?.data, error.message);
      setError(error.response?.data?.error || 'Failed to delete application. Please try again.');
    }
  };

  const renderField = (field) => {
    if (!formData) return null;

    const error = formData[field] === '' || formData[field] === null
      ? 'This field is required'
      : '';
    const commonProps = {
      name: field,
      value: formData[field] || '',
      onChange: handleChange,
      required: true,
      className: `form-control ${error ? 'is-invalid' : ''}`,
    };

    switch (field) {
      case 'fullName':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Full Name</label>
            <input type="text" {...commonProps} style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'nationalIdNumber':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>National ID Number</label>
            <input type="text" {...commonProps} maxLength="12" style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'permanentAddress':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Address</label>
            <textarea {...commonProps} rows="3" style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'contactNumber':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Contact Number</label>
            <input type="tel" {...commonProps} maxLength="12" placeholder="+947xxxxxxxx or 07xxxxxxxx" style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'monthlyIncome':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Monthly Income</label>
            <input type="number" {...commonProps} min="0" step="0.01" style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'loanAmount':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Loan Amount</label>
            <input type="number" {...commonProps} min="1000" max="1000000" style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'loanPurpose':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Loan Purpose</label>
            <select {...commonProps} style={{ fontFamily: 'Poppins, sans-serif' }}>
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
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Repayment Duration (Months)</label>
            <input type="text" {...commonProps} placeholder="Enter months (1-240)" style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'currentOccupation':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Job Type</label>
            <input type="text" {...commonProps} style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'employerName':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Employer</label>
            <input type="text" {...commonProps} style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'employerContact':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Employer Contact</label>
            <input type="tel" {...commonProps} maxLength="12" placeholder="+947xxxxxxxx or 07xxxxxxxx" style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'numberOfFamilyMembers':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Number of Dependents</label>
            <input type="number" {...commonProps} min="0" style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      case 'governmentAidHistory':
        return (
          <div className="mb-3">
            <label className="form-label fw-semibold" style={{ color: '#333333' }}>Previous Samurdhi Benefits</label>
            <input type="text" {...commonProps} required={false} style={{ fontFamily: 'Poppins, sans-serif' }} />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  const renderFormFields = () => {
    if (!formData) return null;

    const fields = selectedApplication.type === 'loan'
      ? [
          'fullName',
          'nationalIdNumber',
          'permanentAddress',
          'contactNumber',
          'monthlyIncome',
          'loanAmount',
          'loanPurpose',
          'loanDuration',
          'currentOccupation',
          'employerName',
          'employerContact',
        ]
      : [
          'fullName',
          'nationalIdNumber',
          'permanentAddress',
          'contactNumber',
          'monthlyIncome',
          'numberOfFamilyMembers',
          'governmentAidHistory',
        ];

    return fields.map((field) => <div key={field}>{renderField(field)}</div>);
  };

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;

    const { type, ...app } = selectedApplication;

    return (
      <div className="card shadow-lg p-4 mx-4" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
        <h3 className="card-title mb-4" style={{ color: '#5D3FD3', fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}>
          {type === 'loan' ? 'Loan Application' : 'Samurdhi Application'}
        </h3>
        <div className="row">
          {Object.entries(app).map(([key, value]) => (
            key !== '_id' && key !== '__v' && (
              <div key={key} className="col-md-6 mb-3">
                <p style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>
                  <strong>{key.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}:</strong>{' '}
                  {typeof value === 'object' && value !== null
                    ? JSON.stringify(value, null, 2)
                    : value || 'N/A'}
                </p>
              </div>
            )
          ))}
        </div>
        <div className="d-flex gap-3">
          <button
            className="btn shadow-sm"
            style={{ backgroundColor: '#5D3FD3', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
            onClick={() => handleEdit(selectedApplication, type)}
          >
            Edit
          </button>
          <button
            className="btn shadow-sm"
            style={{ backgroundColor: '#DC3545', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
            onClick={() => handleDelete(app._id, type)}
          >
            Delete
          </button>
          <button
            className="btn shadow-sm"
            style={{ backgroundColor: '#6C757D', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
            onClick={() => setSelectedApplication(null)}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-5" style={{ backgroundColor: '#F5F5F5', fontFamily: 'Poppins, sans-serif', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-10 col-md-11 col-sm-12">
          <h1 className="text-center mb-5 fw-bold" style={{ color: '#5D3FD3'}}>My Applications</h1>
          
          {error && (
            <div className="alert alert-danger text-center shadow-sm mb-4" style={{ borderRadius: '8px', fontFamily: 'Poppins, sans-serif'}}>
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <button
              className="btn shadow-sm"
              style={{ backgroundColor: '#A8E6CF', color: '#333333', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
              onClick={() => navigate('/')}
            >
              Back to Dashboard
            </button>
          </div>
          
          {isEditing && formData ? (
            <div className="card shadow-lg p-4 mb-4" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px'}}>
              <h3 className="card-title mb-4" style={{ color: '#5D3FD3', fontWeight: 600 }}>
                Edit {selectedApplication.type === 'loan' ? 'Loan' : 'Samurdhi'} Application
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
                {renderFormFields()}
                <div className="d-flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="btn shadow-sm"
                    style={{ backgroundColor: '#A8E6CF', color: '#333333', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
                  >
                    Update Application
                  </button>
                  <button
                    type="button"
                    className="btn shadow-sm"
                    style={{ backgroundColor: '#6C757D', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
                    onClick={() => {
                      setIsEditing(false);
                      setFormData(null);
                      setSelectedApplication(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : selectedApplication ? (
            renderApplicationDetails()
          ) : (
            <div className="card shadow-lg mb-4" style={{ backgroundColor: '#FFFFFF', borderRadius: '12px' }}>
              <div className="card-body">
                <h4 className="card-title mb-4" style={{ color: '#5D3FD3', fontWeight: 600 }}>Loan Applications</h4>
                {loans.length === 0 ? (
                  <p style={{ color: '#333333', fontFamily: 'Poppins, sans-serif' }}>No loan applications found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: '#5D3FD3', color: '#FFFFFF' }}>
                        <tr>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Full Name</th>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Amount</th>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Purpose</th>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Status</th>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loans.map((loan) => (
                          <tr key={loan._id}>
                            <td style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>{loan.fullName || 'N/A'}</td>
                            <td style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>{loan.loanAmount || 'N/A'}</td>
                            <td style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>{loan.loanPurpose || 'N/A'}</td>
                            <td style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>{loan.status || 'Pending'}</td>
                            <td>
                              <button
                                className="btn btn-sm shadow-sm me-2"
                                style={{ backgroundColor: '#A8E6CF', color: '#333333', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
                                onClick={() => handleView(loan, 'loan')}
                              >
                                View
                              </button>
                              <button
                                className="btn btn-sm shadow-sm"
                                style={{ backgroundColor: '#5D3FD3', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
                                onClick={() => handleEdit(loan, 'loan')}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <h4 className="card-title mt-5 mb-4" style={{ color: '#5D3FD3', fontWeight: 600 }}>Samurdhi Applications</h4>
                {samurdhiApplications.length === 0 ? (
                  <p style={{ color: '#333333', fontFamily: 'Poppins, sans-serif' }}>No Samurdhi applications found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: '#5D3FD3', color: '#FFFFFF' }}>
                        <tr>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Full Name</th>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Income</th>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Family Members</th>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Status</th>
                          <th style={{ fontFamily: 'Poppins, sans-serif' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {samurdhiApplications.map((app) => (
                          <tr key={app._id}>
                            <td style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>{app.fullName || 'N/A'}</td>
                            <td style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>{app.monthlyIncome || 'N/A'}</td>
                            <td style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>{app.numberOfFamilyMembers || '0'}</td>
                            <td style={{ fontFamily: 'Poppins, sans-serif', color: '#333333' }}>{app.status || 'Pending'}</td>
                            <td>
                              <button
                                className="btn btn-sm shadow-sm me-2"
                                style={{ backgroundColor: '#A8E6CF', color: '#333333', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
                                onClick={() => handleView(app, 'samurdhi')}
                              >
                                View
                              </button>
                              <button
                                className="btn btn-sm shadow-sm"
                                style={{ backgroundColor: '#5D3FD3', color: '#FFFFFF', fontFamily: 'Poppins, sans-serif', borderRadius: '8px' }}
                                onClick={() => handleEdit(app, 'samurdhi')}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyApplications;