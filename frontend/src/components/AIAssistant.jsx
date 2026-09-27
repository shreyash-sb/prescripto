import { useState, useContext, useRef, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const AIAssistant = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Prescripto AI Assistant 🤖\n\nI can help you find verified doctors, understand how to book or cancel appointments, check your scheduled visits, or clarify general healthcare and prescription terms.\n\nHow can I help you today?',
    },
  ])

  const messagesEndRef = useRef(null)

  const quickPrompts = [
    'What is Prescripto?',
    'Which doctors are available?',
    'How do I book an appointment?',
    'When is my next appointment?',
    'What does a dermatologist do?',
    "What does 'after food' mean?",
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSendMessage = async (textToSend = null) => {
    const query = typeof textToSend === 'string' ? textToSend : inputMessage
    if (!query || !query.trim() || isLoading) return

    const userMsg = { sender: 'user', text: query.trim() }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInputMessage('')
    setIsLoading(true)

    try {
      // Build conversation history for context
      const history = updatedMessages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))

      const headers = {}
      if (token) {
        headers.token = token
      }

      const { data } = await axios.post(
        `${backendUrl}/api/ai/chat`,
        {
          message: query.trim(),
          conversationHistory: history,
        },
        { headers }
      )

      if (data.success && data.response) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.response },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'I apologize, but I could not retrieve that information right now. Please try again.',
          },
        ])
      }
    } catch (error) {
      console.error('AI Assistant Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I am temporarily unable to connect to the assistant service. Please check your network and try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: 'Chat history cleared. How can I help you with Prescripto today?',
      },
    ])
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary to-indigo-600 text-white font-bold px-4 sm:px-5 py-3 rounded-full shadow-2xl hover:shadow-indigo-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white'
        title='Open Prescripto AI Assistant'
      >
        <span className='text-xl'>🤖</span>
        <span className='text-xs sm:text-sm tracking-wide hidden sm:inline'>Prescripto AI</span>
        <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span>
      </button>

      {/* Slide-Up / Floating Chat Widget */}
      {isOpen && (
        <div className='fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-w-lg h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col justify-between overflow-hidden animate-fade-in'>
          {/* Header */}
          <div className='p-4 bg-gradient-to-r from-primary to-indigo-600 text-white flex items-center justify-between'>
            <div className='flex items-center gap-2.5'>
              <div className='w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl'>
                🤖
              </div>
              <div>
                <h3 className='font-bold text-sm leading-tight'>Prescripto AI Assistant</h3>
                <p className='text-[11px] text-indigo-100 flex items-center gap-1'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-400'></span>
                  Healthcare & Platform Guide
                </p>
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
              <button
                onClick={handleClearChat}
                className='p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-colors'
                title='Clear Chat History'
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className='w-7 h-7 rounded-xl hover:bg-white/20 flex items-center justify-center text-white/90 font-bold text-sm transition-colors'
                title='Close Assistant'
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className='flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 custom-scrollbar'>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className='w-7 h-7 rounded-full bg-indigo-100 text-primary flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-sm'>
                    🤖
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] whitespace-pre-line shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none font-medium'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Loader */}
            {isLoading && (
              <div className='flex gap-2.5 justify-start items-center'>
                <div className='w-7 h-7 rounded-full bg-indigo-100 text-primary flex items-center justify-center text-sm flex-shrink-0'>
                  🤖
                </div>
                <div className='bg-white text-gray-400 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-1.5'>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce'></span>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100'></span>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200'></span>
                  <span className='text-[11px] font-medium text-gray-500 ml-1'>Prescripto AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Pill Bar */}
          {messages.length <= 2 && (
            <div className='px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar'>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className='flex-shrink-0 px-2.5 py-1 rounded-full bg-indigo-50/80 hover:bg-indigo-100 text-primary text-[11px] font-semibold border border-indigo-100 transition-colors'
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Box Area */}
          <div className='p-3 bg-white border-t border-gray-100'>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className='flex items-center gap-2'
            >
              <input
                type='text'
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask about doctors, booking, or prescriptions...'
                disabled={isLoading}
                className='flex-1 py-2.5 px-4 text-xs sm:text-sm border border-gray-200 rounded-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50/70 focus:bg-white'
              />
              <button
                type='submit'
                disabled={isLoading || !inputMessage.trim()}
                className='bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-opacity-95 disabled:opacity-40 transition-all shadow-md flex-shrink-0'
                title='Send message'
              >
                ➔
              </button>
            </form>
            <p className='text-[10px] text-gray-400 text-center mt-1.5 leading-tight'>
              ℹ️ Educational guide only. Always consult a qualified doctor for medical decisions.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
