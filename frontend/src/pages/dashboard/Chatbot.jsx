import * as React from "react"
import { MessageSquare, Send, X } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { useSettings } from "../../context/SettingsContext"

const messages = [
  {
    id: 1,
    sender: "bot",
    content: "Hello! I'm your Zen Garden assistant. How can I help you today?",
    timestamp: new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    })
  }
]

export function Chatbot() {
  const { settings } = useSettings()
  const [isOpen, setIsOpen] = React.useState(false)
  const [input, setInput] = React.useState("")
  const [chatMessages, setChatMessages] = React.useState(messages)
  const messagesEndRef = React.useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: settings.timezone
    })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const now = new Date()

    // Add user message
    const newUserMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      content: input,
      timestamp: formatTime(now)
    }

    // Add bot response
    const newBotMessage = {
      id: chatMessages.length + 2,
      sender: "bot",
      content: "I'm here to help you with your Zen Garden journey. What would you like to know?",
      timestamp: formatTime(now)
    }

    setChatMessages([...chatMessages, newUserMessage, newBotMessage])
    setInput("")
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 h-[500px] bg-wax-flower-950/80 backdrop-blur-sm border border-wax-flower-800/30 shadow-lg rounded-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-wax-flower-800/30">
            <h3 className="text-wax-flower-100 font-medium">Zen Garden Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-wax-flower-400 hover:text-wax-flower-300"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-wax-flower-500 text-wax-flower-50"
                      : "bg-wax-flower-900/50 text-wax-flower-100"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-wax-flower-800/30">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-wax-flower-900/50 border-wax-flower-800/30 text-wax-flower-100 placeholder:text-wax-flower-500"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-wax-flower-500 hover:bg-wax-flower-600 text-wax-flower-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 bg-wax-flower-500 hover:bg-wax-flower-600 text-wax-flower-50 shadow-lg"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
} 