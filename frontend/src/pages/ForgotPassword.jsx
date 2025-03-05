"use client";

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HeaderIcons from "../components/HeaderIcons";

// Frequently used class names as variables
const inputClass =
  "bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8] pr-10";
const containerClass =
  "col-span-4 col-start-2 w-full max-w-md relative bg-[rgba(180,177,177,0.05)] backdrop-blur-xl border-4 border-[rgba(95,30,151,0.2)] rounded-3xl shadow-2xl p-8 transition-all duration-300";
const overlayClass =
  "absolute inset-0 pointer-events-none rounded-2xl z-0 transition-all duration-300";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for border glow and overlay effects
  const gradientOverlayRef = useRef(null);
  const containerRef = useRef(null);

  // Border glow and overlay effects for the card
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
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Replace with your actual API endpoint
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: email
      });
      setSuccess(true);
    } catch (err) {
      console.error("Password reset error:", err.response?.data);
      setError(err.response?.data?.error || "Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 min-h-screen items-center">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={containerClass}
      >
        <div ref={gradientOverlayRef} className={overlayClass} style={{ opacity: 0, background: "none" }} />
        <div className="relative z-10 text-white text-center">
          <HeaderIcons isFocused={false} />
          
          {!success ? (
            <>
              <h1 className="text-4xl font-bold mb-4 text-[#E0AAFF]">Forgot Password</h1>
              <p className="text-[#94A3B8] mb-8 text-base">
                Enter your email address and we'll send you instructions to reset your password
              </p>
              {error && (
                <div className="mb-4">
                  <p className="text-red-500">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  required
                />
                <Button 
                  type="submit" 
                  className="w-full bg-[#a600c8] hover:bg-[#6A1B9A] text-white h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
              <p className="text-[#94A3B8] mt-4 text-sm">
                Remember your password?{" "}
                <a href="/login" className="text-[#a600c8] hover:underline">
                  Login here
                </a>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="text-[#a600c8] text-5xl mb-6">✓</div>
              <h2 className="text-2xl font-semibold mb-4 text-[#E0AAFF]">Check Your Email</h2>
              <p className="text-[#94A3B8] mb-6">
                We've sent password reset instructions to {email}
              </p>
              <a
                href="/login"
                className="text-[#a600c8] hover:underline"
              >
                Back to Login
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
