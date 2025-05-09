import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Nav,
  Container,
  Row,
  Col,
  Button,
  Card,
  Badge,
} from "react-bootstrap";
import {
  FaUser,
  FaFileAlt,
  FaHospital,
  FaComments,
  FaArrowRight,
  FaBell,
} from "react-icons/fa";
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { NoteOutlined } from "@mui/icons-material";

const EgramaHomepage = () => {
  return (
    <div className="egrama-app">
      {/* Navbar */}
      <Navbar/>  

      {/* Hero Section */}
      <div
        className="hero-section py-5 mt-28"
        style={{
          background: "linear-gradient(135deg, #6610f2 0%, #7952b3 100%)",
          color: "white",
        }}
      >
        <Container className="text-center py-5">
          <h1 className="display-4 fw-bold mb-3">
            Your One-Stop Digital Village Services Platform
          </h1>
          <p className="lead mb-5">
            Access government services, apply for loans, manage your profile,
            and connect with healthcare facilities - all in one place.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/register">
              <Button variant="light" size="lg" className="px-4">
                Register Now
              </Button>
            </Link>
            <Button variant="outline-light" size="lg" className="px-4">
              Learn More
            </Button>
          </div>
        </Container>
      </div>

    {/* Services Section */}
    <div className="py-12 bg-white">
      <Container>
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-3">Our <span className="text-indigo-600">Services</span></h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the comprehensive range of digital services we offer to make your life easier
          </p>
        </div>

        <Row className="g-6">
          {/* Certificate Application */}
          <Col md={6} lg={3}>
            <Link to="/certificate-login" className="text-decoration-none">
              <div className="h-full group">
                <div className="relative h-full bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                      alt="Certificate Application"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4 -mt-12 relative z-10">
                      <FaUser className="text-indigo-600 text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Apply for Grama Niladari Certificate</h3>
                    <p className="text-gray-600 mb-4">
                      Quick and easy online application for all types of government certificates
                    </p>
                    <div className="flex items-center text-indigo-600 font-medium">
                      <span>Get Started</span>
                      <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Col>

          {/* Loan Applications */}
          <Col md={6} lg={3}>
            <Link to="/loan-dashboard" className="text-decoration-none">
              <div className="h-full group">
                <div className="relative h-full bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                      alt="Loan Applications"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 -mt-12 relative z-10">
                      <FaFileAlt className="text-blue-600 text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Loans & Samurdi Benefits</h3>
                    <p className="text-gray-600 mb-4">
                      Apply for government loans and welfare benefits with simplified procedures
                    </p>
                    <div className="flex items-center text-blue-600 font-medium">
                      <span>Explore Options</span>
                      <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Col>

          {/* Hospital Services */}
          <Col md={6} lg={3}>
            <Link to="#" className="text-decoration-none">
              <div className="h-full group">
                <div className="relative h-full bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                      alt="Hospital Services"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4 -mt-12 relative z-10">
                      <FaHospital className="text-green-600 text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Hospital Services</h3>
                    <p className="text-gray-600 mb-4">
                      Book appointments and access medical records from healthcare facilities
                    </p>
                    <div className="flex items-center text-green-600 font-medium">
                      <span>Health Portal</span>
                      <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Col>

          {/* Chat Assistant */}
          <Col md={6} lg={3}>
            <Link to="/chat-home" className="text-decoration-none">
              <div className="h-full group">
                <div className="relative h-full bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100">
                  <div className="relative h-40 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                      alt="Chat Assistant"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4 -mt-12 relative z-10">
                      <FaComments className="text-purple-600 text-xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Your Chat Assistant</h3>
                    <p className="text-gray-600 mb-4">
                      Connect with GN officers and get instant answers to your queries
                    </p>
                    <div className="flex items-center text-purple-600 font-medium">
                      <span>Start Chatting</span>
                      <FaArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </Col>
        </Row>

        <div className="text-center mt-10">
          <Button variant="outline-primary" size="lg" className="px-8 py-3 border-2 font-medium">
            View All Services
          </Button>
        </div>
      </Container>
    </div>

{/* Features Section */}
<div className="py-12 bg-gradient-to-br from-indigo-50 to-blue-50">
  <Container>
    <Row className="align-items-center">
      <Col lg={6} className="mb-8 mb-lg-0 pe-lg-5">
        <h2 className="text-4xl font-bold mb-12 text-gray-800" style={{marginBottom:'25px'}}>
          Why Choose <span className="text-indigo-600">e-Grama</span>?
        </h2>
        
        {/* Feature 1 */}
        <div className="flex mb-8 group">
          <div className="flex-shrink-0">
            <div className="rounded-xl bg-white shadow-lg p-4 flex justify-center items-center w-16 h-16 group-hover:bg-indigo-100 transition-colors duration-300">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2933/2933245.png" 
                alt="Simplified Processes" 
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
          <div className="ms-6">
            <h5 className="text-xl font-bold text-gray-800 mb-2">Simplified Processes</h5>
            <p className="text-gray-600">
              Complete government procedures online without multiple visits to offices. 
              Our streamlined system saves you time and hassle.
            </p>
          </div>
        </div>
        
        {/* Feature 2 */}
        <div className="flex mb-8 group">
          <div className="flex-shrink-0">
            <div className="rounded-xl bg-white shadow-lg p-4 flex justify-center items-center w-16 h-16 group-hover:bg-indigo-100 transition-colors duration-300">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/2956/2956740.png" 
                alt="Secure Management" 
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
          <div className="ms-6">
            <h5 className="text-xl font-bold text-gray-800 mb-2">Secure Management</h5>
            <p className="text-gray-600">
              Your data is encrypted with bank-level security and stored with the 
              highest privacy standards. We protect what matters most.
            </p>
          </div>
        </div>
        
        {/* Feature 3 */}
        <div className="flex group">
          <div className="flex-shrink-0">
            <div className="rounded-xl bg-white shadow-lg p-4 flex justify-center items-center w-16 h-16 group-hover:bg-indigo-100 transition-colors duration-300">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3050/3050520.png" 
                alt="24/7 Availability" 
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
          <div className="ms-6">
            <h5 className="text-xl font-bold text-gray-800 mb-2">24/7 Availability</h5>
            <p className="text-gray-600">
              Access services anytime, anywhere through our mobile-friendly platform. 
              No more waiting in long queues during office hours.
            </p>
          </div>
        </div>
      </Col>
      
      <Col lg={6}>
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Happy citizens using e-Grama services"
            className="img-fluid rounded-xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
          />
          <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg hidden md:block">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h6 className="font-bold text-gray-800">98% Satisfaction</h6>
                <p className="text-sm text-gray-600">From our users</p>
              </div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  </Container>
</div>

      {/* Call to Action */}
      <div
        className="py-5"
        style={{
          background: "linear-gradient(135deg, #6610f2 0%, #7952b3 100%)",
          color: "white",
        }}
      >
        <Container className="text-center py-4">
          <h2 className="fw-bold mb-4">Ready to Get Started?</h2>
          <p className="lead mb-4">
            Join thousands of citizens who are already enjoying the benefits of
            e-Grama services.
          </p>
          <Link to='./register'>
          <Button
            variant="light"
            size="lg"
            className="px-5 py-3 fw-bold"
            style={{ borderRadius: "30px" }}
          >
            Register Now
          </Button>
          </Link>
        </Container>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <Container>
          <Row>
            <Col md={4} className="mb-4 mb-md-0">
              <div className="d-flex align-items-center mb-4">
                <div
                  className="logo-box me-2"
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#6610f2",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                    }}
                  >
                    e
                  </span>
                </div>
                <span
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.3rem",
                  }}
                >
                  e-Grama System
                </span>
              </div>
              <p className="text-white">
                Your one-stop solution for all digital village services and
                government procedures.
              </p>
            </Col>
            <Col md={2} className="mb-4 mb-md-0">
              <h5 className="mb-4">Quick Links</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-white">
                    Home
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-white">
                    About Us
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-white">
                    Services
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </Col>
            <Col md={3} className="mb-4 mb-md-0">
              <h5 className="mb-4">Services</h5>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-white">
                    Profile Management
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-white">
                    Loan Applications
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-white">
                    Hospital Services
                  </a>
                </li>
                <li className="mb-2">
                  <a href="#" className="text-decoration-none text-white">
                    Government Forms
                  </a>
                </li>
              </ul>
            </Col>
            <Col md={3}>
              <h5 className="mb-4">Contact Us</h5>
              <p className="text-white mb-2">Email: support@egrama.gov</p>
              <p className="text-white mb-2">Phone: +94 11 2345678</p>
              <p className="text-white">Hotline: 1919</p>
            </Col>
          </Row>
          <hr className="my-4" />
          <div className="text-center text-white">
            <small>&copy; 2025 e-Grama System. All rights reserved.</small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default EgramaHomepage;