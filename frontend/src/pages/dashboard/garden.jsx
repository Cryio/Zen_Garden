import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Leaf, Star, Trophy, Flower2, Target, Calendar } from 'lucide-react';
import DashboardLayout from './layout';

export default function Garden() {
  // Mock data for garden achievements
  const achievements = [
    {
      title: "Early Bird",
      description: "Complete morning routine for 7 days",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">5/7</div>
          <div className="text-sm text-yellow-500">In Progress</div>
        </div>
      ),
      icon: <Star className="h-4 w-4 text-primary" />,
    },
    {
      title: "Green Thumb",
      description: "Grow 10 flowers in your garden",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">8/10</div>
          <div className="text-sm text-green-500">Almost there!</div>
        </div>
      ),
      icon: <Leaf className="h-4 w-4 text-primary" />,
    },
    {
      title: "Consistency King",
      description: "30-day streak",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">12/30</div>
          <div className="text-sm text-muted-foreground">Long way to go</div>
        </div>
      ),
      icon: <Trophy className="h-4 w-4 text-primary" />,
    },
    {
      title: "Garden Master",
      description: "Unlock all garden features",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">3/5</div>
          <div className="text-sm text-blue-500">In Progress</div>
        </div>
      ),
      icon: <Flower2 className="h-4 w-4 text-primary" />,
    },
    {
      title: "Habit Hero",
      description: "Complete 50 habits in a month",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">32/50</div>
          <div className="text-sm text-green-500">On track</div>
        </div>
      ),
      icon: <Target className="h-4 w-4 text-primary" />,
    },
    {
      title: "Time Master",
      description: "Maintain a 90% completion rate for 2 weeks",
      header: (
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">85%</div>
          <div className="text-sm text-yellow-500">Almost there</div>
        </div>
      ),
      icon: <Calendar className="h-4 w-4 text-primary" />,
    },
  ];

  // Mock data for garden items
  const gardenItems = [
    { name: "Rose", rarity: "rare", count: 2 },
    { name: "Daisy", rarity: "common", count: 5 },
    { name: "Tulip", rarity: "uncommon", count: 3 },
    { name: "Orchid", rarity: "epic", count: 1 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-in">
        {/* Garden Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Your Zen Garden</h1>
            <p className="text-muted-foreground">Watch your habits bloom into beautiful flowers</p>
          </div>
          <div className="flex gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plants</SelectItem>
                <SelectItem value="common">Common</SelectItem>
                <SelectItem value="rare">Rare</SelectItem>
                <SelectItem value="epic">Epic</SelectItem>
              </SelectContent>
            </Select>
            <Button>Plant New Seed</Button>
          </div>
        </div>

        {/* Garden View */}
        <Card className="p-6">
          <Tabs defaultValue="grid" className="space-y-6">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-6">
              {/* Garden Grid */}
              <div className="garden-grid h-[400px]">
                {Array.from({ length: 70 }).map((_, i) => (
                  <div
                    key={i}
                    className={`garden-cell ${
                      Math.random() > 0.5
                        ? ['activity-none', 'activity-low', 'activity-medium', 'activity-high', 'activity-max'][
                            Math.floor(Math.random() * 5)
                          ]
                        : 'activity-none'
                    }`}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {gardenItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.rarity === 'epic' ? 'bg-purple-500/20' :
                        item.rarity === 'rare' ? 'bg-blue-500/20' :
                        item.rarity === 'uncommon' ? 'bg-green-500/20' :
                        'bg-gray-500/20'
                      }`}>
                        <Leaf className={`w-6 h-6 ${
                          item.rarity === 'epic' ? 'text-purple-500' :
                          item.rarity === 'rare' ? 'text-blue-500' :
                          item.rarity === 'uncommon' ? 'text-green-500' :
                          'text-gray-500'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{item.rarity}</p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Count: {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Achievements */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Garden Achievements</h2>
          <BentoGrid className="px-4">
            {achievements.map((achievement, i) => (
              <BentoCard
                key={i}
                title={achievement.title}
                description={achievement.description}
                header={achievement.header}
                icon={achievement.icon}
                className={i === 3 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </DashboardLayout>
  );
} 