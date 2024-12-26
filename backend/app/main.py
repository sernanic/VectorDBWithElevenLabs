from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import content

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"  # For development only - remove in production
    ],
    allow_credentials=False,  # Changed to False since we're allowing all origins
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(content.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to the Documentation API"}
