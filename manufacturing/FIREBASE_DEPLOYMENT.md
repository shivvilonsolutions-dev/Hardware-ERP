# Firebase Hosting Deployment Guide

## Prerequisites
- Firebase account (create at https://firebase.google.com)
- Node.js installed

## Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase
```bash
firebase login
```
This will open a browser window to authenticate with your Google account.

## Step 3: Initialize Firebase Project
```bash
firebase init hosting
```

When prompted:
- **Select a Firebase project**: Create a new project or select existing
- **What do you want to use as your public directory?**: `dist`
- **Configure as a single-page app?**: Yes
- **File for index.html**: `index.html`

## Step 4: Build the Project
```bash
npm run build
```
This creates the `dist` folder with the production build.

## Step 5: Deploy to Firebase
```bash
firebase deploy
```

## Step 6: Access Your Site
After deployment, Firebase will provide a URL like:
```
https://hardware-erp-manufacturing.web.app
```

## Configuration Files Already Created
- `firebase.json` - Firebase hosting configuration
- `.firebaserc` - Firebase project settings

## Notes
- The `firebase.json` is configured to serve the `dist` folder
- Single-page app routing is enabled (all routes go to index.html)
- Every deployment requires running `npm run build` first

## Automatic Deployment (Optional)
To set up automatic deployment from GitHub:
1. Go to Firebase Console → Build → Hosting
2. Connect GitHub repository
3. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Enable automatic deployments on push to main branch

## Environment Variables
If you need environment variables in production:
1. Go to Firebase Console → Project Settings → Environment Variables
2. Add your API base URL and other secrets
3. Access them in your app using `import.meta.env.VARIABLE_NAME`

## Troubleshooting
- **Build fails**: Make sure all dependencies are installed (`npm install`)
- **Deploy fails**: Check Firebase CLI is installed and you're logged in
- **404 errors**: Ensure `firebase.json` has the correct `public` directory set to `dist`
