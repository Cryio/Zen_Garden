import { BrowserRouter } from "react-router-dom"
import { SettingsProvider } from "./context/SettingsContext"
import { AuthProvider } from "./context/AuthContext"
import AppRoutes from "./routes"
import { Toaster } from "sonner"
import AuthCheck from "./components/AuthCheck"

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <AuthCheck>
            <Toaster position="top-right" richColors />
            <AppRoutes />
          </AuthCheck>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
