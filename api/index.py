import sys
import os
from fastapi import FastAPI

# Add the root directory to the python path so 'backend.app' can be resolved
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app as backend_app

# Mount the backend app under /api so it matches the Vercel routing
app = FastAPI()
app.mount("/api", backend_app)
