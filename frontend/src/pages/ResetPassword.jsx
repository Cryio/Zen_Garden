"use client";

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!password || !confirmPassword) {
      setError("Please enter both passwords");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
        password
      });
      
      if (response.data.message) {
        setSuccess(true);
      } else {
        throw new Error("No response message received");
      }
    } catch (err) {
      console.error("Password reset error:", err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.details || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-6 gap-4 items-center px-4 relative">
      <AnimatedBackground />
      <div className={containerClass}>
        <div className={overlayClass} />
        <div className="relative z-10 text-wax-flower-200 text-center">
          <HeaderIcons isFocused={false} />
          
          {!success ? (
            <>
              <h1 className="text-4xl font-bold mb-4 text-wax-flower-200">Reset Password</h1>
              <p className="text-wax-flower-400 mb-8 text-base">
                Enter your new password below
              </p>
              {error && (
                <div className="mb-4">
                  <p className="text-wax-flower-600">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  required
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                  required
                />
                <Button 
                  type="submit" 
                  className={buttonClass}
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="text-wax-flower-500 text-5xl mb-6">✓</div>
              <h2 className="text-2xl font-semibold mb-4 text-wax-flower-200">Password Reset Successful</h2>
              <p className="text-wax-flower-400 mb-6">
                Your password has been successfully reset
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className={buttonClass}
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 