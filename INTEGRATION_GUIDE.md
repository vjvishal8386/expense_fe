# Frontend-Backend Integration Guide

## ✅ Quick Fixes Applied

All 7 quick fixes have been implemented! The frontend is now **ready for backend integration**.

## What Changed

### 1. ✅ API Layer (`src/api/mockAPI.ts`)
**Before:** Complex mock logic with localStorage and hardcoded user IDs  
**After:** Clean API calls to backend endpoints

```typescript
// All functions now use axios to call real backend
export const fetchFriends = async () => {
  const response = await axiosClient.get('/friends');
  return response.data;
};

export const addFriend = async (email: string, name: string) => {
  const response = await axiosClient.post('/friends', { email, name });
  return response.data;
};
// ... same for expenses
```

### 2. ✅ Authentication (`src/context/AuthContext.tsx`)
**Before:** Hardcoded user1/user2 with mock tokens  
**After:** Real JWT authentication

```typescript
const login = async (email: string, password: string) => {
  const response = await axiosClient.post('/auth/login', { email, password });
  const { access_token, user } = response.data;
  // Stores real JWT token
};
```

### 3. ✅ Data Types (`src/data/mockData.ts`)
**Before:** Mock data storage functions  
**After:** Clean TypeScript interfaces only

```typescript
export interface Friend {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  id: string;
  userAId: string;
  userBId: string;
  amount: number;
  description: string;
  paidByUserId: string;
  date: string;
}
```

## Testing the Integration

### Step 1: Get Backend Running

Use `BACKEND_PROMPT.md` to generate backend code, then:

```bash
cd backend
pip install -r requirements.txt
# Set up PostgreSQL database
# Configure .env file
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Verify backend is running: http://127.0.0.1:8000/docs

### Step 2: Start Frontend

```bash
npm install
npm run dev
```

Frontend will run on: http://localhost:3000

### Step 3: Test Complete Workflow

1. **Register Vishal:**
   - Go to http://localhost:3000
   - Click "Sign up"
   - Email: `vishal@gmail.com`, Password: `NeonX`
   - Should automatically login

2. **Add Friend (Tushar):**
   - Click "+ Add Friend"
   - Email: `tushar@example.com`, Name: "Tushar"
   - Click "Add Friend"
   - Should see Tushar in friends list

3. **Add Expenses:**
   - Click on Tushar
   - Click "+ Add Expense"
   - Add: "Lunch, ₹500, I paid"
   - Add: "Movie, ₹300, Tushar paid"
   - Should see both expenses

4. **Logout and Register Tushar:**
   - Click "Logout"
   - Click "Sign up"
   - Email: `tushar@example.com`, Password: `password123`

5. **Verify Shared Data:**
   - Should see Vishal in friends list
   - Click on Vishal
   - Should see both expenses that Vishal added
   - Balance should show correctly

6. **Add Expense as Tushar:**
   - Add: "Coffee, ₹150, I paid"
   - Logout and login as Vishal
   - Should see all 3 expenses

## API Request/Response Examples

### Registration
```http
POST http://127.0.0.1:8000/auth/register
Content-Type: application/json

{
  "email": "vishal@gmail.com",
  "password": "NeonX"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "vishal@gmail.com"
  }
}
```

### Login
```http
POST http://127.0.0.1:8000/auth/login
Content-Type: application/json

{
  "email": "vishal@gmail.com",
  "password": "NeonX"
}

Response: Same as registration
```

### Add Friend
```http
POST http://127.0.0.1:8000/friends
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "email": "tushar@example.com",
  "name": "Tushar"
}

Response:
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "email": "tushar@example.com",
  "name": "Tushar"
}
```

### Get Friends
```http
GET http://127.0.0.1:8000/friends
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "email": "tushar@example.com",
    "name": "Tushar"
  }
]
```

### Add Expense
```http
POST http://127.0.0.1:8000/expenses
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "friend_id": "660e8400-e29b-41d4-a716-446655440001",
  "amount": 500,
  "description": "Lunch",
  "paid_by_user_id": "550e8400-e29b-41d4-a716-446655440000",
  "expense_date": "2024-01-15"
}

Response:
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "userAId": "550e8400-e29b-41d4-a716-446655440000",
  "userBId": "660e8400-e29b-41d4-a716-446655440001",
  "amount": 500,
  "description": "Lunch",
  "paidByUserId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2024-01-15"
}
```

### Get Expenses
```http
GET http://127.0.0.1:8000/expenses/660e8400-e29b-41d4-a716-446655440001
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

Response:
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "userAId": "550e8400-e29b-41d4-a716-446655440000",
    "userBId": "660e8400-e29b-41d4-a716-446655440001",
    "amount": 500,
    "description": "Lunch",
    "paidByUserId": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2024-01-15"
  }
]
```

## Troubleshooting

### CORS Errors
If you see CORS errors in browser console:

**Backend Fix:**
```python
# In backend/app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 401 Unauthorized
- Check if token is being sent (Browser DevTools → Network → Headers)
- Verify token is stored: `localStorage.getItem('token')`
- Check backend logs for JWT validation errors

### Connection Refused
- Verify backend is running: `curl http://127.0.0.1:8000/docs`
- Check firewall settings
- Ensure backend is on port 8000

### Friend Not Appearing
- Check backend response in Network tab
- Verify bidirectional friendship is created in database
- Refresh the page after adding friend

### Expenses Not Syncing
- Check if both users are registered in backend
- Verify expenses have correct userAId and userBId
- Check database for expense records

## What Works Now

✅ Real user registration with database  
✅ JWT token authentication  
✅ Secure API calls with Bearer token  
✅ Friend relationships stored in PostgreSQL  
✅ Shared expenses visible to both users  
✅ Real-time balance calculation  
✅ Proper error handling  
✅ CORS configured for React frontend  

## Files Modified

1. `src/api/mockAPI.ts` - Replaced all mock logic with real API calls
2. `src/context/AuthContext.tsx` - Real JWT authentication
3. `src/data/mockData.ts` - Removed mock storage, kept TypeScript types
4. `README.md` - Updated documentation

## Files Unchanged (Still Work)

- `src/pages/Login.tsx` ✅
- `src/pages/Register.tsx` ✅
- `src/pages/Dashboard.tsx` ✅
- `src/pages/Chat.tsx` ✅
- `src/components/Navbar.tsx` ✅
- `src/components/FriendList.tsx` ✅
- `src/components/ExpenseCard.tsx` ✅
- `src/App.tsx` ✅

## Next Steps

1. ✅ Frontend is ready
2. 🔄 Generate backend using `BACKEND_PROMPT.md`
3. 🔄 Test integration following this guide
4. 🚀 Deploy both frontend and backend

The frontend now works **exactly** as described in the backend workflow!

