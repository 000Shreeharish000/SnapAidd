SnapAid
Edge-Powered Emergency Intelligence & Verification System

No citizen should hesitate to report an emergency due to lack of trust, delay, or misinformation risk.

SnapAid is a real-time AI-powered emergency intelligence platform that transforms raw citizen-submitted media into structured, verified operational intelligence for law enforcement agencies.

Instead of forwarding unstructured images, SnapAid performs automated incident classification, severity scoring, and authenticity validation before streaming structured incident packets to a live Police Command Dashboard.

🚀 Overview

SnapAid addresses two critical challenges in modern emergency systems:

Delayed triage due to manual media inspection

Rising misinformation from AI-generated or manipulated content

By combining multimodal AI analysis with structured backend intelligence processing, SnapAid reduces false reporting, accelerates response prioritization, and strengthens trust in citizen-generated evidence.

🧠 Core Features
👤 Citizen Module

Capture or upload image/video

AI-powered incident classification

Severity scoring (1–5 scale)

Confidence scoring

AI-generated contextual summary

Location auto-detection (GPS)

Structured incident submission

Gamified civic participation (points & Republic Day Civic Award badge)

👮 Police Dashboard

Secure role-based login

Real-time incident feed (WebSockets)

Interactive geospatial map clustering

Severity-based filtering

Status tracking (Pending / Dispatched / Closed)

AI summary view

Action logging

🔐 Safety & Authenticity Layer

AI-generated media detection

Confidence scoring

Structured incident packet generation

Reduced misinformation risk

JWT-based authentication

Password hashing (bcrypt)

🌐 Multi-Language Support

English

Tamil

Hindi

📞 Emergency Numbers Page

Public access to:

Police (112)

Ambulance

Fire

Women Helpline

Cybercrime Helpline

🏗 System Architecture
Citizen (Mobile UI)
        │
        ▼
Media Upload (Image / Video)
        │
        ▼
Gemini Multimodal Analysis
        │
        ▼
Structured Incident Packet Generator
        │
        ▼
FastAPI Backend (JWT Secured)
        │
        ├── PostgreSQL Database
        ├── WebSocket Live Feed
        └── Authenticity Scoring Engine
        │
        ▼
Police Command Dashboard (React + Map View)
⚙ Technology Stack

Frontend:

React (Mobile-first UI)

Leaflet (Geospatial Map Visualization)

Backend:

FastAPI

PostgreSQL

SQLAlchemy ORM

JWT Authentication

WebSockets

AI:

Gemini Multimodal API (Incident Analysis)

Structured Severity & Confidence Scoring

Security:

Bcrypt Password Hashing

Role-Based Access Control

Token Authentication

📊 Impact

SnapAid improves emergency response efficiency by:

Reducing manual triage workload

Minimizing response latency

Decreasing false alarm volume

Mitigating misinformation and synthetic media risks

Improving structured prioritization of incidents

The platform enhances operational reliability and strengthens modern public safety infrastructure.

🎥 Demo

Live Demo:
👉 [Insert Demo Link Here]

Demo Video:
👉 [Insert Video Link Here]

GitHub Repository:
👉 [Insert GitHub Link Here]

🛠 Installation & Setup
Backend Setup
pip install -r requirements.txt
uvicorn main:app --reload
Frontend Setup
npm install
npm start

Configure environment variables:

DATABASE_URL

JWT_SECRET_KEY

GEMINI_API_KEY

🔐 Security Considerations

Passwords are securely hashed using bcrypt.

All endpoints are protected using JWT authentication.

Role-based middleware restricts dashboard access to police users.

Input validation prevents injection attacks.

📌 Future Enhancements

Edge device inference optimization

Advanced synthetic media detection model

Integration with official emergency APIs

Real-time predictive risk heatmaps

🏆 AMD Slingshot 2026 Submission

SnapAid is designed as scalable emergency infrastructure — not merely a reporting application — enabling faster, smarter, and more reliable public safety operations.
