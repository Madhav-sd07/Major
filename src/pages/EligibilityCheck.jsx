import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { eligibilityAPI, schemeAPI } from '../services/api';
import { useForm } from 'react-hook-form';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, ArrowRight, GraduationCap, Heart, Wheat, Laptop, Building, Users, DollarSign, Home, Briefcase } from 'lucide-react';

const EligibilityCheck = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();
  const [step, setStep] = useState(1); // 1: Domain selection, 2: Form, 3: Results
  const [selectedDomain, setSelectedDomain] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
    setIsVisible(true);
    if (user) {
      // Pre-fill form with user data
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
      setValue('dateOfBirth', user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '');
      setValue('gender', user.gender || '');
      setValue('income', user.income || '');
      setValue('familySize', user.familySize || '');
      setValue('occupation', user.occupation || '');
      setValue('category', user.category || '');
      if (user.address) {
        setValue('state', user.address.state || '');
        setValue('city', user.address.city || '');
        setValue('pincode', user.address.pincode || '');
      }
    }
  }, [user, setValue]);

  const fetchCategories = async () => {
    try {
      const response = await schemeAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    setStep(2); // Move to form step
  };

  const handleBackToDomains = () => {
    setStep(1);
    setSelectedDomain('');
    setResults([]);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const userData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        income: parseFloat(data.income) || 0,
        familySize: parseInt(data.familySize) || 1,
        occupation: data.occupation,
        category: data.category,
        address: {
          state: data.state,
          city: data.city,
          pincode: data.pincode,
          country: 'India'
        }
      };

      const params = {
        category: selectedDomain,
        limit: 50
      };

      const response = await eligibilityAPI.checkMultiple(userData, params);
      setResults(response.data.results);
      setStep(3); // Move to results step
    } catch (error) {
      console.error('Error checking eligibility:', error);
      alert('Error checking eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDomainIcon = (domain) => {
    const icons = {
      'Education': GraduationCap,
      'Healthcare': Heart,
      'Agriculture': Wheat,
      'Employment': Briefcase,
      'Housing': Home,
      'Financial': DollarSign,
      'Women': Users,
      'Senior Citizens': Users,
      'Disability': Users,
      'Other': Building
    };
    return icons[domain] || Building;
  };

  const getDomainColor = (domain) => {
    const colors = {
      'Education': 'from-blue-500 to-blue-600',
      'Healthcare': 'from-red-500 to-red-600',
      'Agriculture': 'from-green-500 to-green-600',
      'Employment': 'from-purple-500 to-purple-600',
      'Housing': 'from-orange-500 to-orange-600',
      'Financial': 'from-yellow-500 to-yellow-600',
      'Women': 'from-pink-500 to-pink-600',
      'Senior Citizens': 'from-indigo-500 to-indigo-600',
      'Disability': 'from-teal-500 to-teal-600',
      'Other': 'from-gray-500 to-gray-600'
    };
    return colors[domain] || 'from-gray-500 to-gray-600';
  };

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
    'Ladakh', 'Puducherry', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli',
    'Daman and Diu', 'Lakshadweep'
  ];

  // Step 1: Domain Selection
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Check Your Eligibility
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Select a domain to check your eligibility for government schemes in that category
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categories.map((category, index) => {
              const Icon = getDomainIcon(category);
              const colorClass = getDomainColor(category);
              
              return (
                <button
                  key={category}
                  onClick={() => handleDomainSelect(category)}
                  className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 interactive-card p-8 text-left group ${
                    isVisible ? 'animate-fadeIn' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${colorClass} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                    {category}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Check eligibility for {category.toLowerCase()} schemes
                  </p>
                  <div className="mt-4 flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700">
                    Select Domain <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading domains...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Personal Information Form
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Back Button */}
          <div className={`mb-8 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
            <button
              onClick={handleBackToDomains}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors duration-300"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Domains
            </button>
            <div className="flex items-center space-x-4 mb-4">
              {(() => {
                const Icon = getDomainIcon(selectedDomain);
                const colorClass = getDomainColor(selectedDomain);
                return (
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${colorClass}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                );
              })()}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Personal Information</h1>
                <p className="text-gray-600">Domain: {selectedDomain}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">1</div>
                <span className="ml-2">Select Domain</span>
              </div>
              <ArrowRight className="h-4 w-4" />
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">2</div>
                <span className="ml-2">Personal Information</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center font-semibold">3</div>
                <span className="ml-2">Results</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <div className={`bg-white rounded-lg shadow-md p-6 sticky top-24 transition-all duration-300 hover:shadow-lg ${
                isVisible ? 'animate-fadeIn' : 'opacity-0'
              }`}>
                <h2 className="text-xl font-semibold mb-6 text-gray-900">Your Information</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { required: 'Name is required' })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      {...register('phone')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      {...register('dateOfBirth')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      {...register('gender')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Annual Income (₹)
                    </label>
                    <input
                      type="number"
                      {...register('income')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Family Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('familySize')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occupation
                    </label>
                    <input
                      type="text"
                      {...register('occupation')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      {...register('category')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    >
                      <option value="">Select Category</option>
                      <option value="General">General</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="OBC">OBC</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <select
                      {...register('state')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      {...register('city')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      {...register('pincode')}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:transform-none interactive-button relative"
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Checking...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          <span>Check Eligibility</span>
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </div>

            {/* Info Section */}
            <div className="lg:col-span-2">
              <div className={`bg-white rounded-lg shadow-md p-8 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center space-x-3 mb-6">
                  {(() => {
                    const Icon = getDomainIcon(selectedDomain);
                    const colorClass = getDomainColor(selectedDomain);
                    return (
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${colorClass}`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDomain} Schemes</h2>
                    <p className="text-gray-600">Fill in your information to check eligibility</p>
                  </div>
                </div>
                <div className="bg-primary-50 rounded-lg p-6 border-l-4 border-primary-600">
                  <h3 className="font-semibold text-gray-900 mb-2">Why provide this information?</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    We use your personal information to accurately check your eligibility for government schemes in the {selectedDomain} domain. 
                    This helps us match you with the most relevant schemes based on your profile, income, location, and other criteria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Results
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`mb-8 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
          <button
            onClick={handleBackToDomains}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 transition-colors duration-300"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Domains
          </button>
          <div className="flex items-center space-x-4 mb-4">
            {(() => {
              const Icon = getDomainIcon(selectedDomain);
              const colorClass = getDomainColor(selectedDomain);
              return (
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${colorClass}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              );
            })()}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eligibility Results</h1>
              <p className="text-gray-600">Domain: {selectedDomain}</p>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="space-y-4">
            <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Found {results.length} {selectedDomain} {results.length === 1 ? 'scheme' : 'schemes'}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-gray-700">
                    {results.filter(r => r.eligibility.isEligible).length} Eligible
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-gray-700">
                    {results.filter(r => !r.eligibility.isEligible).length} Not Eligible
                  </span>
                </div>
              </div>
            </div>

            {results.map((result, index) => (
              <div
                key={result.scheme.id}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01] ${
                  result.eligibility.isEligible
                    ? 'border-green-500'
                    : 'border-red-500'
                } ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {result.scheme.name}
                    </h3>
                    <p className="text-sm text-gray-600">{result.scheme.category}</p>
                  </div>
                  {result.eligibility.isEligible ? (
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-gray-700 mb-4">{result.scheme.description}</p>
                <div className={`rounded-lg p-4 mb-4 ${
                  result.eligibility.isEligible
                    ? 'bg-green-50'
                    : 'bg-red-50'
                }`}>
                  <ul className="space-y-2">
                    {result.eligibility.reasons.map((reason, i) => (
                      <li key={i} className={`flex items-start ${
                        result.eligibility.isEligible
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}>
                        {result.eligibility.isEligible ? (
                          <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate(`/schemes/${result.scheme.id}`)}
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1 transition-colors duration-300"
                >
                  <span>View Scheme Details</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`bg-white rounded-lg shadow-md p-12 text-center ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No results found. Please try again.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EligibilityCheck;
