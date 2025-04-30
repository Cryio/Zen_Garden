"use client";

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HeaderIcons from "../components/HeaderIcons";
import AnimatedBackground from "../components/AnimatedBackground";

// Frequently used class names as variables
const inputClass =
  "bg-wax-flower-950/20 text-wax-flower-200 border-none h-12 placeholder-wax-flower-200 focus:ring-2 focus:ring-wax-flower-500 focus:ring-offset-2 focus:ring-offset-wax-flower-200 pr-10 w-full";
const containerClass =
  "col-span-4 col-start-2 w-full max-w-md relative bg-wax-flower-950/5 backdrop-blur-xl border-2 border-wax-flower-800/20 rounded-3xl shadow-2xl p-8 transition-all duration-300";
const overlayClass =
  "absolute inset-0 pointer-events-none rounded-2xl z-0 transition-all duration-300";
const buttonClass = 
  "w-full bg-wax-flower-500 hover:bg-wax-flower-600 text-white h-12 font-medium transition-colors focus:ring-2 focus:ring-wax-flower-500/50 focus:ring-offset-2 focus:ring-offset-wax-flower-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-wax-flower-500";
const actionLinkClass = "text-wax-flower-500 hover:text-wax-flower-400 hover:underline transition-colors";

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
      const borderGradient = `radial-gradient(800px circle at ${x}px ${y}px, rgba(220, 38, 38, 0.7), rgba(185, 28, 28, 0.3) 40%, transparent 70%)`;
      containerRef.current.style.borderImage = `${borderGradient} 1 stretch`;
      containerRef.current.style.borderImageSlice = "1";
    }
    if (gradientOverlayRef.current) {
      gradientOverlayRef.current.style.opacity = 1;
      gradientOverlayRef.current.style.background = `radial-gradient(400px circle at ${x}px ${y}px, rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.1) 50%, transparent 80%)`;
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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        email: email
      });
      
      if (response.data.message) {
        setSuccess(true);
      } else {
        throw new Error("No response message received");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.response?.data?.error || "Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-6 gap-4 items-center px-4 relative">
      <AnimatedBackground />
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={containerClass}
      >
        <div ref={gradientOverlayRef} className={overlayClass} style={{ opacity: 0, background: "none" }} />
        <div className="relative z-10 text-wax-flower-200 text-center">
          <HeaderIcons isFocused={false} />
          
          {!success ? (
            <>
              <h1 className="text-4xl font-bold mb-4 text-wax-flower-200">Forgot Password</h1>
              <p className="text-wax-flower-400 mb-8 text-base">
                Enter your email address and we'll send you instructions to reset your password
              </p>
              {error && (
                <div className="mb-4">
                  <p className="text-wax-flower-600">{error}</p>
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
                  className={buttonClass}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
              <p className="text-wax-flower-400 mt-4 text-sm">
                Remember your password?{" "}
                <a href="/login" className={actionLinkClass}>
                  Login here
                </a>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="text-wax-flower-500 text-5xl mb-6">✓</div>
              <h2 className="text-2xl font-semibold mb-4 text-wax-flower-200">Check Your Email</h2>
              <p className="text-wax-flower-400 mb-6">
                We've sent password reset instructions to {email}
              </p>
              <a
                href="/login"
                className={actionLinkClass}
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
