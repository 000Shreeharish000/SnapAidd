# Installation & Setup

## One-time setup (from project root)

```powershell
cd "c:\Users\Shree Harish V\Desktop\snapaid\SnapAidd-main"
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
@" MONGO_URL=mongodb://localhost:27017 DB_NAME=snapaid GEMINI_API_KEY=your_gemini_key JWT_SECRET=snapaid_secure_secret_key_2024 "@ | Set-Content .env
```

## Run backend (Terminal 1)

```powershell
cd "c:\Users\Shree Harish V\Desktop\snapaid\SnapAidd-main\backend"
.\.venv\Scripts\Activate.ps1
uvicorn server:app --reload --port 8000
```

## Run frontend (Terminal 2)

```powershell
cd "c:\Users\Shree Harish V\Desktop\snapaid\SnapAidd-main\frontend"
npm install
"REACT_APP_BACKEND_URL=http://localhost:8000" | Set-Content .env
npm start
```

## If MongoDB is not already running

```powershell
net start MongoDB
# If service is unavailable: mongod --dbpath "C:\data\db"
```

### Daily use after setup:
Start MongoDB (if needed), then run backend in one terminal and frontend in another.


# Environment Variables

- MONGO_URL
- DB_NAME
- GEMINI_API_KEY
- JWT_SECRET

## Prototype Image

![Prototype 1](public/WhatsApp%20Image%202026-03-04%20at%2023.40.17%20%281%29.jpeg)
![Prototype 2](public/WhatsApp%20Image%202026-03-04%20at%2023.40.17.jpeg)
![Prototype 3](public/WhatsApp%20Image%202026-03-04%20at%2023.40.18%20%281%29.jpeg)
![Prototype 4](public/WhatsApp%20Image%202026-03-04%20at%2023.40.18%20%282%29.jpeg)
![Prototype 5](public/WhatsApp%20Image%202026-03-04%20at%2023.40.18.jpeg)
![Prototype 6](public/WhatsApp%20Image%202026-03-04%20at%2023.40.19%20%281%29.jpeg)
![Prototype 7](public/WhatsApp%20Image%202026-03-04%20at%2023.40.19%20%282%29.jpeg)
![Prototype 8](public/WhatsApp%20Image%202026-03-04%20at%2023.40.19.jpeg)

