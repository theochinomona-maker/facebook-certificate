# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Your `.env` File is Ready!
The `.env` file has been created with your Facebook App credentials:
- **App ID**: `1203244734963303`
- **App Secret**: Already configured ✓

**⚠️ IMPORTANT**: The `.env` file contains your actual Facebook App Secret. Keep it secure!

### Step 3: Start the Server
```bash
npm start
```

You should see:
```
============================================================
Facebook Certificate Sharing Demo Server
============================================================
Server running at: http://localhost:3000
Home Page: http://localhost:3000/index.html
Signup Page: http://localhost:3000/signup.html
Admin Dashboard: http://localhost:3000/admin.html
============================================================
Configuration:
  App ID: 1203244734963303
  ✓ App Secret: Configured
============================================================
```

## 🎯 Access Your Application

Open your browser to:
- **Home/Login**: http://localhost:3000/index.html
- **Sign Up**: http://localhost:3000/signup.html
- **Admin Dashboard**: http://localhost:3000/admin.html

## 📱 Demo Flow

### Option 1: Use Existing Demo User
1. Go to http://localhost:3000/index.html
2. Click any learner profile (e.g., "Thabo Molefe")
3. View certificates
4. Click "Share to Facebook" on any certificate
5. Authenticate with Facebook
6. Select a Facebook Page
7. Certificate is posted!

### Option 2: Create New Account
1. Go to http://localhost:3000/signup.html
2. Choose:
   - **Sign Up with Facebook** (uses Facebook OAuth)
   - **Manual signup** (just name and email)
3. You'll be logged in automatically
4. View and share your certificates

## 🔧 Troubleshooting

### "App Secret not configured" warning
If you see this warning, your `.env` file might not be loaded:
1. Verify `.env` exists in project root
2. Check that it contains: `FACEBOOK_APP_SECRET=a909c74be642d681700e3106bec5d992`
3. Restart the server

### Facebook OAuth not working
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app (ID: 1203244734963303)
3. Go to **Facebook Login → Settings**
4. Add these redirect URIs:
   ```
   http://localhost:3000/auth/facebook/callback
   http://localhost:3000/auth/facebook-signup/callback
   ```
5. Click "Save Changes"

## 📚 Need More Help?

See the complete setup guide: **[SETUP.md](SETUP.md)**

## 🎉 You're All Set!

Your Facebook Certificate Sharing demo is ready to use. Enjoy! 🚀
