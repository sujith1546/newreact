import express from 'express';
import cors from 'cors';
import handler from './api/chat.js';
import contactHandler from './api/contact.js';

const app = express();

app.use(cors());
app.use(express.json());

// Forward POST requests directly to the Vercel handlers
app.post('/api/chat', handler);
app.post('/api/contact', contactHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🤖 Dev RAG Streaming API running at http://localhost:3001`);
  console.log(`📡 POST http://localhost:3001/api/chat`);
  console.log(`📡 POST http://localhost:3001/api/contact`);
});
