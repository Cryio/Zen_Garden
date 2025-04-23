import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error:', error);
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', error.response.data);
      throw error;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please try again later.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      throw error;
    }
  }
);

// Habit-related API calls
const habitApi = {
  // Get all goals for a user
  getGoals: async (userId) => {
    try {
      const response = await api.get(`/api/habits/${userId}/habits`);
      return response;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  },

  // Create a new goal
  createGoal: async (userId, goalData) => {
    try {
      const response = await api.post(`/api/habits/${userId}/habits`, goalData);
      return response;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  },

  // Create a new habit
  createHabit: async (userId, goalId, habitData) => {
    try {
      const response = await api.post(`/api/habits/${userId}/habits/${goalId}`, habitData);
      return response;
    } catch (error) {
      console.error('Error creating habit:', error);
      throw error;
    }
  },

  // Update habit completion status
  updateHabitCompletion: async (userId, goalId, habitId, completed) => {
    try {
      const response = await api.put(`/api/habits/${userId}/habits/${habitId}`, {
        completed,
        goalId
      });
      return response;
    } catch (error) {
      console.error('Error updating habit completion:', error);
      throw error;
    }
  },

  // Update user stats
  updateStats: async (userId, stats) => {
    try {
      const response = await api.put(`/habits/${userId}/stats`, stats);
      return response;
    } catch (error) {
      console.error('Error updating stats:', error);
      throw error;
    }
  },

  // Update goal
  updateGoal: async (userId, goalId, goalData) => {
    try {
      const response = await api.put(`/api/habits/${userId}/habits/${goalId}`, goalData);
      return response;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  },

  // Delete goal
  deleteGoal: async (userId, goalId) => {
    try {
      const response = await api.delete(`/api/habits/${userId}/habits/${goalId}`);
      return response;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  },

  // Update a habit
  updateHabit: async (userId, goalId, habitId, habitData) => {
    try {
      const response = await api.put(`/habits/${userId}/goals/${goalId}/habits/${habitId}`, habitData);
      return response;
    } catch (error) {
      console.error('Error updating habit:', error);
      throw error;
    }
  },

  // Delete habit
  deleteHabit: async (userId, goalId, habitId) => {
    try {
      const response = await api.delete(`/api/habits/${userId}/habits/${goalId}/${habitId}`);
      return response;
    } catch (error) {
      console.error('Error deleting habit:', error);
      throw error;
    }
  },

  // Focus Mode API calls
  createFocusSession: async (sessionData) => {
    try {
      const response = await api.post(`/api/focus/${sessionData.userId}/focus`, {
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        duration: sessionData.duration,
        habitId: sessionData.habitId,
        type: sessionData.type,
        completed: sessionData.completed,
        interruptions: sessionData.interruptions,
        notes: sessionData.notes
      });
      return response;
    } catch (error) {
      console.error('Error creating focus session:', error);
      throw error;
    }
  },

  getFocusSessions: async (userId) => {
    try {
      const response = await api.get(`/api/focus/${userId}/focus`);
      return response;
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
      throw error;
    }
  },

  updateFocusSession: async (userId, sessionId, sessionData) => {
    try {
      const response = await api.put(`/api/focus/${userId}/focus/${sessionId}`, sessionData);
      return response;
    } catch (error) {
      console.error('Error updating focus session:', error);
      throw error;
    }
  },

  getFocusStats: async (userId, timeframe = 'week') => {
    try {
      const response = await api.get(`/api/focus/${userId}/focus/stats?timeframe=${timeframe}`);
      return response;
    } catch (error) {
      console.error('Error fetching focus stats:', error);
      throw error;
    }
  },
};

export { api, habitApi };
  