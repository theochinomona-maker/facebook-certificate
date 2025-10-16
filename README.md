# Facebook Certificate Sharing Demo

A prototype application demonstrating Facebook OAuth integration for learnership certificate sharing on the Speccon platform.

## Features

- **User Registration**: Sign up manually or with Facebook OAuth
- **Certificate Management**: View and manage learner certificates
- **Facebook Integration**: Share certificates directly to Facebook Pages
- **Admin Dashboard**: Track sharing analytics and learner statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Facebook App
See **[SETUP.md](SETUP.md)** for detailed instructions on:
- Creating a Facebook App
- Getting your App ID and App Secret
- Configuring OAuth redirect URIs
- Setting up environment variables

### 3. Set Your App Secret

Create a `.env` file in the project root:
```env
FACEBOOK_APP_SECRET=your_app_secret_here
```

Or set it as an environment variable:
```bash
# Windows CMD
set FACEBOOK_APP_SECRET=your_secret_here

# Windows PowerShell
$env:FACEBOOK_APP_SECRET="your_secret_here"

# macOS/Linux
export FACEBOOK_APP_SECRET=your_secret_here
```

### 4. Start the Server
```bash
npm start
```

### 5. Open in Browser
- Home: http://localhost:3000/index.html
- Signup: http://localhost:3000/signup.html
- Admin: http://localhost:3000/admin.html

## Documentation

📖 **[Complete Setup Guide](SETUP.md)** - Detailed setup instructions

## Project Structure

```
├── public/
│   ├── css/styles.css           # Application styles
│   ├── certificates/            # Certificate images
│   ├── index.html               # Home/login page
│   ├── signup.html              # Registration page
│   ├── certificates.html        # Certificate display
│   └── admin.html               # Analytics dashboard
├── server.js                    # Express server & APIs
├── package.json                 # Dependencies
├── .env.example                 # Environment template
└── SETUP.md                     # Setup instructions
```

## Tech Stack

- **Backend**: Node.js, Express.js
- **Authentication**: Facebook OAuth 2.0
- **Session Management**: express-session
- **HTTP Client**: Axios
- **Frontend**: Vanilla JavaScript, CSS3

## Security

⚠️ **Important**:
- Never commit your `.env` file or App Secret
- This is a demo application - use proper security measures for production
- Use HTTPS in production environments
- Implement proper database storage instead of in-memory arrays

## Demo Users

The application comes with 4 demo learners:
1. Thabo Molefe - thabo.molefe@example.com
2. Nomsa Dlamini - nomsa.dlamini@example.com
3. John Smith - john.smith@example.com
4. Sarah Johnson - sarah.johnson@example.com

## Support

For issues or questions, see the [SETUP.md](SETUP.md) troubleshooting section.

---

**© 2025 Speccon** - Demo Prototype for Facebook Integration