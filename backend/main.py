from fastapi import FastAPI
from routes.userRoutes import router 


app = FastAPI()

app.include_router(router)
