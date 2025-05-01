"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Wallet, 
  Landmark, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  ChevronDown,
  MoreVertical,
  RefreshCw,
  BarChart2,
  PieChart as PieChartIcon,
  Calendar
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Legend
} from 'recharts';
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- MOCK DATA & HELPERS ---
const INITIAL_TRANSACTIONS = [
  { id: 1, type: "expense", category: "Groceries", amount: 85.42, date: "2024-04-28", description: "Weekly grocery shopping" },
  { id: 2, type: "expense", category: "Transportation", amount: 32.50, date: "2024-04-27", description: "Fuel refill" },
  { id: 3, type: "expense", category: "Entertainment", amount: 45.99, date: "2024-04-26", description: "Movie tickets" },
  { id: 4, type: "expense", category: "Utilities", amount: 120.75, date: "2024-04-25", description: "Electricity bill" },
  { id: 5, type: "saving", category: "Emergency Fund", amount: 200.00, date: "2024-04-24", description: "Monthly savings" },
  { id: 6, type: "saving", category: "Vacation", amount: 150.00, date: "2024-04-23", description: "Thailand trip savings" },
  { id: 7, type: "investment", category: "Index Fund", amount: 300.00, date: "2024-04-22", description: "NIFTY index fund" },
  { id: 8, type: "investment", category: "Crypto", amount: 75.00, date: "2024-04-21", description: "Bitcoin purchase" },
  { id: 9, type: "expense", category: "Dining Out", amount: 68.25, date: "2024-04-20", description: "Dinner with friends" },
  { id: 10, type: "expense", category: "Shopping", amount: 125.99, date: "2024-04-19", description: "New clothes" },
  { id: 11, type: "saving", category: "Home Downpayment", amount: 500.00, date: "2024-04-18", description: "Home loan savings" },
  { id: 12, type: "investment", category: "Tech Stocks", amount: 250.00, date: "2024-04-17", description: "Tech company shares" },
  { id: 13, type: "expense", category: "Groceries", amount: 92.35, date: "2024-04-16", description: "Monthly groceries" },
  { id: 14, type: "expense", category: "Healthcare", amount: 240.00, date: "2024-04-15", description: "Doctor visit" },
  { id: 15, type: "expense", category: "Transportation", amount: 28.75, date: "2024-04-14", description: "Cab ride" },
  { id: 16, type: "expense", category: "Utilities", amount: 85.00, date: "2024-04-13", description: "Internet bill" },
  { id: 17, type: "expense", category: "Shopping", amount: 180.50, date: "2024-04-12", description: "Home essentials" },
  { id: 18, type: "expense", category: "Dining Out", amount: 49.99, date: "2024-04-11", description: "Lunch with colleagues" },
  { id: 19, type: "saving", category: "Retirement", amount: 300.00, date: "2024-04-10", description: "Retirement fund" },
  { id: 20, type: "investment", category: "Real Estate", amount: 450.00, date: "2024-04-09", description: "REIT investment" },
];

// Color schemes matching Zen Garden theme
const COLORS = ["#FD6A3A", "#FF8C6B", "#36A2EB", "#4BC0C0", "#9966FF", "#FF9F40"];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(value);
};

// --- TRANSACTION FORM DIALOG ---
const TransactionFormDialog = ({ isOpen, onClose, onSubmit }) => {
  // Predefined categories sorted alphabetically for each type
  const categories = {
    expense: ["Dining Out", "Entertainment", "Groceries", "Healthcare", "Shopping", "Transportation", "Utilities"],
    saving: ["Emergency Fund", "Home Downpayment", "Retirement", "Vacation"],
    investment: ["Crypto", "Index Fund", "Real Estate", "Stocks", "Tech Stocks"],
  };
  
  const [formData, setFormData] = useState({
    type: "expense",
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (value) => {
    if (value === "new_category") {
      setShowNewCategory(true);
    } else {
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const handleNewCategorySubmit = () => {
    setFormData(prev => ({ ...prev, category: newCategory }));
    setShowNewCategory(false);
    setNewCategory("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.category && formData.amount) {
      onSubmit({
        ...formData,
        amount: Number.parseFloat(formData.amount),
      });
      
      setFormData({
        type: "expense",
        category: "",
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-wax-flower-900/95 border border-wax-flower-700/30 rounded-xl p-6 w-full max-w-md shadow-lg"
      >
        <div className="mb-4">
          <h2 className="text-xl font-bold text-wax-flower-200">Add New Transaction</h2>
          <p className="text-sm text-wax-flower-300">Record your financial activity</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-wax-flower-300 mb-1">Transaction Type</label>
            <div className="flex gap-2">
              {["expense", "saving", "investment"].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type, category: "" }))}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium border transition-colors",
                    formData.type === type 
                      ? "border-[#FD6A3A] bg-wax-flower-800/80 text-[#FD6A3A]" 
                      : "border-wax-flower-700/50 bg-wax-flower-950/40 text-wax-flower-400 hover:bg-wax-flower-900/80"
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-wax-flower-300 mb-1">Category</label>
            {showNewCategory ? (
              <div className="flex gap-2">
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all"
                  placeholder="Enter new category..."
                />
                <button
                  type="button"
                  onClick={handleNewCategorySubmit}
                  className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] hover:from-[#FF8C6B] hover:to-[#FD6A3A] transition-colors"
                >
                  Add
                </button>
              </div>
            ) : (
              <Select value={formData.category} onValueChange={handleCategorySelect}>
                <SelectTrigger className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-wax-flower-900/95 border border-wax-flower-700/30 rounded-lg text-wax-flower-200">
                  {categories[formData.type]?.sort().map((category) => (
                    <SelectItem key={category} value={category} className="hover:bg-wax-flower-800/50">
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="new_category" className="text-[#FD6A3A] hover:bg-wax-flower-800/50">
                    + Add New Category
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-wax-flower-300 mb-1">Description</label>
            <input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all"
              placeholder="Enter description..."
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-wax-flower-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wax-flower-400">₹</span>
              <input
                id="amount"
                name="amount"
                type="number"
                step="100"
                min="100"
                value={formData.amount}
                onChange={handleChange}
                className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg pl-8 pr-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all [&::-webkit-inner-spin-button]:w-6 [&::-webkit-inner-spin-button]:h-10 [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-inner-spin-button]:cursor-pointer [&::-webkit-inner-spin-button]:m-0"
                placeholder="0.00"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-wax-flower-300 mb-1">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-wax-flower-300 bg-wax-flower-950/40 border border-wax-flower-700/50 hover:bg-wax-flower-900/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-white bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] hover:from-[#FF8C6B] hover:to-[#FD6A3A] transition-colors"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- FINANCE SUMMARY CARDS ---
const FinanceSummaryCard = ({ title, amount, change, icon, color }) => {
  const isPositive = change > 0;
  
  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-5 hover:bg-wax-flower-900/80 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-wax-flower-300 text-sm font-medium">{title}</h3>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-xl font-bold text-wax-flower-200 mb-1">
        {formatCurrency(amount)}
      </div>
      <div className="flex items-center text-xs font-medium">
        {isPositive ? (
          <ArrowUpRight className={`h-3.5 w-3.5 mr-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`} />
        ) : (
          <ArrowDownRight className={`h-3.5 w-3.5 mr-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`} />
        )}
        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
          {isPositive ? '+' : ''}{change}% from last month
        </span>
      </div>
    </div>
  );
};

// --- EXPENSE BREAKDOWN ---
const ExpenseBreakdown = ({ data, showEditControls = false, showLimits = true }) => {
  const [categoryLimits, setCategoryLimits] = useState({
    "Groceries": 100,
    "Transportation": 50,
    "Entertainment": 80,
    "Utilities": 150,
    "Shopping": 200,
    "Dining Out": 100,
    "Healthcare": 300
  });
  
  const [editingLimit, setEditingLimit] = useState(null);
  const [newLimit, setNewLimit] = useState("");
  
  const GRADIENTS = [
    ["#FD6A3A", "#FF8C6B"],
    ["#36A2EB", "#4BC0C0"],
    ["#9966FF", "#C084FC"],
    ["#FF9F40", "#FFC107"],
    ["#E03C85", "#FF5CAA"],
    ["#4BC0C0", "#80E0E0"]
  ];
  
  const handleEditLimit = (category) => {
    setEditingLimit(category);
    setNewLimit(categoryLimits[category]?.toString() || "");
  };
  
  const handleSaveLimit = () => {
    if (editingLimit && newLimit) {
      setCategoryLimits({
        ...categoryLimits,
        [editingLimit]: parseFloat(newLimit)
      });
    }
    setEditingLimit(null);
  };
  
  // Calculate if spending is over limit
  const getSpendingStatus = (category, amount) => {
    const limit = categoryLimits[category] || 0;
    if (limit === 0) return "neutral";
    if (amount > limit) return "over";
    if (amount > limit * 0.8) return "warning";
    return "under";
  };
  
  // Get text color based on spending status
  const getStatusColor = (status) => {
    switch (status) {
      case "over": return "text-rose-400";
      case "warning": return "text-amber-400";
      case "under": return "text-emerald-400";
      default: return "text-wax-flower-300";
    }
  };
  
  // Add percentage calculation for each category
  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: Math.round((item.amount / totalAmount) * 100),
    status: getSpendingStatus(item.category, item.amount)
  }));
  
  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-wax-flower-200/95 p-3 rounded-lg shadow-lg border border-[#FD6A3A]/50 text-wax-flower-950">
          <p className="font-bold">{data.category}</p>
          <p className="font-medium">{formatCurrency(data.amount)}</p>
          <p className="text-sm text-wax-flower-900">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 hover:bg-wax-flower-900/80 transition-colors h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-[#FD6A3A]" />
          <h2 className="text-xl font-bold text-wax-flower-200">Expense Breakdown</h2>
        </div>
      </div>
      <p className="text-sm text-wax-flower-400 mb-4">Your spending by category</p>
      
      <div className="flex">
        <div className="w-1/2 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {GRADIENTS.map((gradient, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={gradient[0]} />
                    <stop offset="100%" stopColor={gradient[1]} />
                  </linearGradient>
                ))}
                <filter id="shadow" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FD6A3A" floodOpacity="0.5"/>
                </filter>
                <filter id="glow" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                innerRadius={45}
                outerRadius={80}
                paddingAngle={4}
                dataKey="amount"
                filter="url(#shadow)"
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#pieGradient${index % GRADIENTS.length})`} 
                    stroke="rgba(0, 0, 0, 0.1)"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="w-1/2 max-h-[260px] overflow-y-auto custom-scrollbar pr-2">
          <div className="space-y-3">
            {dataWithPercentage.map((item, index) => (
              <div key={index} className="bg-wax-flower-950/40 rounded-lg p-3 hover:bg-wax-flower-950/60 transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-wax-flower-200 text-base">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className={`${getStatusColor(item.status)} text-base font-medium`}>
                      {formatCurrency(item.amount)}
                    </span>
                    {showEditControls && (
                      <button
                        onClick={() => handleEditLimit(item.category)}
                        className="text-wax-flower-400 hover:text-[#FD6A3A] transition-colors p-1"
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-wax-flower-400">{item.percentage}% of total</span>
                  {showLimits && item.status !== "neutral" && (
                    <span className={getStatusColor(item.status)}>
                      {item.status === "over" 
                        ? `Exceeded by ${formatCurrency(item.amount - (categoryLimits[item.category] || 0))}` 
                        : item.status === "warning"
                          ? "Near limit"
                          : "Under limit"}
                    </span>
                  )}
                </div>
                
                {showLimits && (
                  <div className="relative h-2.5 bg-wax-flower-950/60 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        item.status === "over" 
                          ? "bg-gradient-to-r from-rose-600 to-rose-400" 
                          : item.status === "warning"
                            ? "bg-gradient-to-r from-amber-600 to-amber-400"
                            : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                      }`}
                      style={{ 
                        width: `${Math.min(
                          (item.amount / (categoryLimits[item.category] || item.amount * 1.2)) * 100, 
                          100
                        )}%` 
                      }}
                    />
                    {categoryLimits[item.category] > 0 && (
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-white"
                        style={{ 
                          left: `${Math.min(
                            (categoryLimits[item.category] / Math.max(item.amount, categoryLimits[item.category])) * 100, 
                            100
                          )}%`,
                          display: item.amount > categoryLimits[item.category] ? 'block' : 'none'
                        }}
                      />
                    )}
                  </div>
                )}
                
                {showEditControls && editingLimit === item.category && (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      value={newLimit}
                      onChange={(e) => setNewLimit(e.target.value)}
                      className="flex-1 bg-wax-flower-950/70 border border-wax-flower-700/50 rounded-lg px-2 py-1 text-sm text-wax-flower-200"
                      placeholder="Enter limit..."
                    />
                    <button
                      onClick={handleSaveLimit}
                      className="px-2 py-1 rounded-lg text-xs text-white bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B]"
                    >
                      Save
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MONTHLY TREND ---
const MonthlyTrend = () => {
  // Sample monthly data
  const data = [
    { month: "Jan", income: 3800, expenses: 3100 },
    { month: "Feb", income: 3600, expenses: 2800 },
    { month: "Mar", income: 4200, expenses: 3400 },
    { month: "Apr", income: 4000, expenses: 3300 },
    { month: "May", income: 4500, expenses: 3200 },
    { month: "Jun", income: 4300, expenses: 3100 },
  ];
  
  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 hover:bg-wax-flower-900/80 transition-colors h-full">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-5 w-5 text-[#FD6A3A]" />
        <h2 className="text-xl font-bold text-wax-flower-200">Monthly Trend</h2>
      </div>
      <p className="text-sm text-wax-flower-400 mb-6">Income vs Expenses</p>
      
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF8C6B" />
                <stop offset="100%" stopColor="#FD6A3A" />
              </linearGradient>
              <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4BC0C0" />
                <stop offset="100%" stopColor="#36A2EB" />
              </linearGradient>
              <filter id="barShadow" height="130%" y="-10%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
              </filter>
              <filter id="barGlow" height="300%" width="300%" x="-100%" y="-100%">
                <feGaussianBlur stdDeviation="3" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(253, 106, 58, 0.2)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#f0d9d0' }} 
              axisLine={{ stroke: 'rgba(253, 106, 58, 0.3)' }}
            />
            <YAxis 
              tick={{ fill: '#f0d9d0' }} 
              axisLine={{ stroke: 'rgba(253, 106, 58, 0.3)' }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), ""]} 
              contentStyle={{ 
                backgroundColor: 'rgba(240, 217, 208, 0.95)', 
                borderColor: 'rgba(253, 106, 58, 0.8)',
                borderRadius: '8px',
                color: '#441c11',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
              }}
              itemStyle={{ color: '#441c11' }}
              labelStyle={{ color: '#441c11', fontWeight: 'bold' }}
            />
            <Bar 
              dataKey="income" 
              name="Income" 
              fill="url(#incomeGradient)" 
              radius={[4, 4, 0, 0]} 
              filter="url(#barShadow)"
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="expenses" 
              name="Expenses" 
              fill="url(#expensesGradient)" 
              radius={[4, 4, 0, 0]} 
              filter="url(#barShadow)"
              animationBegin={300}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- SAVINGS GOALS ---
const SavingsGoals = ({ data, onAddGoal, onEditGoal, onDeleteGoal }) => {
  // Calculate percentages
  const goalsWithPercentage = data.map(goal => {
    const target = goal.targetAmount;
    const current = goal.currentAmount;
    const percentage = Math.min(Math.round((current / target) * 100), 100);
    return { ...goal, percentage };
  });
  
  const [activeMenu, setActiveMenu] = useState(null);
  
  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 hover:bg-wax-flower-900/80 transition-colors h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#FD6A3A]" />
          <h2 className="text-xl font-bold text-wax-flower-200">Savings Goals</h2>
        </div>
        <button
          onClick={onAddGoal}
          className="text-wax-flower-400 hover:text-[#FD6A3A] transition-colors p-1 rounded-full"
        >
          <Plus size={18} />
        </button>
      </div>
      <p className="text-sm text-wax-flower-400 mb-6">Track your progress</p>
      
      <div className="space-y-6">
        {goalsWithPercentage.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium text-wax-flower-200">{goal.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-wax-flower-300">
                  {formatCurrency(goal.currentAmount)} <span className="text-wax-flower-400">/ {formatCurrency(goal.targetAmount)}</span>
                </span>
                <div className="relative">
                  <button 
                    className="text-wax-flower-400 hover:text-[#FD6A3A] transition-colors"
                    onClick={() => setActiveMenu(activeMenu === goal.id ? null : goal.id)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeMenu === goal.id && (
                    <div className="absolute right-0 mt-1 bg-wax-flower-900/95 border border-wax-flower-700/30 rounded-lg shadow-lg p-2 z-10">
                      <button 
                        onClick={() => {
                          onEditGoal(goal.id);
                          setActiveMenu(null);
                        }}
                        className="text-left w-full px-3 py-1.5 text-sm text-wax-flower-200 hover:bg-wax-flower-800/50 rounded-md whitespace-nowrap"
                      >
                        Edit Goal
                      </button>
                      <button 
                        onClick={() => {
                          onDeleteGoal(goal.id);
                          setActiveMenu(null);
                        }}
                        className="text-left w-full px-3 py-1.5 text-sm text-rose-400 hover:bg-wax-flower-800/50 rounded-md whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="h-2.5 bg-wax-flower-950/60 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B]" 
                style={{ width: `${goal.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-wax-flower-400">Target date: {goal.targetDate}</span>
              <span className="text-[#FD6A3A] font-medium">{goal.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- NEW SAVINGS GOAL FORM ---
const NewSavingsGoalForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: ""
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount)
    });
  };
  
  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 hover:bg-wax-flower-900/80 transition-colors h-full">
      <h2 className="text-xl font-bold text-wax-flower-200 mb-4">Add New Savings Goal</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-wax-flower-300 mb-1">Goal Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all"
            placeholder="e.g. Vacation, Emergency Fund"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-wax-flower-300 mb-1">Target Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wax-flower-400">₹</span>
            <input
              name="targetAmount"
              type="number"
              value={formData.targetAmount}
              onChange={handleChange}
              className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg pl-8 pr-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-wax-flower-300 mb-1">Current Amount (if any)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-wax-flower-400">₹</span>
            <input
              name="currentAmount"
              type="number"
              value={formData.currentAmount}
              onChange={handleChange}
              className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg pl-8 pr-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-wax-flower-300 mb-1">Target Date</label>
          <input
            name="targetDate"
            type="date"
            value={formData.targetDate}
            onChange={handleChange}
            className="w-full bg-wax-flower-950/50 border border-wax-flower-700/50 rounded-lg px-4 py-2.5 text-wax-flower-200 placeholder:text-wax-flower-500/70 focus:ring-2 focus:ring-[#FD6A3A]/50 focus:border-[#FD6A3A] outline-none transition-all [color-scheme:dark]"
            required
          />
        </div>
        
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-wax-flower-300 bg-wax-flower-950/40 border border-wax-flower-700/50 hover:bg-wax-flower-900/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-lg text-white bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] hover:from-[#FF8C6B] hover:to-[#FD6A3A] transition-colors"
          >
            Add Goal
          </button>
        </div>
      </form>
    </div>
  );
};

// --- INVESTMENT TRANSACTIONS ---
const InvestmentTransactions = ({ transactions }) => {
  const filteredTransactions = transactions.filter(t => 
    t.type === 'investment'
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 hover:bg-wax-flower-900/80 transition-colors h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#FD6A3A]" />
          <h2 className="text-xl font-bold text-wax-flower-200">Investment Transactions</h2>
        </div>
      </div>
      <p className="text-sm text-wax-flower-400 mb-4">Your investment activity</p>
      
      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-wax-flower-950/40 hover:bg-wax-flower-950/60 transition-colors">
              <div className="flex items-center max-w-[70%]">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center mr-3 shadow-md bg-gradient-to-br from-purple-800/80 to-purple-900/80">
                  <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-wax-flower-200 truncate">
                    {transaction.category}
                    <span className="text-xs text-wax-flower-400 ml-2">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-sm text-wax-flower-300 truncate">
                    {transaction.description || 'No description'}
                  </p>
                </div>
              </div>
              <p className="font-medium text-emerald-400 whitespace-nowrap">
                +{formatCurrency(transaction.amount)}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-wax-flower-400">
            No investment transactions yet
          </div>
        )}
      </div>
    </div>
  );
};

// --- EXPENSE TREND ---
const ExpenseTrend = ({ transactions }) => {
  // Process transactions for line chart
  const processTransactionsByDate = () => {
    // Sort transactions by date
    const sortedTransactions = [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Group by date
    const groupedByDate = {};
    sortedTransactions.forEach(transaction => {
      if (!groupedByDate[transaction.date]) {
        groupedByDate[transaction.date] = 0;
      }
      groupedByDate[transaction.date] += transaction.amount;
    });
    
    // Convert to array format for chart
    return Object.keys(groupedByDate).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date,
      amount: groupedByDate[date],
      transactions: sortedTransactions.filter(t => t.date === date)
    }));
  };
  
  const expenseData = processTransactionsByDate();
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-wax-flower-200/95 p-3 rounded-lg shadow-lg border border-[#FD6A3A]/50 text-wax-flower-950 text-sm">
          <p className="font-bold mb-2">{data.date}</p>
          <p className="text-wax-flower-900 font-medium">Total: {formatCurrency(data.amount)}</p>
          <div className="mt-2 pt-2 border-t border-wax-flower-900/20">
            <p className="font-medium mb-1">Transactions:</p>
            <div className="max-h-[100px] overflow-y-auto">
              {data.transactions.map((t, i) => (
                <div key={i} className="text-xs mb-1">
                  <span className="font-medium">{t.category}:</span> {formatCurrency(t.amount)}
                  <p className="text-wax-flower-900/80 text-xs">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 hover:bg-wax-flower-900/80 transition-colors h-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-[#FD6A3A]" />
        <h2 className="text-xl font-bold text-wax-flower-200">Monthly Expense Trend</h2>
      </div>
      <p className="text-sm text-wax-flower-400 mb-6">Your daily spending pattern</p>
      
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={expenseData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="expenseLineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FD6A3A" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#FF8C6B" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="expenseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FD6A3A" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FF8C6B" stopOpacity={0.1} />
              </linearGradient>
              <filter id="lineShadow" height="200%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#FD6A3A" floodOpacity="0.5"/>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(253, 106, 58, 0.2)" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#f0d9d0' }} 
              axisLine={{ stroke: 'rgba(253, 106, 58, 0.3)' }}
            />
            <YAxis 
              tick={{ fill: '#f0d9d0' }} 
              axisLine={{ stroke: 'rgba(253, 106, 58, 0.3)' }}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="url(#expenseLineGradient)" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#FD6A3A', stroke: '#FD6A3A', strokeWidth: 1 }}
              activeDot={{ r: 6, fill: '#FF8C6B', stroke: '#fff', strokeWidth: 2 }}
              filter="url(#lineShadow)"
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              fill="url(#expenseAreaGradient)" 
              stroke={false}
              fillOpacity={1} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- RECENT TRANSACTIONS ---
const RecentTransactions = ({ transactions, limit = 10 }) => {
  const getIconByType = (type) => {
    switch (type) {
      case 'expense': return <ArrowDownRight className="h-5 w-5 text-rose-400" />;
      case 'saving': return <ArrowUpRight className="h-5 w-5 text-emerald-400" />;
      case 'investment': return <ArrowUpRight className="h-5 w-5 text-emerald-400" />;
      default: return <DollarSign className="h-5 w-5 text-blue-400" />;
    }
  };
  
  const getBgByType = (type) => {
    switch (type) {
      case 'expense': return 'bg-gradient-to-br from-rose-800/80 to-rose-900/80';
      case 'saving': return 'bg-gradient-to-br from-emerald-800/80 to-emerald-900/80';
      case 'investment': return 'bg-gradient-to-br from-purple-800/80 to-purple-900/80';
      default: return 'bg-gradient-to-br from-blue-800/80 to-blue-900/80';
    }
  };
  
  const getTextColorByType = (type) => {
    switch (type) {
      case 'expense': return 'text-rose-400';
      case 'saving': return 'text-emerald-400';
      case 'investment': return 'text-emerald-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="bg-wax-flower-900/70 rounded-xl border border-wax-flower-700/30 p-6 hover:bg-wax-flower-900/80 transition-colors h-[400px]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[#FD6A3A] font-bold text-lg">₹</span>
            <h2 className="text-xl font-bold text-wax-flower-200">Recent Transactions</h2>
          </div>
          <p className="text-sm text-wax-flower-400 mt-1">Your latest financial activities</p>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
        {transactions
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit)
          .map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-wax-flower-800/30 transition-colors">
              <div className="flex items-center max-w-[70%]">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 shadow-md ${getBgByType(transaction.type)}`}>
                  {getIconByType(transaction.type)}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-wax-flower-200 truncate">
                    {transaction.category}
                    <span className="text-xs text-wax-flower-400 ml-2">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="text-sm text-wax-flower-300 truncate">
                    {transaction.description || 'No description'}
                  </p>
                </div>
              </div>
              <p className={`font-medium ${getTextColorByType(transaction.type)} whitespace-nowrap`}>
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function FinanceTracker() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [savingsGoals, setSavingsGoals] = useState([
    { id: 1, name: 'Emergency Fund', currentAmount: 3200, targetAmount: 5000, targetDate: 'Dec 2024' },
    { id: 2, name: 'Vacation', currentAmount: 1500, targetAmount: 2500, targetDate: 'Aug 2024' },
    { id: 3, name: 'New Laptop', currentAmount: 800, targetAmount: 1800, targetDate: 'Oct 2024' },
  ]);

  // Calculate totals
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = transactions.filter(t => t.type === 'saving').reduce((sum, t) => sum + t.amount, 0);
  const totalInvestments = transactions.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);

  // Process data for charts
  const expenseData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category);
      if (existing) {
        existing.amount += t.amount;
      } else {
        acc.push({ category: t.category, amount: t.amount });
      }
      return acc;
    }, []);

  const handleAddTransaction = (newTransaction) => {
    setTransactions(prev => [
      { id: Date.now(), ...newTransaction },
      ...prev
    ]);
  };
  
  const handleAddSavingsGoal = (newGoal) => {
    setSavingsGoals(prev => [
      ...prev,
      { id: Date.now(), ...newGoal, targetDate: new Date(newGoal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }
    ]);
    setShowAddGoalForm(false);
  };
  
  const handleEditSavingsGoal = (goalId) => {
    // Would be implemented with a dialog to edit the goal
    console.log("Edit goal", goalId);
  };
  
  const handleDeleteSavingsGoal = (goalId) => {
    setSavingsGoals(prev => prev.filter(goal => goal.id !== goalId));
  };
  
  const handleTrackInvestment = (investmentData) => {
    // Add the investment data as a transaction
    handleAddTransaction({
      type: "investment",
      category: investmentData.type,
      amount: investmentData.amount,
      date: new Date().toISOString().split("T")[0],
      description: investmentData.notes || `${investmentData.type} investment`
    });
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <style jsx="true" global="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(42, 42, 42, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #FD6A3A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #fd825b;
        }
        
        /* Override date input styles */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(80%) sepia(30%) saturate(2000%) hue-rotate(350deg) brightness(120%);
          cursor: pointer;
        }
        
        input[type="date"] {
          color-scheme: dark;
        }
      `}</style>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-wax-flower-200">Finance Tracker</h1>
          <p className="text-base text-wax-flower-300">Manage your expenses, savings, and investments</p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="px-4 py-2 rounded-lg text-white bg-gradient-to-r from-[#FD6A3A] to-[#FF8C6B] hover:from-[#FF8C6B] hover:to-[#FD6A3A] transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <FinanceSummaryCard 
          title="Total Expenses" 
          amount={totalExpenses} 
          change={-8.5} 
          icon={<Wallet className="h-5 w-5 text-rose-400" />}
          color="bg-rose-950/50"
        />
        <FinanceSummaryCard 
          title="Total Savings" 
          amount={totalSavings} 
          change={12.3} 
          icon={<Landmark className="h-5 w-5 text-emerald-400" />}
          color="bg-emerald-950/50"
        />
        <FinanceSummaryCard 
          title="Total Investments" 
          amount={totalInvestments} 
          change={3.7} 
          icon={<TrendingUp className="h-5 w-5 text-purple-400" />}
          color="bg-purple-950/50"
        />
      </div>
      
      <div className="flex border-b border-wax-flower-700/30 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-2 font-medium text-sm relative",
            activeTab === 'overview' 
              ? "text-[#FD6A3A]" 
              : "text-wax-flower-400 hover:text-wax-flower-200"
          )}
        >
          Overview
          {activeTab === 'overview' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FD6A3A]"
              initial={false}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={cn(
            "px-4 py-2 font-medium text-sm relative",
            activeTab === 'expenses' 
              ? "text-[#FD6A3A]" 
              : "text-wax-flower-400 hover:text-wax-flower-200"
          )}
        >
          Expenses
          {activeTab === 'expenses' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FD6A3A]"
              initial={false}
            />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('savings');
            setShowAddGoalForm(false); // Reset form state when switching tabs
          }}
          className={cn(
            "px-4 py-2 font-medium text-sm relative",
            activeTab === 'savings' 
              ? "text-[#FD6A3A]" 
              : "text-wax-flower-400 hover:text-wax-flower-200"
          )}
        >
          Savings & Investments
          {activeTab === 'savings' && (
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FD6A3A]"
              initial={false}
            />
          )}
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MonthlyTrend />
              <ExpenseBreakdown data={expenseData} showEditControls={false} showLimits={false} />
            </div>
            <ExpenseTrend transactions={transactions} />
            <RecentTransactions transactions={transactions} limit={10} />
          </motion.div>
        )}
        
        {activeTab === 'expenses' && (
          <motion.div
            key="expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <ExpenseBreakdown data={expenseData} showEditControls={true} showLimits={true} />
            <ExpenseTrend transactions={transactions} />
            <RecentTransactions 
              transactions={transactions.filter(t => t.type === 'expense')} 
              limit={10} 
            />
          </motion.div>
        )}
        
        {activeTab === 'savings' && (
          <motion.div
            key="savings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {showAddGoalForm ? (
                <NewSavingsGoalForm 
                  onSubmit={handleAddSavingsGoal}
                  onCancel={() => setShowAddGoalForm(false)}
                />
              ) : (
                <SavingsGoals 
                  data={savingsGoals} 
                  onAddGoal={() => setShowAddGoalForm(true)}
                  onEditGoal={handleEditSavingsGoal}
                  onDeleteGoal={handleDeleteSavingsGoal}
                />
              )}
              <InvestmentTransactions transactions={transactions} />
            </div>
            <RecentTransactions 
              transactions={transactions.filter(t => t.type === 'saving' || t.type === 'investment')} 
              limit={10} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {dialogOpen && (
          <TransactionFormDialog 
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            onSubmit={handleAddTransaction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
