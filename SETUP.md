# Facebook Certificate Sharing Demo - Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- Facebook Developer Account
- Facebook App created in Facebook Developers Portal

## Step 1: Get Your Facebook App Credentials

### 1.1 Access Facebook Developers Portal

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Log in with your Facebook account
3. Click **"My Apps"** in the top menu
4. Select your existing app OR click **"Create App"**

### 1.2 Create a New App (if needed)

If you don't have an app yet:

1. Click **"Create App"**
2. Select **"Consumer"** or **"Business"** type
3. Fill in:
   - **App Name**: "Speccon Certificate Sharing" (or your choice)
   - **App Contact Email**: Your email
4. Click **"Create App"**

### 1.3 Get Your App ID and App Secret

1. In your app dashboard, go to **Settings → Basic** (left sidebar)
2. You'll see:
   - **App ID**: Copy this value (example: `1203244734963303`)
   - **App Secret**: Click **"Show"** button (you may need to re-enter your Facebook password)
   - Copy the **App Secret** value

### 1.4 Configure OAuth Settings

1. In your app dashboard, go to **Facebook Login → Settings** (left sidebar)
2. Under **"Valid OAuth Redirect URIs"**, add:
   ```
   http://localhost:3000/auth/facebook/callback
   http://localhost:3000/auth/facebook-signup/callback
   ```
3. Click **"Save Changes"**

### 1.5 Add Required Permissions

1. Go to **App Review → Permissions and Features**
2. Request the following permissions (for development, they're auto-approved):
   - `email` - Get user's email address
   - `public_profile` - Get user's name and profile
   - `pages_manage_posts` - Post to Facebook Pages
   - `pages_read_engagement` - Read Page data

## Step 2: Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server framework
- `express-session` - Session management
- `axios` - HTTP client for Facebook API calls
- `dotenv` - Environment variable management

## Step 3: Configure Environment Variables

### Option 1: Using .env File (Recommended)

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` file and add your credentials:
   ```env
   FACEBOOK_APP_ID=1203244734963303
   FACEBOOK_APP_SECRET=your_actual_app_secret_here
   ```

3. Replace `your_actual_app_secret_here` with your real App Secret from Step 1.3

**⚠️ IMPORTANT**: Never commit your `.env` file to Git! It's already in `.gitignore`.

### Option 2: Set Environment Variables Manually

#### Windows Command Prompt:
```cmd
set FACEBOOK_APP_SECRET=your_actual_app_secret_here
npm start
```

#### Windows PowerShell:
```powershell
$env:FACEBOOK_APP_SECRET="your_actual_app_secret_here"
npm start
```

#### macOS/Linux/Git Bash:
```bash
export FACEBOOK_APP_SECRET=your_actual_app_secret_here
npm start
```

**Note**: With this option, you need to set the variable every time you open a new terminal.

## Step 4: Update App ID in Code (if different)

If your Facebook App ID is different from `1203244734963303`:

1. Open `server.js`
2. Find line 22:
   ```javascript
   const FACEBOOK_APP_ID = '1203244734963303';
   ```
3. Replace with your App ID

OR add it to your `.env` file:
```env
FACEBOOK_APP_ID=your_app_id_here
```

And update `server.js` to use it:
```javascript
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '1203244734963303';
```

## Step 5: Start the Server

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
Admin Dashboard: http://localhost:3000/admin.html
============================================================
✓ Facebook App Secret loaded from environment variable
============================================================
```

If you see:
```
⚠ WARNING: FACEBOOK_APP_SECRET not set!
```

Go back to Step 3 and ensure your App Secret is properly configured.

## Step 6: Test the Application

### 6.1 Access the Application

Open your browser and navigate to:
- **Home Page**: http://localhost:3000/index.html
- **Signup Page**: http://localhost:3000/signup.html
- **Admin Dashboard**: http://localhost:3000/admin.html

### 6.2 Test Manual Signup

1. Go to http://localhost:3000/signup.html
2. Fill in the manual signup form:
   - Full Name: "Test User"
   - Email: "test@example.com"
3. Click **"Create Account"**
4. You should be redirected to the certificates page

### 6.3 Test Facebook Signup

1. Go to http://localhost:3000/signup.html
2. Click **"Sign Up with Facebook"**
3. Log in to Facebook (if not already logged in)
4. Grant the requested permissions
5. You should be redirected back and logged in

### 6.4 Test Certificate Sharing

1. Select a learner profile (or login via signup)
2. Click **"Share to Facebook"** on any certificate
3. Select a Facebook Page to post to
4. The certificate should be posted to your selected Page

## Troubleshooting

### "App Secret not configured" Error

**Problem**: Server shows warning about missing App Secret

**Solution**:
- Verify your `.env` file exists and has the correct format
- Check that `.env` file is in the project root directory
- Ensure there are no extra spaces: `FACEBOOK_APP_SECRET=abc123` (not `FACEBOOK_APP_SECRET = abc123`)
- Restart the server after creating/modifying `.env`

### "Invalid OAuth Redirect URI" Error

**Problem**: Facebook shows error when trying to authenticate

**Solution**:
- Go to Facebook App Settings → Facebook Login → Settings
- Ensure these URIs are added:
  - `http://localhost:3000/auth/facebook/callback`
  - `http://localhost:3000/auth/facebook-signup/callback`
- Make sure there are no typos or extra spaces
- Click "Save Changes"

### "This app is in Development Mode" Warning

**Problem**: Facebook shows a warning when logging in

**Solution**: This is normal for apps in development mode. Only developers/testers added to your app can use it. To make it public:
- Go to App Review → Request Advanced Access for permissions
- Submit your app for review (required for production)

### Cannot Post to Facebook Page

**Problem**: Error when trying to share certificate to Page

**Solution**:
- Ensure you're an admin of the Facebook Page you're trying to post to
- Verify your app has `pages_manage_posts` permission
- Check that the Page is not restricted
- Try refreshing your Facebook authentication

### Port 3000 Already in Use

**Problem**: Error "Port 3000 is already in use"

**Solution**:
- Close any other applications using port 3000
- Or change the PORT in `server.js`:
  ```javascript
  const PORT = 3001; // or any available port
  ```

## Project Structure

```
FacebookCertificateDemo/
├── public/
│   ├── css/
│   │   └── styles.css          # All application styles
│   ├── certificates/
│   │   ├── cert1.png            # Certificate images
│   │   ├── cert2.png
│   │   ├── cert3.png
│   │   └── cert4.png
│   ├── index.html               # Home/login page
│   ├── signup.html              # Signup page
│   ├── certificates.html        # Certificates display page
│   └── admin.html               # Admin dashboard
├── server.js                    # Express server & API routes
├── package.json                 # Dependencies
├── .env                         # Environment variables (create this!)
├── .env.example                 # Environment variables template
└── SETUP.md                     # This file
```

## Features

✅ Manual signup with email
✅ Facebook OAuth signup
✅ Facebook OAuth for certificate sharing
✅ Multi-learner support
✅ Certificate management
✅ Facebook Page posting
✅ Admin analytics dashboard
✅ Responsive design

## Security Notes

- **Never commit** your `.env` file or App Secret to version control
- The App Secret should be kept confidential
- In production, use HTTPS instead of HTTP
- Use a secure session secret (not the demo one in `server.js`)
- Consider using a proper database instead of in-memory arrays

## Need Help?

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Express.js Documentation](https://expressjs.com/)

---

**Ready to go!** Follow the steps above and your Facebook Certificate Sharing demo will be up and running! 🚀
