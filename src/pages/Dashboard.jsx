import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { eligibilityAPI } from '../services/api';
import { CheckCircle, XCircle, TrendingUp, Clock } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    eligible: 0,
    notEligible: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    total: 0,
    eligible: 0,
    notEligible: 0
  });

  useEffect(() => {
    setIsVisible(true);
    fetchHistory();
  }, []);

  useEffect(() => {
    // Animate stats counter
    const animateCounter = (target, setter, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    if (stats.total > 0) {
      animateCounter(stats.total, (val) => setAnimatedStats(prev => ({ ...prev, total: val })));
      animateCounter(stats.eligible, (val) => setAnimatedStats(prev => ({ ...prev, eligible: val })));
      animateCounter(stats.notEligible, (val) => setAnimatedStats(prev => ({ ...prev, notEligible: val })));
    }
  }, [stats]);

  const fetchHistory = async () => {
    try {
      const response = await eligibilityAPI.getHistory();
      const checks = response.data.history || [];
      setHistory(checks);
      
      const eligibleCount = checks.filter(c => c.isEligible).length;
      setStats({
        total: checks.length,
        eligible: eligibleCount,
        notEligible: checks.length - eligibleCount
      });
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome back, {user?.name}!</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Total Checks', value: animatedStats.total, icon: TrendingUp, color: 'primary', bgColor: 'bg-primary-50' },
            { label: 'Eligible Schemes', value: animatedStats.eligible, icon: CheckCircle, color: 'green', bgColor: 'bg-green-50' },
            { label: 'Not Eligible', value: animatedStats.notEligible, icon: XCircle, color: 'red', bgColor: 'bg-red-50' }
          ].map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-xl transform hover:scale-105 interactive-card ${
                isVisible ? 'animate-fadeIn' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className={`text-3xl font-bold mt-2 text-${stat.color}-600`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-300 hover:shadow-lg ${
          isVisible ? 'animate-fadeIn' : 'opacity-0'
        }`} style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            {[
              { to: '/eligibility-check', label: 'Check Eligibility', color: 'primary', icon: CheckCircle },
              { to: '/schemes', label: 'Browse Schemes', color: 'gray', icon: TrendingUp },
              { to: '/profile', label: 'Update Profile', color: 'gray', icon: Clock }
            ].map((action, index) => (
              <Link
                key={index}
                to={action.to}
                className={`px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg interactive-button relative flex items-center space-x-2 ${
                  action.color === 'primary'
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Eligibility History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Eligibility Checks</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No eligibility checks yet.</p>
              <Link
                to="/eligibility-check"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Check your eligibility now →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {history.slice(0, 10).map((check, index) => (
                <div
                  key={index}
                  className={`border-l-4 rounded-lg p-4 ${
                    check.isEligible
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {check.schemeId?.name || 'Scheme'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Checked on {new Date(check.checkedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center">
                        {check.isEligible ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-green-700 font-medium">Eligible</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-red-700 font-medium">Not Eligible</span>
                          </>
                        )}
                      </div>
                      {check.reasons && check.reasons.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {check.reasons.slice(0, 2).map((reason, i) => (
                            <li key={i} className="text-sm text-gray-600">
                              • {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    {check.schemeId?._id && (
                      <Link
                        to={`/schemes/${check.schemeId._id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium ml-4"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

