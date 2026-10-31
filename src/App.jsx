import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Link } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CursorGlow from './components/ui/CursorGlow';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const BrowsePage = lazy(() => import('./pages/BrowsePage'));
const ResearchDetailPage = lazy(() => import('./pages/ResearchDetailPage'));
const FacultyPage = lazy(() => import('./pages/FacultyPage'));
const FacultyDetailPage = lazy(() => import('./pages/FacultyDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const SubmitResearch = lazy(() => import('./pages/user/SubmitResearch'));
const StudentDashboard = lazy(() => import('./pages/user/StudentDashboard'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
// Admin area
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminPapers = lazy(() => import('./pages/admin/AdminPapers'));
const AdminFaculty = lazy(() => import('./pages/admin/AdminFaculty'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
// Faculty portal
const FacultyLayout = lazy(() => import('./components/layout/FacultyLayout'));
const FacultyStudents = lazy(() => import('./pages/faculty/FacultyStudents'));

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
  </div>
);

/**
 * Route guard. Redirects unauthenticated users to /auth, and users whose
 * role is not in `roles` to their home (dashboard or home page).
 */
function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && !roles.includes(user.role)) {
    // Redirect to appropriate home based on role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'faculty') return <Navigate to="/portal" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Inner component to use location + auth
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith('/admin') || location.pathname.startsWith('/portal');
  const isHome = location.pathname === '/';
  const isAbout = location.pathname === '/about';

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body relative">
      {/* Global Background Elements kept below hero */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glow-orb absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neutral-200 rounded-full animate-float"></div>
        <div className="glow-orb absolute bottom-[5%] right-[-5%] w-[600px] h-[600px] bg-neutral-200 rounded-full animate-float-delayed"></div>
        <div className="glow-orb absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-neutral-300 rounded-full animate-float-slow"></div>
      </div>

      {!isAdminArea && <Navbar />}
      <CursorGlow />
      <ScrollToTop />

      <main className={`flex-1 relative z-10 ${isHome || isAbout || isAdminArea ? '' : 'pt-[76px]'}`}>
        <Suspense fallback={<Loader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public */}
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/research/:id" element={<ResearchDetailPage />} />
              <Route path="/faculty" element={<FacultyPage />} />
              <Route path="/faculty/:id" element={<FacultyDetailPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Student / any authenticated user */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit"
                element={
                  <ProtectedRoute roles={['student', 'faculty']}>
                    <SubmitResearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute roles={['student', 'faculty', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Faculty Portal — /portal */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute roles={['faculty']}>
                    <FacultyLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="papers" element={<AdminPapers />} />
                <Route path="students" element={<FacultyStudents />} />
                <Route path="analytics" element={<AdminAnalytics />} />
              </Route>

              {/* Admin Console — /admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="papers" element={<AdminPapers />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="faculty" element={<AdminFaculty />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="categories" element={<AdminCategories />} />
              </Route>

              <Route path="*" element={
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                  <span className="material-symbols-outlined text-[64px] text-outline mb-4">explore_off</span>
                  <h1 className="font-display text-[28px] font-bold mb-2">Page Not Found</h1>
                  <p className="text-on-surface-variant text-[14px] mb-6">The page you're looking for doesn't exist.</p>
                  <Link to="/" className="bg-neutral-900 text-white px-8 py-3.5 rounded-full text-[14px] font-bold hover:bg-neutral-700 active:scale-95 transition-all">
                    Back to Home
                  </Link>
                </div>
              } />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!isAdminArea && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Shell />
      </Router>
    </AuthProvider>
  );
}

export default App;
