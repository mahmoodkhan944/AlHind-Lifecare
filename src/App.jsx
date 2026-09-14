import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Public pages — lazy-loaded per route so visiting any one page only
// downloads and executes that page's own JS, not the whole site's (this is
// the main lever for reducing Total Blocking Time / Speed Index: the Admin
// panel alone is a large chunk of code that a public visitor never needs).
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Doctors = lazy(() => import('@/pages/Doctors'));
const DoctorDetail = lazy(() => import('@/pages/DoctorDetail'));
const Hospitals = lazy(() => import('@/pages/Hospitals'));
const HospitalDetail = lazy(() => import('@/pages/HospitalDetail'));
const Treatments = lazy(() => import('@/pages/Treatments'));
const TreatmentDetail = lazy(() => import('@/pages/TreatmentDetail'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogDetail = lazy(() => import('@/pages/BlogDetail'));
const Testimonials = lazy(() => import('@/pages/Testimonials'));
const Contact = lazy(() => import('@/pages/Contact'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Layout
import PublicLayout from '@/components/layout/PublicLayout';

// Admin pages — also lazy, and each is its own chunk so e.g. editing
// Testimonials doesn't pull in the Bulk Upload / Treatments admin code.
import AdminLayout from '@/components/admin/AdminLayout';
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminLeads = lazy(() => import('@/pages/admin/AdminLeads'));
const TreatmentRequests = lazy(() => import('@/pages/admin/TreatmentRequests'));
const AdminDoctors = lazy(() => import('@/pages/admin/AdminDoctors'));
const AdminHospitals = lazy(() => import('@/pages/admin/AdminHospitals'));
const AdminTreatments = lazy(() => import('@/pages/admin/AdminTreatments'));
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog'));
const AdminTestimonials = lazy(() => import('@/pages/admin/AdminTestimonials'));
const AdminAppointments = lazy(() => import('@/pages/admin/AdminAppointments'));
const AdminFAQs = lazy(() => import('@/pages/admin/AdminFAQs'));
const AdminHomeContent = lazy(() => import('@/pages/admin/AdminHomeContent'));
const AdminAboutContent = lazy(() => import('@/pages/admin/AdminAboutContent'));
const AdminNewsletter = lazy(() => import('@/pages/admin/AdminNewsletter'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

// Shown briefly while a route's chunk downloads — plain and unobtrusive
// since on a fast connection it's rarely visible for more than a beat.
function RouteFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

const AuthenticatedApp = () => {
  return (
    <Suspense fallback={<RouteFallback />}>
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
        <Route path="/treatments/:slug" element={<TreatmentDetail />} />
        <Route path="/landing/:slug" element={<TreatmentDetail forceLanding />} />
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
          <Route path="/admin/home-content" element={<AdminHomeContent />} />
          <Route path="/admin/about-content" element={<AdminAboutContent />} />
          <Route path="/admin/newsletter" element={<AdminNewsletter />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router
          basename={import.meta.env.BASE_URL}
        >
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>

        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;