from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx
import base64
import json
import socketio
import aiofiles
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContentWithMimeType

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Settings
JWT_SECRET = os.environ.get('JWT_SECRET', 'snapaid_secure_secret_key_2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 168  # 7 days

# Gemini API Key
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')

# Socket.IO Setup
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ============ MODELS ============

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "citizen"  # citizen or police

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    name: str
    email: str
    role: str
    points: int = 0
    badges: List[str] = []
    picture: Optional[str] = None

class IncidentCreate(BaseModel):
    incident_type: str
    severity_score: int
    confidence_score: float
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    media_base64: Optional[str] = None
    media_type: Optional[str] = None
    ai_summary: Optional[str] = None

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    internal_notes: Optional[str] = None

class IncidentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    incident_id: str
    user_id: str
    user_name: Optional[str] = None
    incident_type: str
    severity_score: int
    confidence_score: float
    authenticity_score: float
    description: str
    ai_summary: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    internal_notes: Optional[str] = None
    media_url: Optional[str] = None
    created_at: str

class AnalyzeMediaRequest(BaseModel):
    media_base64: str
    media_type: str  # image/jpeg, image/png, video/mp4

# ============ HELPERS ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    # Check cookie first
    session_token = request.cookies.get("session_token")
    if session_token:
        session = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if session:
            expires_at = session.get("expires_at")
            if isinstance(expires_at, str):
                expires_at = datetime.fromisoformat(expires_at)
            if expires_at.tzinfo is None:
                expires_at = expires_at.replace(tzinfo=timezone.utc)
            if expires_at > datetime.now(timezone.utc):
                user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
                if user:
                    return user
    
    # Check Authorization header
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        # Check if it's a session token
        session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if session:
            user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
            if user:
                return user
        # Try JWT
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
            if user:
                return user
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            pass
    
    raise HTTPException(status_code=401, detail="Not authenticated")

def require_role(allowed_roles: List[str]):
    async def role_checker(request: Request):
        user = await get_current_user(request)
        if user["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Access denied")
        return user
    return role_checker

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "role": user_data.role,
        "points": 0,
        "badges": [],
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    return UserResponse(**user_doc)

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"], user["role"])
    return {
        "token": token,
        "user": UserResponse(**user).model_dump()
    }

@api_router.post("/auth/session")
async def exchange_session(request: Request):
    """Exchange Emergent OAuth session_id for session data"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        oauth_data = resp.json()
    
    # Find or create user
    user = await db.users.find_one({"email": oauth_data["email"]}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "name": oauth_data["name"],
            "email": oauth_data["email"],
            "password": "",
            "role": "citizen",
            "points": 0,
            "badges": [],
            "picture": oauth_data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user)
    else:
        # Update picture if changed
        if oauth_data.get("picture") and user.get("picture") != oauth_data["picture"]:
            await db.users.update_one(
                {"user_id": user["user_id"]},
                {"$set": {"picture": oauth_data["picture"]}}
            )
            user["picture"] = oauth_data["picture"]
    
    # Create session
    session_token = oauth_data.get("session_token", f"sess_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response = JSONResponse({
        "user": UserResponse(**user).model_dump(),
        "session_token": session_token
    })
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7*24*60*60
    )
    return response

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(request: Request):
    user = await get_current_user(request)
    return UserResponse(**user)

@api_router.post("/auth/logout")
async def logout(request: Request):
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response = JSONResponse({"message": "Logged out"})
    response.delete_cookie(key="session_token", path="/")
    return response

# ============ AI ANALYSIS ============

@api_router.post("/analyze-media")
async def analyze_media(request: Request, data: AnalyzeMediaRequest):
    await get_current_user(request)  # Ensure authenticated
    
    if not GEMINI_API_KEY:
        # Return mock analysis if no API key
        return {
            "incident_type": "Other",
            "severity_score": 3,
            "confidence_score": 0.75,
            "summary": "Unable to analyze - API key not configured. Please describe the incident manually."
        }
    
    try:
        # Save media temporarily
        media_ext = data.media_type.split('/')[-1]
        temp_path = f"/tmp/media_{uuid.uuid4().hex}.{media_ext}"
        
        media_bytes = base64.b64decode(data.media_base64)
        async with aiofiles.open(temp_path, 'wb') as f:
            await f.write(media_bytes)
        
        # Initialize Gemini chat
        chat = LlmChat(
            api_key=GEMINI_API_KEY,
            session_id=f"analysis_{uuid.uuid4().hex[:8]}",
            system_message="""You are an emergency incident analyzer. Analyze the provided image/video and respond ONLY with valid JSON in this exact format:
{
    "incident_type": "One of: Accident, Fire, Weapon, Violence, Medical, Natural Disaster, Crime, Other",
    "severity_score": "Integer from 1 (minor) to 5 (critical)",
    "confidence_score": "Float from 0.0 to 1.0 indicating how confident you are",
    "summary": "Brief 2-3 sentence description of what you see and recommended action"
}
Return ONLY the JSON object, no markdown, no code blocks, no other text."""
        ).with_model("gemini", "gemini-2.5-flash")
        
        # Analyze with Gemini
        media_file = FileContentWithMimeType(
            file_path=temp_path,
            mime_type=data.media_type
        )
        
        response = await chat.send_message(UserMessage(
            text="Analyze this emergency media and classify the incident. Respond with JSON only.",
            file_contents=[media_file]
        ))
        
        # Clean up temp file
        os.remove(temp_path)
        
        # Parse response
        response_text = str(response).strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        
        analysis = json.loads(response_text)
        
        return {
            "incident_type": analysis.get("incident_type", "Other"),
            "severity_score": int(analysis.get("severity_score", 3)),
            "confidence_score": float(analysis.get("confidence_score", 0.7)),
            "summary": analysis.get("summary", "Incident detected")
        }
        
    except Exception as e:
        logger.error(f"AI analysis error: {e}")
        return {
            "incident_type": "Other",
            "severity_score": 3,
            "confidence_score": 0.5,
            "summary": f"Analysis partial - please verify details manually."
        }

# ============ INCIDENT ROUTES ============

@api_router.post("/incidents", response_model=IncidentResponse, status_code=201)
async def create_incident(request: Request, incident: IncidentCreate):
    user = await get_current_user(request)
    
    incident_id = f"inc_{uuid.uuid4().hex[:12]}"
    
    # Calculate authenticity score (placeholder logic)
    authenticity_score = min(1.0, (incident.confidence_score * 0.5) + 0.3 + (0.1 if incident.latitude else 0) + (0.1 if incident.media_base64 else 0))
    
    # Store media as base64 URL (for demo purposes)
    media_url = None
    if incident.media_base64 and incident.media_type:
        media_url = f"data:{incident.media_type};base64,{incident.media_base64[:100]}..."  # Truncated for storage
    
    incident_doc = {
        "incident_id": incident_id,
        "user_id": user["user_id"],
        "user_name": user["name"],
        "incident_type": incident.incident_type,
        "severity_score": incident.severity_score,
        "confidence_score": incident.confidence_score,
        "authenticity_score": round(authenticity_score, 2),
        "description": incident.description,
        "ai_summary": incident.ai_summary,
        "latitude": incident.latitude,
        "longitude": incident.longitude,
        "status": "pending",
        "internal_notes": None,
        "media_url": media_url,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.incidents.insert_one(incident_doc)
    
    # Award points to user
    points_awarded = incident.severity_score * 10
    new_points = user.get("points", 0) + points_awarded
    badges = user.get("badges", [])
    
    # Badge logic
    if new_points >= 100 and "First Responder" not in badges:
        badges.append("First Responder")
    if new_points >= 500 and "Community Guardian" not in badges:
        badges.append("Community Guardian")
    if new_points >= 1000 and "Republic Day Civic Award" not in badges:
        badges.append("Republic Day Civic Award")
    
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"points": new_points, "badges": badges}}
    )
    
    # Broadcast to police dashboard via Socket.IO
    await sio.emit('new_incident', {
        **incident_doc,
        "points_awarded": points_awarded
    })
    
    return IncidentResponse(**incident_doc)

@api_router.get("/incidents", response_model=List[IncidentResponse])
async def get_incidents(
    request: Request,
    status: Optional[str] = None,
    severity: Optional[int] = None,
    incident_type: Optional[str] = None
):
    user = await get_current_user(request)
    
    query = {}
    
    # Citizens see only their incidents, police see all
    if user["role"] == "citizen":
        query["user_id"] = user["user_id"]
    
    if status:
        query["status"] = status
    if severity:
        query["severity_score"] = severity
    if incident_type:
        query["incident_type"] = incident_type
    
    incidents = await db.incidents.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return [IncidentResponse(**inc) for inc in incidents]

@api_router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(request: Request, incident_id: str):
    await get_current_user(request)
    
    incident = await db.incidents.find_one({"incident_id": incident_id}, {"_id": 0})
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    return IncidentResponse(**incident)

@api_router.patch("/incidents/{incident_id}", response_model=IncidentResponse)
async def update_incident(request: Request, incident_id: str, update: IncidentUpdate):
    user = await get_current_user(request)
    
    if user["role"] != "police":
        raise HTTPException(status_code=403, detail="Only police can update incidents")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")
    
    result = await db.incidents.update_one(
        {"incident_id": incident_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident = await db.incidents.find_one({"incident_id": incident_id}, {"_id": 0})
    
    # Broadcast update
    await sio.emit('incident_updated', incident)
    
    return IncidentResponse(**incident)

# ============ STATS ============

@api_router.get("/stats")
async def get_stats(request: Request):
    user = await get_current_user(request)
    
    if user["role"] != "police":
        raise HTTPException(status_code=403, detail="Access denied")
    
    total = await db.incidents.count_documents({})
    pending = await db.incidents.count_documents({"status": "pending"})
    dispatched = await db.incidents.count_documents({"status": "dispatched"})
    closed = await db.incidents.count_documents({"status": "closed"})
    
    # Get severity distribution
    pipeline = [
        {"$group": {"_id": "$severity_score", "count": {"$sum": 1}}}
    ]
    severity_dist = await db.incidents.aggregate(pipeline).to_list(100)
    
    # Get type distribution
    pipeline = [
        {"$group": {"_id": "$incident_type", "count": {"$sum": 1}}}
    ]
    type_dist = await db.incidents.aggregate(pipeline).to_list(100)
    
    return {
        "total": total,
        "pending": pending,
        "dispatched": dispatched,
        "closed": closed,
        "severity_distribution": {str(s["_id"]): s["count"] for s in severity_dist},
        "type_distribution": {s["_id"]: s["count"] for s in type_dist if s["_id"]}
    }

# ============ USER PROFILE ============

@api_router.get("/profile", response_model=UserResponse)
async def get_profile(request: Request):
    user = await get_current_user(request)
    return UserResponse(**user)

@api_router.get("/leaderboard")
async def get_leaderboard():
    users = await db.users.find(
        {"role": "citizen"},
        {"_id": 0, "user_id": 1, "name": 1, "points": 1, "badges": 1, "picture": 1}
    ).sort("points", -1).limit(10).to_list(10)
    return users

# ============ SOCKET.IO EVENTS ============

@sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")

@sio.event
async def join_police_room(sid, data):
    await sio.enter_room(sid, 'police_dashboard')
    logger.info(f"Client {sid} joined police dashboard")

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "SnapAid API Running", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Include router
app.include_router(api_router)

# Mount Socket.IO
app.mount("/socket.io", socket_app)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
