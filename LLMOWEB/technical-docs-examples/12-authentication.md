# Authentication

**Authentication** is the process of verifying a user's claimed identity before granting system access. Authentication answers "Who are you?" and must occur before authorization ("What are you allowed to do?").

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Authentication: Methods, Implementation, and Best Practices",
  "description": "Comprehensive guide to authentication systems including sessions, JWT, OAuth, and security considerations",
  "articleSection": "Security",
  "proficiencyLevel": "Intermediate",
  "keywords": "authentication, JWT, OAuth, sessions, security, tokens, password hashing",
  "dependencies": [
    {"@type": "SoftwareApplication", "name": "bcrypt"},
    {"@type": "SoftwareApplication", "name": "jsonwebtoken"},
    {"@type": "SoftwareApplication", "name": "passport.js"}
  ],
  "datePublished": "2024-01-15"
}
</script>

## Authentication vs Authorization

| Aspect | Authentication | Authorization |
|--------|----------------|---------------|
| **Question** | "Who are you?" | "What can you do?" |
| **Process** | Verify identity | Check permissions |
| **Methods** | Passwords, biometrics, tokens | Roles, permissions, ACLs |
| **Timing** | First step | After authentication |
| **Example** | User logs in with password | User can delete posts |

**Example scenario:** A user provides username/password (authentication). The system verifies credentials and identifies them as "admin" (authentication successful). When they attempt to delete a post, the system checks if admins have delete permission (authorization).

## Authentication Methods

### 1. Session-Based Authentication

**Session-based authentication** stores user state on the server after successful login. The server generates a unique session ID, stores session data (user ID, login time, etc.) in memory or a database, and sends the session ID to the client as a cookie. Subsequent requests include this cookie for verification.

**Workflow:**
1. User submits credentials (username/password)
2. Server verifies credentials against database
3. Server creates session record with unique ID
4. Server sends session ID as HTTP-only cookie
5. Client automatically includes cookie in future requests
6. Server validates session ID on each request
7. Server invalidates session on logout or timeout

**Implementation:**

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');
const bcrypt = require('bcrypt');

// Redis client for session storage (production-ready)
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// Session middleware
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,  // Cryptographic secret
  name: 'sessionId',  // Cookie name (don't use default 'connect.sid')
  resave: false,  // Don't save unchanged sessions
  saveUninitialized: false,  // Don't create session until something stored
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    httpOnly: true,  // Prevent JavaScript access (XSS protection)
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    sameSite: 'lax'  // CSRF protection
  }
}));

// POST /api/auth/login - Create session
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // 2. Verify password
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // 3. Create session
  req.session.userId = user.id;
  req.session.email = user.email;
  req.session.role = user.role;
  req.session.loginTime = Date.now();

  // 4. Save session and return user data
  req.session.save((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Session creation failed',
        code: 'SESSION_ERROR'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  });
});

// Authentication middleware
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'UNAUTHORIZED'
    });
  }
  next();
}

// GET /api/auth/me - Get current user
app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await User.findByPk(req.session.userId);
  res.json({ user });
});

// POST /api/auth/logout - Destroy session
app.post('/api/auth/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: 'Logout failed',
        code: 'LOGOUT_ERROR'
      });
    }

    res.clearCookie('sessionId');
    res.json({ message: 'Logged out successfully' });
  });
});
```

**Advantages:**
- ✅ Server controls session lifecycle (can revoke immediately)
- ✅ Session data stored server-side (secure)
- ✅ Simple implementation for traditional web apps
- ✅ Works without JavaScript (form-based auth)

**Disadvantages:**
- ❌ Requires server-side storage (memory/Redis/database)
- ❌ Difficult to scale horizontally (session sharing needed)
- ❌ Not suitable for mobile apps or microservices
- ❌ CORS complications for cross-domain requests

### 2. Token-Based Authentication (JWT)

**JSON Web Tokens (JWT)** are self-contained, stateless tokens that encode user information and signature. JWTs eliminate server-side session storage by encoding all necessary data in the token itself. The server verifies the signature but doesn't need to look up session state.

**JWT structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  ← Header (algorithm, type)
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.  ← Payload (claims)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature (verification)
```

**Header** (Base64 encoded):
```json
{
  "alg": "HS256",  // HMAC SHA-256 algorithm
  "typ": "JWT"     // Token type
}
```

**Payload** (Base64 encoded):
```json
{
  "sub": "user-123",           // Subject (user ID)
  "email": "john@example.com", // Custom claim
  "role": "admin",             // Custom claim
  "iat": 1642089600,           // Issued at (Unix timestamp)
  "exp": 1642176000            // Expiration (Unix timestamp)
}
```

**Signature** (HMAC SHA-256):
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

**Implementation:**

```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;  // Must be cryptographically random
const JWT_EXPIRATION = '24h';  // Token expires in 24 hours

// POST /api/auth/login - Generate JWT
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // 2. Verify password
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({
      error: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS'
    });
  }

  // 3. Generate JWT
  const token = jwt.sign(
    {
      sub: user.id,        // Subject (standard claim)
      email: user.email,   // Custom claim
      role: user.role      // Custom claim
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRATION,
      algorithm: 'HS256'   // Use HS256 (HMAC) or RS256 (RSA)
    }
  );

  // 4. Return token and user data
  res.json({
    token,
    expiresIn: 24 * 60 * 60,  // 24 hours in seconds
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

// Authentication middleware
function requireAuth(req, res, next) {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'No token provided',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.substring(7);  // Remove 'Bearer ' prefix

  try {
    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      error: 'Token verification failed',
      code: 'VERIFICATION_ERROR'
    });
  }
}

// GET /api/auth/me - Get current user (from token)
app.get('/api/auth/me', requireAuth, async (req, res) => {
  // req.user populated by requireAuth middleware
  const user = await User.findByPk(req.user.id);
  res.json({ user });
});

// POST /api/auth/refresh - Refresh token (extend expiration)
app.post('/api/auth/refresh', requireAuth, (req, res) => {
  // Generate new token with same claims but new expiration
  const token = jwt.sign(
    {
      sub: req.user.id,
      email: req.user.email,
      role: req.user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );

  res.json({
    token,
    expiresIn: 24 * 60 * 60
  });
});
```

**Client-side usage:**

```javascript
// Login and store token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token } = await response.json();
localStorage.setItem('token', token);

// Use token in subsequent requests
const data = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Advantages:**
- ✅ Stateless (no server-side storage needed)
- ✅ Easy horizontal scaling
- ✅ Perfect for SPAs, mobile apps, microservices
- ✅ Cross-domain support (CORS-friendly)

**Disadvantages:**
- ❌ Cannot be revoked immediately (must wait for expiration)
- ❌ Payload is readable (Base64 encoded, not encrypted)
- ❌ Token size larger than session ID
- ❌ XSS vulnerability if stored in localStorage

### 3. OAuth 2.0 and Social Login

**OAuth 2.0** is an authorization framework that enables third-party applications to access user data without exposing passwords. OAuth is commonly used for "Sign in with Google/Facebook/GitHub" functionality.

**OAuth flow (Authorization Code Grant):**
1. User clicks "Sign in with Google"
2. App redirects to Google's authorization endpoint
3. User authenticates with Google and grants permissions
4. Google redirects back with authorization code
5. App exchanges code for access token (server-side)
6. App uses access token to fetch user profile
7. App creates local user account and session/JWT

**Implementation with Passport.js:**

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      let user = await User.findOne({ where: { googleId: profile.id } });

      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0].value
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Initiate OAuth flow
app.get('/api/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// OAuth callback
app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate JWT for authenticated user
    const token = jwt.sign(
      { sub: req.user.id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redirect to frontend with token
    res.redirect(`https://yourapp.com/auth-success?token=${token}`);
  }
);
```

## Password Security

### Password Hashing

**Never store passwords in plain text.** Use one-way hashing algorithms like bcrypt, which are intentionally slow to prevent brute-force attacks.

**bcrypt features:**
- **Salting** - Random data added to password before hashing (prevents rainbow table attacks)
- **Cost factor** - Configurable iterations (higher = slower = more secure)
- **Future-proof** - Can increase cost factor as hardware improves

**Implementation:**

```javascript
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;  // 2^12 iterations (adjust based on performance)

// Hash password during registration
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  // Validate password strength
  if (password.length < 8) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters',
      code: 'WEAK_PASSWORD'
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user
  const user = await User.create({
    email,
    passwordHash  // Store hash, never plain text
  });

  res.status(201).json({ user: { id: user.id, email: user.email } });
});

// Verify password during login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Compare provided password with stored hash
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Password valid, proceed with authentication...
});
```

### Password Reset Flow

**Password reset** must be secure to prevent account takeover. Use time-limited, single-use tokens sent via email.

```javascript
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// POST /api/auth/forgot-password - Request reset
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    // Don't reveal if email exists (prevent enumeration)
    return res.json({
      message: 'If that email exists, a reset link has been sent'
    });
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Store hashed token with expiration
  await user.update({
    resetTokenHash,
    resetTokenExpires: Date.now() + 3600000  // 1 hour
  });

  // Send email with reset link
  const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.`
  });

  res.json({
    message: 'If that email exists, a reset link has been sent'
  });
});

// POST /api/auth/reset-password - Set new password
app.post('/api/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  // Hash provided token
  const resetTokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with matching token that hasn't expired
  const user = await User.findOne({
    where: {
      resetTokenHash,
      resetTokenExpires: { [Op.gt]: Date.now() }
    }
  });

  if (!user) {
    return res.status(400).json({
      error: 'Invalid or expired token',
      code: 'INVALID_RESET_TOKEN'
    });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password and clear reset token
  await user.update({
    passwordHash,
    resetTokenHash: null,
    resetTokenExpires: null
  });

  res.json({ message: 'Password reset successful' });
});
```

## Security Best Practices

1. **Always use HTTPS** - Credentials/tokens sent over HTTP can be intercepted
2. **Use httpOnly cookies** - Prevents XSS attacks from stealing session cookies
3. **Implement rate limiting** - Prevent brute-force login attempts (5 attempts per 15 minutes)
4. **Use bcrypt for passwords** - Slow hashing algorithm resistant to brute-force
5. **Set short token expiration** - JWTs should expire within hours, not days
6. **Validate token signatures** - Always verify JWT signature before trusting payload
7. **Don't store sensitive data in JWTs** - Payload is readable (Base64, not encrypted)
8. **Implement CSRF protection** - Use sameSite cookies or CSRF tokens
9. **Log authentication events** - Track failed login attempts for security monitoring
10. **Use secure password reset** - Time-limited, single-use tokens via email

## Comparison: Sessions vs JWT vs OAuth

| Factor | Sessions | JWT | OAuth |
|--------|----------|-----|-------|
| **Storage** | Server (Redis/DB) | Client (localStorage/cookie) | Provider (Google/GitHub) |
| **Scalability** | Difficult (requires sharing) | Easy (stateless) | Depends on provider |
| **Revocation** | Immediate | Delayed (wait for expiry) | Immediate (provider handles) |
| **Best For** | Traditional web apps | SPAs, mobile, microservices | Social login, third-party access |
| **Complexity** | Low | Medium | High |
| **Security** | High (server-controlled) | Medium (client stores token) | High (delegated to provider) |

---

**Next**: [Authorization →](./13-authorization.md)
