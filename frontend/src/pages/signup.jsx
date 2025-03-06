"use client";

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

// Define your frequently used class names as variables
const inputClass =
  "bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8] pr-10";
const containerClass =
  "col-span-4 col-start-2 w-full max-w-2xl relative bg-[rgba(180,177,177,0.05)] backdrop-blur-xl border-4 border-[rgba(95,30,151,0.2)] rounded-3xl shadow-2xl p-12 transition-all duration-300";
const selectTriggerClass =
  "bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8]";
const overlayClass =
  "absolute inset-0 pointer-events-none rounded-2xl z-0 transition-all duration-300";

export default function Signup() {
  const navigate = useNavigate();

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

    const trimmedData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      gender: formData.gender,
      dob: formData.dob,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
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
          password: trimmedData.password,
        }
      );
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error.response?.data);
      setError(
        error.response?.data?.error ||
          "Unexpected error occurred during signup"
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
        <div ref={gradientOverlayRef} className={overlayClass} style={{ opacity: 0, background: "none" }} />
        <div className="relative z-10 text-white text-center max-w-xl mx-auto">
          <HeaderIcons isFocused={isPasswordFocused} />
          <h1 className="text-5xl font-bold mb-6 text-[#E0AAFF]">Sign Up</h1>
          <p className="text-[#94A3B8] mb-10 text-lg">
            Enter your details to create a new account and get started
          </p>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    <Input
                      type="text"
                      name="dob"
                      placeholder="Date of Birth"
                      value={formData.dob ? isoFormatDMY(new Date(formData.dob)) : ""}
                      readOnly
                      className={`${inputClass} cursor-pointer`}
                      required
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 bg-[rgba(126,34,206,0.5)] backdrop-blur-lg border border-[rgba(126,34,206,0.3)] rounded-lg shadow-lg">
                    <DatePicker
                      value={formData.dob ? new Date(formData.dob) : null}
                      onChange={(newDate) => {
                        const iso = newDate ? formatLocalDateToISO(newDate) : "";
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
                <SelectTrigger className={selectTriggerClass}>
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
            <CaptchaComponent
              captcha={captcha}
              onChange={handleCaptchaChange}
              refreshCaptcha={() => setCaptcha(generateCaptcha())}
            />
            <Button
              type="submit"
              className="w-full bg-[#a600c8] hover:bg-[#6A1B9A] text-white h-14 text-lg"
              disabled={!captcha.isVerified}
            >
              Create Account
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="bg-[rgba(126,34,206,0.2)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[rgba(180,177,177,0.05)] px-2 text-[#94A3B8]">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/5 hover:bg-white/10 text-white h-14 text-lg border-[rgba(126,34,206,0.2)]"
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
          <p className="text-[#94A3B8] mt-6 text-base">
            Already have an account?{" "}
            <a href="/login" className="text-[#a600c8] hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
