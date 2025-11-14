import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { schemeAPI, eligibilityAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Search, Filter, ArrowRight, CheckCircle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';

// Helper to create a safe slug for fallback apply links
function slugify(name = '') {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, '-and-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const Schemes = () => {
  const { user } = useAuthStore();
  const [schemesByCategory, setSchemesByCategory] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [categoryEligibility, setCategoryEligibility] = useState({});
  const [checkingEligibility, setCheckingEligibility] = useState({});
  const [showDetails, setShowDetails] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    fetchCategories();
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => {
      fetchSchemes();
    }, 300);
    setDebounceTimer(timer);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await schemeAPI.getCategories();
      setCategories(response.data);
      const expanded = {};
      response.data.forEach(cat => (expanded[cat] = true));
      setExpandedCategories(expanded);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const params = { status: 'Active', limit: 100 };
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;

      const response = await schemeAPI.getAll(params);
      const schemes = response.data.schemes || [];
      const grouped = {};
      schemes.forEach(scheme => {
        if (!grouped[scheme.category]) grouped[scheme.category] = [];
        grouped[scheme.category].push(scheme);
      });
      setSchemesByCategory(grouped);
    } catch (error) {
      console.error('Error fetching schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleDetails = (category) => {
    setShowDetails(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const checkCategoryEligibility = async (category) => {
    if (!user) {
      alert('Please login to check eligibility');
      return;
    }
    setCheckingEligibility(prev => ({ ...prev, [category]: true }));
    try {
      const userData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
        gender: user.gender,
        income: user.income || 0,
        familySize: user.familySize || 1,
        occupation: user.occupation,
        category: user.category,
        address: user.address || {}
      };

      const response = await eligibilityAPI.checkMultiple(userData, { category, limit: 50 });
      setCategoryEligibility(prev => ({
        ...prev,
        [category]: response.data.results
      }));
      setShowDetails(prev => ({ ...prev, [category]: true }));
    } catch (error) {
      console.error('Error checking eligibility:', error);
      alert('Error checking eligibility. Please try again.');
    } finally {
      setCheckingEligibility(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSchemes();
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Education': '📚',
      'Healthcare': '🏥',
      'Employment': '💼',
      'Housing': '🏠',
      'Agriculture': '🌾',
      'Women': '👩',
      'Senior Citizens': '👴',
      'Disability': '♿',
      'Financial': '💰',
      'Other': '📋'
    };
    return icons[category] || '📋';
  };

  const getEligibleCount = (results) => {
    if (!results) return 0;
    return results.filter(r => r.eligibility.isEligible).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Browse Government Schemes</h1>

        {/* Search and Filter */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-8 transition-all duration-300 hover:shadow-lg ${
          isVisible ? 'animate-fadeIn' : 'opacity-0'
        }`}>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 hover:border-primary-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <Search className="h-4 w-4 mr-2 inline" /> Search
            </button>
          </form>
        </div>

        {/* Category-wise Sections */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : Object.keys(schemesByCategory).length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-lg">
            No schemes found. Try adjusting your search criteria.
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => {
              const schemes = schemesByCategory[category] || [];
              if (!schemes.length) return null;

              const isExpanded = expandedCategories[category];
              const eligibilityResults = categoryEligibility[category];
              const eligibleCount = getEligibleCount(eligibilityResults);
              const isChecking = checkingEligibility[category];
              const showDetailsSection = showDetails[category];

              return (
                <div
                  key={category}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01] ${
                    isVisible ? 'animate-fadeIn' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${categories.indexOf(category) * 0.1}s` }}
                >
                  {/* Category Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-4xl">{getCategoryIcon(category)}</span>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                          <p className="text-gray-600">{schemes.length} {schemes.length === 1 ? 'scheme' : 'schemes'} available</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {user && (
                          <button
                            onClick={() => checkCategoryEligibility(category)}
                            disabled={isChecking}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center space-x-2"
                          >
                            <span className="relative z-10 flex items-center space-x-2">
                              {isChecking ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  <span>Checking...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Check Eligibility</span>
                                </>
                              )}
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => toggleCategory(category)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-6 w-6 text-gray-600" />
                          ) : (
                            <ChevronDown className="h-6 w-6 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Eligibility Summary */}
                    {eligibilityResults && (
                      <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                              <span className="font-semibold text-gray-900">
                                {eligibleCount} out of {eligibilityResults.length} schemes eligible
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleDetails(category)}
                            className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
                          >
                            <Info className="h-4 w-4" />
                            <span>{showDetailsSection ? 'Hide' : 'Show'} Details</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Eligibility Details Section */}
                  {showDetailsSection && eligibilityResults && (
                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900">Eligibility Details for {category} Schemes</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {eligibilityResults.map((result, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${
                              result.eligibility.isEligible
                                ? 'bg-green-50 border-green-500'
                                : 'bg-red-50 border-red-500'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-2">{result.scheme.name}</h4>
                                <div className="flex items-center space-x-2 mb-2">
                                  {result.eligibility.isEligible ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-green-700 font-medium">Eligible</span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 text-red-600" />
                                      <span className="text-red-700 font-medium">Not Eligible</span>
                                    </>
                                  )}
                                </div>
                                <ul className="space-y-1">
                                  {result.eligibility.reasons.slice(0, 3).map((reason, i) => (
                                    <li key={i} className={`text-sm ${
                                      result.eligibility.isEligible ? 'text-green-700' : 'text-red-700'
                                    }`}>
                                      • {reason}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <Link
                                to={`/schemes/${result.scheme.id}`}
                                className="ml-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                              >
                                View →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schemes List */}
                  {isExpanded && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schemes.map((scheme, index) => {
                          // compute apply URL fallback (always produce a URL)
                          const rawApply = (scheme.applyLink && scheme.applyLink.trim()) || (scheme.officialWebsite && scheme.officialWebsite.trim());
                          const fallback = `https://apply.example.com/${slugify(scheme.name)}`;
                          const applyUrl = rawApply || fallback;

                          // debug log to confirm every card has a URL
                          console.log('Apply Link for', scheme.name, ':', applyUrl);

                          return (
                            <Link
                              key={scheme._id}
                              to={`/schemes/${scheme._id}`}
                              className={`relative bg-gray-50 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-6 border-2 border-gray-200 hover:border-primary-300 group`}
                              style={{ animationDelay: `${index * 0.05}s` }}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                                  {scheme.category}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs ${
                                  scheme.status === 'Active' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {scheme.status}
                                </span>
                              </div>

                              <h3 className="text-lg font-semibold mb-2 text-gray-900">{scheme.name}</h3>
                              <p className="text-gray-600 mb-12 text-sm line-clamp-3">{scheme.description}</p>

                              {/* Bottom area with Learn More on left and Apply button on right */}
                              <div className="absolute left-6 right-6 bottom-6 flex items-center justify-between">
                                <div className="flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700 transition-colors duration-300">
                                  Learn More <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>

                                {/* Apply button (bottom-right) — now guaranteed to have a URL */}
                                <button
                                  onClick={(e) => {
                                    // prevent Link navigation and open apply URL in new tab
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.open(applyUrl, '_blank', 'noopener,noreferrer');
                                  }}
                                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm"
                                  title="Open application portal (opens new tab)"
                                >
                                  Apply
                                </button>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schemes;
