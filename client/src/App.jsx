import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PHMDashboard from './pages/PHMDashboard';
import AddPatient from './pages/AddPatient';
import PatientPage from './pages/PatientPage'; 
import PatientDetails from './pages/PatientDetails'; 
import ProgressTracking from './pages/ProgressTracking'; 
import MainPage from './pages/MainPage';
import CertificateLogin from './pages/CertificateLogin';
import { useAuth } from "./context/AuthContext";
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import NavBar from "./components/Navbar";
import ChatPage from './pages/ChatPage';
import ChatHome from './pages/ChatHome';
import LoanDashboard from './pages/LoanDashboard';
import MyApplications from './pages/MyApplications';
import InstituteReview from './pages/InstituteReview';
import ApplicationForm from './pages/ApplicationForm';

const AuthenticatedLayout = () => {
  return (
    <>
      <NavBar />
      <div className="content-wrapper">
        <Outlet />
      </div>
    </>
  );
};

function App() {
  const { user } = useAuth();
  console.log('Current auth state:', user ? `User ${user.username} logged in` : 'No user');
    
  return (
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainPage />} />
        
        {/* Auth routes - redirect if already logged in */}
        <Route path="/login" element={ <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/certificate-login" element={<CertificateLogin />} />
        
        {/* All protected routes with navbar */}
        <Route element={<AuthenticatedLayout />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/chat-home" element={<ChatHome />} />
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
          <Route path="/patient-dashboard" element={<Dashboard />} />
          <Route path="/dashboard" element={<PHMDashboard />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/patients" element={<PatientPage />} />
          <Route path="/patient/:id" element={<PatientDetails />} />
          <Route path="/progress-tracking/:id" element={<ProgressTracking />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/loan-dashboard" element={<LoanDashboard user={user} />} />
          <Route path="/apply" element={<ApplicationForm />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/institute-review" element={<InstituteReview />} />
        </Route>

        {/* Fallback route - should be last */}
        <Route
          path="*"
          element={<Navigate to={user ? "/profile" : "/"} replace />}
        />
      </Routes>
  );
}

export default App;