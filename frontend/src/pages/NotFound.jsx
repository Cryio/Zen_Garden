"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <AnimatedBackground />
      <div className="text-center space-y-6 relative z-10">
        <h1 className="text-8xl font-bold text-white">404</h1>
        <p className="text-2xl text-gray-300">Page Not Found</p>
        <p className="text-gray-400 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button 
          onClick={() => navigate('/')} 
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Go Back Home
        </Button>
      </div>
    </div>
  );
}
