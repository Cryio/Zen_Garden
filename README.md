# Zen Garden

Zen Garden is a web application designed to make habit tracking engaging and interactive. It features a gamified experience where users can visualize their progress through a virtual 3D garden that grows as they complete their habits. The application likely incorporates AI to provide personalized insights and recommendations, enhancing the user experience. With a user-friendly dashboard, Zen_Garden aims to help users build and maintain positive habits in a fun and motivating way.

## Features 

- **User Authentication**: Secure login, signup, and password recovery along with OAuth2.0 signup/login. 
- **Habit Tracking**: Create and monitor customizable habit goals.
- **3D Garden Visualization**: An interactive garden that evolves with habit completion.
- **Analytics Dashboard**: View progress and insights on habit performance.
- **Settings**: Personalize the application experience.
- **Help Section**: Access guidance and support.

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime for server-side logic.
- **Express.js**: Web framework for building APIs.
- **MongoDB with Mongoose**: Database for storing user and habit data.
- **JWT**: JSON Web Tokens for secure authentication.

### Frontend
- **React**: JavaScript library for building user interfaces.
- **Vite**: Fast build tool and development server.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Radix UI**: Accessible UI components for enhanced usability.
- **React Three Fiber**: Library for 3D graphics in React.

## Installation

Follow these steps to set up Zen_Garden locally:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Cryio/Zen_Garden.git
   cd Zen_Garden
   ```

2. **Set Up the Backend**:
   - Install dependencies in the root directory:
     ```bash
     npm install
     ```
   - Create a `.env` file in the root directory with:
     ```
     DATABASE_URL=mongodb://localhost:27017/zen_garden
     JWT_SECRET=your_secret_key
     ```
   - Ensure MongoDB is running locally or update `DATABASE_URL` for a cloud instance.

3. **Set Up the Frontend**:
   - Navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```

4. **Run the Application**:
   - Start the backend server (from the root directory):
     ```bash
     node backend/server.js
     ```
   - In another terminal, start the frontend development server:
     ```bash
     cd frontend
     npm run dev
     ```

5. **Access the Application**:
   - Open a browser and navigate to `http://localhost:3000` to use Zen_Garden.

## Usage

- **Sign Up or Log In**: Create a new account or access an existing one.
- **Explore the Dashboard**: View your habits, garden, analytics, and settings.
- **Track Habits**: Add new habits and mark them as completed daily.
- **Interact with the Garden**: Watch your virtual garden grow as you maintain habits.
- **Review Analytics**: Monitor your progress through detailed insights.

## Contributing

Contributions are welcome! To contribute:
- Fork the repository.
- Create a new branch for your feature or bug fix.
- Submit a pull request with a clear description of changes.
- For major changes, please open an issue first to discuss your ideas.
