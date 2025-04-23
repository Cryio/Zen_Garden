import { BrowserRouter } from "react-router-dom"
import { SettingsProvider } from "./context/SettingsContext"
import { AuthProvider } from "./context/AuthContext"
import AppRoutes from "./routes"
import { Toaster } from "sonner"
import AuthCheck from "./components/AuthCheck"
import { ToastProvider } from '@/components/ui/use-toast'

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastProvider>
        <BrowserRouter>
          <AuthCheck>
            <Toaster position="top-right" richColors />
            <AppRoutes />
          </AuthCheck>
        </BrowserRouter>
        </ToastProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}

export default App
