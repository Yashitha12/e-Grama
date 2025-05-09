import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import '@fortawesome/fontawesome-free/css/all.min.css';

function InstituteReview() {
  const [loans, setLoans] = useState([]);
  const [samurdhiApplications, setSamurdhiApplications] = useState([]);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterType, setFilterType] = useState('All');
  const [filterPurpose, setFilterPurpose] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [message, setMessage] = useState(null);
  const [checklist, setChecklist] = useState({
    nic: false,
    incomeProof: false,
    utilityBill: false,
  });
  const [notes, setNotes] = useState('');
  const [showTimeline, setShowTimeline] = useState(false);
  const [editingNotes, setEditingNotes] = useState({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForm, setEmailForm] = useState({
    email: '',
    fullName: '',
    date: '',
    time: '',
    location: 'Galle Divisional Secretariat',
    applicationType: '',
  });

  useEffect(() => {
    fetchLoans();
    fetchSamurdhiApplications();
  }, []);

  const fetchLoans = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/microfinance/loans/RES123');
      if (Array.isArray(res.data)) {
        setLoans(res.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching loans:', error.message, error.response?.data);
      setError('Failed to fetch loan applications. Please try again later.');
    }
  };

  const fetchSamurdhiApplications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/microfinance/samurdhi/RES123');
      if (Array.isArray(res.data)) {
        setSamurdhiApplications(res.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching Samurdhi applications:', error.message, error.response?.data);
      setError('Failed to fetch Samurdhi applications. Please try again later.');
    }
  };

  const handleStatusUpdate = async (id, type, status, timelineUpdate = false) => {
    try {
      setError('');
      const updateData = { status };
      if (timelineUpdate) {
        // Fetch the application data first if no selectedApplication exists
        let statusHistoryData = [];
        if (!selectedApplication) {
          try {
            // Get the current application to access its statusHistory
            const response = await axios.get(`http://localhost:5000/api/microfinance/${type === 'loan' ? 'loans' : 'samurdhi'}/${id}`);
            statusHistoryData = response.data.statusHistory || [];
          } catch (fetchError) {
            console.error('Error fetching application:', fetchError);
            statusHistoryData = [];
          }
        } else {
          statusHistoryData = selectedApplication.statusHistory || [];
        }

        updateData.statusHistory = [
          ...statusHistoryData,
          { status, date: new Date().toISOString().split('T')[0] },
        ];
      }
      
      if (type === 'loan') {
        await axios.put(`http://localhost:5000/api/microfinance/loans/${id}`, updateData);
        setMessage({ text: '📝 Status changed successfully', type: 'success' });
        fetchLoans();
      } else {
        await axios.put(`http://localhost:5000/api/microfinance/samurdhi/${id}`, updateData);
        setMessage({ text: '📝 Status changed successfully', type: 'success' });
        fetchSamurdhiApplications();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      setMessage({ text: '❌ Error occurred', type: 'error' });
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('⚠️ Are you sure you want to delete this application?')) {
      try {
        setError('');
        if (type === 'loan') {
          await axios.delete(`http://localhost:5000/api/microfinance/loans/${id}`);
          setMessage({ text: '❌ Application deleted', type: 'error' });
          fetchLoans();
        } else {
          await axios.delete(`http://localhost:5000/api/microfinance/samurdhi/${id}`);
          setMessage({ text: '❌ Application deleted', type: 'error' });
          fetchSamurdhiApplications();
        }
        setSelectedApplication(null);
      } catch (error) {
        console.error('Error deleting application:', error);
        setMessage({ text: '❌ Error occurred', type: 'error' });
      }
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setChecklist({
      nic: application.nicSubmitted || false,
      incomeProof: application.incomeProofSubmitted || false,
      utilityBill: application.utilityBillSubmitted || false,
    });
    setNotes(application.notes || '');
  };

  const closeDetails = () => {
    setSelectedApplication(null);
    setShowTimeline(false);
  };

  const handleChecklistChange = (e) => {
    setChecklist({ ...checklist, [e.target.name]: e.target.checked });
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleTableNotesLooseFocus = async (id, type, newNotes) => {
    try {
      setError('');
      const updateData = { notes: newNotes };
      if (type === 'loan') {
        await axios.put(`http://localhost:5000/api/microfinance/loans/${id}`, updateData);
        setMessage({ text: '📝 Notes updated successfully', type: 'success' });
        fetchLoans();
      } else {
        await axios.put(`http://localhost:5000/api/microfinance/samurdhi/${id}`, updateData);
        setMessage({ text: '📝 Notes updated successfully', type: 'success' });
        fetchSamurdhiApplications();
      }
      setEditingNotes({ ...editingNotes, [id]: newNotes });
    } catch (error) {
      console.error('Error updating notes:', error);
      setMessage({ text: '❌ Error updating notes', type: 'error' });
    }
  };

  const handleSendAppointmentEmail = async () => {
    try {
      setError('');
      await axios.post('http://localhost:5000/api/microfinance/send-appointment-email', emailForm);
      setMessage({ text: '📧 Appointment email sent successfully', type: 'success' });
      setShowEmailModal(false);
      setEmailForm({
        email: '',
        fullName: '',
        date: '',
        time: '',
        location: 'Galle Divisional Secretariat',
        applicationType: '',
      });
    } catch (error) {
      console.error('Error sending appointment email:', error);
      setMessage({ text: '❌ Error sending appointment email', type: 'error' });
    }
  };

  const openEmailModal = (application) => {
    setEmailForm({
      email: application.email || '',
      fullName: application.fullName || '',
      date: '',
      time: '',
      location: 'Galle Divisional Secretariat',
      applicationType: application.applicationType,
    });
    setShowEmailModal(true);
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    setEmailForm({
      email: '',
      fullName: '',
      date: '',
      time: '',
      location: 'Galle Divisional Secretariat',
      applicationType: '',
    });
  };

  const handleEmailFormChange = (e) => {
    const { name, value } = e.target;
    setEmailForm({ ...emailForm, [name]: value });
  };

  const generateReport = () => {
    const doc = new jsPDF();
    let yPos = 20;

    doc.setFont('helvetica');
    doc.setFontSize(24);
    doc.setTextColor(93, 63, 211);
    doc.text('Institute Review Report', 105, yPos, { align: 'center' });
    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.text('Generated on: ' + new Date().toLocaleString(), 105, yPos, { align: 'center' });
    yPos += 30;

    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Loan Applications', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${loans.length}`, 20, yPos);
    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 5;

    loans.forEach((loan, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
        doc.text('Loan Applications (Continued)', 20, yPos);
        yPos += 10;
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
      }
      doc.setFontSize(12);
      doc.text(`Loan #${index + 1}`, 20, yPos);
      yPos += 5;
      doc.text(`ID: ${loan._id}`, 30, yPos);
      yPos += 5;
      doc.text(`Name: ${loan.fullName || 'N/A'}`, 30, yPos);
      yPos += 5;
      doc.text(`Amount: ${loan.loanAmount || 'N/A'}`, 30, yPos);
      yPos += 5;
      doc.text(`Purpose: ${loan.loanPurpose || 'N/A'}`, 30, yPos);
      yPos += 5;
      doc.text(`Status: ${loan.status || 'Pending'}`, 30, yPos);
      yPos += 5;
      doc.text(`Email: ${loan.email || 'N/A'}`, 30, yPos);
      yPos += 5;
      doc.text(`Notes: ${loan.notes || 'N/A'}`, 30, yPos);
      yPos += 10;
    });

    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Samurdhi Applications', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${samurdhiApplications.length}`, 20, yPos);
    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 5;

    samurdhiApplications.forEach((app, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
        doc.setFontSize(16);
        doc.text('Samurdhi Applications (Continued)', 20, yPos);
        yPos += 10;
        doc.line(20, yPos, 190, yPos);
        yPos += 10;
      }
      doc.setFontSize(12);
      doc.text(`Application #${index + 1}`, 20, yPos);
      yPos += 5;
      doc.text(`ID: ${app._id}`, 30, yPos);
      yPos += 5;
      doc.text(`Name: ${app.fullName || 'N/A'}`, 30, yPos);
      yPos += 5;
      doc.text(`Income: ${app.monthlyIncome || 'N/A'}`, 30, yPos);
      yPos += 5;
      doc.text(`Status: ${app.status || 'Pending'}`, 30, yPos);
      yPos += 5;
      doc.text(`Email: ${app.email || 'N/A'}`, 30, yPos);
      yPos += 5;
      doc.text(`Notes: ${app.notes || 'N/A'}`, 30, yPos);
      yPos += 10;
    });

    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', 20, yPos);
    yPos += 10;
    doc.line(20, yPos, 190, yPos);
    yPos += 5;

    doc.setFontSize(12);
    doc.text('Loans:', 20, yPos);
    yPos += 5;
    doc.text(`Pending: ${loans.filter(l => l.status === 'Pending').length}`, 30, yPos);
    yPos += 5;
    doc.text(`Approved: ${loans.filter(l => l.status === 'Approved').length}`, 30, yPos);
    yPos += 5;
    doc.text(`Rejected: ${loans.filter(l => l.status === 'Rejected').length}`, 30, yPos);
    yPos += 5;
    yPos += 10;

    doc.text('Samurdhi:', 20, yPos);
    yPos += 5;
    doc.text(`Pending: ${samurdhiApplications.filter(a => a.status === 'Pending').length}`, 30, yPos);
    yPos += 5;
    doc.text(`Approved: ${samurdhiApplications.filter(a => a.status === 'Approved').length}`, 30, yPos);
    yPos += 5;
    doc.text(`Rejected: ${samurdhiApplications.filter(a => a.status === 'Rejected').length}`, 30, yPos);

    doc.save(`institute_review_report_${Date.now()}.pdf`);
  };

  const filteredLoans = loans.filter(loan => {
    const matchesType = filterType === 'All' || loan.applicationType === filterType;
    const matchesPurpose = filterPurpose === 'All' || loan.loanPurpose === filterPurpose;
    const matchesStatus = filterStatus === 'All' || loan.status === filterStatus;
    const matchesName = searchName === '' || loan.fullName?.toLowerCase().includes(searchName.toLowerCase());
    return matchesType && matchesPurpose && matchesStatus && matchesName;
  });

  const filteredSamurdhi = samurdhiApplications.filter(app => {
    const matchesType = filterType === 'All' || app.applicationType === filterType;
    const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
    const matchesName = searchName === '' || app.fullName?.toLowerCase().includes(searchName.toLowerCase());
    return matchesType && matchesStatus && matchesName;
  });

  const sortedAndFilteredData = [...filteredLoans, ...filteredSamurdhi].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    if (sortOrder === 'asc') {
      return aValue.toString().localeCompare(bValue.toString());
    }
    return bValue.toString().localeCompare(aValue.toString());
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setFilterType('All');
    setFilterPurpose('All');
    setFilterStatus('All');
    setSearchName('');
  };

  const getStatusBadge = (status, statusHistory) => {
    let badgeClass = '';
    if (status === 'Pending') {
      badgeClass = 'status-pending';
    } else if (status === 'Approved') {
      badgeClass = 'status-approved';
    } else if (status === 'Rejected') {
      badgeClass = 'status-rejected';
    }

    return (
      <div className="position-relative">
        <span
          className={`status-badge ${badgeClass}`}
          onClick={() => setShowTimeline(!showTimeline)}
        >
          {status}
        </span>
        {showTimeline && statusHistory && (
          <div className="card shadow-sm position-absolute" style={{ zIndex: 1000, width: '200px', top: '30px', left: '0' }}>
            <div className="card-body p-2">
              <h6 className="card-title mb-2">Status Timeline</h6>
              <ul className="list-unstyled mb-0">
                {statusHistory.map((entry, index) => (
                  <li key={index} className="mb-1">{entry.status} → {entry.date}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleStatusChange = (event, id, type) => {
    const newStatus = event.target.value;
    handleStatusUpdate(id, type, newStatus, true);
  };

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;

    const isLoan = selectedApplication.applicationType === 'Loan';
    const app = selectedApplication;

    return (
      <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content card">
            <div className="modal-header card-header-custom">
              <h5 className="modal-title">{isLoan ? 'Loan Application Details' : 'Samurdhi Application Details'}</h5>
              <button type="button" className="btn-close btn-close-white" onClick={closeDetails} aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              <div className="row g-3">
                {Object.entries(app).map(([key, value]) => (
                  key !== '_id' && key !== '__v' && !['proofOfIncome', 'bankStatement', 'lowIncomeProof', 'idCopy', 'employmentLetter', 'businessPlan', 'consentToTerms', 'fundUsageMonitoring', 'detailsConfirmation', 'consentToShare', 'nicSubmitted', 'incomeProofSubmitted', 'utilityBillSubmitted', 'notes', 'statusHistory'].includes(key.toLowerCase()) && (
                    <div key={key} className="col-md-6">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title text-uppercase" style={{ color: '#5D3FD3', fontWeight: '500', fontSize: '14px' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</h6>
                          <p className="card-text" title={value || 'N/A'} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                <div className="col-12 mt-4">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase" style={{ color: '#5D3FD3', fontWeight: '500', fontSize: '14px' }}>Contact Email</h6>
                      <p className="card-text fw-bold" title={app.email || 'N/A'}>{app.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="col-12 mt-4">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase" style={{ color: '#5D3FD3', fontWeight: '500', fontSize: '14px' }}>Document Checklist</h6>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="nic"
                          checked={checklist.nic}
                          onChange={handleChecklistChange}
                          id="nic"
                        />
                        <label className="form-check-label" htmlFor="nic">
                          {checklist.nic ? '✅ NIC Submitted' : '❌ NIC Not Submitted'}
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="incomeProof"
                          checked={checklist.incomeProof}
                          onChange={handleChecklistChange}
                          id="incomeProof"
                        />
                        <label className="form-check-label" htmlFor="incomeProof">
                          {checklist.incomeProof ? '✅ Income Proof Submitted' : '❌ Income Proof Not Submitted'}
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="utilityBill"
                          checked={checklist.utilityBill}
                          onChange={handleChecklistChange}
                          id="utilityBill"
                        />
                        <label className="form-check-label" htmlFor="utilityBill">
                          {checklist.utilityBill ? '✅ Utility Bill Submitted' : '❌ Utility Bill Not Submitted'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 mt-4">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase" style={{ color: '#5D3FD3', fontWeight: '500', fontSize: '14px' }}>Internal Notes</h6>
                      <textarea
                        className="form-control"
                        value={notes}
                        onChange={handleNotesChange}
                        rows="4"
                        placeholder="Add internal notes here..."
                        style={{ borderColor: '#A8E6CF' }}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-custom" onClick={closeDetails}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEmailModal = () => {
    if (!showEmailModal) return null;

    return (
      <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content card">
            <div className="modal-header card-header-custom">
              <h5 className="modal-title">Send Appointment Email</h5>
              <button type="button" className="btn-close btn-close-white" onClick={closeEmailModal} aria-label="Close"></button>
            </div>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label" style={{ color: '#5D3FD3', fontWeight: '500', fontSize: '14px' }}>Email</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={emailForm.email}
                  readOnly
                  style={{ borderColor: '#A8E6CF' }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: '#5D3FD3', fontWeight: '500', fontSize: '14px' }}>Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="date"
                  value={emailForm.date}
                  onChange={handleEmailFormChange}
                  required
                  style={{ borderColor: '#A8E6CF' }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: '#5D3FD3', fontWeight: '500', fontSize: '14px' }}>Time</label>
                <input
                  type="time"
                  className="form-control"
                  name="time"
                  value={emailForm.time}
                  onChange={handleEmailFormChange}
                  required
                  style={{ borderColor: '#A8E6CF' }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ color: '#5D3FD3', fontWeight: '500', fontSize: '14px' }}>Location</label>
                <input
                  type="text"
                  className="form-control"
                  name="location"
                  value={emailForm.location}
                  onChange={handleEmailFormChange}
                  required
                  style={{ borderColor: '#A8E6CF' }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-custom" onClick={closeEmailModal}>Cancel</button>
              <button type="button" className="btn btn-custom" onClick={handleSendAppointmentEmail}>
                <i className="fas fa-envelope me-2"></i> Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          .card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            animation: fadeInUp 0.6s ease-out;
          }
          
          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          }
          
          .card-header-custom {
            background-color: #5D3FD3;
            color: white;
            padding: 20px;
            border-radius: 16px 16px 0 0;
          }
          
          .btn-custom {
            background-color: #5D3FD3;
            color: white;
            border: none;
            border-radius: 10px;
            padding: 12px 24px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .btn-custom:hover {
            background-color: #4B0082;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(93, 63, 211, 0.3);
          }
          
          .btn-outline-custom {
            background-color: transparent;
            color: #5D3FD3;
            border: 2px solid #5D3FD3;
            border-radius: 10px;
            padding: 10px 22px;
            font-weight: 600;
            transition: all 0.3s ease;
          }
          
          .btn-outline-custom:hover {
            background-color: #5D3FD3;
            color: white;
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(93, 63, 211, 0.2);
          }
          
          .feature-table th {
            background-color: #5D3FD3;
            color: #FFFFFF;
            font-weight: 600;
            padding: 16px;
            border: none;
          }
          
          .feature-table td {
            padding: 16px;
            font-size: 15px;
            border-bottom: 1px solid #f0f0f0;
            vertical-align: middle;
          }
          
          .feature-table tr:last-child td {
            border-bottom: none;
          }
          
          .feature-table tr:hover td {
            background-color: #f9f9ff;
          }
          
          .status-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          }
          
          .status-pending {
            background-color: #FFE8A3;
            color: #B78105;
          }
          
          .status-approved {
            background-color: #A8E6CF;
            color: #2C7A51;
          }
          
          .status-rejected {
            background-color: #FFD1D1;
            color: #D32F2F;
          }
          
          .stat-card {
            border-radius: 16px;
            padding: 24px;
            height: 100%;
            border-left: 4px solid #5D3FD3;
            background-color: white;
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(93, 63, 211, 0.15);
          }
          
          .stat-number {
            font-size: 32px;
            font-weight: 700;
            color: #5D3FD3;
          }
          
          .stat-label {
            font-size: 16px;
            color: #666;
            margin-top: 5px;
          }
          
          .stat-icon {
            font-size: 40px;
            opacity: 0.15;
            position: absolute;
            right: 24px;
            top: 50%;
            transform: translateY(-50%);
            color: #5D3FD3;
          }
          
          .pagination .page-link {
            color: #5D3FD3;
            border-radius: 8px;
            margin: 0 5px;
            transition: all 0.3s ease;
          }
          
          .pagination .page-item.active .page-link {
            background-color: #5D3FD3;
            border-color: #5D3FD3;
            color: #FFFFFF;
          }
          
          .pagination .page-link:hover {
            background-color: #A8E6CF;
            color: #333333;
            transform: translateY(-2px);
          }
          
          .form-control, .form-select {
            border-radius: 10px;
            border-color: #A8E6CF;
            transition: all 0.3s ease;
          }
          
          .form-control:focus, .form-select:focus {
            border-color: #5D3FD3;
            box-shadow: 0 0 0 0.2rem rgba(93, 63, 211, 0.25);
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (max-width: 768px) {
            .feature-table thead {
              display: none;
            }
            
            .feature-table tbody tr {
              display: block;
              margin-bottom: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .feature-table td {
              display: block;
              text-align: left;
              padding: 12px 15px;
              font-size: 14px;
            }
            
            .feature-table td:before {
              content: attr(data-label);
              font-weight: 600;
              color: #5D3FD3;
              display: block;
              margin-bottom: 5px;
            }
          }
        `}
      </style>

      {message && (
        <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} text-center alert-dismissible fade show card`} role="alert">
          {message.text}
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header-custom d-flex justify-content-between align-items-center">
          <div>
            <h2 className="m-0">Institute Review Dashboard</h2>
            <small style={{ color: '#A8E6CF' }}>Home / Dashboard / Institute Review</small>
          </div>
          <div className="d-flex align-items-center">
            <div className="notification-bell me-3">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </div>
            <div className="user-avatar">I</div>
            <small>{new Date().toLocaleString()}</small>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 col-sm-6 mb-4">
          <div className="card stat-card position-relative">
            <div className="stat-number">{loans.length + samurdhiApplications.length}</div>
            <div className="stat-label">Total Applications</div>
            <i className="fas fa-file-alt stat-icon"></i>
          </div>
        </div>
        <div className="col-md-4 col-sm-6 mb-4">
          <div className="card stat-card position-relative">
            <div className="stat-number">{loans.filter(l => l.status === 'Approved').length + samurdhiApplications.filter(s => s.status === 'Approved').length}</div>
            <div className="stat-label">Approved</div>
            <i className="fas fa-check-circle stat-icon"></i>
          </div>
        </div>
        <div className="col-md-4 col-sm-6 mb-4">
          <div className="card stat-card position-relative">
            <div className="stat-number">{loans.filter(l => l.status === 'Pending').length + samurdhiApplications.filter(s => s.status === 'Pending').length}</div>
            <div className="stat-label">Pending</div>
            <i className="fas fa-hourglass-half stat-icon"></i>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header-custom">
          <h5 className="mb-0">Filter Applications</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="d-flex flex-wrap">
              <div className="me-3 mb-2">
                <select
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All"><i className="fas fa-file me-2"></i> All Types</option>
                  <option value="Loan"><i className="fas fa-file me-2"></i> Loan</option>
                  <option value="Samurdhi"><i className="fas fa-file me-2"></i> Samurdhi</option>
                </select>
              </div>
              <div className="me-3 mb-2">
                <select
                  className="form-select"
                  value={filterPurpose}
                  onChange={(e) => setFilterPurpose(e.target.value)}
                >
                  <option value="All"><i className="fas fa-bullseye me-2"></i> All Purposes</option>
                  {[...new Set(loans.map(loan => loan.loanPurpose))].map(purpose => (
                    <option key={purpose} value={purpose}>{purpose || 'N/A'}</option>
                  ))}
                </select>
              </div>
              <div className="me-3 mb-2">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All"><i className="fas fa-search me-2"></i> All Statuses</option>
                  <option value="Pending"><i className="fas fa-search me-2"></i> Pending</option>
                  <option value="Approved"><i className="fas fa-search me-2"></i> Approved</option>
                  <option value="Rejected"><i className="fas fa-search me-2"></i> Rejected</option>
                </select>
              </div>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="🔎 Search by Name"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>
            <button className="btn btn-outline-custom" onClick={resetFilters}>
              <i className="fas fa-sync-alt me-2"></i> Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="text-end mb-4">
        <button className="btn btn-custom" onClick={generateReport}>
          <i className="fas fa-file-pdf me-2"></i> Generate Report
        </button>
      </div>

      <div className="card feature-table">
        <div className="card-header-custom">
          <h5 className="mb-0">Application Review</h5>
        </div>
        <div className="card-body p-0">
          {currentItems.length === 0 ? (
            <p className="text-center p-4">No applications found. Try adjusting filters.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th data-label="Type" onClick={() => handleSort('applicationType')}>
                      💼 Type {sortField === 'applicationType' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th data-label="Full Name" onClick={() => handleSort('fullName')}>
                      👤 Full Name {sortField === 'fullName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th data-label="Details" onClick={() => handleSort('loanAmount')}>
                      📋 Details {sortField === 'loanAmount' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th data-label="Status" onClick={() => handleSort('status')}>
                      🔔 Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th data-label="Notes" onClick={() => handleSort('notes')}>
                      📝 Notes {sortField === 'notes' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th data-label="Actions">⚙️ Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={item._id} style={{ backgroundColor: item.loanAmount && item.loanAmount > 1000000 ? '#FFE6E6' : 'transparent' }}>
                      <td data-label="Type">{item.applicationType}</td>
                      <td data-label="Full Name" title={item.fullName || 'N/A'}>{item.fullName || 'N/A'}</td>
                      <td data-label="Details" title={item.loanAmount || item.monthlyIncome ? `Amount: ${item.loanAmount || 'N/A'}, Purpose: ${item.loanPurpose || 'N/A'}` : `Income: ${item.monthlyIncome || 'N/A'}`}>
                        {item.loanAmount ? `Amount: ${item.loanAmount}, Purpose: ${item.loanPurpose || 'N/A'}` : `Income: ${item.monthlyIncome || 'N/A'}`}
                      </td>
                      <td data-label="Status">
                        <div className="d-flex align-items-center">
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(e, item._id, item.applicationType === 'Loan' ? 'loan' : 'samurdhi')}
                            className="form-select me-2"
                            style={{ width: '120px' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          {getStatusBadge(item.status, item.statusHistory || [
                            { status: 'Submitted', date: '2025-04-14' },
                            { status: 'Reviewed', date: '2025-04-16' },
                            { status: 'Approved', date: '2025-04-17' },
                          ])}
                        </div>
                      </td>
                      <td data-label="Notes">
                        <input
                          type="text"
                          className="form-control"
                          value={editingNotes[item._id] !== undefined ? editingNotes[item._id] : item.notes || ''}
                          onChange={(e) => setEditingNotes({ ...editingNotes, [item._id]: e.target.value })}
                          onBlur={() => handleTableNotesLooseFocus(item._id, item.applicationType === 'Loan' ? 'loan' : 'samurdhi', editingNotes[item._id] || item.notes || '')}
                          placeholder="Add notes..."
                          style={{ width: '150px' }}
                        />
                      </td>
                      <td data-label="Actions">
                        <button
                          className="btn btn-outline-custom btn-sm me-2"
                          onClick={() => handleViewDetails(item)}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </button>
                        <button
                          className="btn btn-outline-custom btn-sm me-2"
                          onClick={() => openEmailModal(item)}
                        >
                          <i className="fas fa-envelope me-1"></i> Email
                        </button>
                        <button
                          className="btn btn-outline-custom btn-sm"
                          onClick={() => handleDelete(item._id, item.applicationType === 'Loan' ? 'loan' : 'samurdhi')}
                        >
                          <i className="fas fa-trash me-1"></i> Delete
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

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>←</button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setCurrentPage(page)}>{page}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>→</button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {renderApplicationDetails()}
      {renderEmailModal()}
    </div>
  );
}

export default InstituteReview;