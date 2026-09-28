import { useState, useContext, useRef, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'

const AIAssistant = () => {
  const { backendUrl, token } = useContext(AppContext)
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all') // 'all' | 'doctors' | 'health' | 'medicines' | 'platform'

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your Prescripto Healthcare & Platform Assistant 🤖\n\nI can answer questions regarding:\n• 👨‍⚕️ **Doctors & OPD:** Find verified specialists, check live availability, fees & clinic rooms\n• 🎫 **Platform & Booking:** Queue tokens (#1, #2...), 100% instant refund guarantee & payments\n• 🩺 **Health & Symptoms:** Fever, aches, precautions, red flags & symptom triage (positive & negative)\n• 💊 **Medicines & Rx:** Safe uses, before/after meal timings, side effects & dose routines\n\n*Note: For questions outside healthcare or platform working, I am in active improvement.*\n\nHow can I assist you today?',
    },
  ])

  const messagesEndRef = useRef(null)

  const quickPromptsByCategory = {
    all: [
      'Which doctors are available today?',
      'How does the 100% instant refund work?',
      'What are the side effects of Ibuprofen?',
      'I have a fever and chills, what should I do?',
      "What does 'after food' mean?",
      'How do queue tokens work?',
    ],
    doctors: [
      'Which doctors are available today?',
      'Do you have a dermatologist?',
      'What does a gynecologist do?',
      'Who is Dr. Richard?',
    ],
    health: [
      'I have a fever and chills, what should I do?',
      'What are positive daily wellness habits?',
      'Difference between MRI and CT scan?',
      'When is chest pain an emergency?',
    ],
    medicines: [
      'What are the side effects of Ibuprofen?',
      "What does 'after food' mean?",
      'What is Paracetamol used for?',
      'What should I do if I miss a medication dose?',
    ],
    platform: [
      'How does the 100% instant refund work?',
      'How do queue tokens work?',
      'How to sync prescription to daily routine?',
      'What payment methods are available?',
    ],
  }

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
            text: 'I apologize, but I could not retrieve that information right now. Please try asking again.',
          },
        ])
      }
    } catch (error) {
      console.error('AI Assistant Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I am temporarily unable to connect to the assistant service. Please check your connection and try again.',
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
        text: 'Chat history cleared. How can I assist you with doctors, health, medicines, or Prescripto today?',
      },
    ])
  }

  const currentPrompts = quickPromptsByCategory[activeCategory] || quickPromptsByCategory.all

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary to-indigo-600 text-white font-bold px-4 sm:px-5 py-3 rounded-full shadow-2xl hover:shadow-indigo-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border-2 border-white'
        title='Open Prescripto Health & Platform AI'
      >
        <span className='text-xl'>🤖</span>
        <span className='text-xs sm:text-sm tracking-wide hidden sm:inline'>Health AI Assistant</span>
        <span className='w-2 h-2 rounded-full bg-emerald-400 animate-pulse'></span>
      </button>

      {/* Slide-Up / Floating Chat Widget */}
      {isOpen && (
        <div className='fixed bottom-20 right-4 sm:right-6 z-50 w-[94vw] sm:w-[440px] max-w-lg h-[580px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col justify-between overflow-hidden animate-fade-in'>
          {/* Header */}
          <div className='p-4 bg-gradient-to-r from-primary via-indigo-600 to-indigo-700 text-white flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner'>
                🤖
              </div>
              <div>
                <h3 className='font-bold text-sm leading-tight'>Prescripto AI Assistant</h3>
                <p className='text-[11px] text-indigo-100 flex items-center gap-1 mt-0.5'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'></span>
                  Doctors • Health • Medicines • Platform
                </p>
              </div>
            </div>

            <div className='flex items-center gap-1'>
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

          {/* Category Tabs for Quick Suggestions */}
          <div className='px-3 py-2 bg-slate-50 border-b border-gray-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-[11px] font-bold'>
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-full transition-all flex-shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setActiveCategory('doctors')}
              className={`px-2.5 py-1 rounded-full transition-all flex-shrink-0 ${
                activeCategory === 'doctors'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              👨‍⚕️ Doctors
            </button>
            <button
              onClick={() => setActiveCategory('health')}
              className={`px-2.5 py-1 rounded-full transition-all flex-shrink-0 ${
                activeCategory === 'health'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🩺 Health & Symptoms
            </button>
            <button
              onClick={() => setActiveCategory('medicines')}
              className={`px-2.5 py-1 rounded-full transition-all flex-shrink-0 ${
                activeCategory === 'medicines'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              💊 Medicines
            </button>
            <button
              onClick={() => setActiveCategory('platform')}
              className={`px-2.5 py-1 rounded-full transition-all flex-shrink-0 ${
                activeCategory === 'platform'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              🎫 Booking & Refunds
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className='flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 custom-scrollbar'>
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
                  <span className='text-[11px] font-medium text-gray-500 ml-1'>Prescripto AI is analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Pill Bar */}
          <div className='px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto custom-scrollbar'>
            {currentPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className='flex-shrink-0 px-2.5 py-1 rounded-full bg-indigo-50/80 hover:bg-indigo-100 text-primary text-[11px] font-semibold border border-indigo-100 transition-colors'
              >
                {prompt}
              </button>
            ))}
          </div>

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
                placeholder='Ask about doctors, health symptoms, medicines, or booking...'
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
              🛡️ Educational guidance only. Always consult a certified doctor for clinical diagnoses.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default AIAssistant
