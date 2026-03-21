import os
import config  # noqa: F401 — loads .env.{APP_ENV}
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.auth import AuthMiddleware
from routes import chat_router
from routes import prompt_router
from routes import prompt_legacy_router
from routes import philosophers_router
from routes import users_router

frontend_url = os.getenv("FRONTEND_URL")

app = FastAPI()

origins = [
	"http://localhost:5173", # Local React App
	"http://localhost",
	frontend_url,
]

# Auth middleware runs after CORS (middleware stack is LIFO, so add auth first)
app.add_middleware(AuthMiddleware)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(prompt_router, prefix="/api")
app.include_router(prompt_legacy_router, prefix="/api")
app.include_router(philosophers_router, prefix="/api")
app.include_router(users_router, prefix="/api")

@app.get("/")
async def root():
	return { "message": "Logos server is up and running" }

@app.get("/health")
async def health_check():
	"""
	Health check endpoint to verify the API is running properly.
	Returns the status of the API and basic system information.
	"""
	return {
		"status": "healthy",
		"message": "API is running successfully",
		"service": "who-backend",
		"version": "1.0.0"
	}

