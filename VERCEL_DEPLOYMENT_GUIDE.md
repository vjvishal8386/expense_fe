# Vercel Deployment Guide - Fix for 404 Errors

## ✅ Problem Fixed!

The **404 NOT_FOUND** error on page refresh is now fixed by adding `vercel.json` configuration.

---

## 🔧 What Was Changed

### 1. Created `vercel.json`
This file tells Vercel to always serve `index.html` for all routes, allowing React Router to handle client-side routing.

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🚀 Deployment Steps

### **Step 1: Commit the Changes**

```bash
cd /home/vishal/Downloads/temp
git add vercel.json
git commit -m "Fix: Add vercel.json for SPA routing"
git push origin main
```

### **Step 2: Redeploy on Vercel**

**Option A: Automatic (if connected to Git)**
- Vercel will auto-deploy when you push to GitHub
- Wait 1-2 minutes for deployment to complete

**Option B: Manual Deploy**
```bash
vercel --prod
```

---

## 🌐 Configure Environment Variables on Vercel

### **Important: Set Backend API URL**

1. Go to your Vercel project dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add the following variable:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com` | Production |

4. Click **Save**
5. **Redeploy** the project for changes to take effect

### **Update axiosClient.ts** (if not already done)

Make sure your `src/api/axiosClient.ts` uses environment variables:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
```

---

## 🔐 Update Backend CORS

**Important:** Update your backend's CORS settings to allow requests from Vercel.

In your backend `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-app-name.vercel.app",  # Replace with your Vercel URL
        "https://*.vercel.app",  # Allow all preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Then redeploy your backend!**

---

## ✅ Testing After Deployment

### Test the following:

1. **Homepage**: Visit `https://your-app.vercel.app`
2. **Login**: Login with credentials
3. **Refresh Dashboard**: Press F5 on `/dashboard` → Should NOT show 404
4. **Refresh Chat Page**: Press F5 on `/chat/:id` → Should NOT show 404
5. **Direct URL**: Open `https://your-app.vercel.app/dashboard` in a new tab → Should work
6. **API Connection**: Add a friend, create an expense → Should work

---

## 🐛 Troubleshooting

### **Still Getting 404?**

1. **Clear Vercel cache:**
   ```bash
   vercel --prod --force
   ```

2. **Check if vercel.json is committed:**
   ```bash
   git status
   cat vercel.json
   ```

3. **Check Vercel build logs:**
   - Go to Vercel dashboard → Deployments → Latest deployment → View logs

### **API Not Working?**

1. **Check environment variable:**
   - Vercel dashboard → Settings → Environment Variables
   - Make sure `VITE_API_BASE_URL` is set correctly

2. **Check browser console:**
   - F12 → Console → Look for CORS or network errors

3. **Verify backend CORS:**
   - Make sure backend allows your Vercel domain

### **Can't Push to Git?**

```bash
# Initialize git if not done
git init
git add .
git commit -m "Initial commit"

# Create a new GitHub repo and push
git remote add origin https://github.com/yourusername/expense-tracker-frontend.git
git push -u origin main
```

---

## 📝 Vercel Configuration Options

### **Additional vercel.json Options** (if needed)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 🎉 You're All Set!

After following these steps:
- ✅ No more 404 errors on refresh
- ✅ All routes work correctly
- ✅ Direct URL access works
- ✅ Backend API connected

---

## 📚 Additional Resources

- [Vercel SPA Documentation](https://vercel.com/docs/frameworks/vite)
- [React Router with Vercel](https://vercel.com/guides/deploying-react-with-vercel)
- [Environment Variables on Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated**: Deployment configuration added with SPA routing fix

