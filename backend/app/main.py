from fastapi import FastAPI
from .routes import auth_routes, user_routes, websocket_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.1.83:3000",
    "http://192.168.42.47:3000",
    "http://localhost:3000",
    "https://c7ce81358e90.ngrok-free.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(websocket_routes.router)

