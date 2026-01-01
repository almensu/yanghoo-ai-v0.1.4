---
name: api-designer
description: Comprehensive API and data type design toolkit with support for REST APIs, GraphQL schemas, and database design. Use when designing APIs from scratch, generating OpenAPI specifications, creating TypeScript/Python data models, designing database schemas, or working through the complete API design workflow from requirements to implementation.
---

# API Designer Skill

## Quick Start

For immediate API design, choose your API type:

- **REST API**: `Use REST API patterns for endpoints, HTTP methods, and status codes`
- **GraphQL Schema**: `Use GraphQL type definitions with proper schema design`
- **Database Design**: `Use database schema patterns and relationships`

## Core Workflows

### 1. REST API Design

**Endpoint Design Pattern**:
```
METHOD /api/v1/{resource}/{id}
```

**Standard Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

**Request/Response Structure**:
```json
{
  "data": {},
  "error": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "v1"
  }
}
```

### 2. GraphQL Schema Design

**Type Definition Pattern**:
```graphql
type User {
  id: ID!
  email: String!
  profile: UserProfile
  createdAt: DateTime!
}

type Query {
  user(id: ID!): User
  users(filter: UserFilter): [User!]!
}
```

### 3. Database Schema Design

**Table Naming**: Use plural nouns, snake_case
**Column Naming**: Use snake_case, be descriptive
**Relationships**: Define foreign keys explicitly

## Advanced Features

### API Specification Generation
- **OpenAPI 3.0**: Generate complete API specs
- **JSON Schema**: Create data validation schemas
- **Postman Collections**: Export ready-to-use collections

### Code Generation
- **TypeScript interfaces**: Auto-generate type definitions
- **Python models**: Create Pydantic models
- **Database migrations**: Generate SQL migration scripts

### Database Design
- **ER diagrams**: Visual representation of relationships
- **Index optimization**: Performance-oriented indexing strategy
- **Normalization**: Apply proper database normalization rules

## Templates and Resources

### API Templates
- `templates/rest-api.yaml` - REST API specification template
- `templates/graphql-api.graphql` - GraphQL schema template
- `templates/database-schema.sql` - Database schema template

### Code Generation Tools
- `scripts/generate-openapi.py` - Generate OpenAPI specs from models
- `scripts/generate-typescript.py` - Generate TypeScript interfaces
- `scripts/generate-pydantic.py` - Generate Python Pydantic models

### Reference Materials
- `references/api-design-patterns.md` - Best practices and patterns
- `references/database-design.md` - Database design principles
- `references/validation-rules.md` - Data validation strategies

## Quality Standards

### API Design Principles
1. **Consistent naming** across all endpoints and types
2. **Proper HTTP usage** - methods, status codes, headers
3. **Clear error responses** with structured error information
4. **Version management** for API evolution
5. **Security considerations** - authentication, authorization, rate limiting

### Data Type Design Principles
1. **Type safety** with clear constraints and validation
2. **Relationship integrity** with proper foreign key usage
3. **Performance optimization** through appropriate indexing
4. **Extensibility** for future schema evolution
5. **Documentation completeness** with clear field descriptions

## Common Use Cases

### E-commerce API
- User management, authentication, profiles
- Product catalog with categories and variants
- Shopping cart and order processing
- Payment integration and inventory management

### Content Management System
- Content creation, editing, publishing workflow
- Media management and file uploads
- User roles and permissions
- SEO optimization and metadata

### Analytics Platform
- Event tracking and data collection
- Report generation and dashboards
- User behavior analysis
- Real-time data processing

## Best Practices

### Performance
- Implement pagination for large datasets
- Use caching strategies appropriately
- Optimize database queries and indexes
- Consider API response compression

### Security
- Validate all input data
- Implement rate limiting
- Use HTTPS for all communications
- Secure sensitive data handling

### Documentation
- Always include example requests/responses
- Document error scenarios clearly
- Provide authentication/authorization guides
- Include testing environment setup