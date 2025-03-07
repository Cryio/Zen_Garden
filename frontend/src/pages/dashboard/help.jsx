import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Mail } from 'lucide-react';

export default function Help() {
  const faqs = [
    {
      question: "How do I create a new habit?",
      answer: "To create a new habit, go to the Habits page and click the 'Add New Habit' button. Fill in the habit details like name, frequency, and reminders, then click Save."
    },
    {
      question: "How does the garden grow?",
      answer: "Your garden grows based on your habit completion. Each completed habit contributes to your garden's growth. Maintain streaks to see your garden flourish!"
    },
    {
      question: "What are streaks?",
      answer: "Streaks are consecutive days of completing a habit. They help track your consistency and motivate you to maintain your habits. The longer your streak, the more points you earn!"
    },
    {
      question: "How do I track my progress?",
      answer: "Visit the Analytics page to see detailed statistics about your habits, including completion rates, streaks, and overall progress. You can also view your history in the Calendar view."
    },
    {
      question: "Can I customize notifications?",
      answer: "Yes! Go to Settings > Notifications to customize when and how you receive reminders for your habits. You can set up daily reminders and weekly progress summaries."
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Find answers and get assistance</p>
        </div>
      </div>

      {/* Quick Support */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Get in touch with our support team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We're here to help you make the most of your habit tracking journey.
            If you can't find what you're looking for, reach out to us directly.
          </p>
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions and answers</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Quick guide to using the app</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium">1. Create Your First Habit</h3>
            <p className="text-sm text-muted-foreground">
              Start by creating a simple habit you want to build. Set realistic goals and choose a frequency that works for you.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">2. Track Daily Progress</h3>
            <p className="text-sm text-muted-foreground">
              Check in daily to mark your habits as complete. Watch your garden grow as you maintain your streaks.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium">3. Review Your Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Visit the Analytics page to see your progress over time and identify areas for improvement.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 