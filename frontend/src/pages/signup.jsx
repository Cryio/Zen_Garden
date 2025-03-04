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
  SelectValue
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Helper functions using local date values
function pad(n) {
  return n < 10 ? "0" + n : n;
}

function isoFormatDMY(d) {
  return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear();
}

function formatLocalDateToISO(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function Signup() {
  const navigate = useNavigate();

  // Form state (dob is stored as ISO string, e.g. "2025-03-05")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: ""
  });

  // State for password strength and error messages
  const [passwordStrength, setPasswordStrength] = useState("");
  const [error, setError] = useState("");

  // Captcha state
  const [captcha, setCaptcha] = useState(generateCaptcha());

  // Refs for the gradient overlay and container (for border glow)
  const gradientOverlayRef = useRef(null);
  const containerRef = useRef(null);

  // Generate a complex CAPTCHA
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
      isVerified: false
    };
  }

  // Refresh captcha on mount
  useEffect(() => {
    setCaptcha(generateCaptcha());
  }, []);

  // Update password strength when the password changes
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
      isVerified: parseInt(userAnswer) === prev.correctAnswer
    }));
  };

  // Enhanced mouse move handler to create both border glow and card hover effect
  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Border glow effect
    if (containerRef.current) {
      const borderGradient = `radial-gradient(800px circle at ${x}px ${y}px, 
      rgba(160,32,240,0.5), 
      rgba(160,32,240,0.2) 40%, 
      transparent 70%)`;
      containerRef.current.style.borderImage = `${borderGradient} 1 stretch`;
      containerRef.current.style.borderImageSlice = '1';
    }

    // Card hover gradient overlay effect
    if (gradientOverlayRef.current) {
      gradientOverlayRef.current.style.opacity = 1;
      gradientOverlayRef.current.style.background = `radial-gradient(
        400px circle at ${x}px ${y}px, 
        rgba(160,32,240,0.1), 
        rgba(160,32,240,0.05) 50%, 
        transparent 80%
      )`;
    }
  };

  // Modified mouse leave to reset both effects
  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.borderImage = 'border';
      containerRef.current.style.transition = 'border-image 1s ease-in-out';
    }
    if (gradientOverlayRef.current) {
      gradientOverlayRef.current.style.opacity = 0;
      gradientOverlayRef.current.style.background = 'none';
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
      confirmPassword: formData.confirmPassword
    };

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

    if (!captcha.isVerified) {
      setError("Please complete the captcha verification!");
      return;
    }

    if (!trimmedData.dob) {
      setError("Please select your Date of Birth!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        {
          firstName: trimmedData.firstName,
          lastName: trimmedData.lastName,
          email: trimmedData.email,
          gender: trimmedData.gender,
          dob: trimmedData.dob,
          password: trimmedData.password
        }
      );
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error.response?.data);
      setError(
        error.response?.data?.error || "Unexpected error occurred during signup"
      );
    }
  };

  return (
    <div className="grid grid-cols-6 gap-4 min-h-screen items-center">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="col-span-4 col-start-2 w-full max-w-md relative bg-[rgba(180,177,177,0.05)] backdrop-blur-xl border-4 border-[rgba(95,30,151,0.2)] rounded-3xl shadow-2xl p-8 transition-all duration-300"
      >
        {/* Gradient overlay with dynamic positioning */}
        <div
          ref={gradientOverlayRef}
          className="absolute inset-0 pointer-events-none rounded-2xl z-0 transition-all duration-300"
          style={{ 
            opacity: 0,
            background: 'none'
          }}
        />
        {/* Form content */}
        <div className="relative z-10 text-white text-center">
          {/* Rest of the form remains the same as in the original code */}
          <h1 className="text-4xl font-bold mb-4 text-[#E0AAFF]">Sign Up</h1>
          <p className="text-[#94A3B8] mb-8 text-base">
            Enter your details to create a new account and get started
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-[rgba(126,34,206,0.2)] text-[#ffdee8] border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8]"
                required
              />
              <Input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-[rgba(126,34,206,0.2)] text-[#ffdee8] border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8]"
                required
              />
            </div>

            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="bg-[rgba(126,34,206,0.2)] text-[#ffdee8] border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8]"
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Input
                      type="text"
                      name="dob"
                      placeholder="Date of Birth"
                      value={
                        formData.dob ? isoFormatDMY(new Date(formData.dob)) : ""
                      }
                      readOnly
                      className="cursor-pointer bg-[rgba(126,34,206,0.2)] text-white border-none h-12 focus:ring-2 focus:ring-[#a600c8]"
                      required
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 bg-[rgba(126,34,206,0.5)] backdrop-blur-lg border border-[rgba(126,34,206,0.3)] rounded-lg shadow-lg">
                    <DatePicker
                      value={formData.dob ? new Date(formData.dob) : null}
                      onChange={(newDate) => {
                        const iso = newDate
                          ? formatLocalDateToISO(newDate)
                          : "";
                        setFormData((prev) => ({ ...prev, dob: iso }));
                      }}
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
                <SelectTrigger className="bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-[rgba(126,34,206,0.5)] backdrop-blur-lg border-none">
                  <SelectItem
                    value="male"
                    className="hover:bg-[rgba(126,34,206,0.3)] focus:bg-[rgba(126,34,206,0.3)] text-white"
                  >
                    Male
                  </SelectItem>
                  <SelectItem
                    value="female"
                    className="hover:bg-[rgba(126,34,206,0.3)] focus:bg-[rgba(126,34,206,0.3)] text-white"
                  >
                    Female
                  </SelectItem>
                  <SelectItem
                    value="other"
                    className="hover:bg-[rgba(126,34,206,0.3)] focus:bg-[rgba(126,34,206,0.3)] text-white"
                  >
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8]"
              required
            />

            {formData.password && (
              <div className="text-left text-sm">
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

            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8]"
              required
            />

            <div className="bg-[rgba(126,34,206,0.2)] p-3 rounded flex items-center justify-between">
              <span className="text-white">{captcha.challenge}</span>
              <Input
                type="text"
                placeholder="Your Answer"
                value={captcha.userAnswer}
                onChange={handleCaptchaChange}
                className="w-35 bg-[rgba(0,0,0,0.3)] text-[#a600c8] border-none h-10 text-center"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCaptcha(generateCaptcha())}
                className="text-[#94A3B8] hover:bg-[rgba(126,34,206,0.1)]"
              >
                Refresh
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#a600c8] hover:bg-[#6A1B9A] text-white h-12"
              disabled={!captcha.isVerified}
            >
              Create Account
            </Button>
          </form>

          <p className="text-[#94A3B8] mt-4 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-[#a600c8] ml-1 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
