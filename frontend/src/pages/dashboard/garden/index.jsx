import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Leaf, Star, Trophy, Flower2, Target, Calendar } from 'lucide-react';
import DashboardLayout from "@/components/DashboardLayout";
import Garden3D from './components/Garden3D';

export default function Garden() {
  return (
    <div className="space-y-8 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200 dark:text-wax-flower-100">Your Zen Garden</h1>
          <p className="text-wax-flower-400 dark:text-wax-flower-300">Nurture your habits and watch your garden grow</p>
        </div>
      </div>

      {/* 3D Garden Canvas */}
      <Card className="">
        <Garden3D />
      </Card>

      {/* Garden Stats */}
      <BentoGrid>
        <BentoCard
          title="Garden Level"
          description="Your current garden level"
          header={
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-500 to-wax-flower-400">
                5
              </div>
              <div className="text-sm text-wax-flower-400">Level up in 3 days</div>
            </div>
          }
          icon={<Leaf className="h-6 w-6 text-wax-flower-500" />}
          background={<div className="absolute inset-0 -z-10 bg-gradient-to-br from-wax-flower-500/20 via-transparent to-transparent" />}
        />
        <BentoCard
          title="Active Plants"
          description="Number of plants in your garden"
          header={
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-500 to-wax-flower-400">
                12
              </div>
              <div className="text-sm text-wax-flower-400">3 new this week</div>
            </div>
          }
          icon={<Flower2 className="h-6 w-6 text-wax-flower-500" />}
          background={<div className="absolute inset-0 -z-10 bg-gradient-to-br from-wax-flower-500/20 via-transparent to-transparent" />}
        />
        <BentoCard
          title="Achievements"
          description="Garden achievements unlocked"
          header={
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-wax-flower-500 to-wax-flower-400">
                8
              </div>
              <div className="text-sm text-wax-flower-400">2 new this month</div>
            </div>
          }
          icon={<Trophy className="h-6 w-6 text-wax-flower-500" />}
          background={<div className="absolute inset-0 -z-10 bg-gradient-to-br from-wax-flower-500/20 via-transparent to-transparent" />}
        />
      </BentoGrid>
    </div>
  );
} 