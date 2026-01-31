from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import ensure_database_exists, create_tables

from routers import user, tender, bid

# ensure_database_exists()
# drop_tables()
create_tables()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
	return {"message": "Hello World" }

app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(tender.router, prefix="/tenders", tags=["tenders"])
app.include_router(bid.router, prefix="/bids", tags=["bids"])