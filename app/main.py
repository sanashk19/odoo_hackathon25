from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import json
import os

app = FastAPI(title="SafeNavi Admin API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Data Models
class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str = "user"
    status: str = "active"
    created_at: str

class WorkflowNode(BaseModel):
    id: str
    type: str
    name: str
    position: Dict[str, int]
    data: Dict[str, Any] = {}

class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str = ""

class Workflow(BaseModel):
    id: str
    name: str
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]
    created_at: str
    updated_at: str

class Expense(BaseModel):
    id: str
    user_id: str
    amount: float
    category: str
    description: str
    status: str = "pending"
    created_at: str

# In-memory storage (replace with database in production)
db = {
    "users": [],
    "workflows": [],
    "expenses": []
}

# Initialize with sample data
if not db["users"]:
    db["users"].append({
        "id": str(uuid.uuid4()),
        "name": "Admin User",
        "email": "admin@safenavi.com",
        "role": "admin",
        "status": "active",
        "created_at": datetime.utcnow().isoformat()
    })

# Initialize with sample expenses for testing
if not db["expenses"]:
    sample_expenses = [
        {"id": str(uuid.uuid4()), "user_id": "user1", "amount": 150.00, "category": "Travel", "description": "Flight tickets", "status": "approved", "created_at": datetime.utcnow().isoformat()},
        {"id": str(uuid.uuid4()), "user_id": "user2", "amount": 45.50, "category": "Meals", "description": "Team lunch", "status": "pending", "created_at": datetime.utcnow().isoformat()},
        {"id": str(uuid.uuid4()), "user_id": "user1", "amount": 200.00, "category": "Accommodation", "description": "Hotel stay", "status": "approved", "created_at": datetime.utcnow().isoformat()},
        {"id": str(uuid.uuid4()), "user_id": "user3", "amount": 75.00, "category": "Travel", "description": "Taxi fare", "status": "pending", "created_at": datetime.utcnow().isoformat()},
        {"id": str(uuid.uuid4()), "user_id": "user2", "amount": 120.00, "category": "Office Supplies", "description": "Stationery", "status": "approved", "created_at": datetime.utcnow().isoformat()},
    ]
    db["expenses"].extend(sample_expenses)

# Helper Functions
def get_db():
    return db

def save_db():
    with open("db.json", "w") as f:
        json.dump(db, f, indent=2)

try:
    with open("db.json", "r") as f:
        db.update(json.load(f))
except FileNotFoundError:
    save_db()

# API Endpoints
@app.get("/api/users", response_model=List[User])
async def get_users():
    return db["users"]

@app.post("/api/users", status_code=status.HTTP_201_CREATED)
async def create_user(user: User):
    user.id = str(uuid.uuid4())
    user.created_at = datetime.utcnow().isoformat()
    db["users"].append(user.dict())
    save_db()
    return user

@app.get("/api/workflows", response_model=List[Workflow])
async def get_workflows():
    return db["workflows"]

@app.post("/api/workflows", status_code=status.HTTP_201_CREATED)
async def create_workflow(workflow: Workflow):
    workflow.id = str(uuid.uuid4())
    workflow.created_at = datetime.utcnow().isoformat()
    workflow.updated_at = workflow.created_at
    db["workflows"].append(workflow.dict())
    save_db()
    return workflow

@app.put("/api/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, workflow: Workflow):
    for i, wf in enumerate(db["workflows"]):
        if wf["id"] == workflow_id:
            workflow.updated_at = datetime.utcnow().isoformat()
            db["workflows"][i] = workflow.dict()
            save_db()
            return workflow
    raise HTTPException(status_code=404, detail="Workflow not found")

@app.get("/api/expenses", response_model=List[Expense])
async def get_expenses():
    return db["expenses"]

@app.post("/api/expenses/analyze")
async def analyze_expenses():
    # Simple analysis - in a real app, you'd use ML here
    expenses = db["expenses"]
    total = sum(e["amount"] for e in expenses)
    by_category = {}
    for e in expenses:
        by_category[e["category"]] = by_category.get(e["category"], 0) + e["amount"]
    
    return {
        "total_expenses": total,
        "by_category": by_category,
        "average_per_user": total / len(expenses) if expenses else 0,
        "insights": [
            f"Top spending category: {max(by_category.items(), key=lambda x: x[1])[0] if by_category else 'N/A'}",
            f"Total expenses: ${total:.2f}",
            f"Average per user: ${(total / len(expenses)) if expenses else 0:.2f}"
        ]
    }

# Serve the admin panel
@app.get("/admin", response_class=HTMLResponse)
async def serve_admin():
    with open("static/src/admin.html") as f:
        return HTMLResponse(content=f.read(), status_code=200)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
