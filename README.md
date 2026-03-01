SnapAid
Edge-Powered Emergency Intelligence & Verification System

No citizen should hesitate to report an emergency due to lack of trust, delay, or misinformation risk.

SnapAid is a real-time AI-powered emergency intelligence platform that transforms raw citizen-submitted media into structured, verified operational intelligence for law enforcement agencies.

Instead of forwarding unstructured images or videos, SnapAid performs automated incident classification, severity scoring, confidence evaluation, and authenticity validation before streaming structured incident packets to a live Police Command Dashboard.

Overview

Modern emergency systems face two critical challenges:

Delayed triage due to manual inspection of unstructured media

Increasing misinformation caused by AI-generated or manipulated content

SnapAid addresses these gaps by converting raw media into validated, severity-scored intelligence before it reaches command centers. This enables faster prioritization, reduces false alarms, and improves operational trust.

Key Features
Citizen Module

Capture or upload image/video instantly

AI-powered incident classification

Severity scoring (1–5 scale)

Confidence scoring

AI-generated contextual summary

Automatic timestamp and GPS capture

Structured incident submission

Civic participation points system

“Republic Day Civic Award” badge recognition

Police Dashboard

Secure role-based login

Real-time incident feed

Interactive geospatial map visualization

Severity and status filtering

Incident detail view

Status updates (Pending / Dispatched / Closed)

Action logging

Safety & Authenticity Layer

AI-generated media detection

Confidence scoring system

Structured incident packet generation

Reduced misinformation risk

JWT-based authentication

Secure password hashing

Multi-Language Support

English

Tamil

Hindi

Emergency Numbers Page

Public access to:

Police (112)

Ambulance

Fire

Women Helpline

Cybercrime Helpline

System Architecture

Citizen (Mobile Interface)
→ Media Upload (Image / Video)
→ Gemini Multimodal AI Analysis
→ Structured Incident Packet Generator
→ FastAPI Backend
→ PostgreSQL Database
→ WebSocket Real-Time Streaming
→ Police Command Dashboard

Technology Stack

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

Gemini Multimodal API

Severity & Confidence Scoring Logic

Security:

Bcrypt Password Hashing

Role-Based Access Control

Token Authentication

Impact

SnapAid enhances emergency response systems by:

Reducing manual triage workload

Minimizing response latency

Decreasing false alarm volume

Mitigating misinformation and synthetic media risks

Improving structured prioritization of incidents

By converting raw media into verified intelligence, SnapAid strengthens operational reliability and modernizes public safety infrastructure.

Demo

Live Demo:
[Insert Live Deployment Link Here]

Demo Video:
[Insert Demo Video Link Here]

GitHub Repository:
[Insert GitHub Repository Link Here]

Installation & Setup

Backend:

pip install -r requirements.txt
uvicorn main:app --reload

Frontend:

npm install
npm start

Environment Variables Required:

DATABASE_URL
JWT_SECRET_KEY
GEMINI_API_KEY

Security Considerations

Passwords are securely hashed.

JWT authentication secures all protected routes.

Role-based middleware restricts police dashboard access.

Input validation ensures safe API interactions.
