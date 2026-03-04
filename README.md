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

<table>
	<tr>
		<td><img src="public/WhatsApp%20Image%202026-03-04%20at%2023.40.17%20%281%29.jpeg" alt="Prototype 1" width="100%" /></td>
		<td><img src="public/WhatsApp%20Image%202026-03-04%20at%2023.40.17.jpeg" alt="Prototype 2" width="100%" /></td>
	</tr>
	<tr>
		<td><img src="public/WhatsApp%20Image%202026-03-04%20at%2023.40.18%20%281%29.jpeg" alt="Prototype 3" width="100%" /></td>
		<td><img src="public/WhatsApp%20Image%202026-03-04%20at%2023.40.18%20%282%29.jpeg" alt="Prototype 4" width="100%" /></td>
	</tr>
	<tr>
		<td><img src="public/WhatsApp%20Image%202026-03-04%20at%2023.40.18.jpeg" alt="Prototype 5" width="100%" /></td>
		<td><img src="public/WhatsApp%20Image%202026-03-04%20at%2023.40.19%20%281%29.jpeg" alt="Prototype 6" width="100%" /></td>
	</tr>
	<tr>
		<td><img src="public/WhatsApp%20Image%202026-03-04%20at%2023.40.19%20%282%29.jpeg" alt="Prototype 7" width="100%" /></td>
		<td><img src="public/WhatsApp%20Image%202026-03-04%20at%2023.40.19.jpeg" alt="Prototype 8" width="100%" /></td>
	</tr>
</table>

