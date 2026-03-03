# 🚀 START HERE - Deploy Your App to GitHub in 15 Minutes

This is the simplest path from your computer → GitHub → Live website.

---

## 📊 What You're Doing

```
Your Computer
     ↓
   GitHub (backup)
     ↓
  Render (backend)
  Vercel (frontend)
     ↓
LIVE WEBSITE 🎉
```

---

## 🎯 The 3 Commands You Need

```bash
# 1. Go to your project folder
cd /path/to/strategy-analyzer

# 2. Push to GitHub (one time)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/strategy-analyzer.git
git branch -M main
git push -u origin main

# 3. Whenever you make changes
git add .
git commit -m "Your changes"
git push
```

That's it! GitHub + Render + Vercel handle the rest automatically.

---

## 📋 What You Need

✅ GitHub account (free): https://github.com/signup
✅ Render account (free): https://render.com/signup
✅ Vercel account (free): https://vercel.com/signup
✅ Git installed on your computer
✅ All files from Claude

---

## 🎬 Quick Steps

### Step 1: Create GitHub Repo (2 min)

1. Go: https://github.com/new
2. Name: `strategy-analyzer`
3. Public ✅
4. Create

### Step 2: Push Code (2 min)

Open terminal in your project folder:

```bash
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/YOUR_USERNAME/strategy-analyzer.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

### Step 3: Deploy Backend (3 min)

1. Go: https://render.com/dashboard
2. New Web Service
3. Connect GitHub → Select `strategy-analyzer`
4. Name: `strategy-analyzer-backend`
5. Build: `cd backend && pip install -r requirements.txt`
6. Start: `cd backend && gunicorn app:app`
7. Create

Wait 2-3 minutes for "Live" ✅

Copy your backend URL:
```
https://strategy-analyzer-backend.onrender.com
```

### Step 4: Deploy Frontend (3 min)

1. Go: https://vercel.com/dashboard
2. Add Project
3. Select `strategy-analyzer` repo
4. Root: `frontend`
5. Environment: Add `REACT_APP_API_URL`
6. Value: Your Render URL from Step 3
7. Deploy

Wait 3-5 minutes for "Ready" ✅

Your live app:
```
https://strategy-analyzer.vercel.app
```

### Step 5: Test (2 min)

1. Visit: https://strategy-analyzer.vercel.app
2. Upload example_data.csv
3. Paste example strategy code
4. Click "Run Analysis"
5. See results! ✅

---

## 📞 Need Help?

### Detailed Guides

- **Visual walkthrough:** `GITHUB_SETUP_VISUAL.md`
- **Technical details:** `GITHUB_DEPLOYMENT.md`
- **Checklist:** `DEPLOYMENT_CHECKLIST.md`
- **Setup:** `SETUP_GUIDE.md`

### Quick Fixes

**"Command not found: git"**
→ Install Git: https://git-scm.com/downloads

**"Render build failed"**
→ Check Render dashboard Logs
→ Run locally: `cd backend && python app.py`

**"Vercel says CORS error"**
→ Check `REACT_APP_API_URL` environment variable
→ Make sure it's your full Render URL

**"No trades generated"**
→ Your strategy logic needs fixing
→ Test locally first

---

## 📂 File Structure

Your GitHub repo will have:

```
strategy-analyzer/
├── backend/
│   ├── app.py                    ← Flask server
│   ├── requirements.txt
│   ├── render.yaml
│   ├── example_data.csv
│   └── example_strategy.py
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── .gitignore
├── README.md
└── GITHUB_DEPLOYMENT.md
```

---

## ✅ Success Checklist

- [ ] GitHub repo created
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render (Live ✅)
- [ ] Frontend deployed to Vercel (Ready ✅)
- [ ] Backend health check works
- [ ] Frontend loads without errors
- [ ] Can upload CSV
- [ ] Can run analysis
- [ ] See results

---

## 🎉 You're Done!

Share your live app:
```
https://strategy-analyzer.vercel.app
```

Anyone can now use your trading strategy analyzer without installing anything!

---

## 🔄 Making Changes

After you change code:

```bash
git add .
git commit -m "What you changed"
git push
```

Render and Vercel automatically redeploy. No manual uploads needed! 🤖

---

**Next:** Read `GITHUB_SETUP_VISUAL.md` for detailed step-by-step with screenshots.
