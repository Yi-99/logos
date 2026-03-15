import os
from dotenv import load_dotenv

APP_ENV = os.getenv("APP_ENV", "local")

load_dotenv(f".env.{APP_ENV}")
