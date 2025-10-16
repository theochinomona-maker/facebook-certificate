# Setting Up ngrok for Facebook Testing

## What is ngrok?

ngrok creates a secure tunnel from a public URL to your localhost, allowing Facebook to access and scrape your local server's Open Graph tags.

## Step-by-Step Setup

### Step 1: Install ngrok

#### Option A: Download from Website (Recommended)
1. Go to https://ngrok.com/download
2. Download ngrok for Windows
3. Extract the `ngrok.exe` file to a folder (e.g., `C:\ngrok\`)

#### Option B: Using Chocolatey (if you have it)
```bash
choco install ngrok
```

#### Option C: Using Scoop (if you have it)
```bash
scoop install ngrok
```

### Step 2: Create Free ngrok Account (Optional but Recommended)

1. Go to https://dashboard.ngrok.com/signup
2. Sign up for a free account
3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
4. Run this command to add your authtoken:
```bash
ngrok authtoken YOUR_AUTH_TOKEN_HERE
```

**Note**: Free account gives you a stable URL for longer and avoids rate limits.

### Step 3: Start Your Application Server

Make sure your server is running:
```bash
npm start
```

You should see:
```
Server running at: http://localhost:3000
```

Keep this terminal open!

### Step 4: Start ngrok in a NEW Terminal

Open a **NEW** command prompt/terminal window and run:

```bash
ngrok http 3000
```

**If ngrok.exe is not in your PATH**, navigate to where you extracted it:
```bash
cd C:\ngrok
ngrok.exe http 3000
```

### Step 5: Copy Your Public URL

ngrok will show something like:
```
ngrok

Session Status                online
Account                       your@email.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Copy the HTTPS URL**: `https://abc123.ngrok-free.app`

This is your public URL that Facebook can access!

### Step 6: Update Facebook App Settings

1. Go to https://developers.facebook.com/apps/
2. Select your app (ID: 1203244734963303)
3. Go to **Settings → Basic**
4. Add your ngrok URL to:
   - **App Domains**: Add `abc123.ngrok-free.app` (without https://)

5. Go to **Facebook Login → Settings**
6. Add these to **Valid OAuth Redirect URIs**:
   ```
   https://abc123.ngrok-free.app/auth/facebook/callback
   https://abc123.ngrok-free.app/auth/facebook-signup/callback
   ```
7. Click **Save Changes**

### Step 7: Test Your Certificate Sharing

1. Open your ngrok URL in browser: `https://abc123.ngrok-free.app`
2. You may see an ngrok warning page - click "Visit Site"
3. Sign up or login
4. Go to certificates page
5. Click **"📤 Share to Feed"**
6. The Facebook Share Dialog should now show:
   - ✅ Certificate image
   - ✅ Pre-filled caption
   - ✅ Course title

### Step 8: Use Facebook Sharing Debugger

To verify Facebook can scrape your certificate:

1. Go to: https://developers.facebook.com/tools/debug/
2. Enter your certificate URL (example):
   ```
   https://abc123.ngrok-free.app/share-certificate.html?id=5
   ```
3. Click **"Debug"**
4. You should see:
   - **Title**: Your course name
   - **Description**: "Hi! I just completed..."
   - **Image**: Your certificate image
5. If it doesn't show, click **"Scrape Again"**

## Important Notes

### ⚠️ ngrok URL Changes
- **Free ngrok URLs change** every time you restart ngrok
- You'll need to update Facebook OAuth redirect URIs each time
- **Solution**: Get ngrok paid plan ($8/month) for a static domain, or use other tunneling services

### 🔄 When ngrok Restarts
If you close ngrok and start it again:
1. You'll get a NEW URL (e.g., `https://xyz789.ngrok-free.app`)
2. Update Facebook App redirect URIs with the new URL
3. Clear Facebook's cache using the Sharing Debugger

### 🌐 Alternative to ngrok

If you want a more permanent solution:
- **Cloudflare Tunnel** (free, static URL): https://www.cloudflare.com/products/tunnel/
- **localtunnel** (free, similar to ngrok): `npx localtunnel --port 3000`
- **Deploy to**: Vercel, Heroku, Railway, etc. (free tiers available)

## Troubleshooting

### Issue: "Failed to connect"
- Make sure your Node.js server is running (`npm start`)
- Make sure ngrok is pointing to port 3000
- Check firewall isn't blocking ngrok

### Issue: Facebook shows "Can't Load URL"
- Make sure the ngrok URL is accessible in a browser first
- Click through the ngrok warning page if it appears
- Update Facebook OAuth redirect URIs

### Issue: No image showing in Facebook share
- Use the Facebook Sharing Debugger to clear cache
- Click "Scrape Again" button
- Make sure the certificate image path is correct
- Check ngrok isn't blocking the image request

### Issue: ngrok warning page every time
- Sign up for a free ngrok account
- Authenticate with: `ngrok authtoken YOUR_TOKEN`
- The warning page will be less intrusive

## Testing Checklist

- [ ] ngrok is running and shows public URL
- [ ] Can access your app through ngrok URL in browser
- [ ] Facebook OAuth redirect URIs updated
- [ ] Facebook App Domains updated
- [ ] Can sign up/login through ngrok URL
- [ ] Certificate appears on certificates page
- [ ] "Share to Feed" opens Facebook dialog
- [ ] Facebook dialog shows certificate image and caption
- [ ] Facebook Sharing Debugger shows correct meta tags

---

**Once ngrok is running, you can test the full Facebook sharing flow!** 🚀

Your certificate will appear in the Facebook Share Dialog with:
- Certificate image preview
- Auto-filled caption with course name
- Professional formatting
