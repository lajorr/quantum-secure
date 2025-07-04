from fastapi import FastAPI, WebSocket
from .controller import websocket_controller
from .routes import auth_routes, user_routes, websocket_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(user_routes.router)
app.include_router(auth_routes.router)
app.include_router(websocket_routes.router)


origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
