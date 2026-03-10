# Zentara 🏔️

A minimal, local AI chat application powered by Ollama. Zentara runs entirely on your machine - no cloud, no API costs, no data leaving your device.

---

## Tech Stack

- **Frontend** — React
- **Backend** — Node.js + Express
- **Database** — PostGre + Supabase
- **AI** — Ollama (Llama 3.2:1b)

---

## Features

- 💬 Real-time AI chat
- 🧠 Conversation memory, Zentara remembers context within a session
- 🔒 Fully local, your conversations never leave your machine
- 🗑️ Clear chat button
- ⌨️ Enter key to send

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Ollama](https://ollama.com/) installed and running

---

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/zentara.git
cd zentara
```

**2. Pull the model**
```bash
ollama pull llama3.2
```

**3. Start the backend**
```bash
cd backend
npm install
node index.js
```

**4. Start the frontend**
```bash
cd frontend
npm install
npm start
```

**5. Open your browser**
```
http://localhost:3000
```

---

## Project Structure

```
zentara/
├── backend/
│   ├── index.js        # Express server + Ollama integration
│   └── .env            # API keys (not committed)
└── frontend/
    └── src/
        ├── App.js      # Main React component
        └── App.css     # Styling
```

---

## Configuration

To change the AI model, update the model name in `backend/index.js`:

```js
model: 'llama3.2' // swap for any Ollama model
```

To give Zentara a different personality, edit the system prompt in `backend/index.js`:

```js
content: 'You are a helpful assistant called Zentara...'
```

---

## License

MIT
