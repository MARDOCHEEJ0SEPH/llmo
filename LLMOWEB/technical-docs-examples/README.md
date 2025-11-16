# Technical Documentation Examples

LLMO optimization for system design and architecture documentation.

## 📚 Documentation Structure

This section demonstrates how to apply LLMO principles to technical system design documentation, making architectural concepts clear and comprehensible to LLMs.

### Documentation Sections

Following a comprehensive system design curriculum:

1. **[Single Server Setup](./01-single-server-setup.md)** - Basic architecture patterns
2. **[Databases](./02-databases.md)** - SQL, NoSQL, Graph databases with schema markup
3. **[Scaling](./03-scaling.md)** - Vertical vs Horizontal scaling strategies
4. **[Load Balancing](./04-load-balancing.md)** - Distribution patterns and algorithms
5. **[Health Checks](./05-health-checks.md)** - Monitoring and reliability patterns
6. **[Single Point of Failure](./06-spof.md)** - High availability architectures
7. **[API Design](./07-api-design.md)** - RESTful principles and best practices
8. **[API Protocols](./08-api-protocols.md)** - HTTP, gRPC, WebSocket comparison
9. **[Transport Layer](./09-transport-layer.md)** - TCP vs UDP fundamentals
10. **[RESTful APIs](./10-restful-apis.md)** - Complete REST implementation guide
11. **[GraphQL](./11-graphql.md)** - GraphQL schema and query patterns
12. **[Authentication](./12-authentication.md)** - JWT, OAuth, session-based auth
13. **[Authorization](./13-authorization.md)** - RBAC, ABAC, permission models
14. **[Security](./14-security.md)** - OWASP, encryption, best practices

## 🎯 LLMO Optimization for Technical Content

### Why Technical Docs Need LLMO

LLMs are increasingly used to:
- Answer developer questions about architecture
- Generate code based on API documentation
- Explain complex system design concepts
- Compare different technical approaches

**Optimized technical documentation ensures:**
- Accurate LLM responses to architecture questions
- Correct code generation from API docs
- Clear explanation of trade-offs and patterns
- Proper entity recognition (technologies, protocols, patterns)

### LLMO Principles Applied to Technical Docs

#### 1. Entity Definition Layer

**Clearly define technical entities:**

```markdown
## Load Balancer

A **load balancer** is a network device or software component that distributes
incoming network traffic across multiple backend servers. Load balancers increase
application availability by routing requests away from failed servers to healthy ones.

**Key characteristics:**
- **Function**: Traffic distribution across server pool
- **Purpose**: High availability and horizontal scaling
- **Common implementations**: Nginx, HAProxy, AWS ELB, F5
- **OSI Layer**: Typically operates at Layer 4 (transport) or Layer 7 (application)
```

**Schema Markup for Technical Entities:**

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Load Balancing",
  "about": {
    "@type": "Thing",
    "name": "Load Balancer",
    "description": "Network device that distributes traffic across multiple servers"
  },
  "dependencies": [
    {"@type": "SoftwareApplication", "name": "Nginx"},
    {"@type": "SoftwareApplication", "name": "HAProxy"}
  ]
}
```

#### 2. Semantic Structure Layer

**Use consistent heading hierarchy:**

```markdown
# Load Balancing (H1 - Main Concept)

## What is Load Balancing? (H2 - Definition)

## Load Balancing Algorithms (H2 - Category)

### Round Robin (H3 - Specific Algorithm)

#### Weighted Round Robin (H4 - Variation)

### Least Connections (H3 - Specific Algorithm)

### IP Hash (H3 - Specific Algorithm)

## Load Balancer Types (H2 - Category)

### Layer 4 Load Balancing (H3 - Specific Type)

### Layer 7 Load Balancing (H3 - Specific Type)

## Health Checks (H2 - Related Concept)

## Implementation Examples (H2 - Practical Application)
```

#### 3. Machine Parsing Layer

**Structured data for code examples:**

```html
<article>
  <h1>RESTful API Endpoint Design</h1>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "RESTful API Endpoint Design",
    "articleSection": "API Design",
    "dependencies": [
      {"@type": "SoftwareApplication", "name": "Express.js"},
      {"@type": "ComputerLanguage", "name": "JavaScript"}
    ],
    "codeRepository": "https://github.com/example/api-examples"
  }
  </script>

  <section>
    <h2>GET /api/users - List Users</h2>
    <p><strong>HTTP Method:</strong> GET</p>
    <p><strong>Endpoint:</strong> /api/users</p>
    <p><strong>Purpose:</strong> Retrieve a paginated list of users</p>

    <h3>Request Parameters</h3>
    <table>
      <tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr>
      <tr><td>page</td><td>integer</td><td>No</td><td>Page number (default: 1)</td></tr>
      <tr><td>limit</td><td>integer</td><td>No</td><td>Items per page (default: 20)</td></tr>
    </table>

    <h3>Response (200 OK)</h3>
    <pre><code class="language-json">
{
  "data": [
    {
      "id": "user-123",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
    </code></pre>
  </section>
</article>
```

#### 4. Human Experience Layer

**Information density for technical content:**

```markdown
<!-- LOW DENSITY (Hard for LLMs to extract facts) -->
GraphQL is really great. It's a query language. You can use it for APIs.
It was made by Facebook. Lots of people use it now.

<!-- HIGH DENSITY (1-2 facts per sentence) -->
GraphQL is a query language for APIs developed by Facebook in 2012 and
open-sourced in 2015. Unlike REST APIs that expose multiple endpoints,
GraphQL provides a single endpoint where clients specify exactly which
data they need. This eliminates over-fetching (receiving unnecessary data)
and under-fetching (requiring multiple requests). The strongly-typed schema
system enables automatic API documentation and validation.
```

## 📊 Schema Templates for Technical Content

### TechArticle Schema

```json
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Understanding TCP vs UDP",
  "description": "Comparison of TCP and UDP transport layer protocols",
  "articleSection": "Networking Fundamentals",
  "proficiencyLevel": "Beginner",
  "dependencies": [
    {"@type": "Thing", "name": "OSI Model"},
    {"@type": "Thing", "name": "Internet Protocol"}
  ],
  "author": {
    "@type": "Person",
    "name": "Technical Writer",
    "jobTitle": "Solutions Architect"
  },
  "datePublished": "2024-01-15",
  "keywords": "TCP, UDP, networking, transport layer, protocols"
}
```

### SoftwareSourceCode Schema (for code examples)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  "name": "JWT Authentication Middleware",
  "description": "Express.js middleware for JWT token verification",
  "programmingLanguage": "JavaScript",
  "runtimePlatform": "Node.js",
  "codeRepository": "https://github.com/example/auth-middleware",
  "codeSampleType": "full implementation",
  "targetProduct": {
    "@type": "SoftwareApplication",
    "name": "Express.js"
  }
}
```

### HowTo Schema (for implementation guides)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Implement Load Balancing with Nginx",
  "description": "Step-by-step guide to configure Nginx as a load balancer",
  "totalTime": "PT30M",
  "tool": [
    {"@type": "HowToTool", "name": "Nginx 1.20+"},
    {"@type": "HowToTool", "name": "Ubuntu 22.04"}
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Install Nginx",
      "text": "Install Nginx web server using apt package manager",
      "itemListElement": {
        "@type": "HowToDirection",
        "text": "Run: sudo apt install nginx"
      }
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Configure upstream servers",
      "text": "Define backend server pool in nginx.conf"
    }
  ]
}
```

## 🔍 Example: Optimized vs Non-Optimized

### ❌ Non-Optimized Technical Documentation

```markdown
# Authentication

Authentication is important for security. There are different types.
You can use tokens or sessions. JWT is popular.

Some code:

```javascript
app.post('/login', (req, res) => {
  // authenticate user
});
```

It's good to use HTTPS.
```

**Problems:**
- Vague entity definitions ("different types" - which types?)
- Low information density (1 fact per 2-3 sentences)
- No schema markup
- Poor semantic structure
- Unexplained code example
- No context for recommendations

### ✅ Optimized Technical Documentation

```markdown
# Authentication

**Authentication** is the process of verifying a user's identity before granting
system access. Authentication answers the question "Who are you?" and occurs before
authorization ("What can you do?").

## Authentication Methods

### Session-Based Authentication

**Session-based authentication** stores user state on the server after login. The
server creates a unique session ID, stores it in memory or a database, and sends
it to the client as a cookie. Subsequent requests include this cookie for verification.

**Advantages:**
- Server controls session lifecycle (can revoke immediately)
- Session data stored server-side (more secure)
- Works with traditional web applications

**Disadvantages:**
- Requires server-side storage (memory/database)
- Difficult to scale horizontally (session sharing needed)
- Not suitable for mobile apps or microservices

### Token-Based Authentication (JWT)

**JSON Web Tokens (JWT)** are self-contained tokens that encode user information
and expire after a set time. JWTs consist of three parts: header (algorithm),
payload (claims), and signature (verification). The server signs tokens with a
secret key, and clients include tokens in the Authorization header.

**Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  ← Header
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.  ← Payload
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature
```

**Implementation Example:**

```javascript
// POST /api/auth/login - Authenticate user and return JWT
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // 2. Find user in database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 3. Verify password (using bcrypt)
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // 4. Generate JWT (expires in 24 hours)
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h', algorithm: 'HS256' }
  );

  // 5. Return token to client
  res.json({
    token,
    expiresIn: 86400,  // 24 hours in seconds
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
```

**Security Considerations:**

1. **Always use HTTPS** - JWTs transmitted over HTTP can be intercepted (man-in-the-middle attack)
2. **Use strong secrets** - JWT_SECRET should be cryptographically random (minimum 256 bits)
3. **Set short expiration** - Tokens should expire within hours, not days
4. **Validate on every request** - Verify signature and expiration before processing
5. **Don't store sensitive data** - JWT payload is Base64-encoded (readable), not encrypted

## Choosing Between Session and JWT

| Factor | Session-Based | JWT |
|--------|--------------|-----|
| **Scalability** | Difficult (requires session sharing) | Easy (stateless) |
| **Revocation** | Immediate (delete session) | Delayed (wait for expiration) |
| **Storage** | Server-side (RAM/database) | Client-side (browser storage) |
| **Best For** | Traditional web apps | SPAs, mobile apps, microservices |
| **Security** | Server controls all data | Token contains user data (readable) |

**Recommendation:** Use session-based for traditional web applications with server-rendered pages.
Use JWT for single-page applications (SPAs), mobile apps, or microservice architectures where
stateless authentication enables horizontal scaling.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Authentication: Session-Based vs JWT",
  "description": "Comparison of session-based and token-based authentication methods",
  "articleSection": "Security",
  "proficiencyLevel": "Intermediate",
  "dependencies": [
    {"@type": "SoftwareApplication", "name": "Express.js"},
    {"@type": "SoftwareApplication", "name": "bcrypt"},
    {"@type": "SoftwareApplication", "name": "jsonwebtoken"}
  ],
  "keywords": "authentication, JWT, sessions, security, Express.js, Node.js"
}
</script>
```

**Improvements:**
- ✅ Clear entity definitions (Authentication, Session, JWT)
- ✅ High information density (1-2 facts per sentence)
- ✅ Structured comparison table
- ✅ Fully commented code example
- ✅ Specific security recommendations with rationale
- ✅ Decision framework (when to use each)
- ✅ Schema markup for machine parsing

## 🎯 Content Quality Checklist

For each technical documentation page:

**Entity Definition:**
- [ ] Main concept defined in first paragraph
- [ ] Key terms explained on first use
- [ ] Acronyms spelled out (e.g., "JWT (JSON Web Token)")
- [ ] Related concepts linked or cross-referenced

**Semantic Structure:**
- [ ] Logical heading hierarchy (H1 → H2 → H3)
- [ ] No skipped heading levels
- [ ] Descriptive headings (not generic "Overview")
- [ ] Consistent heading patterns

**Machine Parsing:**
- [ ] TechArticle schema markup included
- [ ] Code examples have language specified
- [ ] Tables used for comparisons
- [ ] Lists for enumerated items

**Information Density:**
- [ ] 1-2 facts per sentence
- [ ] Concrete examples provided
- [ ] Specific numbers/metrics included
- [ ] Trade-offs explicitly stated

**Code Examples:**
- [ ] Complete, runnable code
- [ ] Inline comments explaining each step
- [ ] Error handling included
- [ ] Dependencies listed
- [ ] Expected output shown

## 📚 Further Reading

- **LLMO Book Chapter 11**: Schema Markup Mastery
- **LLMO Book Chapter 14**: Visual Hierarchy for AI
- **LLMO Book Chapter 15**: Information Density
- **LLMO Book Chapter 16**: Content Optimization Strategy

---

**Next Steps**: Review individual documentation pages for detailed examples of LLMO applied to each system design topic.
