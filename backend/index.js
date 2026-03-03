const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())
// Endpoint to handle chat messages
app.post('/chat', async (req, res) => {
  try {
    // Extract messages from request body
    const { messages } = req.body
    console.log('Received messages:', messages)
    // Add system prompt to guide the AI's behavior
    const systemMessage = {
      role: 'system',
      content: 'You are a helpful assistant called Cal. You are concise, friendly and slightly witty.'
    }
    // Send messages to Ollama API
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Send the entire conversation history to Ollama, including the system prompt
      body: JSON.stringify({
        model: 'llama3.2:1b',
        messages: [systemMessage, ...messages],
        stream: false
      })
    })
    // Parse response from Ollama and send back to frontend
    const data = await response.json()
    console.log('Ollama response:', data)
    res.json({ reply: data.message.content })
    
  } catch (error) { 
    // Handle errors and send error response
    console.error('Error:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// Start the server
app.listen(3001, () => {
    console.log('Server is running on port 3001')
})