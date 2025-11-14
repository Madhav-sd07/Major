import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, X, User, LogOut, Home, Search, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`bg-white shadow-md sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-lg' : 'shadow-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo with animation */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <CheckCircle className="h-8 w-8 text-primary-600 group-hover:rotate-12 transition-transform duration-300" />
              <div className="absolute inset-0 bg-primary-600 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-300">
              Scheme Finder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/')
                  ? 'text-primary-600 bg-primary-50 font-medium'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Home className="h-5 w-5 inline mr-1" />
              Home
            </Link>
            <Link
              to="/schemes"
              className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/schemes')
                  ? 'text-primary-600 bg-primary-50 font-medium'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              <Search className="h-5 w-5 inline mr-1" />
              Browse Schemes
            </Link>
            <Link
              to="/eligibility-check"
              className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                isActive('/eligibility-check')
                  ? 'text-primary-600 bg-primary-50 font-medium'
                  : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
              }`}
            >
              Check Eligibility
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`relative px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive('/dashboard')
                      ? 'text-primary-600 bg-primary-50 font-medium'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center space-x-4 pl-4 border-l border-gray-300">
                  <Link
                    to="/profile"
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <User className="h-5 w-5 mr-1" />
                    <span className="max-w-[100px] truncate">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-red-600 hover:text-red-700 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4 pl-4 border-l border-gray-300">
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-all duration-300 rounded-lg hover:bg-primary-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-all duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 animate-scaleIn" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation with animation */}
      <div
        className={`md:hidden border-t border-gray-200 transition-all duration-300 overflow-hidden ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            className={`block px-3 py-2 rounded-md transition-all duration-300 ${
              isActive('/')
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/schemes"
            className={`block px-3 py-2 rounded-md transition-all duration-300 ${
              isActive('/schemes')
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Browse Schemes
          </Link>
          <Link
            to="/eligibility-check"
            className={`block px-3 py-2 rounded-md transition-all duration-300 ${
              isActive('/eligibility-check')
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Check Eligibility
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`block px-3 py-2 rounded-md transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
