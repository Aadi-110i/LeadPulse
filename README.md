<div align="center">

# ⚡ LeadPulse

### AI-Powered Call & Lead Management Backend Platform

*Log calls. Get AI summaries. Auto-follow-up on WhatsApp. All through one clean REST API.*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Queue-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com)
[![License](https://img.shields.io/badge/License-MIT-00E5FF?style=flat-square)](LICENSE)

[Live Demo](https://lead-pulse-zeta.vercel.app) • [API Docs](#api-reference) • [Architecture](#system-architecture)

</div>

---

## 🧠 What is LeadPulse?

LeadPulse is a **production-ready backend system** built for small and medium businesses 
to manage their entire customer communication lifecycle — from the first call to the 
final conversion.

Most SMBs lose leads because they forget to follow up. LeadPulse fixes this by:
- Automatically **transcribing and summarizing** every customer call using LLMs
- **Queuing and sending WhatsApp follow-ups** within minutes of a call ending
- Giving sales teams a **live dashboard** to track every lead's journey
- Exposing **clean REST APIs** so this can plug into any existing CRM or workflow

---

## 🏗️ System Architecture
                ┌─────────────────────────────────────┐
                │           Client / CRM System        │
                └──────────────┬──────────────────────┘
                               │ REST API calls
                ┌──────────────▼──────────────────────┐
                │         Express.js API Server         │
                │  /api/calls  /api/leads  /api/logs   │
                └───┬──────────────────┬───────────────┘
                    │                  │
       ┌────────────▼───┐     ┌────────▼──────────┐
       │  PostgreSQL DB  │     │   Redis + BullMQ  │
       │  Leads, Calls,  │     │   Job Queue for   │
       │  Summaries      │     │   WhatsApp sends  │
       └────────────────┘     └────────┬──────────┘
                                       │
                ┌──────────────────────▼──────────────┐
                │         Worker Service                │
                │  Calls OpenAI → Summarizes call      │
                │  Triggers Twilio WhatsApp webhook    │
                └─────────────────────────────────────┘

---

## ✨ Features

| Feature | Description |
|---|---|
| 📞 **Call Logging API** | Log call metadata (duration, transcript, outcome) via POST endpoint |
| 🤖 **LLM Summarization** | GPT-4o extracts key points, sentiment, and next steps from call notes |
| 💬 **WhatsApp Follow-up** | Automated messages sent via Twilio/Meta Cloud API after every call |
| 🔁 **Async Job Queue** | BullMQ + Redis handles retries, delays, and dead-letter queues |
| 📊 **Lead Pipeline** | Track leads across stages: `new → contacted → converted` |
| 🔍 **Observability** | Request latency, failed jobs, webhook delivery tracked per lead |
| 🔐 **JWT Auth** | Secure API access with role-based tokens |

---

## 🚀 API Reference

### Log a Call
```http
POST /api/calls
Content-Type: application/json

{
  "lead_id": "lead_204",
  "duration_seconds": 183,
  "transcript": "Customer interested in Pro plan, asked about pricing...",
  "outcome": "interested"
}
```

### Get Lead with AI Summary
```http
GET /api/leads/lead_204

Response:
{
  "id": "lead_204",
  "name": "Rahul Sharma",
  "status": "contacted",
  "last_call": "2026-05-08T14:32:00Z",
  "ai_summary": "Customer is evaluating Pro plan. Main concern is pricing. 
                  Suggested a follow-up demo on Friday.",
  "sentiment": "positive",
  "followup_sent": true,
  "followup_time": "2026-05-08T14:35:22Z"
}
```

### Get Observability Stats
```http
GET /api/stats

Response:
{
  "total_leads": 1240,
  "calls_today": 84,
  "avg_latency_ms": 342,
  "failed_jobs": 3,
  "whatsapp_delivery_rate": 0.982
}
```

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js  
**Database:** PostgreSQL (leads, calls, summaries)  
**Queue:** Redis + BullMQ (async WhatsApp delivery)  
**AI:** OpenAI GPT-4o API (call summarization, sentiment)  
**Messaging:** Twilio / Meta Cloud API (WhatsApp)  
**Auth:** JWT + bcrypt  
**Observability:** Custom middleware logging latency + error rates  
**Frontend:** React + Tailwind CSS (Dashboard UI)  
**Deployment:** Railway (backend) + Vercel (frontend)

---

## ⚙️ Local Setup

```bash
# Clone the repo
git clone https://github.com/Aadi-110i/LeadPulse.git
cd leadpulse

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in: DATABASE_URL, REDIS_URL, OPENAI_API_KEY, TWILIO_AUTH_TOKEN

# Run database migrations
npm run migrate

# Start the dev server
npm run dev

# Start the queue worker (separate terminal)
npm run worker
```



## 🎯 Built For

This project was built to demonstrate production-backend thinking:
handling real async workflows, integrating LLMs beyond "hello world," 
and building systems that could survive real traffic — not just pass tests.

---

<div align="center">
Made with ☕ and zero BS &nbsp;|&nbsp; 
<a href="https://leadpulse.io">Live Demo</a>
</div>
