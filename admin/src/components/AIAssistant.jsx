import { useState, useContext, useRef, useEffect } from 'react'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'
import axios from 'axios'

const AIAssistant = () => {
  const adminCtx = useContext(AdminContext)
  const doctorCtx = useContext(DoctorContext)

  const backendUrl = adminCtx?.backendUrl || doctorCtx?.backendUrl || 'http://localhost:5000'
  const aToken = adminCtx?.aToken || ''
  const dToken = doctorCtx?.dToken || ''
  const isDoctor = Boolean(dToken)

  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: isDoctor
        ? 'Hello Doctor! I am your Prescripto Clinical AI Assistant 👨‍⚕️🤖\n\nI can assist you with:\n• Clinical diagnosis phrasing & differential references\n• Standard prescription formats & dosage guidelines\n• Practice scheduling, OPD shifts, and live queue controls\n• MERN architectural and clinical workflow questions\n\nHow can I support your practice today?'
        : 'Hello Administrator! I am your Prescripto Management AI Assistant 🛡️🤖\n\nI can assist you with:\n• Hospital operations, OPD capacity, and revenue analytics\n• Doctor onboarding, speciality distribution, and roster management\n• 100% automated refund rules and settlement policies\n• Full-stack platform questions and troubleshooting\n\nHow can I help you manage the hospital today?',
    },
  ])

  const messagesEndRef = useRef(null)

  const quickPrompts = isDoctor
    ? [
        'How to write clear prescription instructions?',
        'What are standard antibiotics for adult fever?',
        'How do I update my consultation shifts?',
        'How does the 100% refund policy work?',
        'Explain MERN architecture of Prescripto',
      ]
    : [
        'How do I onboard a new doctor?',
        'Where can I see available vs off-duty doctors?',
        'How does automated refund work on cancellation?',
        'How to verify cash payments?',
        'What tech stack powers Prescripto?',
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
      const history = updatedMessages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))

      const headers = {}
      if (aToken) headers.atoken = aToken
      if (dToken) headers.dtoken = dToken

      const { data } = await axios.post(
        `${backendUrl}/api/ai/chat`,
        {
          message: query.trim(),
          conversationHistory: history,
        },
        { headers }
      )

      if (data.success && data.response) {
        setMessages((prev) => [...prev, { sender: 'ai', text: data.response }])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'I apologize, but I could not process your query right now. Please try again.',
          },
        ])
      }
    } catch (error) {
      console.error('Admin AI Assistant Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'The AI assistant is temporarily unavailable. Please verify backend connection and try again.',
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
        text: 'Chat history cleared. How can I assist you with Prescripto operations?',
      },
    ])
  }

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className='fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary to-indigo-700 text-white font-bold px-4 sm:px-5 py-3 rounded-full shadow-2xl hover:shadow-indigo-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white'
        title='Open Prescripto AI Assistant'
      >
        <span className='text-xl'>🤖</span>
        <span className='text-xs sm:text-sm tracking-wide font-extrabold hidden sm:inline'>
          {isDoctor ? 'Clinical AI' : 'Admin AI'}
        </span>
        <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span>
      </button>

      {/* Floating Chat Widget */}
      {isOpen && (
        <div className='fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-w-lg h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col justify-between overflow-hidden animate-fade-in'>
          {/* Header */}
          <div className='p-4 bg-gradient-to-r from-primary to-indigo-700 text-white flex items-center justify-between shadow-sm'>
            <div className='flex items-center gap-2.5'>
              <div className='w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner'>
                🤖
              </div>
              <div>
                <h3 className='font-bold text-sm leading-tight'>
                  {isDoctor ? 'Prescripto Clinical AI' : 'Prescripto Admin AI'}
                </h3>
                <p className='text-[11px] text-indigo-100 flex items-center gap-1'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'></span>
                  {isDoctor ? 'Doctor & Rx Intelligence' : 'Hospital Operations Intelligence'}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
              <button
                type='button'
                onClick={handleClearChat}
                className='p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white text-xs font-semibold transition-colors'
                title='Clear Chat History'
              >
                🗑️
              </button>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='w-7 h-7 rounded-xl hover:bg-white/20 flex items-center justify-center text-white/90 font-bold text-sm transition-colors'
                title='Close Assistant'
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className='flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70'>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className='w-7 h-7 rounded-full bg-indigo-100 text-primary flex items-center justify-center text-sm flex-shrink-0 mt-0.5 shadow-xs'>
                    🤖
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] whitespace-pre-line shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-tr-none font-medium'
                      : 'bg-white text-gray-800 border border-gray-200/80 rounded-tl-none'
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
                <div className='bg-white text-gray-400 border border-gray-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-1.5'>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce'></span>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100'></span>
                  <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200'></span>
                  <span className='text-[11px] font-medium text-gray-500 ml-1'>Analyzing query...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          {messages.length <= 2 && (
            <div className='px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto'>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type='button'
                  onClick={() => handleSendMessage(prompt)}
                  className='flex-shrink-0 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-primary text-[11px] font-semibold border border-indigo-100 transition-colors'
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
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
                placeholder={
                  isDoctor
                    ? 'Ask clinical or scheduling questions...'
                    : 'Ask administrative or hospital questions...'
                }
                disabled={isLoading}
                className='flex-1 py-2.5 px-4 text-xs sm:text-sm border border-gray-200 rounded-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-gray-50 focus:bg-white'
              />
              <button
                type='submit'
                disabled={isLoading || !inputMessage.trim()}
                className='bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-all shadow-md flex-shrink-0'
                title='Send message'
              >
                ➔
              </button>
            </form>
            <p className='text-[10px] text-gray-400 text-center mt-1.5 leading-tight'>
              🛡️ Prescripto Intelligent AI Copilot • Powered by Google Gemini
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
