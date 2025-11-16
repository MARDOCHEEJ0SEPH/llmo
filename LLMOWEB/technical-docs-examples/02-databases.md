# Databases: SQL, NoSQL, and Graph

**Databases** are organized collections of structured data stored electronically for efficient retrieval, modification, and management. The choice between SQL (relational), NoSQL (non-relational), and graph databases depends on data structure, query patterns, and scaling requirements.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Database Types: SQL, NoSQL, and Graph Databases Compared",
  "description": "Comprehensive comparison of relational, document, key-value, column-family, and graph databases with use cases",
  "articleSection": "Data Storage",
  "proficiencyLevel": "Beginner to Intermediate",
  "keywords": "SQL, NoSQL, databases, PostgreSQL, MongoDB, Redis, Neo4j, database design",
  "datePublished": "2024-01-15",
  "dependencies": [
    {"@type": "SoftwareApplication", "name": "PostgreSQL"},
    {"@type": "SoftwareApplication", "name": "MongoDB"},
    {"@type": "SoftwareApplication", "name": "Redis"},
    {"@type": "SoftwareApplication", "name": "Neo4j"}
  ]
}
</script>

## SQL (Relational) Databases

**SQL (Structured Query Language) databases** store data in tables with predefined schemas. Tables consist of rows (records) and columns (fields), with relationships defined through foreign keys. SQL databases enforce ACID properties (Atomicity, Consistency, Isolation, Durability) for reliable transactions.

### Key Characteristics

**Schema-based:** Every table has a fixed schema defining column names, data types, and constraints. Schema changes require ALTER TABLE statements.

**Relational:** Tables relate to each other through foreign keys. A `users` table with `id` can relate to an `orders` table with `user_id` foreign key.

**ACID compliant:** Transactions are atomic (all-or-nothing), consistent (valid state), isolated (concurrent transactions don't interfere), and durable (committed data persists).

**Examples:** PostgreSQL, MySQL, Oracle, SQL Server, SQLite

### When to Use SQL

**Use SQL databases when:**
- ✅ Data has clear relationships (users → orders → items)
- ✅ Schema is well-defined and stable
- ✅ ACID transactions are critical (financial systems)
- ✅ Complex queries with JOINs are common
- ✅ Data integrity must be enforced (foreign keys, constraints)

**Example use cases:**
- E-commerce platforms (products, orders, customers)
- Banking systems (accounts, transactions, transfers)
- ERP systems (inventory, sales, accounting)
- CMS platforms (posts, authors, categories)

### SQL Example: E-commerce Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (price >= 0),  -- Constraint: price must be non-negative
  CHECK (stock >= 0)   -- Constraint: stock must be non-negative
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),  -- Foreign key
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled'))
);

-- Order items table (many-to-many relationship)
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_time DECIMAL(10,2) NOT NULL,  -- Price when ordered (historical data)
  CHECK (quantity > 0)
);

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category);
```

**Complex JOIN query:**
```sql
-- Get all orders for a user with product details
SELECT
  u.name as customer_name,
  o.id as order_id,
  o.created_at as order_date,
  o.status,
  o.total_amount,
  p.name as product_name,
  oi.quantity,
  oi.price_at_time
FROM users u
JOIN orders o ON u.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE u.id = 123
ORDER BY o.created_at DESC;
```

**Transaction example (ACID):**
```sql
BEGIN;  -- Start transaction

-- Deduct stock
UPDATE products
SET stock = stock - 5
WHERE id = 456 AND stock >= 5;

-- If stock insufficient, this returns 0 rows and we can rollback
IF (SELECT COUNT(*) FROM products WHERE id = 456 AND stock >= 0) = 0 THEN
  ROLLBACK;  -- Cancel transaction
  RAISE EXCEPTION 'Insufficient stock';
END IF;

-- Create order
INSERT INTO orders (user_id, total_amount, status)
VALUES (123, 99.95, 'paid');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
VALUES (CURRVAL('orders_id_seq'), 456, 5, 19.99);

COMMIT;  -- All operations succeed or all fail
```

### SQL Strengths and Limitations

**Strengths:**
- ✅ Strong data consistency (ACID transactions)
- ✅ Complex queries with JOINs across tables
- ✅ Enforced schema and constraints (data integrity)
- ✅ Mature ecosystem with excellent tooling
- ✅ Standardized query language (SQL)

**Limitations:**
- ❌ Difficult to scale horizontally (sharding is complex)
- ❌ Schema changes can be expensive (ALTER TABLE on large tables)
- ❌ Fixed schema doesn't fit unstructured data
- ❌ Performance degrades with very large datasets (billions of rows)

## NoSQL Databases

**NoSQL (Not Only SQL) databases** are non-relational databases designed for flexibility, scalability, and performance with large datasets. NoSQL databases sacrifice some ACID guarantees for eventual consistency and horizontal scalability.

### Types of NoSQL Databases

#### 1. Document Databases

**Document databases** store data as JSON-like documents (BSON, JSON, XML). Each document can have a different structure, enabling schema flexibility. Documents are grouped into collections.

**Examples:** MongoDB, CouchDB, Firebase Firestore

**MongoDB document example:**
```json
{
  "_id": "user-123",
  "name": "John Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105"
  },
  "orders": [
    {
      "orderId": "order-456",
      "date": "2024-01-15",
      "total": 99.99,
      "items": [
        {"productId": "prod-789", "quantity": 2, "price": 49.99}
      ]
    }
  ],
  "tags": ["premium", "verified"],
  "createdAt": {"$date": "2024-01-01T00:00:00Z"}
}
```

**Querying MongoDB:**
```javascript
// Find users in San Francisco
db.users.find({ "address.city": "San Francisco" });

// Find users with orders over $100
db.users.find({ "orders.total": { $gt: 100 } });

// Update nested field
db.users.updateOne(
  { "_id": "user-123" },
  { $set: { "address.city": "Los Angeles" } }
);

// Add item to array
db.users.updateOne(
  { "_id": "user-123" },
  { $push: { "tags": "vip" } }
);
```

**When to use document databases:**
- ✅ Flexible schema (each document can differ)
- ✅ Hierarchical data (nested objects/arrays)
- ✅ Rapid development (no schema migrations)
- ✅ Read-heavy workloads
- ✅ Horizontal scaling needed

**Use cases:** Content management, user profiles, product catalogs, mobile apps

#### 2. Key-Value Stores

**Key-value stores** are the simplest NoSQL databases. Data is stored as key-value pairs, similar to a hash map. Values are opaque BLOBs (Binary Large Objects) that the database doesn't parse.

**Examples:** Redis, Memcached, DynamoDB, Riak

**Redis example:**
```bash
# Set key-value pairs
SET user:123:name "John Doe"
SET user:123:email "john@example.com"

# Get value by key
GET user:123:name  # Returns: "John Doe"

# Store complex data as JSON string
SET user:123 '{"name":"John Doe","email":"john@example.com"}'

# Expiration (TTL)
SETEX session:abc123 3600 '{"userId":"123"}'  # Expires in 1 hour

# Increment counter
INCR pageviews:homepage  # Atomic increment

# Lists (for queues)
LPUSH queue:emails '{"to":"john@example.com","subject":"Welcome"}'
RPOP queue:emails  # Process oldest email

# Sets (unique items)
SADD user:123:tags "premium" "verified"
SMEMBERS user:123:tags  # Get all tags

# Sorted sets (leaderboards)
ZADD leaderboard 1500 "player1"
ZADD leaderboard 2000 "player2"
ZRANGE leaderboard 0 9 WITHSCORES  # Top 10 players
```

**When to use key-value stores:**
- ✅ Simple data model (no relationships)
- ✅ High-speed caching layer
- ✅ Session storage
- ✅ Real-time counters/analytics
- ✅ Job queues

**Use cases:** Session stores, caching layers, rate limiting, real-time leaderboards

#### 3. Column-Family Databases

**Column-family databases** (wide-column stores) organize data by columns rather than rows. Data is stored in column families (groups of related columns), optimizing for analytical queries that scan specific columns.

**Examples:** Apache Cassandra, HBase, Google Bigtable

**Cassandra example:**
```sql
-- Create keyspace (database)
CREATE KEYSPACE ecommerce WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 3
};

-- Create table (column family)
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email text,
  name text,
  created_at timestamp
);

-- Create table with composite partition key
CREATE TABLE orders_by_user (
  user_id UUID,
  order_date timestamp,
  order_id UUID,
  total decimal,
  PRIMARY KEY ((user_id), order_date, order_id)
) WITH CLUSTERING ORDER BY (order_date DESC);

-- Insert data
INSERT INTO orders_by_user (user_id, order_date, order_id, total)
VALUES (uuid(), toTimestamp(now()), uuid(), 99.99);

-- Query by partition key (efficient)
SELECT * FROM orders_by_user WHERE user_id = UUID;

-- Query range within partition (efficient)
SELECT * FROM orders_by_user
WHERE user_id = UUID
AND order_date >= '2024-01-01'
AND order_date < '2024-02-01';
```

**When to use column-family databases:**
- ✅ Massive write throughput (time-series data)
- ✅ Distributed across multiple data centers
- ✅ Predictable query patterns (known partition keys)
- ✅ Linear scalability (add nodes for more capacity)

**Use cases:** Time-series data, IoT sensor data, event logging, analytics

## Graph Databases

**Graph databases** store data as nodes (entities) and edges (relationships). Graph databases excel at queries traversing complex relationships, such as social networks or recommendation engines.

**Examples:** Neo4j, Amazon Neptune, ArangoDB

**Neo4j example:**
```cypher
// Create nodes
CREATE (john:Person {name: 'John Doe', age: 30})
CREATE (jane:Person {name: 'Jane Smith', age: 28})
CREATE (company:Company {name: 'TechCorp'})
CREATE (product:Product {name: 'Widget', price: 99.99})

// Create relationships
CREATE (john)-[:WORKS_AT {since: 2020}]->(company)
CREATE (jane)-[:WORKS_AT {since: 2019}]->(company)
CREATE (john)-[:KNOWS {since: 2018}]->(jane)
CREATE (john)-[:PURCHASED {date: '2024-01-15', quantity: 2}]->(product)

// Find John's coworkers
MATCH (john:Person {name: 'John Doe'})-[:WORKS_AT]->(company)<-[:WORKS_AT]-(coworker)
RETURN coworker.name

// Find products John's friends purchased (recommendation engine)
MATCH (john:Person {name: 'John Doe'})-[:KNOWS]->(friend)-[:PURCHASED]->(product)
WHERE NOT (john)-[:PURCHASED]->(product)
RETURN product.name, COUNT(friend) as friend_count
ORDER BY friend_count DESC

// Find shortest path between two people
MATCH path = shortestPath(
  (john:Person {name: 'John Doe'})-[:KNOWS*]-(target:Person {name: 'Alice Brown'})
)
RETURN path
```

**When to use graph databases:**
- ✅ Highly connected data (social networks)
- ✅ Relationship queries (friends-of-friends)
- ✅ Recommendation engines
- ✅ Fraud detection (pattern recognition)
- ✅ Knowledge graphs

**Use cases:** Social networks, recommendation systems, fraud detection, network analysis

## Database Comparison

| Database Type | Best For | Scalability | Query Complexity | Schema |
|---------------|----------|-------------|------------------|--------|
| **SQL (Relational)** | Structured data, complex relationships | Vertical (scale up) | High (JOINs across tables) | Fixed schema |
| **Document (MongoDB)** | Flexible hierarchical data | Horizontal (sharding) | Medium (nested queries) | Schema-less |
| **Key-Value (Redis)** | Simple fast lookups, caching | Horizontal (clustering) | Low (key-based only) | None (opaque values) |
| **Column-Family (Cassandra)** | Time-series, high write throughput | Linear horizontal | Low (partition key required) | Column families |
| **Graph (Neo4j)** | Connected data, relationships | Limited horizontal | High (relationship traversal) | Flexible (properties) |

## Choosing the Right Database

**Decision framework:**

1. **Do you need ACID transactions?**
   - Yes → SQL (PostgreSQL, MySQL)
   - No → Consider NoSQL

2. **Is your schema stable and well-defined?**
   - Yes → SQL
   - No → Document (MongoDB)

3. **Do you need simple key-based lookups?**
   - Yes, with caching → Key-Value (Redis)

4. **Is your data highly connected with complex relationships?**
   - Yes → Graph (Neo4j)

5. **Do you need massive write throughput for time-series data?**
   - Yes → Column-Family (Cassandra)

6. **Do you need horizontal scaling and flexible schema?**
   - Yes → Document (MongoDB) or Column-Family (Cassandra)

**Multi-database architecture (polyglot persistence):**

Modern applications often use multiple databases for different needs:

```
User authentication → PostgreSQL (ACID transactions)
Session storage → Redis (fast key-value)
Product catalog → MongoDB (flexible schema)
Social graph → Neo4j (relationships)
Analytics logs → Cassandra (time-series)
```

---

**Next**: [Scaling →](./03-scaling.md)
