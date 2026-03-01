# SnapAid - Emergency Intelligence & Verification System

## Original Problem Statement
Create a production-ready mobile-first web application called SnapAid - Edge-Powered Emergency Intelligence & Verification System with:
- Two user roles: Citizen and Police
- JWT + Google OAuth authentication
- AI-powered incident analysis using Gemini
- SOS Button with instant image capture
- GPay-style success popup
- 7 Emergency numbers with click-to-call
- Multi-language support (English, Tamil, Hindi)
- Real-time police dashboard with WebSocket
- Gamification with points and badges

## Architecture
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: FastAPI + MongoDB + Socket.IO
- **AI**: Gemini 2.5 Flash (via Emergent Integrations)
- **Auth**: JWT + Emergent Google OAuth

## User Personas
1. **Citizen**: Report emergencies via image/video, earn points and badges
2. **Police Officer**: Monitor incidents in real-time, update status, add notes

## Core Requirements (Static)
- [x] Mobile-first responsive design
- [x] Role-based authentication (Citizen/Police)
- [x] Media capture and upload (image/video)
- [x] AI incident analysis (type, severity, confidence)
- [x] SOS emergency mode with instant capture
- [x] 7 Emergency numbers with click-to-call
- [x] Multi-language support (EN/TA/HI)
- [x] Real-time police dashboard
- [x] Gamification (points, badges)

## What's Been Implemented (March 1, 2026)
- Complete authentication system (JWT + Google OAuth)
- Citizen Dashboard with SOS button, upload options
- SOS Page with camera capture and instant submission
- Review Page with AI analysis results
- Success Page with GPay-style animation
- Profile Page with points, badges, reports
- Police Dashboard with stats, filters, incident feed
- Emergency Numbers Page with 7 helplines
- Multi-language context (English, Tamil, Hindi)
- Real-time WebSocket updates
- Gemini AI integration for media analysis

## Prioritized Backlog

### P0 (Critical) - Done
- [x] User authentication
- [x] Incident submission
- [x] Police incident management
- [x] Emergency numbers

### P1 (High)
- [ ] Push notifications for new incidents
- [ ] Map view with incident clustering
- [ ] Offline mode / PWA support

### P2 (Medium)
- [ ] Incident image gallery
- [ ] Audio recording support
- [ ] Admin panel for user management
- [ ] Analytics dashboard

### P3 (Low)
- [ ] Dark/Light theme toggle
- [ ] Export reports as PDF
- [ ] Incident timeline history

## Next Tasks
1. Add push notifications for police dashboard
2. Implement map view with Leaflet/Mapbox
3. Add PWA support for offline capability
4. Create admin panel for user management
