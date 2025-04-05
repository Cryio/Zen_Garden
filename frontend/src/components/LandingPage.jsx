import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-wax-flower-950/30 to-wax-flower-900/30 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('/zen-pattern.svg')] opacity-5"></div>
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Title */}
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-200 to-wax-flower-400">
            Zen Garden
          </h1>
          <p className="text-xl text-wax-flower-100 mb-8">
            Cultivate your habits, nurture your growth
          </p>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 rounded-lg bg-wax-flower-900/20 backdrop-blur-sm border border-wax-flower-800/30">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold mb-2">Track Habits</h3>
              <p className="text-wax-flower-200">Monitor your daily practices with ease</p>
            </div>
            <div className="p-6 rounded-lg bg-wax-flower-900/20 backdrop-blur-sm border border-wax-flower-800/30">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Visualize Progress</h3>
              <p className="text-wax-flower-200">See your growth through beautiful charts</p>
            </div>
            <div className="p-6 rounded-lg bg-wax-flower-900/20 backdrop-blur-sm border border-wax-flower-800/30">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Set Goals</h3>
              <p className="text-wax-flower-200">Define and achieve your objectives</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="px-8 py-3 rounded-lg bg-wax-flower-500 text-white font-medium hover:bg-wax-flower-600 transition-colors"
            >
              Start Your Journey
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-3 rounded-lg bg-wax-flower-900/40 text-wax-flower-100 font-medium border border-wax-flower-700 hover:bg-wax-flower-900/60 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-16 text-wax-flower-300 text-sm">
            <p>Begin your mindful journey today</p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-wax-flower-900/50 to-transparent"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-wax-flower-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-wax-flower-600/10 rounded-full blur-3xl"></div>
    </div>
  );
};

export default LandingPage; 