"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Camera, Globe, Moon, Sun, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    theme: 'light',
    gardenPreference: 'zen',
    notifications: true,
    timezone: 'UTC'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/profile`,
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProfile(response.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-wax-flower-200/20 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-wax-flower-200/20 rounded w-3/4"></div>
            <div className="h-4 bg-wax-flower-200/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

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
                {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-wax-flower-200 dark:text-wax-flower-100">First Name</Label>
                <Input
                  id="firstName" 
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  className="border-wax-flower-200/20 dark:border-wax-flower-100/20" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-wax-flower-200 dark:text-wax-flower-100">Last Name</Label>
                <Input
                  id="lastName" 
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  className="border-wax-flower-200/20 dark:border-wax-flower-100/20" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-wax-flower-200 dark:text-wax-flower-100">Email</Label>
              <Input
                id="email" 
                name="email"
                type="email" 
                value={profile.email}
                onChange={handleChange}
                className="border-wax-flower-200/20 dark:border-wax-flower-100/20" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-wax-flower-200 dark:text-wax-flower-100">Bio</Label>
              <Textarea 
                id="bio" 
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..." 
                className="border-wax-flower-200/20 dark:border-wax-flower-100/20 min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              className="bg-wax-flower-500 hover:bg-wax-flower-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
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