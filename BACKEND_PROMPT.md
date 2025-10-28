# FastAPI Backend for Expense Tracker App

## Project Overview
I need a FastAPI backend for a React + TypeScript expense tracker application. The app allows users to manage shared expenses with friends in a one-on-one format (not group expenses). Users can track who paid for what and see balances with each friend.

## Key Features Required
1. **User Authentication:** JWT-based auth with email/password
2. **Friend Management:** Add friends, view friends list
3. **Expense Management:** Add expenses between two users, view expense history
4. **Real-time Balance Calculation:** Calculate balance between two users
5. **Shared Data:** When User A adds an expense with User B, both users should see it

## Database Schema

### Users Table
- `id` (UUID, primary key)
- `email` (string, unique, indexed)
- `password_hash` (string)
- `name` (string, optional)
- `created_at` (timestamp)

### Friends Table (Junction table for user relationships)
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key -> users.id)
- `friend_id` (UUID, foreign key -> users.id)
- `created_at` (timestamp)
- Unique constraint on (user_id, friend_id)
- Note: Friendship should be bidirectional (if A adds B, both see each other as friends)

### Expenses Table
- `id` (UUID, primary key)
- `user_a_id` (UUID, foreign key -> users.id) - One user in the expense
- `user_b_id` (UUID, foreign key -> users.id) - Other user in the expense
- `amount` (decimal/float)
- `description` (string)
- `paid_by_user_id` (UUID, foreign key -> users.id) - Who paid for this expense
- `expense_date` (date)
- `created_at` (timestamp)
- `updated_at` (timestamp)

Note: `paid_by_user_id` must be either `user_a_id` or `user_b_id`

## API Endpoints Needed

### Authentication
```
POST /auth/register
- Body: { "email": string, "password": string }
- Returns: { "access_token": string, "user": { "id": string, "email": string } }

POST /auth/login
- Body: { "email": string, "password": string }
- Returns: { "access_token": string, "user": { "id": string, "email": string } }

GET /auth/me
- Headers: Authorization: Bearer <token>
- Returns: { "id": string, "email": string }
```

### Friends
```
GET /friends
- Headers: Authorization: Bearer <token>
- Returns: [{ "id": string, "email": string, "name": string }]
- Note: Return all users who are friends with the current user

POST /friends
- Headers: Authorization: Bearer <token>
- Body: { "email": string, "name": string }
- Returns: { "id": string, "email": string, "name": string }
- Note: Add a friend by email. Create bidirectional friendship.
- If friend_email doesn't exist in users table, create a pending friend entry
```

### Expenses
```
GET /expenses/{friend_id}
- Headers: Authorization: Bearer <token>
- Returns: [{
    "id": string,
    "userAId": string,
    "userBId": string,
    "amount": number,
    "description": string,
    "paidByUserId": string,
    "date": string (ISO format)
  }]
- Note: Return all expenses between current user and friend_id

POST /expenses
- Headers: Authorization: Bearer <token>
- Body: {
    "friend_id": string,
    "amount": number,
    "description": string,
    "paid_by_user_id": string,  // Must be current user or friend_id
    "expense_date": string (ISO format)
  }
- Returns: {
    "id": string,
    "userAId": string,
    "userBId": string,
    "amount": number,
    "description": string,
    "paidByUserId": string,
    "date": string
  }
- Note: Create expense between current user and friend

GET /expenses/{friend_id}/balance
- Headers: Authorization: Bearer <token>
- Returns: { "balance": number }
- Note: Positive = friend owes current user, Negative = current user owes friend
- Balance = sum of (expenses where current_user paid) - sum of (expenses where friend paid)
```

## Technical Requirements

### Tech Stack
- **Framework:** FastAPI (Python 3.9+)
- **Database:** PostgreSQL (use SQLAlchemy ORM)
- **Authentication:** JWT tokens (python-jose, passlib for password hashing)
- **CORS:** Enable CORS for frontend (http://localhost:3000)
- **Validation:** Pydantic models for request/response validation

### Project Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI app initialization, CORS, routers
│   ├── database.py          # Database connection, session management
│   ├── models/
│   │   ├── user.py          # SQLAlchemy User model
│   │   ├── friend.py        # SQLAlchemy Friend model
│   │   └── expense.py       # SQLAlchemy Expense model
│   ├── schemas/
│   │   ├── auth.py          # Pydantic schemas for auth
│   │   ├── friend.py        # Pydantic schemas for friends
│   │   └── expense.py       # Pydantic schemas for expenses
│   ├── routers/
│   │   ├── auth.py          # Auth endpoints
│   │   ├── friends.py       # Friends endpoints
│   │   └── expenses.py      # Expenses endpoints
│   ├── dependencies.py      # Dependency injection (get_db, get_current_user)
│   └── security.py          # JWT creation/validation, password hashing
├── alembic/                 # Database migrations
├── requirements.txt
├── .env.example
└── README.md
```

### Dependencies (requirements.txt)
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
pydantic[email]==2.5.0
alembic==1.12.1
python-dotenv==1.0.0
```

## Important Implementation Details

### Authentication
- Use bcrypt for password hashing
- JWT tokens with 7-day expiration
- Include user_id in JWT payload
- Protect all endpoints except /auth/register and /auth/login

### Friend Relationships
- When User A adds User B as a friend:
  - Create entry: (user_a_id, user_b_id)
  - Also create reverse entry: (user_b_id, user_a_id) for bidirectional friendship
- When fetching friends, return only unique friends (don't duplicate)

### Expense Logic
- Store expenses with both user IDs (user_a_id, user_b_id)
- Track who paid (paid_by_user_id)
- When User A creates expense with User B:
  - Both users can see this expense
  - user_a_id = current user, user_b_id = friend_id
- When fetching expenses between two users, check both directions:
  - WHERE (user_a_id = current AND user_b_id = friend) OR (user_a_id = friend AND user_b_id = current)

### Balance Calculation
From current user's perspective:
```python
balance = 0
for expense in expenses_with_friend:
    if expense.paid_by_user_id == current_user_id:
        balance += expense.amount  # Friend owes me
    else:
        balance -= expense.amount  # I owe friend
return balance
```

### CORS Configuration
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Environment Variables (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days
```

## Expected Behavior

### Example Flow:
1. **User Registration:**
   - Vishal registers with `vishal@gmail.com`
   - System creates user with hashed password
   - Returns JWT token

2. **Add Friend:**
   - Vishal adds friend with email `tushar@example.com`
   - System creates bidirectional friendship
   - If Tushar doesn't exist, creates placeholder entry

3. **Add Expense:**
   - Vishal adds expense: "Lunch, ₹500, I paid"
   - System stores: user_a=vishal, user_b=tushar, paid_by=vishal, amount=500

4. **Tushar Logs In:**
   - Tushar logs in with `tushar@example.com`
   - Fetches friends list → sees Vishal
   - Opens chat with Vishal → sees the ₹500 lunch expense
   - Balance shows: "You owe Vishal ₹500"

5. **Tushar Adds Expense:**
   - Tushar adds: "Coffee, ₹150, I paid"
   - Both users now see both expenses
   - Balance updates: Tushar owes Vishal ₹350

## Best Practices
1. Use async/await for database operations
2. Implement proper error handling (try/except)
3. Return appropriate HTTP status codes
4. Use dependency injection for database sessions
5. Validate all inputs with Pydantic models
6. Hash passwords before storing
7. Use database transactions for related operations
8. Add database indexes on frequently queried fields (email, user_ids)
9. Implement proper logging
10. Add API documentation (FastAPI auto-generates Swagger docs)

## Testing
After implementation, test with:
- Run backend: `uvicorn app.main:app --reload --port 8000`
- Frontend expects backend at: `http://127.0.0.1:8000`
- Test registration, login, add friend, add expenses
- Verify data is shared between users

## Additional Notes
- All endpoints return JSON
- Date format: ISO 8601 (YYYY-MM-DD)
- Currency: No specific handling needed, frontend uses ₹ symbol
- No need for email verification or password reset (MVP)
- No need for deleting expenses or friends (MVP)
- No need for editing expenses (MVP)

Please generate clean, production-ready FastAPI code following these specifications.

