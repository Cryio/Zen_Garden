import { BrowserRouter } from "react-router-dom"
import { SettingsProvider } from "./context/SettingsContext"
import AppRoutes from "./routes"

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SettingsProvider>
  )
}

export default App
