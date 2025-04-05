import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Camera, Globe, Moon, Sun, User } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-6 space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200 dark:text-wax-flower-100">Settings</h1>
          <p className="text-wax-flower-400 dark:text-wax-flower-300">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile Settings */}
      <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
        <CardHeader>
          <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100">Profile Settings</CardTitle>
          <CardDescription className="text-wax-flower-400 dark:text-wax-flower-300">Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-wax-flower-200/20 dark:border-wax-flower-100/20">
              <AvatarImage src="/avatars/01.png" />
              <AvatarFallback className="bg-wax-flower-500/20 text-wax-flower-200 dark:text-wax-flower-100">
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" className="border-wax-flower-200/20 dark:border-wax-flower-100/20 text-wax-flower-200 dark:text-wax-flower-100 hover:bg-wax-flower-500/20">
                <Camera className="mr-2 h-4 w-4" />
                Change Avatar
              </Button>
              <p className="text-sm text-wax-flower-400 dark:text-wax-flower-300">Upload a new profile picture</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-wax-flower-200 dark:text-wax-flower-100">First Name</Label>
              <Input id="firstName" placeholder="Anmol" className="border-wax-flower-200/20 dark:border-wax-flower-100/20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-wax-flower-200 dark:text-wax-flower-100">Last Name</Label>
              <Input id="lastName" placeholder="Ranjan" className="border-wax-flower-200/20 dark:border-wax-flower-100/20" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-wax-flower-200 dark:text-wax-flower-100">Email</Label>
            <Input id="email" type="email" placeholder="anmol.ranjan@example.com" className="border-wax-flower-200/20 dark:border-wax-flower-100/20" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-wax-flower-200 dark:text-wax-flower-100">Bio</Label>
            <Textarea 
              id="bio" 
              placeholder="Tell us about yourself..." 
              className="border-wax-flower-200/20 dark:border-wax-flower-100/20 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-wax-flower-200 dark:text-wax-flower-100">Timezone</Label>
            <Select>
              <SelectTrigger className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utc">UTC</SelectItem>
                <SelectItem value="est">Eastern Time</SelectItem>
                <SelectItem value="pst">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button className="bg-wax-flower-500 hover:bg-wax-flower-600 text-white">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Garden Preferences */}
      <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
        <CardHeader>
          <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100">Garden Preferences</CardTitle>
          <CardDescription className="text-wax-flower-400 dark:text-wax-flower-300">Customize your Zen Garden experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-wax-flower-200 dark:text-wax-flower-100">Garden Theme</Label>
              <p className="text-sm text-wax-flower-400 dark:text-wax-flower-300">
                Choose your preferred garden theme
              </p>
            </div>
            <Select defaultValue="spring">
              <SelectTrigger className="w-[180px] border-wax-flower-200/20 dark:border-wax-flower-100/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spring">Spring Garden</SelectItem>
                <SelectItem value="summer">Summer Garden</SelectItem>
                <SelectItem value="autumn">Autumn Garden</SelectItem>
                <SelectItem value="winter">Winter Garden</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-wax-flower-200 dark:text-wax-flower-100">Garden Size</Label>
              <p className="text-sm text-wax-flower-400 dark:text-wax-flower-300">
                Adjust your garden's size
              </p>
            </div>
            <Select defaultValue="medium">
              <SelectTrigger className="w-[180px] border-wax-flower-200/20 dark:border-wax-flower-100/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
        <CardHeader>
          <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100">Notifications</CardTitle>
          <CardDescription className="text-wax-flower-400 dark:text-wax-flower-300">Configure how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-wax-flower-200 dark:text-wax-flower-100">Daily Reminders</Label>
              <p className="text-sm text-wax-flower-400 dark:text-wax-flower-300">
                Receive daily notifications for your habits
              </p>
            </div>
            <Switch className="data-[state=checked]:bg-wax-flower-500" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-wax-flower-200 dark:text-wax-flower-100">Weekly Summary</Label>
              <p className="text-sm text-wax-flower-400 dark:text-wax-flower-300">
                Get a weekly report of your progress
              </p>
            </div>
            <Switch className="data-[state=checked]:bg-wax-flower-500" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-wax-flower-200 dark:text-wax-flower-100">Garden Milestones</Label>
              <p className="text-sm text-wax-flower-400 dark:text-wax-flower-300">
                Get notified when you reach garden milestones
              </p>
            </div>
            <Switch className="data-[state=checked]:bg-wax-flower-500" />
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="border-wax-flower-200/20 dark:border-wax-flower-100/20">
        <CardHeader>
          <CardTitle className="text-wax-flower-200 dark:text-wax-flower-100">Theme Settings</CardTitle>
          <CardDescription className="text-wax-flower-400 dark:text-wax-flower-300">Customize your app appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-wax-flower-200 dark:text-wax-flower-100">Dark Mode</Label>
              <p className="text-sm text-wax-flower-400 dark:text-wax-flower-300">
                Toggle dark mode theme
              </p>
            </div>
            <Switch className="data-[state=checked]:bg-wax-flower-500" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-wax-flower-200 dark:text-wax-flower-100">Color Scheme</Label>
              <p className="text-sm text-wax-flower-400 dark:text-wax-flower-300">
                Choose your preferred color scheme
              </p>
            </div>
            <Select defaultValue="wax-flower">
              <SelectTrigger className="w-[180px] border-wax-flower-200/20 dark:border-wax-flower-100/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wax-flower">Wax Flower</SelectItem>
                <SelectItem value="sakura">Sakura</SelectItem>
                <SelectItem value="lotus">Lotus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200/20">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-red-400/70">Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-red-400">Delete Account</Label>
            <p className="text-sm text-red-400/70">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive" className="bg-red-500 hover:bg-red-600">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 