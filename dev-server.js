import express from 'express';
import cors from 'cors';
import handler from './api/chat.js';
import contactHandler from './api/contact.js';
import geoHandler from './api/geo.js';
import sendOtpHandler from './api/send-otp.js';
import verifyOtpHandler from './api/verify-otp.js';
import loginAlertHandler from './api/login-alert.js';

const app = express();

app.use(cors());
app.use(express.json());

// Forward requests directly to the Vercel handlers
app.post('/api/chat', handler);
app.post('/api/contact', contactHandler);
app.get('/api/geo', geoHandler);
app.post('/api/geo', geoHandler);
app.post('/api/send-otp', sendOtpHandler);
app.post('/api/verify-otp', verifyOtpHandler);
app.post('/api/login-alert', loginAlertHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🤖 Dev RAG Streaming API running at http://localhost:3001`);
  console.log(`📡 POST http://localhost:3001/api/chat`);
  console.log(`📡 POST http://localhost:3001/api/contact`);
  console.log(`📡 GET  http://localhost:3001/api/geo`);
  console.log(`📡 POST http://localhost:3001/api/send-otp`);
  console.log(`📡 POST http://localhost:3001/api/verify-otp`);
  console.log(`📡 POST http://localhost:3001/api/login-alert`);
});

