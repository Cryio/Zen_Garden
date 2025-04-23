import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarDays, 
  BarChart3, 
  Target, 
  Leaf, 
  Clock, 
  Brain, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-wax-flower-950/30 to-wax-flower-900/30">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-[url('/zen-pattern.svg')] opacity-5"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-200 to-wax-flower-400">
              Zen Garden
            </h1>
            <p className="text-xl text-wax-flower-100 mb-8 max-w-2xl mx-auto">
              Cultivate your habits, nurture your growth, and watch your personal garden flourish
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button asChild size="lg" className="bg-wax-flower-500 hover:bg-wax-flower-600">
                <Link to="/signup">Start Your Journey</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-wax-flower-700 text-wax-flower-100 hover:bg-wax-flower-900/60">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-wax-flower-950/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-wax-flower-100">Why Choose Zen Garden?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-wax-flower-900/20 backdrop-blur-sm border-wax-flower-800/30">
              <CardHeader>
                <Leaf className="w-12 h-12 mb-4 text-wax-flower-400" />
                <CardTitle className="text-wax-flower-100">Habit Tracking</CardTitle>
                <CardDescription className="text-wax-flower-300">
                  Monitor your daily practices with an intuitive interface
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-wax-flower-900/20 backdrop-blur-sm border-wax-flower-800/30">
              <CardHeader>
                <BarChart3 className="w-12 h-12 mb-4 text-wax-flower-400" />
                <CardTitle className="text-wax-flower-100">Progress Analytics</CardTitle>
                <CardDescription className="text-wax-flower-300">
                  Visualize your growth through beautiful charts and insights
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="bg-wax-flower-900/20 backdrop-blur-sm border-wax-flower-800/30">
              <CardHeader>
                <Target className="w-12 h-12 mb-4 text-wax-flower-400" />
                <CardTitle className="text-wax-flower-100">Goal Setting</CardTitle>
                <CardDescription className="text-wax-flower-300">
                  Define and achieve your objectives with smart tracking
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-wax-flower-100">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wax-flower-900/20 flex items-center justify-center">
                <CalendarDays className="w-8 h-8 text-wax-flower-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-wax-flower-100">1. Set Habits</h3>
              <p className="text-wax-flower-300">Define your daily practices</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wax-flower-900/20 flex items-center justify-center">
                <Clock className="w-8 h-8 text-wax-flower-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-wax-flower-100">2. Track Daily</h3>
              <p className="text-wax-flower-300">Log your progress</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wax-flower-900/20 flex items-center justify-center">
                <Brain className="w-8 h-8 text-wax-flower-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-wax-flower-100">3. Stay Focused</h3>
              <p className="text-wax-flower-300">Use our Pomodoro timer</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wax-flower-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-wax-flower-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-wax-flower-100">4. Grow</h3>
              <p className="text-wax-flower-300">Watch your garden flourish</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-wax-flower-950/50">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-wax-flower-100">Ready to Start Your Journey?</h2>
          <p className="text-xl text-wax-flower-200 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their habits with Zen Garden
          </p>
          <Button asChild size="lg" className="bg-wax-flower-500 hover:bg-wax-flower-600">
            <Link to="/signup">
              Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-wax-flower-800/30">
        <div className="container mx-auto text-center">
          <p className="text-wax-flower-300 text-sm">
            © {new Date().getFullYear()} Zen Garden. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 