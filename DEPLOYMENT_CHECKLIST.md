# ⚡ GITHUB DEPLOYMENT CHECKLIST

Copy and paste this checklist. Check off each item as you complete it!

---

## 📋 Pre-Deployment Checklist

- [ ] Git installed on your computer (`git --version`)
- [ ] GitHub account created (https://github.com/signup)
- [ ] All files downloaded from Claude
- [ ] Understand backend/frontend folder structure

---

## 🔧 Local Setup

- [ ] Folder structure created:
  ```
  strategy-analyzer/
  ├── backend/
  ├── frontend/
  └── [other files]
  ```

- [ ] Files in correct locations:
  - [ ] `backend/app.py`
  - [ ] `backend/requirements.txt`
  - [ ] `backend/render.yaml`
  - [ ] `frontend/package.json`
  - [ ] `frontend/public/index.html`
  - [ ] `frontend/src/App.jsx`
  - [ ] `.gitignore`
  - [ ] `README.md`

- [ ] Frontend API URL updated:
  ```javascript
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  ```

---

## 📤 Push to GitHub

- [ ] Create GitHub repository at https://github.com/new
  - [ ] Name: `strategy-analyzer`
  - [ ] Public
  - [ ] No README initialization

- [ ] Open terminal in project folder

- [ ] Run these commands:
  ```bash
  git init
  git add .
  git commit -m "Initial commit: Trading Strategy Analyzer"
  git remote add origin https://github.com/YOUR_USERNAME/strategy-analyzer.git
  git branch -M main
  git push -u origin main
  ```

- [ ] Verify on GitHub:
  - Visit https://github.com/YOUR_USERNAME/strategy-analyzer
  - See all files listed ✅

---

## 🚀 Deploy Backend (Render)

- [ ] Create Render account at https://render.com
  - [ ] Sign up with GitHub
  - [ ] Authorize GitHub access

- [ ] Create Web Service:
  - [ ] Click "New +" → "Web Service"
  - [ ] Connect GitHub repo `strategy-analyzer`
  - [ ] Name: `strategy-analyzer-backend`
  - [ ] Environment: `Python 3`
  - [ ] Build: `cd backend && pip install -r requirements.txt`
  - [ ] Start: `cd backend && gunicorn app:app`
  - [ ] Instance: **Free**
  - [ ] Click "Create Web Service"

- [ ] Wait for deployment (2-3 min)

- [ ] Test with:
  ```bash
  curl https://strategy-analyzer-backend.onrender.com/api/health
  ```

- [ ] Save backend URL:
  ```
  https://strategy-analyzer-backend.onrender.com
  ```

---

## 🎨 Deploy Frontend (Vercel)

- [ ] Create Vercel account at https://vercel.com
  - [ ] Sign up with GitHub
  - [ ] Authorize GitHub access

- [ ] Create Project:
  - [ ] Click "Add New..." → "Project"
  - [ ] Select `strategy-analyzer` repo
  - [ ] Framework: Create React App
  - [ ] Root: `frontend`
  - [ ] Build: `npm run build`
  - [ ] Output: `build`

- [ ] Environment Variables:
  - [ ] Add: `REACT_APP_API_URL`
  - [ ] Value: `https://strategy-analyzer-backend.onrender.com`

- [ ] Click "Deploy"

- [ ] Wait for deployment (3-5 min)

- [ ] Save frontend URL:
  ```
  https://strategy-analyzer.vercel.app
  ```

---

## ✅ Testing

- [ ] Backend health check passes
- [ ] Frontend loads at Vercel URL
- [ ] Upload `example_data.csv` works
- [ ] Strategy code validation works
- [ ] "Run Analysis" button works
- [ ] Results display correctly

---

## 🎯 Post-Deployment

- [ ] Update Vercel environment with correct backend URL (if needed)
- [ ] Test with real CSV data
- [ ] Share frontend URL with users:
  ```
  https://strategy-analyzer.vercel.app
  ```

- [ ] Set up uptime monitoring:
  - [ ] Go to https://uptimerobot.com
  - [ ] Add monitor: `https://strategy-analyzer-backend.onrender.com/api/health`
  - [ ] Check every 5 minutes
  - [ ] Gets email alerts if down

---

## 📝 Ongoing Maintenance

Each time you make changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Both Render and Vercel auto-redeploy! ✅

---

## 🔗 Quick Links

| Service | URL |
|---------|-----|
| GitHub Repo | https://github.com/YOUR_USERNAME/strategy-analyzer |
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Live App | https://strategy-analyzer.vercel.app |
| Backend API | https://strategy-analyzer-backend.onrender.com |

---

## 💡 Tips

✅ Always test locally before pushing
✅ Check Render/Vercel logs if deployment fails
✅ Environment variables are case-sensitive
✅ Vercel deploys faster when root is set correctly
✅ Render keeps free tier alive with uptime monitor

---

**Done? Share your app!** 🎉

```
https://strategy-analyzer.vercel.app
```
