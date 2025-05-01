# Zen Garden

Zen Garden is a modern, feature-rich habit tracking application that helps users build and maintain positive habits through an engaging and interactive interface. The application combines powerful habit tracking features with a beautiful UI and advanced features like focus mode and detailed analytics.

## Features

### Core Features
- **Habit Tracking**
  - Create and manage multiple habits
  - Group habits under goals
  - Daily, weekly, and monthly tracking
  - Streak tracking and progress visualization
  - Completion history and statistics

- **Monthly Overview**
  - Interactive calendar view
  - Color-coded completion status
  - Month-to-month navigation
  - Detailed daily completion statistics

- **Focus Mode (Pomodoro Timer)**
  - Customizable timer durations
  - Session tracking and statistics
  - Break management
  - Interruption tracking
  - Background music controls

- **Analytics Dashboard**
  - Comprehensive progress tracking
  - Visual statistics and trends
  - Streak analytics
  - Goal completion rates
  - Daily, weekly, and monthly views

### Additional Features
- **User Authentication**
  - Secure login/signup system
  - JWT-based authentication
  - Password recovery
  - Session management

- **Goal Management**
  - Create and track multiple goals
  - Progress visualization
  - Habit grouping under goals
  - Goal completion statistics

- **3D Garden Visualization**
  - Interactive garden that evolves with habit completion
  - Visual progress indicators
  - Achievement tracking
  - Progress celebrations

## Technology Stack

### Backend
- **Core**:
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT for authentication

- **Features**:
  - RESTful API architecture
  - Secure password hashing
  - Session management
  - Data validation

### Frontend
- **Core**:
  - React 18
  - Vite (for fast development and building)
  - React Router (for navigation)
  - Framer Motion (for animations)

- **UI/Styling**:
  - Tailwind CSS
  - Radix UI components
  - Lucide React icons
  - Custom UI components
  - React Three Fiber (for 3D graphics)

- **State Management & API**:
  - Context API for global state
  - Axios for API requests
  - JWT for authentication

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Cryio/Zen_Garden.git
   cd Zen_Garden
   ```

2. **Install Dependencies**
   
   Frontend:
   ```bash
   cd frontend
   npm install
   ```

   Backend:
   ```bash
   cd backend
   npm install
   ```

3. **Environment Setup**
   
   Create .env files in both frontend and backend directories:

   Frontend (.env):
   ```
   VITE_API_URL=http://localhost:5000
   ```

   Backend (.env):
   ```
   MONGODB_URI=mongodb://localhost:27017/zen_garden
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. **Run the Application**

   Backend (from root directory):
   ```bash
   node backend/server.js
   ```

   Frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the Application**:
   - Open a browser and navigate to `http://localhost:3000`

## Project Structure

```
zen-garden/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
└── backend/
    ├── config/
    ├── models/
    ├── routes/
    ├── server.js
    └── package.json
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout

### Habits
- GET `/api/habits/:userId/habits` - Get all habits
- POST `/api/habits/:userId/habits` - Create new habit
- PUT `/api/habits/:userId/habits/:habitId` - Update habit
- DELETE `/api/habits/:userId/habits/:habitId` - Delete habit

### Focus Mode
- POST `/api/focus/:userId/focus` - Start focus session
- GET `/api/focus/:userId/focus` - Get focus sessions
- GET `/api/focus/:userId/focus/stats` - Get focus statistics

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss your ideas.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Icons by Lucide React
- UI Components inspired by Radix UI
- Animations powered by Framer Motion
