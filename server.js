require('dotenv').config();

const express = require('express');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'facebook-cert-demo-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '1203244734963303';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

const learners = [
  {
    id: 1,
    name: 'Thabo Molefe',
    email: 'thabo.molefe@example.com'
  },
  {
    id: 2,
    name: 'Nomsa Dlamini',
    email: 'nomsa.dlamini@example.com'
  },
  {
    id: 3,
    name: 'John Smith',
    email: 'john.smith@example.com'
  },
  {
    id: 4,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com'
  }
];

const certificates = [
  {
    id: 1,
    learnerId: 1,
    learnerName: 'Thabo Molefe',
    courseName: 'Project Management Professional',
    imageFile: 'cert1.png',
    completionDate: '2025-09-15',
    shared: false,
    sharedTimestamp: null,
    shareStatus: null
  },
  {
    id: 2,
    learnerId: 1,
    learnerName: 'Thabo Molefe',
    courseName: 'Digital Marketing Fundamentals',
    imageFile: 'cert2.png',
    completionDate: '2025-08-20',
    shared: true,
    sharedTimestamp: '2025-08-21T10:30:00Z',
    shareStatus: 'success'
  },
  {
    id: 3,
    learnerId: 2,
    learnerName: 'Nomsa Dlamini',
    courseName: 'Data Science Essentials',
    imageFile: 'cert3.png',
    completionDate: '2025-10-01',
    shared: false,
    sharedTimestamp: null,
    shareStatus: null
  },
  {
    id: 4,
    learnerId: 3,
    learnerName: 'John Smith',
    courseName: 'Web Development Bootcamp',
    imageFile: 'cert4.png',
    completionDate: '2025-09-28',
    shared: false,
    sharedTimestamp: null,
    shareStatus: null
  }
];

const shareActivity = [
  {
    date: '2025-08-21T10:30:00Z',
    learnerName: 'Thabo Molefe',
    courseName: 'Digital Marketing Fundamentals',
    platform: 'Facebook',
    status: 'success'
  }
];

app.get('/api/learners', (req, res) => {
  res.json(learners);
});

app.post('/api/login', (req, res) => {
  const { learnerId } = req.body;
  const learner = learners.find(l => l.id === parseInt(learnerId));
  
  if (!learner) {
    return res.status(404).json({ error: 'Learner not found' });
  }
  
  req.session.learnerId = learner.id;
  req.session.learnerName = learner.name;
  req.session.learnerEmail = learner.email;
  
  res.json({ 
    success: true, 
    learner: {
      id: learner.id,
      name: learner.name,
      email: learner.email
    }
  });
});

// Get a single certificate by ID (for sharing)
app.get('/api/certificate/:id', (req, res) => {
  const certId = parseInt(req.params.id);
  const certificate = certificates.find(c => c.id === certId);

  if (!certificate) {
    return res.status(404).json({ error: 'Certificate not found' });
  }

  res.json(certificate);
});

// Mark certificate as shared
app.post('/api/certificate/:id/mark-shared', (req, res) => {
  const certId = parseInt(req.params.id);
  const certificate = certificates.find(c => c.id === certId);

  if (!certificate) {
    return res.status(404).json({ error: 'Certificate not found' });
  }

  certificate.shared = true;
  certificate.sharedTimestamp = new Date().toISOString();
  certificate.shareStatus = 'success';

  shareActivity.unshift({
    date: certificate.sharedTimestamp,
    learnerName: certificate.learnerName,
    courseName: certificate.courseName,
    platform: 'Facebook',
    status: 'success'
  });

  res.json({ success: true, certificate });
});

app.get('/api/my-certificates', (req, res) => {
  if (!req.session.learnerId) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  let userCertificates = certificates.filter(cert => cert.learnerId === req.session.learnerId);

  // If new user has no certificates, create a demo one
  if (userCertificates.length === 0 && req.session.learnerId > 4) {
    const newCert = {
      id: certificates.length + 1,
      learnerId: req.session.learnerId,
      learnerName: req.session.learnerName,
      courseName: 'Web Development Bootcamp',
      imageFile: 'cert4.png',
      completionDate: new Date().toISOString().split('T')[0],
      shared: false,
      sharedTimestamp: null,
      shareStatus: null
    };
    certificates.push(newCert);
    userCertificates = [newCert];
  }

  res.json({
    learner: {
      id: req.session.learnerId,
      name: req.session.learnerName,
      email: req.session.learnerEmail
    },
    certificates: userCertificates
  });
});

app.get('/auth/facebook', (req, res) => {
  const { certificateId } = req.query;
  
  if (!certificateId) {
    return res.status(400).send('Certificate ID is required');
  }
  
  req.session.certificateId = certificateId;
  
  const redirectUri = `${PUBLIC_URL}/auth/facebook/callback`;
  const scope = 'pages_manage_posts,pages_read_engagement,public_profile';
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;

  res.redirect(authUrl);
});

app.get('/auth/facebook/callback', async (req, res) => {
  const { code, error, error_description } = req.query;
  
  if (error) {
    return res.redirect(`/certificates.html?error=${encodeURIComponent(error_description || error)}`);
  }
  
  if (!code) {
    return res.redirect('/certificates.html?error=No authorization code received');
  }
  
  try {
    if (!FACEBOOK_APP_SECRET) {
      return res.redirect('/certificates.html?error=Facebook App Secret not configured. Please set FACEBOOK_APP_SECRET environment variable.');
    }
    
    const redirectUri = `${PUBLIC_URL}/auth/facebook/callback`;
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;
    
    const tokenResponse = await axios.get(tokenUrl);
    const accessToken = tokenResponse.data.access_token;
    
    req.session.facebookAccessToken = accessToken;
    
    const pagesResponse = await axios.get(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`);
    const pages = pagesResponse.data.data;
    
    if (pages && pages.length > 0) {
      req.session.facebookPages = pages;
      res.redirect('/certificates.html?pages=true');
    } else {
      res.redirect('/certificates.html?error=No Facebook Pages found. You need a Facebook Page to post certificates.');
    }
    
  } catch (error) {
    console.error('Facebook OAuth Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to authenticate with Facebook';
    res.redirect(`/certificates.html?error=${encodeURIComponent(errorMessage)}`);
  }
});

app.get('/api/facebook-pages', (req, res) => {
  if (!req.session.facebookPages) {
    return res.status(401).json({ error: 'No Facebook pages in session' });
  }
  
  res.json({ pages: req.session.facebookPages });
});

app.post('/api/share-to-facebook', async (req, res) => {
  const { certificateId, pageId } = req.body;
  
  if (!req.session.learnerId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  if (!req.session.facebookAccessToken) {
    return res.status(401).json({ error: 'Not authenticated with Facebook' });
  }
  
  const certificate = certificates.find(c => c.id === parseInt(certificateId));
  
  if (!certificate) {
    return res.status(404).json({ error: 'Certificate not found' });
  }
  
  if (certificate.learnerId !== req.session.learnerId) {
    return res.status(403).json({ error: 'Not authorized to share this certificate' });
  }
  
  try {
    const selectedPage = req.session.facebookPages.find(p => p.id === pageId);
    
    if (!selectedPage) {
      return res.status(400).json({ error: 'Invalid page selected' });
    }
    
    const pageAccessToken = selectedPage.access_token;
    const caption = `Hi! I just completed ${certificate.courseName} from Speccon! 🎓✨`;
    const imageUrl = `${PUBLIC_URL}/certificates/${certificate.imageFile}`;
    
    const postResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${pageId}/photos`,
      {
        url: imageUrl,
        caption: caption,
        access_token: pageAccessToken
      }
    );
    
    certificate.shared = true;
    certificate.sharedTimestamp = new Date().toISOString();
    certificate.shareStatus = 'success';
    
    shareActivity.unshift({
      date: certificate.sharedTimestamp,
      learnerName: certificate.learnerName,
      courseName: certificate.courseName,
      platform: 'Facebook',
      status: 'success'
    });
    
    delete req.session.facebookAccessToken;
    delete req.session.facebookPages;
    delete req.session.certificateId;
    
    res.json({ 
      success: true, 
      message: 'Certificate shared successfully!',
      postId: postResponse.data.id
    });
    
  } catch (error) {
    console.error('Facebook Posting Error:', error.response?.data || error.message);
    
    certificate.shareStatus = 'failed';
    
    shareActivity.unshift({
      date: new Date().toISOString(),
      learnerName: certificate.learnerName,
      courseName: certificate.courseName,
      platform: 'Facebook',
      status: 'failed'
    });
    
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to post to Facebook';
    res.status(500).json({ error: errorMessage });
  }
});

// Admin credentials (in production, use a database with hashed passwords)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // In production, hash this!
};

// Middleware to check admin authentication
function requireAdminAuth(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized. Please login as admin.' });
  }
  next();
}

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    req.session.isAdmin = true;
    req.session.adminUsername = username;
    res.json({
      success: true,
      message: 'Admin login successful'
    });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Check admin session
app.get('/api/admin/check-session', (req, res) => {
  if (req.session.isAdmin) {
    res.json({
      authenticated: true,
      username: req.session.adminUsername
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Admin logout
app.post('/api/admin/logout', (req, res) => {
  req.session.isAdmin = false;
  req.session.adminUsername = null;
  res.json({ success: true });
});

// Protected admin analytics endpoint
app.get('/api/admin/analytics', requireAdminAuth, (req, res) => {
  const totalCertificates = certificates.length;
  const sharedCertificates = certificates.filter(c => c.shared).length;
  const shareRate = totalCertificates > 0 ? ((sharedCertificates / totalCertificates) * 100).toFixed(1) : 0;

  const successfulShares = shareActivity.filter(a => a.status === 'success').length;
  const failedShares = shareActivity.filter(a => a.status === 'failed').length;
  const totalShares = successfulShares + failedShares;
  const successRate = totalShares > 0 ? ((successfulShares / totalShares) * 100).toFixed(1) : 100;

  const learnerStats = learners.map(learner => {
    const learnerCerts = certificates.filter(c => c.learnerId === learner.id);
    const learnerShared = learnerCerts.filter(c => c.shared).length;
    const learnerShareRate = learnerCerts.length > 0 ? ((learnerShared / learnerCerts.length) * 100).toFixed(1) : 0;

    return {
      name: learner.name,
      totalCertificates: learnerCerts.length,
      sharedCertificates: learnerShared,
      shareRate: learnerShareRate
    };
  });

  const recentActivity = shareActivity.slice(0, 10);

  res.json({
    summary: {
      totalCertificates,
      sharedCertificates,
      shareRate: parseFloat(shareRate),
      successRate: parseFloat(successRate)
    },
    learnerStats,
    recentActivity,
    certificateDistribution: learnerStats.map(ls => ({
      name: ls.name,
      count: ls.totalCertificates
    }))
  });
});

// Manual signup endpoint
app.post('/api/signup', (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Check if email already exists
  const existingLearner = learners.find(l => l.email.toLowerCase() === email.toLowerCase());
  if (existingLearner) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  // Create new learner
  const newLearner = {
    id: learners.length + 1,
    name: name,
    email: email,
    phone: phone || null,
    facebookId: null,
    createdAt: new Date().toISOString()
  };

  learners.push(newLearner);

  // Log them in
  req.session.learnerId = newLearner.id;
  req.session.learnerName = newLearner.name;
  req.session.learnerEmail = newLearner.email;

  res.json({
    success: true,
    learner: {
      id: newLearner.id,
      name: newLearner.name,
      email: newLearner.email
    }
  });
});

// Facebook signup OAuth flow
app.get('/auth/facebook-signup', (req, res) => {
  const redirectUri = `${PUBLIC_URL}/auth/facebook-signup/callback`;
  const scope = 'email,public_profile';
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;

  res.redirect(authUrl);
});

app.get('/auth/facebook-signup/callback', async (req, res) => {
  const { code, error, error_description } = req.query;

  if (error) {
    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'facebook-signup-error',
              message: '${error_description || error}'
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  if (!code) {
    return res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'facebook-signup-error',
              message: 'No authorization code received'
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `);
  }

  try {
    if (!FACEBOOK_APP_SECRET) {
      return res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({
                type: 'facebook-signup-error',
                message: 'Facebook App Secret not configured'
              }, window.location.origin);
              window.close();
            </script>
          </body>
        </html>
      `);
    }

    const redirectUri = `${PUBLIC_URL}/auth/facebook-signup/callback`;
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${FACEBOOK_APP_SECRET}&code=${code}`;

    const tokenResponse = await axios.get(tokenUrl);
    const accessToken = tokenResponse.data.access_token;

    // Get user profile from Facebook
    const profileResponse = await axios.get(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`);
    const profile = profileResponse.data;

    // Check if user already exists by Facebook ID or email
    let learner = learners.find(l => l.facebookId === profile.id);

    if (!learner && profile.email) {
      learner = learners.find(l => l.email.toLowerCase() === profile.email.toLowerCase());
    }

    if (learner) {
      // Update existing learner with Facebook ID if not set
      if (!learner.facebookId) {
        learner.facebookId = profile.id;
      }
    } else {
      // Create new learner
      learner = {
        id: learners.length + 1,
        name: profile.name,
        email: profile.email || `facebook_${profile.id}@example.com`,
        phone: null,
        facebookId: profile.id,
        createdAt: new Date().toISOString()
      };
      learners.push(learner);
    }

    // Log them in
    req.session.learnerId = learner.id;
    req.session.learnerName = learner.name;
    req.session.learnerEmail = learner.email;

    // Send success message to parent window
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'facebook-signup-success',
              learner: {
                id: ${learner.id},
                name: '${learner.name}',
                email: '${learner.email}'
              }
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Facebook Signup Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to sign up with Facebook';

    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({
              type: 'facebook-signup-error',
              message: '${errorMessage}'
            }, window.location.origin);
            window.close();
          </script>
        </body>
      </html>
    `);
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/config', (req, res) => {
  res.json({
    appId: FACEBOOK_APP_ID,
    hasAppSecret: !!FACEBOOK_APP_SECRET
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Facebook Certificate Sharing Demo Server');
  console.log('='.repeat(60));
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Home Page: http://localhost:${PORT}/index.html`);
  console.log(`Signup Page: http://localhost:${PORT}/signup.html`);
  console.log(`Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log('='.repeat(60));
  console.log('Configuration:');
  console.log(`  App ID: ${FACEBOOK_APP_ID}`);

  if (FACEBOOK_APP_SECRET) {
    console.log('  ✓ App Secret: Configured');
  } else {
    console.log('  ✗ App Secret: NOT SET (Required for OAuth)');
    console.log('');
    console.log('⚠️  WARNING: FACEBOOK_APP_SECRET not configured!');
    console.log('  Facebook OAuth will not work without it.');
    console.log('');
    console.log('  To fix this:');
    console.log('  1. Create a .env file in project root');
    console.log('  2. Add: FACEBOOK_APP_SECRET=your_secret_here');
    console.log('  3. Restart the server');
    console.log('');
    console.log('  Or set it temporarily:');
    console.log('    Windows CMD: set FACEBOOK_APP_SECRET=your_secret && npm start');
    console.log('    PowerShell:  $env:FACEBOOK_APP_SECRET="your_secret"; npm start');
    console.log('    Mac/Linux:   export FACEBOOK_APP_SECRET=your_secret && npm start');
  }

  console.log('='.repeat(60));
});