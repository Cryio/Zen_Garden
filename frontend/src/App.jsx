import { BrowserRouter } from "react-router-dom"
import { SettingsProvider } from "./context/SettingsContext"
import AppRoutes from "./routes"
import { Toaster } from "sonner"
import AuthCheck from "./components/AuthCheck"

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AuthCheck>
          <Toaster position="top-right" richColors />
          <AppRoutes />
        </AuthCheck>
      </BrowserRouter>
    </SettingsProvider>
  )
}

export default App
