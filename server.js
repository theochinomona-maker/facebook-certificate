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

const FACEBOOK_APP_ID = '1203244734963303';
let FACEBOOK_APP_SECRET = '';

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

app.get('/api/my-certificates', (req, res) => {
  if (!req.session.learnerId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  const userCertificates = certificates.filter(cert => cert.learnerId === req.session.learnerId);
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
  
  const redirectUri = `http://localhost:${PORT}/auth/facebook/callback`;
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
      FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
      if (!FACEBOOK_APP_SECRET) {
        return res.redirect('/certificates.html?error=Facebook App Secret not configured. Please set FACEBOOK_APP_SECRET environment variable.');
      }
    }
    
    const redirectUri = `http://localhost:${PORT}/auth/facebook/callback`;
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
    const imageUrl = `http://localhost:${PORT}/certificates/${certificate.imageFile}`;
    
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

app.get('/api/admin/analytics', (req, res) => {
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

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/config', (req, res) => {
  res.json({
    appId: FACEBOOK_APP_ID,
    hasAppSecret: !!FACEBOOK_APP_SECRET || !!process.env.FACEBOOK_APP_SECRET
  });
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('Facebook Certificate Sharing Demo Server');
  console.log('='.repeat(60));
  console.log(`Server running at: http://localhost:${PORT}`);
  console.log(`Home Page: http://localhost:${PORT}/index.html`);
  console.log(`Admin Dashboard: http://localhost:${PORT}/admin.html`);
  console.log('='.repeat(60));
  
  if (process.env.FACEBOOK_APP_SECRET) {
    FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    console.log('✓ Facebook App Secret loaded from environment variable');
  } else {
    console.log('⚠ WARNING: FACEBOOK_APP_SECRET not set!');
    console.log('  Set it via: set FACEBOOK_APP_SECRET=your_secret_here');
  }
  
  console.log('='.repeat(60));
});