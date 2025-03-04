import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function Signup() {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    sex: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

// Generate a CAPTCHA
const generateCaptcha = () => {
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
    }
  
    // Generate a random alphanumeric string (e.g., 'A1B3C')
    const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  
    return {
      challenge: `${randomString} | ${num1} ${operator} ${num2} = ?`,
      correctAnswer,
      userAnswer: "",
      isVerified: false,
    };
  };
  
  export default function Signup() {
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [formData, setFormData] = useState({});
  
    useEffect(() => {
      setCaptcha(generateCaptcha());
    }, []);
  
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
  
  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // More comprehensive validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    // Validation checks
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address!");
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      alert("Password must be at least 8 characters long, contain a letter, a number, and a special character!");
      return;
    }

    if (!captcha.isVerified) {
      alert("Please complete the captcha verification!");
      return;
    }

    // Proceed with signup
    console.log('Signup submitted', formData);
  };

  return (
    <div className="grid grid-cols-6 gap-4">
        <div className="col-span-4 col-start-2 w-full max-w-md bg-[rgba(180,177,177,0.05)] backdrop-blur-xl border border-[rgba(126,34,206,0.2)] rounded-2xl p-8 shadow-2xl p-4">        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4 text-[#E0AAFF]">Sign Up</h1>
          <p className="text-[#94A3B8] mb-8 text-base">
            Enter your details to create a new account and get started
          </p>
          
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
              <Select 
                name="sex"
                value={formData.sex}
                onValueChange={(value) => setFormData(prev => ({...prev, sex: value}))}
              >
                <SelectTrigger className="bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8]">
                  <SelectValue placeholder="Select Sex" />
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
              
              <Input 
                type="number" 
                name="age"
                placeholder="Age" 
                value={formData.age}
                onChange={handleChange}
                min="13"
                max="120"
                className="bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8]"
                required
              />
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
            
            <Input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-[rgba(126,34,206,0.2)] text-white border-none h-12 placeholder-[#94A3B8] focus:ring-2 focus:ring-[#a600c8]"
              required
            />
            
            {/* Simple Captcha Verification */}
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
                onClick={generateCaptcha}
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
            Already have an account? 
            <a href="/login" className="text-[#a600c8] ml-1 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}