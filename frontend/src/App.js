import { useState, useEffect, useRef } from 'react'
import './App.css'
import logo from './logo.svg'
import ReactMarkdown from 'react-markdown'

function App() {
  // State to hold messages and current input
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const [editingIndex, setEditingIndex] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [ttsEnabled, setTtsEnabled] = useState(false)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  // Fetch chat history from backend on component mount
  useEffect(() => {
    fetch('http://localhost:3001/history')
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages)
      })
      .catch(err => console.error('History fetch failed:', err))
  }, [])
  // Preload voices for TTS
  useEffect(() => {
    window.speechSynthesis.getVoices()
  }, [])
  // Function to clear chat history and delete all messages from the database
  const clearChat = async () => {
    await fetch('http://localhost:3001/history', { method: 'DELETE' })
    setMessages([])
  }
  // Function to start editing a user message
  const startEdit = (index, content) => {
    setEditingIndex(index)
    setEditingText(content)
  }
  // Function to toggle text-to-speech
  const speak = (text) => {
    if (!ttsEnabled) return
    window.speechSynthesis.cancel()

    const cleaned = text
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/[-*+]\s/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/>\s/g, '')

    const utterance = new SpeechSynthesisUtterance(cleaned)
    utterance.rate = 0.95
    utterance.pitch = 1.1

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices()
      console.log(voices.map(v => v.name)) // ← this will show you all available voices

      const femaleVoice = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Karen')    ||
        v.name.includes('Zira')     ||
        v.name.includes('Susan')    ||
        v.name.includes('Hazel')    ||
        v.name.includes('Moira')    ||
        v.name.includes('Victoria')
      )

      if (femaleVoice) {
        utterance.voice = femaleVoice
      }

      window.speechSynthesis.speak(utterance)
    }

    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      setVoiceAndSpeak()
    } else {
      window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak
    }
  }
  // Function to confirm edit and resend messages to backend
  const confirmEdit = async () => {
    const updatedMessages = messages.slice(0, editingIndex)
    setEditingIndex(null)
    setEditingText('')
    setInput(editingText)

    const userMessage = { role: 'user', content: editingText }
    const newMessages = [...updatedMessages, userMessage]
    setMessages(newMessages)
    setLoading(true)

    await fetch('http://localhost:3001/history', { method: 'DELETE' })

    for (const msg of updatedMessages) {
      await fetch('http://localhost:3001/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      })
    }

    const response = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages })
    })

    const data = await response.json()
    const aiMessage = { role: 'assistant', content: data.reply }
    setMessages([...newMessages, aiMessage])
    speak(data.reply)
    setLoading(false)
  }
  // Function to send message to backend and get response
  const sendMessage = async () => {
    if (!input.trim()) return
    // Add user message to state
    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    // Send message to backend and clear input
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    // Send message to backend and get response
    const response = await fetch('http://localhost:3001/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages })
    })
    
    const data = await response.json()
    const aiMessage = { role: 'assistant', content: data.reply }
    setMessages([...updatedMessages, aiMessage])
    speak(data.reply)
    setLoading(false)
  }
  // Render the chat interface
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="brand">
          <img src={logo} alt="logo" />
          <div>
            <div className="brand-name">Zentara</div>
            <div className="brand-tag">AI Assistant</div>
          </div>
        </div>
        <div className="header-actions">
          <button className={`btn-tts ${ttsEnabled ? 'active' : ''}`} onClick={() => setTtsEnabled(!ttsEnabled)}>
            {ttsEnabled ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
            )}
          </button>
          <button className="btn-clear" onClick={clearChat}>Clear</button>
        </div>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {editingIndex === index ? (
              <div className="edit-container">
                <input
                  className="edit-input"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && confirmEdit()}
                  autoFocus
                />
                <div className="edit-buttons">
                  <button className="btn-confirm" onClick={confirmEdit}>Save</button>
                  <button className="btn-cancel" onClick={() => setEditingIndex(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="message-content">
                {msg.role === 'assistant' ? (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
                {msg.role === 'user' && (
                  <button className="btn-edit" onClick={() => startEdit(index, msg.content)}>✏️</button>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="thinking-dots">
              <span/><span/><span/>
            </div>
          </div>
        )}
        <div ref={bottomRef} /> 
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Message Zentara..."
        />
        <button className="btn-send" onClick={sendMessage} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default App;