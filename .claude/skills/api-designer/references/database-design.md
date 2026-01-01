# Database Design Principles and Patterns

## Database Schema Design

### Normalization Rules

#### First Normal Form (1NF)
- Each column contains atomic values
- No repeating groups
- Each row is unique

```sql
-- Bad: Repeating groups
CREATE TABLE users_bad (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    phone_numbers VARCHAR(500) -- "123-456-7890,987-654-3210"
);

-- Good: Separate table
CREATE TABLE users_good (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE user_phone_numbers (
    user_id INT REFERENCES users_good(id),
    phone_number VARCHAR(20),
    PRIMARY KEY (user_id, phone_number)
);
```

#### Second Normal Form (2NF)
- Meets 1NF
- All non-key attributes depend on the entire primary key

```sql
-- Bad: Partial dependencies
CREATE TABLE order_items_bad (
    order_id INT,
    product_id INT,
    product_name VARCHAR(100),  -- Depends only on product_id
    quantity INT,
    price DECIMAL(10,2),       -- Depends only on product_id
    PRIMARY KEY (order_id, product_id)
);

-- Good: Separate tables
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    product_name VARCHAR(100),
    price DECIMAL(10,2)
);

CREATE TABLE order_items (
    order_id INT,
    product_id INT REFERENCES products(product_id),
    quantity INT,
    PRIMARY KEY (order_id, product_id)
);
```

#### Third Normal Form (3NF)
- Meets 2NF
- No transitive dependencies

```sql
-- Bad: Transitive dependencies
CREATE TABLE users_bad (
    id INT PRIMARY KEY,
    department_id INT,
    department_name VARCHAR(100),  -- Depends on department_id
    manager_id INT,
    manager_name VARCHAR(100)      -- Depends on manager_id
);

-- Good: Separate tables
CREATE TABLE departments (
    department_id INT PRIMARY KEY,
    department_name VARCHAR(100)
);

CREATE TABLE employees (
    employee_id INT PRIMARY KEY,
    employee_name VARCHAR(100)
);

CREATE TABLE users (
    id INT PRIMARY KEY,
    department_id INT REFERENCES departments(department_id),
    manager_id INT REFERENCES employees(employee_id)
);
```

## Common Database Patterns

### Auditing Pattern

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    old_values JSONB,
    new_values JSONB,
    changed_by VARCHAR(50),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
```

### Soft Delete Pattern

```sql
-- Add to tables that support soft delete
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE users ADD COLUMN deleted_by VARCHAR(50) NULL;

-- Query only non-deleted records
SELECT * FROM users WHERE deleted_at IS NULL;

-- Include deleted records when needed
SELECT * FROM users WHERE deleted_at IS NOT NULL;
SELECT * FROM users; -- All records

-- Soft delete operation
UPDATE users
SET deleted_at = NOW(), deleted_by = 'user_123'
WHERE id = 456;
```

### Time-based Partitioning

```sql
-- PostgreSQL partitioned table for orders
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE orders_2024_02 PARTITION OF orders
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Automatically create partitions
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name text, start_date date)
RETURNS void AS $$
DECLARE
    partition_name text;
    end_date date;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + interval '1 month';

    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF %I
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

### Hierarchical Data

#### Adjacency List Pattern
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES categories(id),
    level INTEGER NOT NULL DEFAULT 0,
    path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for hierarchical queries
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories(path);
CREATE INDEX idx_categories_level ON categories(level);

-- Recursive query to get full category tree
WITH RECURSIVE category_tree AS (
    -- Base case: root categories
    SELECT id, name, parent_id, level, 1 as depth
    FROM categories
    WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case: child categories
    SELECT c.id, c.name, c.parent_id, c.level, ct.depth + 1
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;
```

#### Nested Set Pattern
```sql
CREATE TABLE nested_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    lft INTEGER NOT NULL,
    rgt INTEGER NOT NULL,
    depth INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for nested set integrity
CREATE UNIQUE INDEX idx_nested_categories_lft_rgt ON nested_categories(lft, rgt);

-- Query to get all descendants
SELECT c.*
FROM nested_categories c
JOIN nested_categories parent ON c.lft > parent.lft AND c.rgt < parent.rgt
WHERE parent.id = $category_id
ORDER BY c.lft;

-- Query to get all ancestors
SELECT parent.*
FROM nested_categories parent
JOIN nested_categories child ON parent.lft < child.lft AND parent.rgt > child.rgt
WHERE child.id = $category_id
ORDER BY parent.lft DESC;
```

## Data Integrity Patterns

### Check Constraints

```sql
-- Email validation
ALTER TABLE users ADD CONSTRAINT chk_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Password strength
ALTER TABLE users ADD CONSTRAINT chk_password_strength
CHECK (length(password) >= 8 AND
       password ~* '[A-Z]' AND           -- At least one uppercase
       password ~* '[a-z]' AND           -- At least one lowercase
       password ~* '[0-9]' AND           -- At least one digit
       password ~* '[!@#$%^&*(),.?":{}|<>]'); -- At least one special character

-- Positive amounts
ALTER TABLE orders ADD CONSTRAINT chk_total_positive
CHECK (total > 0);

-- Date ranges
ALTER TABLE subscriptions ADD CONSTRAINT chk_date_range
CHECK (end_date IS NULL OR end_date >= start_date);

-- Business rules
ALTER TABLE products ADD CONSTRAINT chk_price_retail
CHECK (retail_price >= wholesale_price);

ALTER TABLE employees ADD CONSTRAINT chk_hire_date
CHECK (hire_date <= birth_date + INTERVAL '18 years');
```

### Domain Types

```sql
-- Custom domain types
CREATE DOMAIN email_address AS VARCHAR(255)
CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

CREATE DOMAIN phone_number AS VARCHAR(20)
CHECK (VALUE ~* '^\+?[1-9]\d{1,14}$' OR VALUE ~* '^\d{3}-\d{3}-\d{4}$');

CREATE DOMAIN positive_decimal AS DECIMAL(12,2)
CHECK (VALUE > 0);

CREATE DOMAIN non_negative_int AS INTEGER
CHECK (VALUE >= 0);

-- Usage in tables
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email email_address UNIQUE,
    phone phone_number,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    price positive_decimal,
    stock_quantity non_negative_int,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enum Types

```sql
-- User status enum
CREATE TYPE user_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'pending_verification'
);

-- Order status enum
CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded',
    'partially_refunded'
);

-- Usage in tables
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    status order_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add check constraints for status transitions
ALTER TABLE orders ADD CONSTRAINT chk_status_transition
CHECK (
    (status = 'pending' AND payment_status IN ('pending', 'failed')) OR
    (status = 'confirmed' AND payment_status = 'completed') OR
    (status = 'cancelled') OR
    (status = 'refunded')
);
```

## Performance Optimization

### Indexing Strategies

#### Composite Indexes
```sql
-- For queries that filter on multiple columns
CREATE INDEX idx_users_status_created ON users(status, created_at);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- For covering indexes (include all query columns)
CREATE INDEX idx_orders_user_status_total ON orders(user_id, status) INCLUDE (total, created_at);

-- Partial indexes for common query patterns
CREATE INDEX idx_active_users_email ON users(email) WHERE status = 'active';
CREATE INDEX idx_recent_orders ON orders(created_at) WHERE created_at > NOW() - INTERVAL '30 days';
```

#### Expression Indexes
```sql
-- For case-insensitive searches
CREATE INDEX idx_users_email_lower ON users(LOWER(email));
CREATE INDEX idx_users_name_lower ON users(LOWER(first_name), LOWER(last_name));

-- For JSON field searches
CREATE INDEX idx_products_attributes_category ON products
USING GIN ((attributes->>'category'));

-- For full-text search
CREATE INDEX idx_articles_content_gin ON articles
USING GIN (to_tsvector('english', content));

-- For date function queries
CREATE INDEX idx_users_birth_month ON users(EXTRACT(MONTH FROM birth_date));
```

#### Functional Indexes for Common Patterns
```sql
-- URL pattern matching
CREATE INDEX idx_websites_domain ON websites((SUBSTRING(url, 'https?://([^/]+)')));

-- Phone number normalization
CREATE INDEX idx_contacts_phone_normalized ON contacts(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'));

-- Geographic distance queries (PostGIS)
CREATE INDEX idx_locations_geom ON locations USING GIST (geom);
```

### Query Optimization

#### Join Optimization
```sql
-- Use appropriate join types
SELECT u.*, o.*
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
  AND o.created_at >= '2024-01-01';

-- Use EXISTS for existence checks (more efficient than IN)
SELECT u.*
FROM users u
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = u.id
    AND o.total > 1000
);

-- Use CTEs for complex queries
WITH user_stats AS (
    SELECT
        user_id,
        COUNT(*) as order_count,
        SUM(total) as total_spent
    FROM orders
    WHERE created_at >= '2024-01-01'
    GROUP BY user_id
)
SELECT u.*, us.order_count, us.total_spent
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE us.order_count > 5;
```

#### Materialized Views
```sql
-- For expensive aggregations
CREATE MATERIALIZED VIEW user_order_summary AS
SELECT
    u.id,
    u.email,
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent,
    MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.email;

-- Create unique index for refresh
CREATE UNIQUE INDEX idx_user_order_summary_id ON user_order_summary(id);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW user_order_summary;

-- For auto-refresh (PostgreSQL 9.4+)
CREATE OR REPLACE FUNCTION refresh_user_order_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron extension
SELECT cron.schedule('refresh-user-summary', '0 */6 * * *', 'SELECT refresh_user_order_summary();');
```

## Database Security

### Row Level Security (RLS)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_data_policy ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::uuid);

-- Users can only see their own orders
CREATE POLICY user_orders_policy ON orders
    FOR ALL
    USING (user_id = current_setting('app.current_user_id')::uuid);

-- Admins can see all data
CREATE POLICY admin_user_policy ON users
    FOR ALL
    USING (current_setting('app.user_role') = 'admin');

CREATE POLICY admin_orders_policy ON orders
    FOR ALL
    USING (current_setting('app.user_role') = 'admin');
```

### Data Encryption

```sql
-- Column-level encryption (pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE TABLE sensitive_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_encrypted BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encryption function
CREATE OR REPLACE FUNCTION encrypt_data(data text, secret_key text)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(data, secret_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decryption function
CREATE OR REPLACE FUNCTION decrypt_data(encrypted_data BYTEA, secret_key text)
RETURNS text AS $$
BEGIN
    RETURN pgp_sym_decrypt(encrypted_data, secret_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Migration Patterns

### Versioned Migrations

```sql
-- Migration table
CREATE TABLE schema_migrations (
    version VARCHAR(20) PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration naming convention: 001_create_users.sql, 002_add_user_profiles.sql, etc.

-- Migration template
-- 001_create_users.sql
BEGIN;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES ('001');

COMMIT;
```

### Rollback Strategies

```sql
-- Rollback script naming: 001_create_users.rollback.sql

BEGIN;
DROP TABLE IF EXISTS users;
DELETE FROM schema_migrations WHERE version = '001';
COMMIT;
```

### Safe Migration Patterns

```sql
-- Adding new column safely
-- Step 1: Add column with default NULL
ALTER TABLE users ADD COLUMN new_field VARCHAR(100) NULL;

-- Step 2: Backfill data in batches
UPDATE users
SET new_field = 'default_value'
WHERE id % 1000 = 0; -- Process in batches

-- Step 3: Add NOT NULL constraint after backfill
ALTER TABLE users
ALTER COLUMN new_field SET NOT NULL,
ALTER COLUMN new_field SET DEFAULT 'default_value';

-- Dropping column safely
-- Step 1: Mark column as unused
ALTER TABLE users ALTER COLUMN old_field SET DATA TYPE text; -- For logging

-- Step 2: Wait for deployment cycle
-- Step 3: Drop column
ALTER TABLE users DROP COLUMN old_field;
```

## Backup and Recovery

### Backup Strategies

```bash
# Full database backup
pg_dump -h localhost -U postgres -d myapp_db -f backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump -h localhost -U postgres -d myapp_db | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Schema-only backup
pg_dump -h localhost -U postgres -d myapp_db --schema-only > schema_$(date +%Y%m%d_%H%M%S).sql

# Data-only backup
pg_dump -h localhost -U postgres -d myapp_db --data-only > data_$(date +%Y%m%d_%H%M%S).sql

# Specific tables
pg_dump -h localhost -U postgres -d myapp_db -t users -t orders > specific_tables.sql
```

### Point-in-Time Recovery

```sql
-- Enable WAL archiving
-- postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive_dir/%f'

-- Base backup
pg_basebackup -h localhost -D /backup/base_backup -U postgres -v -P

-- Recovery configuration
-- recovery.conf
restore_command = 'cp /archive_dir/%f %p'
recovery_target_time = '2024-01-15 14:30:00'
```

## Monitoring and Maintenance

### Database Health Checks

```sql
-- Connection statistics
SELECT
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database;

-- Table statistics
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_live_tup,
    n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup + n_dead_tup DESC;

-- Index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Maintenance Operations

```sql
-- Vacuum and analyze tables
VACUUM ANALYZE users;
VACUUM ANALYZE orders;

-- Rebuild indexes
REINDEX INDEX CONCURRENTLY idx_users_email;
REINDEX INDEX CONCURRENTLY idx_orders_user_id;

-- Update table statistics
ANALYZE users;
ANALYZE orders;

-- Check table bloat
SELECT
    schemaname,
    tablename,
    ROUND(
        (pg_relation_size(schemaname||'.'||tablename) /
         (COUNT(*) * (24 + 32))::FLOAT) - 1, 2
    ) AS bloat_ratio
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid
WHERE c.relkind = 'r'
  AND a.attnum > 0
GROUP BY schemaname, tablename, pg_relation_size(schemaname||'.'||tablename)
HAVING ROUND(
    (pg_relation_size(schemaname||'.'||tablename) /
     (COUNT(*) * (24 + 32))::FLOAT) - 1, 2
) > 0.1;
```