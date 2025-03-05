"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import HeaderIcons from "../components/HeaderIcons";
import PasswordInput from "../components/PasswordInput";

// Helper functions
function pad(n) {
  return n < 10 ? "0" + n : n;
}
function isoFormatDMY(d) {
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
}
function formatLocalDateToISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Frequently used class name variables
const inputClass =
  "bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8] pr-10";
const containerClass =
  "col-span-4 col-start-2 w-full max-w-5xl relative bg-[rgba(180,177,177,0.05)] backdrop-blur-xl border-4 border-[rgba(95,30,151,0.2)] rounded-3xl shadow-2xl p-20 transition-all duration-300";
const overlayClass =
  "absolute inset-0 pointer-events-none rounded-2xl z-0 transition-all duration-300";

export default function Login() {
  const navigate = useNavigate();

  // Login only requires email and password
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Refs for border glow and overlay effects
  const gradientOverlayRef = useRef(null);
  const containerRef = useRef(null);

  // States for password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Toggle state for header icons based on password field focus
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Update login form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Focus/blur handlers for toggling header icons
  const handlePasswordFocus = () => {
    setIsPasswordFocused(true);
  };

  const handlePasswordBlur = () => {
    setIsPasswordFocused(false);
  };

  // Border glow and overlay effects
  const handleMouseMove = (event) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (containerRef.current) {
      const borderGradient = `radial-gradient(800px circle at ${x}px ${y}px, rgba(160,32,240,0.5), rgba(160,32,240,0.2) 40%, transparent 70%)`;
      containerRef.current.style.borderImage = `${borderGradient} 1 stretch`;
      containerRef.current.style.borderImageSlice = "1";
    }
    if (gradientOverlayRef.current) {
      gradientOverlayRef.current.style.opacity = 1;
      gradientOverlayRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(160,32,240,0.2), rgba(160,32,240,0.1) 50%, transparent 80%)`;
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.borderImage = "border";
      containerRef.current.style.transition = "border-image 1s ease-in-out";
    }
    if (gradientOverlayRef.current) {
      gradientOverlayRef.current.style.opacity = 0;
      gradientOverlayRef.current.style.background = "none";
      gradientOverlayRef.current.style.transition = "opacity 1s ease-in-out";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password!");
      return;
    }

    // You can add more validations as needed
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      console.log(response.data);
      navigate("/dashboard"); // or your landing page after login
    } catch (error) {
      console.error("Login error:", error.response?.data);
      setError(
        error.response?.data?.error ||
          "Unexpected error occurred during login"
      );
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 min-h-screen items-center px-4">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={containerClass}
      >
        <div
          ref={gradientOverlayRef}
          className={overlayClass}
          style={{ opacity: 0, background: "none" }}
        />
        <div className="relative z-10 text-white text-center max-w-lg mx-auto">
          {/* Render header icons (stacked cat icons that toggle based on password focus) */}
          <HeaderIcons isFocused={isPasswordFocused} />
          <h1 className="text-5xl font-bold mb-6 text-[#E0AAFF]">Login</h1>
          <p className="text-[#94A3B8] mb-10 text-lg">
            Enter your email and password to log in
          </p>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              required
            />
            <PasswordInput
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              show={showPassword}
              toggleShow={() => setShowPassword(!showPassword)}
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
            />
            <Button
              type="submit"
              className="w-full bg-[#a600c8] hover:bg-[#6A1B9A] text-white h-14 text-lg"
            >
              Login
            </Button>
          </form>
          <div className="space-y-4 mt-6">
            <p className="text-[#94A3B8] text-base">
              Create an account?{" "}
              <a href="/signup" className="text-[#a600c8] hover:underline">
                Sign Up
              </a>
            </p>  
            <p className="text-[#94A3B8] text-base">
              Forgot your password?{" "}
              <a href="/forgot-password" className="text-[#a600c8] hover:underline">
                Reset it
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
