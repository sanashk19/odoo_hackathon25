# Admin Panel Backend Integration - Complete Setup Guide

## ✅ What's Been Implemented

### Backend (Python FastAPI)
- **Location**: `/app/main.py`
- **Port**: `http://localhost:8000`
- **Status**: ✅ Running

### Features Implemented

#### 1. **User Management** ✅
- **Add User**: Create new users via API
- **List Users**: Fetch all users from backend
- **API Endpoint**: `POST /api/users`, `GET /api/users`
- **Frontend Integration**: Connected to "Add User" button in admin.html

#### 2. **Workflow Builder** ✅
- **Save Workflow**: Save workflow configurations to backend
- **New Workflow**: Create new workflow with clean state
- **Test Workflow**: Visual workflow testing with node highlighting
- **API Endpoints**: 
  - `POST /api/workflows` - Create new workflow
  - `PUT /api/workflows/{id}` - Update existing workflow
  - `GET /api/workflows` - List all workflows
- **Frontend Integration**: All workflow buttons connected

#### 3. **AI Assistant - Expense Analysis** ✅
- **Re-analyze Expenses**: Fetch real-time expense analysis from backend
- **View Insights**: Display detailed expense breakdown
- **API Endpoint**: `POST /api/expenses/analyze`
- **Features**:
  - Total expenses calculation
  - Category-wise breakdown
  - Average per user
  - Top spending insights
- **Frontend Integration**: Connected to "Re-analyze Expenses" and "View Expense Insights" buttons

## 🚀 How to Use

### 1. Start the Backend Server
```bash
cd /Users/jiya/odoo_hackathon25/app
python3 main.py
```

### 2. Access the Admin Panel
Open your browser and navigate to:
```
http://localhost:8000/admin
```

Or directly open the HTML file and it will connect to the backend API.

### 3. Test the Features

#### Add User
1. Click "Add User" button
2. Fill in user details (name, email, role, status)
3. Click "Save User"
4. User will be saved to backend and displayed in the table

#### Workflow Builder
1. Go to "Approval Workflow Builder" section
2. Drag components to the canvas
3. Click "Save Workflow" - saves to backend
4. Click "New Workflow" - creates a fresh workflow
5. Click "Test Workflow" - runs visual test simulation

#### AI Expense Analysis
1. Go to "AI Policy Assistant" section
2. Click "Re-analyze Expenses" - fetches analysis from backend
3. Click "View Expense Insights" - displays detailed breakdown
4. Results appear in the AI chat window

## 📁 File Structure

```
/Users/jiya/odoo_hackathon25/
├── app/
│   ├── main.py              # FastAPI backend server
│   ├── requirements.txt     # Python dependencies
│   ├── db.json             # Data storage (auto-created)
│   └── static/             # Symlink to ../static
├── static/
│   └── src/
│       ├── admin.html      # Admin panel UI
│       ├── admin.js        # Frontend with backend integration
│       └── admin.css       # Styles
└── BACKEND_SETUP.md        # This file
```

## 🔧 API Endpoints

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create new user

### Workflows
- `GET /api/workflows` - List all workflows
- `POST /api/workflows` - Create new workflow
- `PUT /api/workflows/{id}` - Update workflow

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses/analyze` - Analyze expenses with AI

## 📊 Data Storage

Currently using JSON file storage (`db.json`) for development.
For production, replace with PostgreSQL or MongoDB.

## 🎯 Next Steps (Optional Enhancements)

1. Add user authentication with JWT tokens
2. Implement real database (PostgreSQL/MongoDB)
3. Add more AI features (predictive analytics, anomaly detection)
4. Implement real-time updates with WebSockets
5. Add data export functionality (CSV, PDF)
6. Implement role-based access control

## 🐛 Troubleshooting

### Server won't start
- Check if port 8000 is already in use: `lsof -i :8000`
- Kill existing process: `pkill -f "python3 main.py"`

### CORS errors
- Backend has CORS enabled for all origins
- Check browser console for specific errors

### API not responding
- Verify server is running: `curl http://localhost:8000/api/users`
- Check server logs for errors

## ✨ Summary

All requested features are now fully functional:
- ✅ Add User (with backend)
- ✅ Save Workflow (with backend)
- ✅ New Workflow (with backend)
- ✅ Test Workflow (with visual feedback)
- ✅ Re-analyze Expenses (with backend AI)
- ✅ View Expense Insights (with backend AI)

The admin panel is now a fully functional application with a Python FastAPI backend!
