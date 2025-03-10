"use client";

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import HeaderIcons from "../components/HeaderIcons";
import PasswordInput from "../components/PasswordInput";
import AnimatedBackground from "../components/AnimatedBackground";

// Frequently used class name variables
const inputClass =
  "bg-wax-flower-950/20 text-wax-flower-200 h-10 placeholder-wax-flower-200 border-none focus:ring-0 focus:ring-offset-2 focus:ring-offset-wax-flower-200 pr-10 w-full";
const containerClass =
  "col-span-4 col-start-2 w-full max-w-md relative bg-wax-flower-950/5 backdrop-blur-xl border-2 border-wax-flower-800/20 rounded-3xl shadow-2xl p-8 transition-all duration-300";
const buttonClass = 
  "w-full bg-wax-flower-500 hover:bg-wax-flower-600 text-white h-12 font-medium transition-colors focus:ring-2 focus:ring-wax-flower-500/50 focus:ring-offset-2 focus:ring-offset-wax-flower-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-wax-flower-500";
const googleButtonClass = 
  "w-full bg-transparent hover:bg-wax-flower-950/10 text-white h-12 font-medium border border-wax-flower-500/20 hover:border-wax-flower-500/40 transition-all focus:ring-2 focus:ring-wax-flower-500 focus:ring-offset-2 focus:ring-offset-wax-flower-950";
const overlayClass =
  "absolute inset-0 pointer-events-none rounded-3xl z-0 transition-all duration-300";
const actionLinkClass = "text-wax-flower-500 hover:text-wax-flower-400 hover:underline transition-colors";

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

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      console.log(response.data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data);
      setError(
        error.response?.data?.error ||
          "Unexpected error occurred during login"
      );
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-6 gap-4 items-center px-4 relative overflow-hidden">
      <AnimatedBackground />
      <style jsx>{`
        a {
          font-weight: 500;
          color: var(--wax-flower-500);
          text-decoration: inherit;
          transition: color 0.2s ease;
        }
        a:hover {
          color: var(--wax-flower-600);
        }
        button:focus,
        button:focus-visible {
          outline: none;
        }
        select:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgb(var(--wax-flower-500));
        }
        input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgb(var(--wax-flower-500));
        }
      `}</style>
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
        <div className="relative z-10 text-wax-flower-200 text-center">
          <HeaderIcons isFocused={isPasswordFocused} />
          <h1 className="text-4xl font-bold mb-4 text-wax-flower-200">Login</h1>
          <p className="text-wax-flower-400 mb-8 text-base">
            Enter your email and password to log in
          </p>
          {error && (
            <Alert variant="destructive" className="mb-6 bg-wax-flower-500/10 text-wax-flower-400 border-wax-flower-500/20">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
            </div>
            <Button
              type="submit"
              className={buttonClass}
            >
              Login
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-wax-flower-950/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-wax-flower-950/5 px-2 text-wax-flower-400">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className={googleButtonClass}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </form>
          <div className="space-y-3 mt-6">
            <p className="text-wax-flower-400 text-sm">
              Create an account?{" "}
              <a href="/signup" className={actionLinkClass}>
                Sign Up
              </a>
            </p>
            <p className="text-wax-flower-400 text-sm">
              Forgot your password?{" "}
              <a href="/forgot-password" className={actionLinkClass}>
                Reset it
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
