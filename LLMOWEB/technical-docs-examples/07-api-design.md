# API Design

**API (Application Programming Interface) design** is the process of creating well-structured interfaces that enable different software components to communicate. Good API design balances usability, consistency, performance, and maintainability.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "API Design Principles and Best Practices",
  "description": "Comprehensive guide to designing robust, scalable APIs",
  "articleSection": "Software Architecture",
  "proficiencyLevel": "Intermediate",
  "keywords": "API design, REST, HTTP methods, versioning, documentation",
  "datePublished": "2024-01-15",
  "author": {
    "@type": "Person",
    "name": "System Design Expert"
  }
}
</script>

## Core API Design Principles

### 1. Consistency

**Consistency** means using uniform naming conventions, URL structures, HTTP methods, and response formats across all endpoints. Consistent APIs have lower learning curves and fewer integration errors.

**Naming conventions:**
- Use **nouns** for resources (not verbs): `/users`, `/products`, `/orders`
- Use **plural nouns** for collections: `/users` (not `/user`)
- Use **kebab-case** for multi-word resources: `/order-items`, `/user-preferences`
- Use **camelCase** for JSON properties: `firstName`, `createdAt`, `totalAmount`

**Example:**
```javascript
// ✅ Good - Consistent naming
GET    /api/users              // List users
GET    /api/users/123          // Get user by ID
POST   /api/users              // Create user
PUT    /api/users/123          // Update user
DELETE /api/users/123          // Delete user

GET    /api/products           // List products
GET    /api/products/456       // Get product by ID

// ❌ Bad - Inconsistent naming
GET    /api/getUsers           // Verb in URL
GET    /api/user/123           // Singular vs plural inconsistency
POST   /api/createNewUser      // Redundant verb
PUT    /api/users/update/123   // Unnecessary path segment
DELETE /api/deleteUser?id=123  // Query param for ID
```

### 2. Resource-Oriented Design

**Resource-oriented design** models the API around business entities (resources) rather than operations. Each resource has a unique identifier and supports standard CRUD operations via HTTP methods.

**HTTP method semantics:**

| Method | Purpose | Idempotent | Safe | Example |
|--------|---------|------------|------|---------|
| **GET** | Retrieve resource(s) | Yes | Yes | `GET /users/123` |
| **POST** | Create new resource | No | No | `POST /users` |
| **PUT** | Replace entire resource | Yes | No | `PUT /users/123` |
| **PATCH** | Update partial resource | No | No | `PATCH /users/123` |
| **DELETE** | Remove resource | Yes | No | `DELETE /users/123` |

**Idempotent** means multiple identical requests have the same effect as a single request. **Safe** means the request doesn't modify state.

**Implementation example:**

```javascript
// GET /api/users - List users with pagination
router.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const users = await User.findAll({
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });

  const total = await User.count();

  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// GET /api/users/:id - Get single user
router.get('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }

  res.json({ data: user });
});

// POST /api/users - Create new user
router.post('/users', async (req, res) => {
  const { email, name, password } = req.body;

  // Validation
  if (!email || !name || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      code: 'VALIDATION_ERROR',
      fields: {
        email: !email ? 'Email is required' : null,
        name: !name ? 'Name is required' : null,
        password: !password ? 'Password is required' : null
      }
    });
  }

  // Check for duplicate email
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({
      error: 'Email already exists',
      code: 'DUPLICATE_EMAIL'
    });
  }

  // Create user
  const user = await User.create({
    email,
    name,
    passwordHash: await bcrypt.hash(password, 10)
  });

  // Return 201 Created with Location header
  res.status(201)
    .header('Location', `/api/users/${user.id}`)
    .json({ data: user });
});

// PUT /api/users/:id - Replace entire user
router.put('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }

  // Replace all fields
  await user.update({
    email: req.body.email,
    name: req.body.name,
    // ... all fields must be provided
  });

  res.json({ data: user });
});

// PATCH /api/users/:id - Partially update user
router.patch('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }

  // Update only provided fields
  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.email !== undefined) updates.email = req.body.email;

  await user.update(updates);

  res.json({ data: user });
});

// DELETE /api/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  }

  await user.destroy();

  res.status(204).send();  // No content
});
```

### 3. Status Codes

**HTTP status codes** communicate the result of each request. Use appropriate status codes to enable clients to handle responses correctly without parsing error messages.

**Common status codes:**

**Success (2xx):**
- **200 OK** - Request succeeded, returning data (GET, PUT, PATCH)
- **201 Created** - Resource created successfully (POST)
- **204 No Content** - Success with no response body (DELETE)

**Client errors (4xx):**
- **400 Bad Request** - Invalid request format or validation error
- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - Authenticated but lacks permission
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Request conflicts with current state (duplicate creation)
- **422 Unprocessable Entity** - Syntactically correct but semantically invalid
- **429 Too Many Requests** - Rate limit exceeded

**Server errors (5xx):**
- **500 Internal Server Error** - Unexpected server error
- **502 Bad Gateway** - Upstream service failed
- **503 Service Unavailable** - Server temporarily unavailable
- **504 Gateway Timeout** - Upstream service timeout

**Example error responses:**

```javascript
// 400 Bad Request - Validation error
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "not-an-email"
    },
    {
      "field": "age",
      "message": "Must be at least 18",
      "value": 15
    }
  ]
}

// 401 Unauthorized - Missing or invalid token
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED",
  "message": "No authentication token provided"
}

// 403 Forbidden - Insufficient permissions
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN",
  "message": "Admin role required for this operation"
}

// 404 Not Found - Resource doesn't exist
{
  "error": "User not found",
  "code": "USER_NOT_FOUND",
  "requestedId": "123"
}

// 429 Too Many Requests - Rate limit exceeded
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "limit": 100,
  "window": "1 hour",
  "retryAfter": 3600
}

// 500 Internal Server Error - Unexpected error
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "requestId": "req-xyz-123"  // For debugging
}
```

### 4. Versioning

**API versioning** enables breaking changes without disrupting existing clients. Version the API from day one to avoid forced migrations later.

**Versioning strategies:**

**URL versioning** (recommended for simplicity):
```javascript
GET /api/v1/users
GET /api/v2/users  // New version with breaking changes
```

**Header versioning:**
```javascript
GET /api/users
Headers: Accept: application/vnd.myapi.v1+json
```

**Query parameter versioning:**
```javascript
GET /api/users?version=1
```

**Implementation example:**

```javascript
// Version 1 - Original API
router.get('/api/v1/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.json({
    id: user.id,
    name: user.name,
    email: user.email
  });
});

// Version 2 - Breaking change: split name into first/last
router.get('/api/v2/users/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  res.json({
    id: user.id,
    firstName: user.firstName,  // New field
    lastName: user.lastName,    // New field
    email: user.email,
    profileUrl: `/users/${user.id}`  // New field
  });
});
```

**Version deprecation timeline:**
1. **Announce deprecation** - 6 months before removal
2. **Add deprecation header** - `Deprecation: true`, `Sunset: 2024-12-31`
3. **Monitor usage** - Track which clients still use old version
4. **Communicate migration** - Email/documentation for migration guide
5. **Remove old version** - After sunset date

### 5. Filtering, Sorting, Pagination

**Filtering, sorting, and pagination** enable clients to retrieve exactly the data they need without transferring unnecessary information.

**Filtering** (query parameters):
```javascript
GET /api/products?category=electronics
GET /api/products?category=electronics&inStock=true
GET /api/products?minPrice=100&maxPrice=500
```

**Sorting:**
```javascript
GET /api/products?sort=price              // Ascending by price
GET /api/products?sort=-price             // Descending (- prefix)
GET /api/products?sort=category,-price    // Multiple fields
```

**Pagination** (cursor-based for performance):
```javascript
// Page-based pagination (simple but skip is slow for large datasets)
GET /api/products?page=2&limit=20

// Cursor-based pagination (performant for large datasets)
GET /api/products?cursor=eyJpZCI6MTIzfQ&limit=20

Response:
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTQzfQ",
    "prevCursor": "eyJpZCI6MTAzfQ",
    "hasMore": true
  }
}
```

**Full implementation:**

```javascript
router.get('/api/products', async (req, res) => {
  // Parse query parameters
  const {
    category,
    minPrice,
    maxPrice,
    inStock,
    sort = 'createdAt',
    page = 1,
    limit = 20
  } = req.query;

  // Build filter conditions
  const where = {};

  if (category) {
    where.category = category;
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
    if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
  }

  if (inStock !== undefined) {
    where.inStock = inStock === 'true';
  }

  // Parse sort parameter
  const sortFields = sort.split(',').map(field => {
    const descending = field.startsWith('-');
    const fieldName = descending ? field.slice(1) : field;
    return [fieldName, descending ? 'DESC' : 'ASC'];
  });

  // Execute query
  const products = await Product.findAll({
    where,
    order: sortFields,
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit)
  });

  const total = await Product.count({ where });

  res.json({
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    filters: { category, minPrice, maxPrice, inStock },
    sort
  });
});
```

## API Documentation

**API documentation** should be comprehensive, accurate, and easy to navigate. Good documentation reduces support requests and accelerates integration.

**Essential documentation elements:**

1. **Overview** - What the API does, authentication method, base URL
2. **Authentication** - How to obtain and use API keys/tokens
3. **Endpoints** - Complete list with descriptions
4. **Request format** - Headers, body structure, parameters
5. **Response format** - Success and error responses with examples
6. **Error codes** - All possible errors with solutions
7. **Rate limits** - Request limits and handling
8. **Changelog** - Version history and breaking changes
9. **Code examples** - Working examples in multiple languages

**OpenAPI (Swagger) specification:**

```yaml
openapi: 3.0.0
info:
  title: Products API
  version: 1.0.0
  description: RESTful API for managing products

servers:
  - url: https://api.example.com/v1
    description: Production server

paths:
  /products:
    get:
      summary: List products
      description: Returns a paginated list of products with optional filtering
      parameters:
        - name: category
          in: query
          schema:
            type: string
          description: Filter by category
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Product'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    Product:
      type: object
      required:
        - id
        - name
        - price
      properties:
        id:
          type: string
          example: "prod-123"
        name:
          type: string
          example: "Wireless Headphones"
        price:
          type: number
          format: float
          example: 99.99
        category:
          type: string
          example: "Electronics"
```

## Rate Limiting

**Rate limiting** prevents abuse and ensures fair resource allocation. Limits are typically measured in requests per time window (e.g., 100 requests/hour).

**Rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 75
X-RateLimit-Reset: 1642089600
```

**Implementation:**

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 100,  // 100 requests per hour
  message: {
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 3600
  },
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false
});

app.use('/api', limiter);
```

## Best Practices Summary

1. **Use nouns for resources** - `/users`, not `/getUsers`
2. **Use HTTP methods correctly** - GET (read), POST (create), PUT/PATCH (update), DELETE (delete)
3. **Return appropriate status codes** - 200, 201, 204, 400, 404, 500, etc.
4. **Version from day one** - `/api/v1/users`
5. **Paginate large collections** - Use `page` and `limit` parameters
6. **Support filtering and sorting** - Enable clients to get exactly what they need
7. **Use consistent naming** - camelCase for JSON, kebab-case for URLs
8. **Document everything** - OpenAPI/Swagger specification
9. **Handle errors gracefully** - Structured error responses with codes
10. **Implement rate limiting** - Prevent abuse and ensure fairness

---

**Next**: [API Protocols →](./08-api-protocols.md)
