import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail, Book, Leaf, Target, Calendar, Bell, Star, Video, Coffee, Heart } from 'lucide-react';

export default function Help() {
  const faqs = [
    {
      question: "How do I create a new habit?",
      answer: "To create a new habit, go to the Habits page and click the 'Add New Habit' button. Fill in the habit details like name, frequency, and reminders, then click Save. You can also set specific goals and track your progress over time.",
      icon: <Leaf className="h-4 w-4 text-wax-flower-500" />
    },
    {
      question: "How does the garden grow?",
      answer: "Your Zen Garden grows based on your habit completion and consistency. Each completed habit adds new elements to your garden. Daily streaks unlock special plants and features. The more consistent you are, the more your garden flourishes with unique flora and peaceful arrangements.",
      icon: <Target className="h-4 w-4 text-wax-flower-500" />
    },
    {
      question: "What are streaks and milestones?",
      answer: "Streaks represent consecutive days of completing habits. They're a key part of your garden's growth. Achieve longer streaks to unlock special rewards and garden elements. Milestones celebrate your achievements and mark significant progress in your journey.",
      icon: <Star className="h-4 w-4 text-wax-flower-500" />
    },
    {
      question: "How do I track my progress?",
      answer: "Visit the Analytics page for detailed insights into your habit journey. View completion rates, streak history, and garden growth statistics. The Calendar view shows your daily activity, while charts and graphs help visualize your long-term progress.",
      icon: <Calendar className="h-4 w-4 text-wax-flower-500" />
    },
    {
      question: "Can I customize notifications?",
      answer: "Yes! In Settings > Notifications, you can fully customize your reminder system. Set daily check-ins, milestone alerts, and weekly summaries. Choose notification times that work best for your schedule and garden maintenance.",
      icon: <Bell className="h-4 w-4 text-wax-flower-500" />
    }
  ];

  const quickGuides = [
    {
      title: "Garden Basics",
      description: "Learn about different plants and garden elements you can unlock.",
      icon: <Leaf className="h-5 w-5" />
    },
    {
      title: "Habit Tracking",
      description: "Master the art of building and maintaining healthy habits.",
      icon: <Target className="h-5 w-5" />
    },
    {
      title: "Progress Tracking",
      description: "Understand your analytics and growth metrics.",
      icon: <Calendar className="h-5 w-5" />
    }
  ];

  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200 dark:text-wax-flower-100">Help & Support</h1>
          <p className="text-wax-flower-400 dark:text-wax-flower-300">Find answers and nurture your habit garden</p>
        </div>
      </div>

      {/* Quick Support */}
      <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
        <CardHeader>
          <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100 flex items-center gap-2">
            <Heart className="h-5 w-5 text-wax-flower-500" />
            Need Help?
          </CardTitle>
          <CardDescription className="text-wax-flower-400 dark:text-wax-flower-300">
            We're here to support your growth journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-wax-flower-300 dark:text-wax-flower-400">
            Our support team is ready to help you make the most of your habit tracking journey.
            If you can't find what you're looking for, reach out to us directly.
          </p>
          <div className="flex gap-4">
            <Button className="bg-wax-flower-500 hover:bg-wax-flower-600 text-white">
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline" className="border-wax-flower-200/20 dark:border-wax-flower-100/20 text-wax-flower-200 dark:text-wax-flower-100">
              <Video className="mr-2 h-4 w-4" />
              Video Tutorials
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickGuides.map((guide, index) => (
          <Card key={index} className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
            <CardHeader>
              <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100 flex items-center gap-2 text-lg">
                {guide.icon}
                {guide.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-wax-flower-400 dark:text-wax-flower-300 text-sm">
                {guide.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQs */}
      <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
        <CardHeader>
          <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100 flex items-center gap-2">
            <Book className="h-5 w-5 text-wax-flower-500" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription className="text-wax-flower-400 dark:text-wax-flower-300">
            Common questions about your Zen Garden journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
                <AccordionTrigger className="text-wax-flower-200 dark:text-wax-flower-100 hover:text-wax-flower-200">
                  <div className="flex items-center gap-2">
                    {faq.icon}
                    {faq.question}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-wax-flower-300 dark:text-wax-flower-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
        <CardHeader>
          <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100 flex items-center gap-2">
            <Coffee className="h-5 w-5 text-wax-flower-500" />
            Getting Started
          </CardTitle>
          <CardDescription className="text-wax-flower-400 dark:text-wax-flower-300">
            Your guide to cultivating healthy habits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-medium text-wax-flower-200 dark:text-wax-flower-100 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-wax-flower-500/20 text-wax-flower-500">1</div>
              Create Your First Habit
            </h3>
            <p className="text-sm text-wax-flower-300 dark:text-wax-flower-400 ml-8">
              Begin with a simple habit you want to cultivate. Set achievable goals and choose a frequency that fits your lifestyle.
              Remember, small steps lead to lasting change.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-wax-flower-200 dark:text-wax-flower-100 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-wax-flower-500/20 text-wax-flower-500">2</div>
              Track Daily Progress
            </h3>
            <p className="text-sm text-wax-flower-300 dark:text-wax-flower-400 ml-8">
              Check in daily to mark your habits as complete. Watch your garden flourish as you maintain your streaks.
              Each completed habit brings new life to your Zen Garden.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-wax-flower-200 dark:text-wax-flower-100 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-wax-flower-500/20 text-wax-flower-500">3</div>
              Review Your Growth
            </h3>
            <p className="text-sm text-wax-flower-300 dark:text-wax-flower-400 ml-8">
              Visit the Analytics page to track your progress over time. Identify patterns, celebrate achievements,
              and adjust your habits for optimal growth.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 