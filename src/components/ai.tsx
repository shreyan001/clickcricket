'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Send } from 'lucide-react'

const TeddyRSC = () => (
  <div className="bg-gray-900 rounded-lg p-4 shadow-[0_0_20px_rgba(255,255,0,0.3)] w-full max-w-[580px] mx-auto text-sm animate-float">
    <h2 className="text-xl font-bold text-yellow-400 mb-2">Welcome to Teddy AI!</h2>
    <p className="text-gray-300 mb-2">I&apos;m here to assist you. Ask me anything!</p>
    <div className="bg-gray-800 p-2 rounded-md shadow-inner">
      <code className="text-yellow-300 text-xs">const teddyAI = new AI(&apos;futuristic&apos;, &apos;helpful&apos;);</code>
    </div>
  </div>
)

export function EnhancedSciFiTeddyAiAssistant() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{type: 'user' | 'ai', content: string}[]>([])
  const [showRSC, setShowRSC] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const newMessages = [...messages, { type: 'user' as const, content: input }]
      setMessages(newMessages)
      setInput('')
      
      setTimeout(() => {
        let aiResponse = "The AI is the future. If you won't adapt, you would be gone."
        if (input.toLowerCase() === 'hi') {
          setShowRSC(true)
          aiResponse = "Hello! I'm Teddy AI. How can I help you today?"
        } else {
          setShowRSC(false)
        }
        setMessages([...newMessages, { type: 'ai', content: aiResponse }])
      }, 1000)
    }
  }

  const handleBack = () => {
    if (messages.length > 2) {
      setMessages(messages.slice(0, -2))
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="flex flex-col items-center justify-center bg-gray-800 font-['Courier',monospace] rounded-xl shadow-[0_0_50px_rgba(255,255,255,0.1)]" style={{ width: '600px', height: '300px' }}>
        <div className="w-full max-w-[580px] h-[240px] overflow-auto p-4 flex flex-col items-center justify-end relative">
          {messages.length > 0 && !showRSC && (
            <button
              onClick={handleBack}
              className="absolute top-2 right-2 p-2 bg-gray-700 text-yellow-400 rounded-full shadow-[0_0_15px_rgba(255,255,0,0.2)] hover:bg-gray-600 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          {showRSC ? (
            <TeddyRSC />
          ) : (
            messages.slice(-2).map((message, index) => (
              <div key={index} className={`w-full max-w-[540px] my-2 ${message.type === 'user' ? 'self-end' : 'self-start'}`}>
                <div 
                  className={`p-4 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-gray-700 text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)]' 
                      : 'bg-yellow-400 text-black shadow-[0_10px_15px_-3px_rgba(255,255,0,0.1),0_4px_6px_-2px_rgba(255,255,0,0.05)] flex items-start'
                  } animate-float animate-rise-up`}
                >
                  {message.type === 'ai' && (
                    <img src="/placeholder.svg?height=24&width=24" alt="Teddy AI" className="w-6 h-6 rounded-full mr-2 border border-black" />
                  )}
                  <div className="text-xs sm:text-sm md:text-base">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSubmit} className="w-full max-w-[580px] p-4 relative">
          <div className="flex items-center bg-gray-700 rounded-full overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Communicate with Teddy AI..."
              className="flex-grow bg-transparent py-3 px-6 text-sm focus:outline-none text-white placeholder-gray-400"
            />
            <button
              type="submit"
              className="absolute right-6 p-3 bg-yellow-400 hover:bg-yellow-500 transition-all rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.3)] hover:shadow-[0_6px_8px_rgba(0,0,0,0.4)] transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Send message"
            >
              <Send className="w-5 h-5 text-black" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}