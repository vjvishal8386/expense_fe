# 🔍 Login Issue Troubleshooting Guide

## ✅ Changes Made

I've added detailed error logging to help diagnose the login issue.

---

## 🐛 Debug Steps

### **Step 1: Check Browser Console**

1. Open your app in the browser
2. Press **F12** → **Console** tab
3. Try to login
4. Look for these messages:

**If you see:**
```javascript
Attempting login with: {email: "...", apiUrl: "..."}
```

This means the request is being sent. Look for more logs:

---

### **Step 2: Common Issues & Solutions**

#### **Issue 1: "Invalid email or password" (401 Error)**
```
Status: 401
```
**Cause**: Wrong credentials or user doesn't exist

**Solutions:**
- ✅ Make sure you registered this account first
- ✅ Check email spelling (case-sensitive)
- ✅ Check password (case-sensitive)
- ✅ Try registering a new account and login with that

---

#### **Issue 2: "User not found" (404 Error)**
```
Status: 404
```
**Cause**: User doesn't exist in database

**Solution:**
- ✅ Register the account first
- ✅ Check if backend database is properly set up

---

#### **Issue 3: "Cannot connect to server" (Network Error)**
```
Network Error
```
**Cause**: Backend not running or CORS issue

**Solutions:**
- ✅ Check if backend is running: `curl https://expense-tracker-api-yhj7.onrender.com/health`
- ✅ Check backend logs for CORS errors
- ✅ Verify backend CORS allows your domain

---

#### **Issue 4: Backend Returns Different Response Format**
```
Error: Invalid response from server
```
**Cause**: Backend response doesn't match expected format

**Solution:**
Check backend response structure. Should be:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

---

## 🧪 Test Workflow

### **Test 1: Register a New User**

1. Go to Register page
2. Fill in:
   - Name: `Test User`
   - Email: `test123@example.com`
   - Password: `test123` (or longer)
   - Confirm Password: `test123`
3. Click "Sign up"
4. Should redirect to Dashboard ✅

### **Test 2: Logout and Login**

1. Click Logout
2. Go to Login page
3. Use the SAME credentials:
   - Email: `test123@example.com`
   - Password: `test123`
4. Click "Sign in"
5. Should redirect to Dashboard ✅

---

## 🔧 Backend Verification

### **Check if Backend is Running**

```bash
# Health check
curl https://expense-tracker-api-yhj7.onrender.com/health

# Should return:
# {"status":"healthy"}
```

### **Test Login API Directly**

First, register a user:
```bash
curl -X POST https://expense-tracker-api-yhj7.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"debug@example.com","password":"debug123"}'
```

Then try login:
```bash
curl -X POST https://expense-tracker-api-yhj7.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"debug@example.com","password":"debug123"}'
```

Should return:
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "user": {...}
}
```

---

## 🌐 Check Backend CORS

Your backend should allow requests from Vercel. Check backend `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",  # Your Vercel domain
        "https://*.vercel.app",  # All Vercel preview URLs
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📱 Browser Console Commands

Open browser console (F12) and run these to debug:

```javascript
// Check current API URL
console.log('API URL:', import.meta.env.VITE_API_BASE_URL || 'https://expense-tracker-api-yhj7.onrender.com');

// Check stored token
console.log('Stored token:', localStorage.getItem('token'));
console.log('Stored user:', localStorage.getItem('user'));

// Clear storage and try again
localStorage.clear();
location.reload();

// Test backend directly
fetch('https://expense-tracker-api-yhj7.onrender.com/health')
  .then(r => r.json())
  .then(console.log);
```

---

## 🎯 Most Likely Causes

Based on "Registration works but Login doesn't", the most likely issues are:

### **1. User Doesn't Exist in Database** (Most Common)
- You're trying to login with an account that was never registered
- **Solution**: Register first, then login

### **2. Wrong Password**
- Password doesn't match what was registered
- **Solution**: Use exact same password as registration

### **3. Backend Database Issue**
- Registration saves to database but login can't find user
- **Solution**: Check backend logs and database connection

### **4. Backend Login Endpoint Bug**
- There's a bug in the backend `/auth/login` endpoint
- **Solution**: Check backend code and logs

---

## 📋 What to Do Now

1. **Open browser console** (F12)
2. **Try to login** and watch for logs
3. **Take a screenshot** of the console errors
4. **Share the error details** with me

The new logging will show exactly what's happening! 🔍

---

## 💡 Quick Test

Try this workflow RIGHT NOW:

```
1. Register with: test999@example.com / test999
2. Should auto-login ✅
3. Logout
4. Login with: test999@example.com / test999
5. Check console for errors
```

If step 4 fails, the console will show the exact error! 🎯

