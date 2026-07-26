import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Public pages
import Home from '@/pages/Home';
import About from '@/pages/About';
import Doctors from '@/pages/Doctors';
import DoctorDetail from '@/pages/DoctorDetail';
import Hospitals from '@/pages/Hospitals';
import HospitalDetail from '@/pages/HospitalDetail';
import Treatments from '@/pages/Treatments';
import TreatmentDetail from '@/pages/TreatmentDetail';
import Blog from '@/pages/Blog';
import BlogDetail from '@/pages/BlogDetail';
import Testimonials from '@/pages/Testimonials';
import Contact from '@/pages/Contact';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layout
import PublicLayout from '@/components/layout/PublicLayout';

// Admin pages
import AdminLayout from '@/components/admin/AdminLayout';
import Dashboard from '@/pages/admin/Dashboard';
import AdminLeads from '@/pages/admin/AdminLeads';
import TreatmentRequests from '@/pages/admin/TreatmentRequests';
import AdminDoctors from '@/pages/admin/AdminDoctors';
import AdminHospitals from '@/pages/admin/AdminHospitals';
import AdminTreatments from '@/pages/admin/AdminTreatments';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminAppointments from '@/pages/admin/AdminAppointments';
import AdminFAQs from '@/pages/admin/AdminFAQs';
import AdminSiteContent from '@/pages/admin/AdminSiteContent';
import AdminNewsletter from '@/pages/admin/AdminNewsletter';
import AdminSettings from '@/pages/admin/AdminSettings';

const AuthenticatedApp = () => {
  return (
    <Routes>
      {/* Public pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/hospitals/:id" element={<HospitalDetail />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/treatments/:id" element={<TreatmentDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
      </Route>

      {/* Auth pages (no layout chrome — AuthLayout is built into each page) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin pages — require a logged-in user with role === 'admin' */}
      <Route
        element={
          <ProtectedRoute requireAdmin unauthenticatedElement={<Navigate to="/login" replace />} />
        }
      >
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/treatment-requests" element={<TreatmentRequests />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/doctors" element={<AdminDoctors />} />
          <Route path="/admin/hospitals" element={<AdminHospitals />} />
          <Route path="/admin/treatments" element={<AdminTreatments />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/testimonials" element={<AdminTestimonials />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/faqs" element={<AdminFAQs />} />
          <Route path="/admin/site-content" element={<AdminSiteContent />} />
          <Route path="/admin/newsletter" element={<AdminNewsletter />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router basename="/AlHind-Lifecare">
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App