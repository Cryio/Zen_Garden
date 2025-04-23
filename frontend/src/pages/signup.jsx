"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import CaptchaComponent from "../components/CaptchaComponent";
import AnimatedBackground from "../components/AnimatedBackground";
import { Calendar } from "@/components/ui/calendar";
import { toast } from 'sonner';

// Helper functions and constants
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const years = Array.from(
  { length: new Date().getFullYear() - 1920 + 1 },
  (_, i) => (1920 + i).toString()
);

function pad(n) {
  return n < 10 ? "0" + n : n;
}
function isoFormatDMY(d) {
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
}
function formatLocalDateToISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Define your frequently used class names as variables
const inputClass =
  "bg-wax-flower-950/20 text-wax-flower-200 border-none h-12 placeholder-wax-flower-200 focus:ring-2 focus:ring-wax-flower-500 focus:ring-offset-2 focus:ring-offset-wax-flower-200 pr-10 w-full";
const containerClass =
  "col-span-4 col-start-2 w-full max-w-xl relative bg-wax-flower-950/5 backdrop-blur-xl border-2 border-wax-flower-800/20 rounded-3xl shadow-2xl p-8 transition-all duration-300";
const selectTriggerClass =
  "bg-wax-flower-950/20 text-wax-flower-200 border-none h-12 placeholder-wax-flower-200 focus:ring-2 focus:ring-wax-flower-500 focus:ring-offset-2 focus:ring-offset-wax-flower-200 w-full";
const buttonClass = 
  "w-full bg-wax-flower-500 hover:bg-wax-flower-600 text-white h-12 font-medium transition-colors focus:ring-2 focus:ring-wax-flower-500/50 focus:ring-offset-2 focus:ring-offset-wax-flower-950 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-wax-flower-500";
const googleButtonClass = 
  "w-full bg-transparent hover:bg-wax-flower-950/10 text-white h-12 font-medium border border-wax-flower-500/20 hover:border-wax-flower-500/40 transition-all focus:ring-2 focus:ring-wax-flower-500 focus:ring-offset-2 focus:ring-offset-wax-flower-950";
const overlayClass =
  "absolute inset-0 pointer-events-none rounded-3xl z-0 transition-all duration-300";
const actionLinkClass = "text-wax-flower-500 hover:text-wax-flower-400 hover:underline transition-colors";

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());

  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Refs for border glow and overlay effects
  const gradientOverlayRef = useRef(null);
  const containerRef = useRef(null);

  // States for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Toggle state for header icons based on password field focus
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operators = ["+", "-", "*"];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let correctAnswer;
    switch (operator) {
      case "+":
        correctAnswer = num1 + num2;
        break;
      case "-":
        correctAnswer = num1 - num2;
        break;
      case "*":
        correctAnswer = num1 * num2;
        break;
      default:
        correctAnswer = num1 + num2;
    }
    return {
      challenge: `${num1} ${operator} ${num2} = ?`,
      correctAnswer,
      userAnswer: "",
      isVerified: false,
    };
  }

  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  useEffect(() => {
    setPasswordStrength(computePasswordStrength(formData.password));
  }, [formData.password]);

  const computePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*#?&]/.test(password)) score++;
    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCaptchaChange = (e) => {
    const userAnswer = e.target.value;
    setCaptcha((prev) => ({
      ...prev,
      userAnswer,
      isVerified: parseInt(userAnswer) === prev.correctAnswer,
    }));
  };

  // Use the same focus/blur handlers for both password fields
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

    const trimmedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      gender: formData.gender,
      dob: formData.dob,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    for (const [key, value] of Object.entries(trimmedData)) {
      if (!value) {
        setError(`Please fill in the ${key.replace(/([A-Z])/g, " $1")}`);
        return;
      }
    }

    if (!emailRegex.test(trimmedData.email)) {
      setError("Please enter a valid email address!");
      return;
    }

    if (!passwordRegex.test(trimmedData.password)) {
      setError(
        "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character!"
      );
      return;
    }

    if (trimmedData.password !== trimmedData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!trimmedData.dob) {
      setError("Please select your Date of Birth!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          firstName: trimmedData.firstName,
          lastName: trimmedData.lastName,
          email: trimmedData.email,
          gender: trimmedData.gender,
          dob: trimmedData.dob,
          password: trimmedData.password
        }
      );

      if (response.data && response.data.token) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        
        // Store user data if needed
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Navigate to dashboard or home page
        navigate("/dashboard");
      } else {
        setError("Unexpected response from server");
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.error || "An error occurred during signup");
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response from server. Please try again later.");
      } else {
        // Something happened in setting up the request that triggered an Error
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  // Update currentMonth when month dropdown changes
  const handleMonthChange = (month) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(months.indexOf(month));
    setCurrentMonth(newDate);
    
    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      dobDate.setMonth(months.indexOf(month));
      setFormData(prev => ({ ...prev, dob: formatLocalDateToISO(dobDate) }));
    }
  };

  // Update currentMonth when year dropdown changes
  const handleYearChange = (year) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    setCurrentMonth(newDate);
    
    if (formData.dob) {
      const dobDate = new Date(formData.dob);
      dobDate.setFullYear(parseInt(year));
      setFormData(prev => ({ ...prev, dob: formatLocalDateToISO(dobDate) }));
    }
  };

  // Handle Google OAuth callback
  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setError('Google authentication failed. Please try again.');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      toast.success('Signup successful');
      navigate('/dashboard');
    }
  }, [searchParams, navigate]);

  // Handle Google signup
  const handleGoogleSignup = () => {
    // Clear any existing errors
    setError('');
    // Redirect to Google OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
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
        .datepicker-input:focus {
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
        <div ref={gradientOverlayRef} className={overlayClass} style={{ opacity: 0, background: "none" }} />
        <div className="relative z-10 text-wax-flower-200 text-center">
          <HeaderIcons isFocused={isPasswordFocused} />
          <h1 className="text-4xl font-bold mb-4 text-wax-flower-200">Sign Up</h1>
          <p className="text-wax-flower-400 mb-8 text-base">
            Enter your details to create a new account and get started
          </p>
          {error && (
            <Alert variant="destructive" className="mb-6 bg-wax-flower-500/10 text-wax-flower-400 border-wax-flower-500/20">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
                <Input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div>
                        <Input
                          type="text"
                          name="dob"
                          placeholder="Date of Birth"
                          value={formData.dob ? isoFormatDMY(new Date(formData.dob)) : ""}
                          readOnly
                          className={`${inputClass} cursor-pointer`}
                          required
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-auto p-2 bg-wax-flower-950/50 backdrop-blur-lg border border-wax-flower-500/20 rounded-lg shadow-lg">
                      <div className="flex space-x-4 mb-4">
                        <Select
                          value={currentMonth ? months[currentMonth.getMonth()] : undefined}
                          onValueChange={handleMonthChange}
                        >
                          <SelectTrigger className="w-[120px] bg-wax-flower-950/20 text-wax-flower-200">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem 
                                key={month} 
                                value={month}
                                className="text-wax-flower-200 hover:bg-wax-flower-500/20"
                              >
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={currentMonth ? currentMonth.getFullYear().toString() : undefined}
                          onValueChange={handleYearChange}
                        >
                          <SelectTrigger className="w-[120px] bg-wax-flower-950/20 text-wax-flower-200">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem 
                                key={year} 
                                value={year}
                                className="text-wax-flower-200 hover:bg-wax-flower-500/20"
                              >
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Calendar
                        mode="single"
                        selected={formData.dob ? new Date(formData.dob) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFormData(prev => ({ ...prev, dob: formatLocalDateToISO(date) }));
                            setCurrentMonth(date);
                          }
                        }}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        disabled={(date) => {
                          const today = new Date();
                          const minDate = new Date();
                          minDate.setFullYear(today.getFullYear() - 100);
                          return date > today || date < minDate;
                        }}
                        initialFocus
                        className="rounded-md border border-wax-flower-500/20"
                        showOutsideDays={false}
                        fixedWeeks
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Select
                  name="gender"
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, gender: value }))
                  }
                >
                  <SelectTrigger className={`${selectTriggerClass} focus:ring-2 focus:ring-wax-flower-500 focus:ring-offset-2`}>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-wax-flower-950/50 backdrop-blur-lg border-wax-flower-500/20">
                    <SelectItem
                      value="male"
                      className="hover:bg-wax-flower-500/20 focus:bg-wax-flower-500/20 text-wax-flower-200"
                    >
                      Male
                    </SelectItem>
                    <SelectItem
                      value="female"
                      className="hover:bg-wax-flower-500/20 focus:bg-wax-flower-500/20 text-wax-flower-200"
                    >
                      Female
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="hover:bg-wax-flower-500/20 focus:bg-wax-flower-500/20 text-wax-flower-200"
                    >
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
              <PasswordInput
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                show={showConfirmPassword}
                toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
              />
              {formData.password && (
                <div className="text-left text-sm text-wax-flower-200">
                  Password Strength:{" "}
                  <span
                    className={
                      formData.password.length < 8
                        ? "text-red-500"
                        : formData.password.length < 12
                        ? "text-yellow-500"
                        : "text-green-500"
                    }
                  >
                    {formData.password.length < 8
                      ? "Weak"
                      : formData.password.length < 12
                      ? "Medium"
                      : "Strong"}
                  </span>
                </div>
              )}
              <CaptchaComponent
                captcha={captcha}
                onChange={handleCaptchaChange}
                refreshCaptcha={() => setCaptcha(generateCaptcha())}
              />
            </div>
            <Button
              type="submit"
              className={buttonClass}
              disabled={!captcha.isVerified}
            >
              Create Account
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-[rgba(126,34,206,0.2)]" />
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
              onClick={handleGoogleSignup}
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
          <p className="text-wax-flower-400 mt-6 text-sm">
            Already have an account?{" "}
            <a href="/login" className={actionLinkClass}>
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
