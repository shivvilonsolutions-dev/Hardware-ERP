# Firebase Complete Setup Guide

## Your Firebase Project
**Project ID:** manufacturing-erp-1f04f
**Console:** https://console.firebase.google.com/u/0/project/manufacturing-erp-1f04f/overview

## Database Explanation

### Important: PostgreSQL vs Firebase

Your project uses **TWO DIFFERENT DATABASES**:

#### 1. PostgreSQL (Backend Database)
- **Purpose:** Stores orders, parties, inventory, process sequences
- **Location:** On Render.com backend
- **API:** https://shivvilon-solution-manufacturing-project.onrender.com/api
- **Tables:** orders, parties, materials, process_sequences

#### 2. Firebase (Hosting Only)
- **Purpose:** Hosts your frontend website
- **Location:** Firebase Hosting
- **Does NOT store data** - only serves the React app

### How to View PostgreSQL Database

Since your backend is on Render.com, you have 2 options:

**Option 1: Via Render Dashboard**
1. Go to https://dashboard.render.com
2. Find your backend service
3. Click on "PostgreSQL" database
4. Use the built-in database browser or connect with pgAdmin

**Option 2: Via API (Recommended for testing)**
Your frontend already connects to the backend API. You can view data through:
- Orders page (NewOrder.tsx)
- Parties page (Party.tsx)
- Inventory page (Inventory.tsx)
- Process page (Process.tsx)

**Option 3: Direct Database Connection**
If you have PostgreSQL installed:
```bash
psql -h <your-render-db-host> -U <username> -d <database>
```

### How to View Firebase Database

Firebase is NOT used for your data. It only hosts the frontend. If you want to use Firebase for data storage, you would need to:
1. Enable Firestore or Realtime Database in Firebase Console
2. Rewrite all API calls to use Firebase SDK instead of REST API
3. Migrate data from PostgreSQL to Firebase

**This is NOT recommended** because:
- Your backend is already built with PostgreSQL
- PostgreSQL is better for relational data (orders, parties, inventory)
- Would require complete rewrite of backend

## Firebase Hosting Setup Steps

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase
```bash
firebase login
```
This will open a browser. Login with the Google account that created the project.

### Step 3: Initialize Firebase (Already Done)
Your project already has:
- `firebase.json` - Hosting configuration
- `.firebaserc` - Project ID configured (manufacturing-erp-1f04f)

### Step 4: Build the Project
```bash
npm run build
```
This creates the `dist` folder with production files.

### Step 5: Deploy to Firebase
```bash
firebase deploy
```

After deployment, you'll get a URL like:
```
https://manufacturing-erp-1f04f.web.app
```

### Step 6: Access Your Live Site
Open the URL provided after deployment.

## Firebase Console Configuration

### Enable Hosting (Already Done)
Your project already has hosting enabled. Verify:
1. Go to https://console.firebase.google.com/u/0/project/manufacturing-erp-1f04f/overview
2. Click "Hosting" in left menu
3. You should see the domains section

### Configure Custom Domain (Optional)
If you want a custom domain (e.g., erp.yourcompany.com):
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the DNS setup instructions

### Set Up Automatic Deployment (Recommended)
To auto-deploy on git push:

1. Go to Firebase Console → Build → Hosting
2. Click "Connect to GitHub"
3. Authorize Firebase to access your GitHub
4. Select your repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Node version:** 18 or 20
6. Enable "Automatically deploy from this branch"

## Environment Variables (If Needed)

If your backend API URL changes or you need other secrets:

### Option 1: Firebase Environment Variables
1. Go to Firebase Console → Project Settings → Environment Variables
2. Add variables:
   - `VITE_API_BASE_URL`: https://shivvilon-solution-manufacturing-project.onrender.com/api
3. Access in code: `import.meta.env.VITE_API_BASE_URL`

### Option 2: Hardcoded (Current Setup)
Currently, your API URL is in `src/api/api.ts`:
```typescript
const API_BASE_URL = "https://shivvilon-solution-manufacturing-project.onrender.com/api";
```

## Testing Checklist

### Before Deployment
- [ ] Run `npm run build` successfully
- [ ] Test `npm run dev` locally
- [ ] Check all pages work (Dashboard, Orders, Process, Reports, Parties, Inventory)
- [ ] Test API connections
- [ ] Verify PWA icons exist in `public/` folder

### After Deployment
- [ ] Open the deployed URL
- [ ] Test all pages
- [ ] Test PWA installation
- [ ] Test offline mode
- [ ] Check mobile responsiveness

## Troubleshooting

### Deployment Fails
**Error:** "No Firebase project found"
**Solution:** Run `firebase login` again

**Error:** "Build failed"
**Solution:** Check `npm run build` works locally first

**Error:** "dist folder not found"
**Solution:** Run `npm run build` before `firebase deploy`

### API Not Working After Deployment
**Problem:** CORS issues or API down
**Solution:** 
1. Check backend is running on Render
2. Check API URL in `src/api/api.ts`
3. Enable CORS on backend if needed

### PWA Not Installable
**Problem:** HTTPS required
**Solution:** Firebase automatically provides HTTPS

**Problem:** Icons missing
**Solution:** Add `icon-192x192.png` and `icon-512x512.png` to `public/` folder

## Backend Database Setup (PostgreSQL)

Your backend should have these tables (from DATABASE_SCHEMA.md):

### Tables Required
1. **orders** - Order information
2. **parties** - Party/contractor information
3. **materials** - Raw material inventory
4. **process_sequences** - Manufacturing process steps

### View Database on Render
1. Go to https://dashboard.render.com
2. Find your PostgreSQL database
3. Click to open database dashboard
4. Use "Query" tab to run SQL queries

### Example SQL Queries
```sql
-- View all orders
SELECT * FROM orders;

-- View all parties
SELECT * FROM parties;

-- View process sequences for an order
SELECT * FROM process_sequences WHERE order_id = 'ORD-001';

-- View inventory
SELECT * FROM materials;
```

## Complete Deployment Workflow

### First Time Setup
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Build project
npm run build

# 4. Deploy
firebase deploy
```

### Regular Updates
```bash
# 1. Build
npm run build

# 2. Deploy
firebase deploy
```

### With Git (Recommended)
```bash
# 1. Commit changes
git add .
git commit -m "Update app"

# 2. Push to GitHub
git push origin main

# 3. Firebase auto-deploys (if configured)
```

## Next Steps Summary

### Immediate Actions
1. ✅ Firebase project created
2. ✅ Firebase config updated (.firebaserc)
3. ⏳ Add PWA icons to `public/` folder
4. ⏳ Run `npm run build` to test build
5. ⏳ Run `firebase deploy` to deploy

### Optional Actions
1. Set up GitHub auto-deployment
2. Configure custom domain
3. Set up environment variables
4. Add analytics (Firebase Analytics)

### Database Actions
1. View PostgreSQL data via Render dashboard
2. Verify backend API is working
3. Test CRUD operations through frontend

## Support Links

- Firebase Console: https://console.firebase.google.com/u/0/project/manufacturing-erp-1f04f/overview
- Firebase Docs: https://firebase.google.com/docs
- Render Dashboard: https://dashboard.render.com
- Backend API: https://shivvilon-solution-manufacturing-project.onrender.com/api

## Quick Reference

### Deploy Command
```bash
npm run build && firebase deploy
```

### View Deployed Site
```
https://manufacturing-erp-1f04f.web.app
```

### Backend API
```
https://shivvilon-solution-manufacturing-project.onrender.com/api
```

### Database Location
PostgreSQL on Render.com (not Firebase)
