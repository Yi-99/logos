import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat_router
from routes import prompt_router
from routes import philosopher_router
from dotenv import load_dotenv

load_dotenv()

frontend_url = os.getenv("FRONTEND_URL")

app = FastAPI()

origins = [
	"http://localhost:5173", # Local React App
	"http://localhost",
	frontend_url,
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(prompt_router, prefix="/api")
app.include_router(philosopher_router, prefix="/api")

@app.get("/")
async def root():
	return { "message": "Hello World" }

@app.get("/health")
async def health_check():
	"""
	Health check endpoint to verify the API is running properly.
	Returns the status of the API and basic system information.
	"""
	return {
		"status": "healthy",
		"message": "API is running successfully",
		"service": "logos-backend",
		"version": "1.0.0"
	}

