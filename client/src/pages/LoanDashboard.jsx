import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const user = { 
    name: 'User', 
    role: 'Applicant',
    avatarColor: 'bg-purple-500' // Added for dynamic avatar coloring
  };

  // Stats data
  const stats = [
    { 
      title: 'Active Applications', 
      value: 2, 
      change: '12% increase', 
      icon: 'fas fa-file-alt',
      trend: 'up',
      color: 'text-green-500'
    },
    { 
      title: 'Approved', 
      value: 1, 
      change: 'Successfully approved', 
      icon: 'fas fa-check-circle',
      trend: 'check',
      color: 'text-blue-500'
    },
    { 
      title: 'Total Amount', 
      value: '$3,000', 
      change: 'Total approved funds', 
      icon: 'fas fa-dollar-sign',
      trend: 'coins',
      color: 'text-cyan-500'
    },
    { 
      title: 'Applications', 
      value: 3, 
      change: 'Total submissions', 
      icon: 'fas fa-clipboard-list',
      trend: 'file',
      color: 'text-indigo-500'
    }
  ];

  // Financial metrics
  const financialMetrics = [
    {
      title: 'Credit Standing',
      value: 75,
      status: 'Good',
      color: 'bg-success',
      badgeColor: 'bg-success-soft text-success',
      labels: ['0', 'Score: 740', '850']
    },
    {
      title: 'Repayment Capacity',
      value: 60,
      status: 'Moderate',
      color: 'bg-info',
      badgeColor: 'bg-info-soft text-info',
      labels: ['Low', '60%', 'High']
    },
    {
      title: 'Debt-to-Income Ratio',
      value: 45,
      status: 'Caution',
      color: 'bg-warning',
      badgeColor: 'bg-warning-soft text-warning',
      labels: ['0%', '45%', '100%']
    },
    {
      title: 'Savings Rate',
      value: 85,
      status: 'Excellent',
      color: 'bg-primary',
      badgeColor: 'bg-primary-soft text-primary',
      labels: ['0%', '85%', '100%']
    }
  ];

  // Application journey steps
  const journeySteps = [
    { number: 1, title: 'Submit', description: 'Complete online application', status: 'active' },
    { number: 2, title: 'Review', description: 'Document verification', status: 'active' },
    { number: 3, title: 'Verify', description: 'Interview & field checks', status: 'current' },
    { number: 4, title: 'Approve', description: 'Final decision & funds', status: '' }
  ];

  // Quick actions
  const quickActions = [
    { icon: 'fas fa-file-signature', title: 'New Loan', subtitle: 'Apply now', link: '/apply' },
    { icon: 'fas fa-hands-helping', title: 'Samurdhi', subtitle: 'Get support', link: '/apply' },
    { icon: 'fas fa-file-alt', title: 'My Files', subtitle: 'Track progress', link: '/my-applications' },
    { icon: 'fas fa-building', title: 'Institute', subtitle: 'Review apps', link: '/institute-review' }
  ];

  // Documents
  const documents = [
    { icon: 'far fa-id-card', title: 'NIC Copy', subtitle: 'Identity verification', status: 'Submitted', badgeColor: 'bg-success' },
    { icon: 'fas fa-file-invoice', title: 'Income Statement', subtitle: 'Financial verification', status: 'Pending', badgeColor: 'bg-warning' },
    { icon: 'fas fa-file-signature', title: 'Bank Statements', subtitle: 'Last 6 months', action: 'Upload' }
  ];

  // Appointments
  const appointments = [
    { date: '21', month: 'MAY', title: 'Document Verification', time: '10:00 AM - Galle Divisional Secretariat' },
    { date: '28', month: 'MAY', title: 'Field Interview', time: '2:30 PM - Your Residence' }
  ];

  return (
    <div className="dashboard-container bg-gray-50 min-h-screen">
      {/* Top Navigation */}
      <header className="top-navbar p-4 shadow-sm bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="app-logo mr-4">
              <i className={`fas fa-hand-holding-usd text-3xl text-purple-600 transition-transform hover:scale-110`}></i>
            </div>
            <h1 className="text-xl font-bold text-gray-800 hidden md:block">MicroAid</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:block relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                placeholder="Search..."
              />
            </div>
            
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className={`${user.avatarColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold shadow-md transition-all group-hover:shadow-lg`}>
                {user.name.charAt(0)}
              </div>
              <span className="hidden md:inline text-gray-700 font-medium">{user.name}</span>
              <i className="fas fa-chevron-down text-gray-500 text-xs transition-transform group-hover:rotate-180"></i>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Banner */}
        <section className="welcome-banner mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8 lg:p-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-7/12 mb-6 md:mb-0">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 animate-fadeIn">
                    Welcome back, {user.name}!
                  </h2>
                  <p className="text-purple-100 text-lg mb-6">
                    Your financial assistance applications are being processed. Take a quick look at your dashboard.
                  </p>
                  <Link 
                    to="/apply" 
                    className="inline-flex items-center px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg shadow-md hover:bg-gray-100 hover:shadow-lg transition-all duration-300"
                  >
                    <i className="fas fa-plus-circle mr-2"></i> New Application
                  </Link>
                </div>
                <div className="md:w-5/12 flex justify-center">
                  <img 
                    src="https://cdn.prod.website-files.com/6364b6fd26e298b11fb9391f/6364b6fd26e2981cc9b93c1a_62fb3c9be416fd1867213b22_DrawKit_0015_-_economy-and-finance-banner.png" 
                    alt="Dashboard Illustration" 
                    className="w-full max-w-xs md:max-w-md transform hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="stats-grid mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-5">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                      <p className={`text-sm ${stat.color} mt-1`}>
                        <i className={`fas fa-${stat.trend} mr-1`}></i>
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.color} bg-opacity-10 p-3 rounded-full self-start`}>
                      <i className={`${stat.icon} text-xl`}></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="lg:w-2/3 space-y-6">
            {/* Application Progress */}
            <section className="application-journey">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Application Journey</h3>
                  <div className="dropdown relative">
                    <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                      <i className="fas fa-ellipsis-v"></i>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="relative">
                    <div className="absolute h-1 bg-gray-200 top-5 left-10 right-10 sm:left-16 sm:right-16 md:left-24 md:right-24"></div>
                    <div className="grid grid-cols-4 gap-4 relative">
                      {journeySteps.map((step, index) => (
                        <div 
                          key={index} 
                          className={`journey-step ${step.status} text-center`}
                        >
                          <div className={`step-number mx-auto mb-3 w-10 h-10 rounded-full flex items-center justify-center 
                            ${step.status === 'current' ? 'bg-purple-600 text-white' : 
                              step.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {step.number}
                          </div>
                          <div className="step-content">
                            <h4 className={`font-semibold ${step.status === 'current' ? 'text-purple-600' : 'text-gray-700'}`}>
                              {step.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                            {step.status === 'current' && (
                              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Financial Health Overview */}
            <section className="financial-health">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Financial Health Overview</h3>
                  <button className="text-purple-600 hover:text-purple-800 focus:outline-none">
                    <i className="fas fa-sync-alt mr-1"></i> Refresh
                  </button>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {financialMetrics.map((metric, index) => (
                      <div key={index} className="finance-metric-card p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-semibold text-gray-700">{metric.title}</h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${metric.badgeColor}`}>
                            {metric.status}
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div className="w-full">
                                <div className={`h-2 rounded-full overflow-hidden ${metric.color}-light`}>
                                  <div 
                                    className={`h-full ${metric.color} rounded-full`} 
                                    style={{ width: `${metric.value}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              {metric.labels.map((label, i) => (
                                <span key={i}>{label}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section className="about-section">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2 mb-6 md:mb-0 md:pr-6">
                      <h3 className="text-2xl font-bold text-purple-600 mb-4">About MicroAid</h3>
                      <p className="text-gray-600 mb-6">
                        MicroAid streamlines application processes for government-supported loan and Samurdhi programs, reducing paperwork and increasing transparency.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-purple-100 p-2 rounded-lg mr-4">
                            <i className="fas fa-shield-alt text-purple-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Secure & Trusted</h4>
                            <p className="text-sm text-gray-500">End-to-end data encryption</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-purple-100 p-2 rounded-lg mr-4">
                            <i className="fas fa-bolt text-purple-600"></i>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800">Fast Processing</h4>
                            <p className="text-sm text-gray-500">Quick approval turnaround</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-1/2">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <ul className="space-y-3">
                          {[
                            'Online Application Submission',
                            'Real-time Status Tracking',
                            'Document Management',
                            'Email Notifications',
                            'Secure Data Handling',
                            'PDF Report Generation'
                          ].map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <i className="fas fa-check-circle text-green-500 mr-3"></i>
                              <span className="text-gray-700">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="lg:w-1/3 space-y-6">
            {/* Quick Actions */}
            <section className="quick-actions">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-800">Quick Actions</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, index) => (
                      <Link 
                        key={index} 
                        to={action.link} 
                        className="block p-4 text-center rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                      >
                        <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                          <i className={`${action.icon} text-xl`}></i>
                        </div>
                        <h4 className="font-semibold text-gray-800">{action.title}</h4>
                        <p className="text-xs text-gray-500">{action.subtitle}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Upcoming Appointments */}
            <section className="appointments">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h3>
                  <Link to="#" className="text-purple-600 text-sm font-medium hover:text-purple-800">
                    View All <i className="fas fa-arrow-right ml-1"></i>
                  </Link>
                </div>
                <div className="p-4 space-y-4">
                  {appointments.map((appointment, index) => (
                    <div key={index} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex">
                        <div className="flex-shrink-0 mr-4 text-center">
                          <div className="w-12 h-12 flex flex-col items-center justify-center bg-purple-50 rounded-lg">
                            <span className="font-bold text-purple-600">{appointment.date}</span>
                            <span className="text-xs text-gray-500">{appointment.month}</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-800">{appointment.title}</h4>
                          <p className="text-sm text-gray-500 mb-3">{appointment.time}</p>
                          <div className="flex space-x-2">
                            <button className="flex-1 py-1 px-3 bg-green-50 text-green-700 text-sm font-medium rounded-md hover:bg-green-100 transition-colors">
                              <i className="fas fa-check mr-1"></i> Confirm
                            </button>
                            <button className="flex-1 py-1 px-3 bg-red-50 text-red-700 text-sm font-medium rounded-md hover:bg-red-100 transition-colors">
                              <i className="fas fa-times mr-1"></i> Reschedule
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Required Documents */}
            <section className="documents">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-800">Required Documents</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-3">
                    {documents.map((doc, index) => (
                      <li key={index} className="p-3 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="mr-3 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                              <i className={`${doc.icon}`}></i>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800">{doc.title}</h4>
                              <p className="text-xs text-gray-500">{doc.subtitle}</p>
                            </div>
                          </div>
                          {doc.status ? (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${doc.badgeColor}`}>
                              {doc.status}
                            </span>
                          ) : (
                            <button className="text-xs font-medium px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                              {doc.action}
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;