import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle, TrendingUp, Users, Award, Sparkles } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({ schemes: 0, categories: 0, availability: '24/7' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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

    animateCounter(100, (val) => setStats(prev => ({ ...prev, schemes: val })));
    animateCounter(10, (val) => setStats(prev => ({ ...prev, categories: val })));
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Animation */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
            <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <Sparkles className="h-5 w-5 animate-bounce-slow" />
              <span className="text-sm font-medium">Find Your Eligible Schemes</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Eligible
              <br />
              <span className="gradient-text bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-white">
                Government Schemes
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-2xl mx-auto">
              Check your eligibility for various government schemes in one place. Quick, easy, and comprehensive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/eligibility-check"
                className="group px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl interactive-button relative"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Check Eligibility</span>
                </span>
              </Link>
              <Link
                to="/schemes"
                className="group px-8 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-400 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl interactive-button relative border-2 border-white/20"
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Browse Schemes</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Interactive Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Why Choose Scheme Finder?
          </h2>
          <p className="text-center text-gray-600 mb-12">Discover the benefits of our platform</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Search, title: 'Easy Search', desc: 'Search and filter through hundreds of government schemes', color: 'text-blue-600' },
              { icon: CheckCircle, title: 'Quick Eligibility', desc: 'Check your eligibility instantly with our smart checker', color: 'text-green-600' },
              { icon: Users, title: 'User Friendly', desc: 'Simple and intuitive interface for everyone', color: 'text-purple-600' },
              { icon: Award, title: 'Comprehensive', desc: 'Covers schemes from all categories and ministries', color: 'text-orange-600' }
            ].map((feature, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 interactive-card group ${
                  isVisible ? 'animate-fadeIn' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className={`h-8 w-8 ${feature.color} group-hover:rotate-12 transition-transform duration-300`} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section with Animated Counters */}
      <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: stats.schemes, suffix: '+', label: 'Government Schemes', icon: '📋' },
              { value: stats.categories, suffix: '+', label: 'Categories', icon: '📂' },
              { value: stats.availability, suffix: '', label: 'Available', icon: '⏰' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                  isVisible ? 'animate-scaleIn' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="text-5xl mb-4">{stat.icon}</div>
                <div className="text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-secondary-600/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Ready to Find Your Eligible Schemes?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Get started by checking your eligibility or browsing available schemes. It's quick, easy, and free!
            </p>
            <Link
              to="/eligibility-check"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl interactive-button relative"
            >
              <span className="relative z-10">Check Eligibility Now</span>
              <CheckCircle className="h-5 w-5 relative z-10" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
