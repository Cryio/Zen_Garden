import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Leaf, Star, Trophy } from 'lucide-react';
import DashboardLayout from './layout';

export default function Garden() {
  // Mock data for garden achievements
  const achievements = [
    { name: "Early Bird", description: "Complete morning routine for 7 days", progress: 5, total: 7, icon: <Star className="w-4 h-4" /> },
    { name: "Green Thumb", description: "Grow 10 flowers in your garden", progress: 8, total: 10, icon: <Leaf className="w-4 h-4" /> },
    { name: "Consistency King", description: "30-day streak", progress: 12, total: 30, icon: <Trophy className="w-4 h-4" /> },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    {achievement.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    {achievement.progress}/{achievement.total}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 