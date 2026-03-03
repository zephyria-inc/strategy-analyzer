# 🚀 Deploy to GitHub & Auto-Deploy to Render/Vercel

This guide walks you through pushing your code to GitHub and setting up automatic deployment.

---

## 📋 Prerequisites

- GitHub account (free at https://github.com)
- Git installed on your computer
- All project files (from Claude)

---

## ✅ Step 1: Create GitHub Repository

### Online (Easiest)

1. Go to **https://github.com/new**
2. **Repository name:** `strategy-analyzer`
3. **Description:** Trading Strategy Analyzer with Walk-Forward & Monte Carlo
4. **Public** (so Render/Vercel can access)
5. **Do NOT initialize** with README (we have one)
6. Click **Create repository**

You'll see:
```
…or push an existing repository from the command line

git remote add origin https://github.com/YOUR_USERNAME/strategy-analyzer.git
git branch -M main
git push -u origin main
```

Save this URL!

---

## 📂 Step 2: Prepare Local Files

Create this folder structure:

```
strategy-analyzer/
├── backend/
│   ├── app.py                    (production Flask app)
│   ├── requirements.txt
│   ├── render.yaml              (deployment config)
│   └── gunicorn_config.py
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx              (your StrategyAnalyzer.jsx)
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.example
├── .gitignore
├── README.md
└── DEPLOYMENT.md                (this file)
```

### Quick Setup

```bash
# Create root directory
mkdir strategy-analyzer
cd strategy-analyzer

# Create subdirectories
mkdir backend frontend

# Copy files
cp app.py backend/
cp requirements.txt backend/
cp StrategyAnalyzer.jsx frontend/src/App.jsx
cp package.json frontend/
```

---

## 🔧 Step 3: Create Required Files

### `backend/render.yaml`

```yaml
services:
  - type: web
    name: strategy-analyzer-backend
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: PORT
        value: 5000
```

### `backend/gunicorn_config.py`

```python
import os
import multiprocessing

bind = f"0.0.0.0:{os.environ.get('PORT', 5000)}"
workers = max(1, multiprocessing.cpu_count() // 2)
threads = 2
worker_class = 'sync'
timeout = 120
keepalive = 5
max_requests = 1000
max_requests_jitter = 100
```

### `frontend/.env.example`

```
REACT_APP_API_URL=http://localhost:5000
```

### `frontend/.env.production`

```
REACT_APP_API_URL=https://strategy-analyzer-backend.onrender.com
```

Update this with your actual Render backend URL after deploying!

---

## 📝 Step 4: Update Frontend to Use Environment Variables

Edit `frontend/src/App.jsx`:

```javascript
// At the top of the component:
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Then replace all:
// fetch('http://localhost:5000/api/analyze', ...)
// With:
// fetch(`${API_URL}/api/analyze`, ...)

// Example:
const runAnalysis = async () => {
  // ... validation code ...
  
  try {
    const formData = new FormData();
    formData.append('csv', csv);
    formData.append('strategy', strategy);

    const response = await fetch(`${API_URL}/api/analyze`, {  // ← Updated
      method: 'POST',
      body: formData
    });
    // ... rest of code ...
  }
};
```

---

## 🔐 Step 5: Initialize Git & Push to GitHub

### Open Terminal/Command Prompt in Your Project

```bash
# Navigate to your project
cd strategy-analyzer

# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Trading Strategy Analyzer"

# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/strategy-analyzer.git

# Create main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**Check GitHub:** Refresh https://github.com/YOUR_USERNAME/strategy-analyzer
You should see all your files! ✅

---

## 🚀 Step 6: Deploy Backend to Render

### 6A. Create Render Account

1. Go to **https://render.com**
2. Sign up with GitHub (easiest)
3. Authorize GitHub access

### 6B. Deploy Backend

1. Click **"New +"** → **"Web Service"**
2. **Connect GitHub repository** → Select `strategy-analyzer`
3. **Configuration:**
   - Name: `strategy-analyzer-backend`
   - Environment: `Python 3`
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && gunicorn app:app`
   - Instance Type: **Free** ✅

4. Click **"Create Web Service"**

**Wait 2-3 minutes for deployment...**

### 6C. Get Your Backend URL

In Render dashboard, you'll see:
```
strategy-analyzer-backend.onrender.com
```

Copy this! You need it for the frontend.

---

## 🎨 Step 7: Deploy Frontend to Vercel

### 7A. Create Vercel Account

1. Go to **https://vercel.com**
2. Sign up with GitHub
3. Authorize GitHub access

### 7B. Deploy Frontend

1. Click **"Add New..."** → **"Project"**
2. Select your `strategy-analyzer` repo
3. **Configuration:**
   - Framework: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://strategy-analyzer-backend.onrender.com
   ```
   (Use your actual Render URL from Step 6C)

5. Click **"Deploy"**

**Wait 3-5 minutes for build...**

### 7C: Get Your Frontend URL

After deployment, Vercel shows:
```
https://strategy-analyzer.vercel.app
```

**That's your live app!** 🎉

---

## ✅ Verification

### Test Backend

```bash
curl https://strategy-analyzer-backend.onrender.com/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-03-03T..."}
```

### Test Frontend

Visit: `https://strategy-analyzer.vercel.app`

You should see the dashboard!

---

## 📤 Push Updates to GitHub

After making changes:

```bash
# Stage changes
git add .

# Commit
git commit -m "Update: Add new feature"

# Push to GitHub
git push
```

**Automatic Deployment:**
- GitHub → Render (backend auto-redeploys in 1 min)
- GitHub → Vercel (frontend auto-redeploys in 3-5 min)

No more manual deployments! 🤖

---

## 🔧 Troubleshooting

### "Build failed on Render"

Check build logs in Render dashboard:
- Click Web Service
- Scroll to "Logs"
- Look for Python errors

Common fixes:
```bash
# Update requirements.txt
pip freeze > backend/requirements.txt

# Commit and push
git add backend/requirements.txt
git commit -m "Update requirements"
git push
```

### "Frontend can't reach backend"

1. Check `REACT_APP_API_URL` in Vercel environment
2. Confirm Render backend URL is correct
3. Check Render has no errors (Logs tab)
4. Wait 5 minutes for cache clear

### "Port already in use" locally

```bash
# Test locally (backend)
cd backend
python app.py

# In another terminal (frontend)
cd frontend
npm start
```

### Render keeps sleeping

Add uptime monitor:
1. Go to **https://uptimerobot.com**
2. Create account
3. Add monitor: `https://your-backend.onrender.com/api/health`
4. Check every 5 minutes
5. Keeps Render awake automatically

---

## 📊 Monitoring

### Render Dashboard
- Check CPU/Memory usage
- View error logs
- Monitor uptime

### Vercel Dashboard
- Check build logs
- Monitor page load times
- View analytics

### GitHub Actions (Optional)
Add CI/CD workflows (see GITHUB_ACTIONS.md)

---

## 🎯 Your Live App

**Share this link with anyone:**
```
https://strategy-analyzer.vercel.app
```

They can:
- Upload CSV data
- Write/paste strategies
- Get instant backtesting results
- No installation needed!

---

## 💾 Git Workflow Going Forward

```bash
# 1. Make changes locally
# 2. Test with: python backend/app.py & npm start (frontend)
# 3. Commit changes
git add .
git commit -m "Feature: Description"

# 4. Push to GitHub
git push

# 5. Render/Vercel auto-deploy (wait 1-5 min)
# 6. Test live at https://strategy-analyzer.vercel.app
```

---

## 📚 Next Steps

- [ ] Create GitHub repo
- [ ] Push local code
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Test live URL
- [ ] Set up uptime monitoring
- [ ] Share with users!

---

**Your strategy analyzer is now live and automatically deployed!** 🚀
