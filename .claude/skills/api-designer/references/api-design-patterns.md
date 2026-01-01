# API Design Patterns and Best Practices

## REST API Design Principles

### HTTP Method Usage

| Method | Usage | Idempotent | Safe |
|--------|-------|------------|------|
| `GET` | Retrieve resources | ✅ | ✅ |
| `POST` | Create resources | ❌ | ❌ |
| `PUT` | Replace resources | ✅ | ❌ |
| `PATCH` | Partial updates | ✅ | ❌ |
| `DELETE` | Remove resources | ✅ | ❌ |

### URL Design Patterns

#### Resource Naming
- Use nouns, not verbs: `/users` instead of `/getUsers`
- Use plural nouns for collections: `/users`, `/products`
- Use singular for specific resource: `/users/{id}`
- Use hyphens for readability: `/user-profiles`

#### Nesting Relationships
```
/users/{id}/orders          # Orders for a specific user
/orders/{id}/items          # Items in a specific order
/users/{id}/orders/{orderId}/items
```

#### Query Parameters
- Filtering: `/users?status=active&role=admin`
- Sorting: `/users?sort_by=created_at&order=desc`
- Pagination: `/users?page=2&limit=20`
- Searching: `/users?search=john`

### Response Format Standards

#### Success Responses
```json
{
  "data": {
    "id": "123",
    "name": "John Doe"
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "v1"
  }
}
```

#### Error Responses
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      "Field 'email' must be a valid email address"
    ]
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "req_123456"
  }
}
```

#### Paginated Responses
```json
{
  "data": [
    {"id": "1", "name": "Item 1"},
    {"id": "2", "name": "Item 2"}
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

## GraphQL Schema Design

### Type Definition Patterns

#### Base Types
```graphql
type Query {
  # Query operations
}

type Mutation {
  # Mutation operations
}

type Subscription {
  # Subscription operations
}
```

#### Object Types
```graphql
type User {
  id: ID!
  email: String!
  profile: UserProfile
  createdAt: DateTime!
  updatedAt: DateTime!
}

type UserProfile {
  bio: String
  avatar: String
  socialLinks: [SocialLink!]
}
```

#### Input Types
```graphql
input CreateUserInput {
  email: String!
  firstName: String
  lastName: String
  password: String!
}

input UserFilter {
  search: String
  status: UserStatus
  createdAfter: DateTime
}
```

#### Enums
```graphql
enum UserRole {
  ADMIN
  USER
  MODERATOR
  GUEST
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

### Resolver Patterns

#### Field Resolvers
```python
async def resolve_user(parent, info, id):
    # Resolve user by ID
    pass

async def resolve_user_orders(parent, info):
    # Resolve user's orders (nested field)
    pass
```

#### List Resolvers with Pagination
```python
async def resolve_users(parent, info, filter, pagination):
    offset = (pagination.page - 1) * pagination.limit
    users = await get_users(filter, offset, pagination.limit)
    total = await count_users(filter)
    return {
        "items": users,
        "pagination": {
            "page": pagination.page,
            "limit": pagination.limit,
            "total": total
        }
    }
```

## Database Design Patterns

### Table Naming Conventions

- Use plural nouns: `users`, `orders`, `products`
- Use snake_case: `user_profiles`, `order_items`
- Use descriptive names: `user_authentication_tokens`

### Column Naming

- Use snake_case: `first_name`, `created_at`, `is_active`
- Use descriptive names: `email_verification_token`
- Boolean prefixes: `is_`, `has_`, `can_`, `should_`

### Data Types Best Practices

#### IDs
```sql
-- Primary keys
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
id BIGINT PRIMARY KEY IDENTITY(1,1)

-- Foreign keys
user_id UUID NOT NULL REFERENCES users(id)
product_id BIGINT NOT NULL REFERENCES products(id)
```

#### Timestamps
```sql
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
deleted_at TIMESTAMP WITH TIME ZONE NULL  -- Soft delete
```

#### JSON Columns
```sql
metadata JSONB DEFAULT '{}'::jsonb
settings JSONB DEFAULT '{}'::jsonb
```

#### Array Columns
```sql
tags TEXT[] DEFAULT '{}'
permissions TEXT[] DEFAULT '{}'
```

### Indexing Strategies

#### Primary Indexes
```sql
-- Primary key automatically indexed
PRIMARY KEY (id)

-- Composite primary key
PRIMARY KEY (user_id, role_id)
```

#### Foreign Key Indexes
```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

#### Query Optimization Indexes
```sql
-- For filtering
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- For searching
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name_search ON users(LOWER(first_name), LOWER(last_name));

-- Composite indexes
CREATE INDEX idx_orders_status_created ON orders(status, created_at);
```

#### Partial Indexes
```sql
-- Only index active users
CREATE INDEX idx_active_users_email ON users(email) WHERE is_active = true;

-- Only index recent orders
CREATE INDEX idx_recent_orders ON orders(created_at) WHERE created_at > NOW() - INTERVAL '30 days';
```

### Relationship Patterns

#### One-to-One
```sql
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(255),
    -- Other profile fields
);
```

#### One-to-Many
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total DECIMAL(10,2),
    -- Other order fields
);
```

#### Many-to-Many
```sql
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);
```

### Data Validation Patterns

#### Check Constraints
```sql
-- Email format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')

-- Password strength
CHECK (length(password) >= 8 AND
       password ~* '[A-Z]' AND
       password ~* '[a-z]' AND
       password ~* '[0-9]')

-- Positive amounts
CHECK (amount > 0)

-- Date ranges
CHECK (end_date IS NULL OR end_date >= start_date)
```

#### Enum Types
```sql
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
```

## Security Patterns

### Authentication

#### JWT Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_123",
    "email": "user@example.com",
    "role": "user",
    "iat": 1640995200,
    "exp": 1641081600
  }
}
```

#### API Keys
```json
{
  "key_id": "ak_live_1234567890abcdef",
  "api_key": "sk_live_abcdef1234567890",
  "permissions": ["read:users", "write:orders"],
  "expires_at": "2024-12-31T23:59:59Z"
}
```

### Authorization Patterns

#### Role-Based Access Control (RBAC)
```sql
-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb
);

-- User roles junction
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);
```

#### Attribute-Based Access Control (ABAC)
```python
def can_access_resource(user, resource, action):
    policies = get_policies_for_user(user)
    return any(
        policy.evaluate(user, resource, action)
        for policy in policies
    )
```

## Performance Patterns

### Caching Strategies

#### Redis Cache Keys
```
user:profile:{user_id}     # User profile data
user:permissions:{user_id} # User permissions
api:response:{endpoint}:{params_hash} # API responses
session:{session_id}       # User session data
```

#### Cache-Aside Pattern
```python
async def get_user(user_id):
    # Try cache first
    cache_key = f"user:profile:{user_id}"
    user = await cache.get(cache_key)

    if user is None:
        # Cache miss - get from database
        user = await db.get_user(user_id)
        if user:
            await cache.set(cache_key, user, ttl=3600)

    return user
```

### Database Optimization

#### Connection Pooling
```python
# SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=30,
    pool_timeout=30,
    pool_recycle=3600
)
```

#### Query Optimization
```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@example.com';

-- Avoid N+1 queries with JOINs or IN clauses
SELECT u.*, p.*
FROM users u
JOIN user_profiles p ON u.id = p.user_id
WHERE u.status = 'active';
```

### API Rate Limiting

#### Token Bucket Algorithm
```python
class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate
        self.last_refill = time.time()

    def consume(self):
        now = time.time()
        time_passed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + time_passed * self.refill_rate)
        self.last_refill = now

        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
```

## Error Handling Patterns

### Error Codes

| Category | Pattern | Example |
|----------|---------|---------|
| Client Error | 4XX_CLIENT_TYPE_SPECIFIC | 400_BAD_REQUEST, 401_UNAUTHORIZED |
| Validation | VALIDATION_FIELD_NAME | VALIDATION_EMAIL_INVALID |
| Business Logic | BUSINESS_CONTEXT_ERROR | BUSINESS_INSUFFICIENT_BALANCE |
| System Error | SYSTEM_COMPONENT_ERROR | SYSTEM_DATABASE_CONNECTION_FAILED |

### Exception Hierarchy
```python
class APIError(Exception):
    def __init__(self, message: str, code: str, status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code

class ValidationError(APIError):
    def __init__(self, field: str, message: str):
        code = f"VALIDATION_{field.upper()}_INVALID"
        super().__init__(message, code, 400)

class AuthenticationError(APIError):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, "AUTHENTICATION_FAILED", 401)

class AuthorizationError(APIError):
    def __init__(self, message: str = "Access denied"):
        super().__init__(message, "AUTHORIZATION_DENIED", 403)
```

## Testing Patterns

### API Testing

#### Request/Response Testing
```python
async def test_create_user():
    response = await client.post("/users", json={
        "email": "test@example.com",
        "password": "securepassword"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["data"]["email"] == "test@example.com"
    assert "id" in data["data"]
```

#### Error Testing
```python
async def test_create_user_invalid_email():
    response = await client.post("/users", json={
        "email": "invalid-email",
        "password": "securepassword"
    })
    assert response.status_code == 400
    data = response.json()
    assert data["error"]["code"] == "VALIDATION_EMAIL_INVALID"
```

### Database Testing

#### Fixtures
```python
@pytest.fixture
async def test_user():
    return await create_test_user(
        email="test@example.com",
        password="testpassword"
    )

async def test_user_creation(test_user):
    assert test_user.email == "test@example.com"
    assert test_user.is_active is True
```

#### Transaction Rollback
```python
async def test_with_transaction():
    async with database.transaction():
        user = await create_user(...)
        order = await create_order(user_id=user.id, ...)
        # Test logic here
        # Changes will be rolled back automatically
```