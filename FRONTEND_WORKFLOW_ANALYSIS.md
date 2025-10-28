# Frontend Workflow Analysis

## Current Frontend State vs Backend Requirements

### ✅ **Step 1: User Registration** - WORKS
**Frontend Code:**
```typescript
// src/context/AuthContext.tsx (line 68-88)
const register = async (email: string, password: string) => {
  const user = { id: 'user_' + Date.now(), email: email };
  // Stores token and user in localStorage
}
```

**Backend Expected Response:**
```json
{
  "access_token": "jwt_token",
  "user": { "id": "uuid", "email": "vishal@gmail.com" }
}
```

**Status:** ✅ Compatible - Frontend accepts user object from backend

---

### ✅ **Step 2: Add Friend** - WORKS (with minor issue)
**Frontend Code:**
```typescript
// src/api/mockAPI.ts (line 88-94)
if (email === 'tushar@example.com') {
  friendId = 'user2';
  friendName = 'Tushar';
}
```

**Issue:** Frontend hardcodes user2 for tushar@example.com. When backend returns actual UUID, this won't work.

**Backend Expected Request:**
```json
POST /friends
{ "email": "tushar@example.com", "name": "Tushar" }
```

**Backend Response:**
```json
{ "id": "uuid-of-tushar", "email": "tushar@example.com", "name": "Tushar" }
```

**Status:** ⚠️ **NEEDS UPDATE** - Remove hardcoded user1/user2 logic

---

### ✅ **Step 3: Add Expense** - WORKS
**Frontend Code:**
```typescript
// src/pages/Chat.tsx (line 71-77)
const paidByUserId = paidBy === 'me' ? user.id : friendId;
await addExpense(user.id, friendId, amountNum, description, paidByUserId, today);
```

**Backend Expected Request:**
```json
POST /expenses
{
  "friend_id": "uuid",
  "amount": 500,
  "description": "Lunch",
  "paid_by_user_id": "uuid",
  "expense_date": "2024-01-15"
}
```

**Backend Response:**
```json
{
  "id": "uuid",
  "userAId": "uuid",
  "userBId": "uuid",
  "amount": 500,
  "description": "Lunch",
  "paidByUserId": "uuid",
  "date": "2024-01-15"
}
```

**Status:** ✅ Compatible - Frontend sends correct data structure

---

### ⚠️ **Step 4: Tushar Logs In and Sees Vishal** - NEEDS FIX
**Frontend Code:**
```typescript
// src/api/mockAPI.ts (line 17-23)
allExpenses.forEach(expense => {
  if (expense.userAId === currentUserId) {
    friendIdsFromExpenses.add(expense.userBId);
  } else if (expense.userBId === currentUserId) {
    friendIdsFromExpenses.add(expense.userAId);
  }
});

// Lines 32-35 - Hardcoded user matching
if (friendId === 'user1' && currentUserId !== 'user1') {
  storedFriends.push({ id: friendId, name: 'Vishal', email: 'vishal@gmail.com' });
}
```

**Issue:** Hardcodes 'user1' and 'user2'. Backend will return UUIDs.

**Backend Expected Response:**
```json
GET /friends
[
  { "id": "uuid-of-vishal", "email": "vishal@gmail.com", "name": "Vishal" }
]
```

**Status:** ⚠️ **NEEDS UPDATE** - Remove hardcoded user1/user2 checks

---

### ✅ **Step 5: Both Users See Expenses** - WORKS
**Frontend Code:**
```typescript
// src/api/mockAPI.ts (line 115-120)
return allExpenses.filter(expense => {
  return (
    (expense.userAId === currentUserId && expense.userBId === friendId) ||
    (expense.userBId === currentUserId && expense.userAId === friendId)
  );
});
```

**Backend Expected Response:**
```json
GET /expenses/{friend_id}
[
  {
    "id": "uuid",
    "userAId": "uuid",
    "userBId": "uuid",
    "amount": 500,
    "description": "Lunch",
    "paidByUserId": "uuid",
    "date": "2024-01-15"
  }
]
```

**Status:** ✅ Compatible - Logic works with any user IDs

---

## Critical Issues to Fix Before Backend Integration

### 🔴 Issue 1: Hardcoded User IDs in `fetchFriends()`
**Location:** `src/api/mockAPI.ts` lines 30-50

**Current Code:**
```typescript
if (friendId === 'user1' && currentUserId !== 'user1') {
  storedFriends.push({ id: friendId, name: 'Vishal', email: 'vishal@gmail.com' });
} else if (friendId === 'user2' && currentUserId !== 'user2') {
  storedFriends.push({ id: friendId, name: 'Tushar', email: 'tushar@example.com' });
}
```

**Problem:** Backend returns UUIDs, not 'user1' or 'user2'

**Solution:** Remove these hardcoded checks. Backend will return friend data directly.

---

### 🔴 Issue 2: Hardcoded User IDs in `addFriend()`
**Location:** `src/api/mockAPI.ts` lines 88-94

**Current Code:**
```typescript
if (email === 'tushar@example.com') {
  friendId = 'user2';
  friendName = 'Tushar';
} else if (email === 'vishal@gmail.com') {
  friendId = 'user1';
  friendName = 'Vishal';
}
```

**Problem:** Backend will return actual user UUIDs based on email lookup

**Solution:** Let backend handle user lookup by email and return the friend object

---

### 🔴 Issue 3: Friend Normalization Logic
**Location:** `src/api/mockAPI.ts` lines 57-64

**Current Code:**
```typescript
storedFriends = storedFriends.map(friend => {
  if (friend.email === 'tushar@example.com' && friend.id !== 'user2') {
    return { id: 'user2', name: 'Tushar', email: 'tushar@example.com' };
  }
  // ...
});
```

**Problem:** Tries to normalize to hardcoded IDs

**Solution:** Remove this logic - backend ensures data consistency

---

## What Works Without Changes

### ✅ Authentication Flow
- Login/Register UI ✅
- Token storage ✅
- Protected routes ✅
- Axios interceptor adds token ✅

### ✅ Expense Management
- Add expense form ✅
- Expense display ✅
- Balance calculation ✅
- Expense filtering by friend ✅

### ✅ UI Components
- Dashboard ✅
- Chat page ✅
- ExpenseCard ✅
- FriendList ✅
- Navbar ✅

---

## Required Frontend Updates for Backend

### Update 1: Simplify `fetchFriends()` in `src/api/mockAPI.ts`

**Replace lines 7-70 with:**
```typescript
export const fetchFriends = async (currentUserId: string): Promise<Friend[]> => {
  const response = await axiosClient.get('/friends');
  return response.data;
};
```

Backend handles all friend relationship logic.

---

### Update 2: Simplify `addFriend()` in `src/api/mockAPI.ts`

**Replace lines 72-108 with:**
```typescript
export const addFriend = async (email: string, name: string): Promise<Friend> => {
  const response = await axiosClient.post('/friends', { email, name });
  return response.data;
};
```

Backend handles user lookup and bidirectional friendship.

---

### Update 3: Update `fetchExpenses()` in `src/api/mockAPI.ts`

**Replace lines 110-121 with:**
```typescript
export const fetchExpenses = async (
  currentUserId: string,
  friendId: string
): Promise<Expense[]> => {
  const response = await axiosClient.get(`/expenses/${friendId}`);
  return response.data;
};
```

---

### Update 4: Update `addExpense()` in `src/api/mockAPI.ts`

**Replace lines 123-147 with:**
```typescript
export const addExpense = async (
  currentUserId: string,
  friendId: string,
  amount: number,
  description: string,
  paidByUserId: string,
  date: string
): Promise<Expense> => {
  const response = await axiosClient.post('/expenses', {
    friend_id: friendId,
    amount,
    description,
    paid_by_user_id: paidByUserId,
    expense_date: date,
  });
  return response.data;
};
```

---

### Update 5: Update `calculateBalance()` in `src/api/mockAPI.ts`

**Keep as is - logic is correct:**
```typescript
export const calculateBalance = (expenses: Expense[], currentUserId: string): number => {
  return expenses.reduce((balance, expense) => {
    if (expense.paidByUserId === currentUserId) {
      return balance + expense.amount;
    } else {
      return balance - expense.amount;
    }
  }, 0);
};
```

---

### Update 6: Update `login()` in `src/context/AuthContext.tsx`

**Replace mock login (lines 39-66) with:**
```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await axiosClient.post('/auth/login', {
      email,
      password,
    });
    
    const { access_token, user } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};
```

---

### Update 7: Update `register()` in `src/context/AuthContext.tsx`

**Replace mock register (lines 68-88) with:**
```typescript
const register = async (email: string, password: string) => {
  try {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const response = await axiosClient.post('/auth/register', {
      email,
      password,
    });
    
    const { access_token, user } = response.data;
    
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  } catch (error: any) {
    console.error('Register error:', error);
    throw new Error(error.response?.data?.detail || 'Registration failed');
  }
};
```

---

## Summary

### Current Status:
- ✅ **70% Ready** - Core logic and UI work correctly
- ⚠️ **30% Needs Updates** - Remove mock/hardcoded logic

### What Needs Fixing:
1. Remove localStorage-based data storage
2. Remove hardcoded user1/user2 logic
3. Replace mock API calls with real axios calls
4. Import axiosClient in mockAPI.ts

### After Backend Integration:
The workflow will work **exactly as described** in the backend prompt:
1. ✅ Vishal registers → Gets UUID from backend
2. ✅ Adds Tushar → Backend creates bidirectional friendship
3. ✅ Adds expenses → Stored in PostgreSQL
4. ✅ Tushar logs in → Backend returns Vishal as friend
5. ✅ Both see expenses → Backend returns all shared expenses

### Action Items:
1. Get backend code from AI using BACKEND_PROMPT.md
2. Apply the 7 updates listed above to frontend
3. Test the complete workflow
4. Deploy! 🚀

