# How to Restart the Server

## The Issue

You're seeing this error when trying to login:
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

This happens because the admin login routes were recently added to `server.js`, but the server is still running the old code without these routes.

## The Solution: Restart the Server

### Step 1: Stop the Current Server

In your terminal/command prompt where the server is running, press:
```
Ctrl + C
```

This will stop the Node.js server.

### Step 2: Start the Server Again

```bash
npm start
```

### Step 3: Verify the Server Started Correctly

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

### Step 4: Test Admin Login

1. Go to: http://localhost:3000/admin-login.html
2. Enter credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Click "Login to Dashboard"
4. You should be redirected to the admin dashboard!

## Why This Happens

Node.js servers don't automatically reload when you change code files. After modifying `server.js`, you must manually restart the server for changes to take effect.

## Alternative: Auto-Restart with Nodemon

To avoid this in the future, you can use `nodemon` which automatically restarts the server when files change:

### Install nodemon:
```bash
npm install --save-dev nodemon
```

### Update package.json:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Use for development:
```bash
npm run dev
```

Now the server will automatically restart whenever you save changes to `server.js`!

---

**After restarting, the admin login should work perfectly!** 🚀
