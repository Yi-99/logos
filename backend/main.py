from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat_router
from routes import prompt_router
from routes import philosophers_router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
	"http://localhost:5173", # Local React App
	"http://localhost",
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")
app.include_router(prompt_router, prefix="/api")
app.include_router(philosophers_router, prefix="/api")

@app.get("/")
async def root():
	"""Health check endpoint"""
	return { "status": "healthy" }
