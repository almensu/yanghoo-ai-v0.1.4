# API Designer Skill

A comprehensive toolkit for designing APIs and data types with support for REST APIs, GraphQL schemas, and database design.

## Features

### 🚀 Core Capabilities
- **REST API Design**: Complete OpenAPI 3.0 specification generation
- **GraphQL Schema Design**: Type definitions and resolver patterns
- **Database Design**: Schema patterns, indexing strategies, and normalization
- **Code Generation**: TypeScript interfaces and Python Pydantic models

### 🛠️ Tools Included

#### Scripts
- `generate_openapi.py` - Generate OpenAPI specifications
- `generate_typescript.py` - Generate TypeScript interfaces and API client
- `generate_pydantic.py` - Generate Pydantic models for Python

#### References
- `api-design-patterns.md` - REST API and GraphQL design best practices
- `database-design.md` - Database schema design and optimization patterns

#### Templates
- `assets/templates/rest-api.yaml` - Complete OpenAPI 3.0 template

## Usage Examples

### Generate OpenAPI Specification
```python
from scripts.generate_openapi import generate_openapi_spec, add_schema, add_path

# Create basic specification
spec = generate_openapi_spec("My API", "1.0.0")

# Add schemas and endpoints
# ... use the generated specification
```

### Generate TypeScript Types
```bash
python3 scripts/generate_typescript.py > types.ts
```

### Generate Pydantic Models
```bash
python3 scripts/generate_pydantic.py > models.py
```

## Supported Patterns

### REST API Design
- Consistent endpoint naming and HTTP method usage
- Standard response formats with pagination
- Proper error handling and status codes
- Security patterns (authentication, authorization)

### Database Design
- Normalization forms (1NF, 2NF, 3NF)
- Indexing strategies for performance
- Hierarchical data patterns
- Audit trails and soft deletes

### Code Generation
- TypeScript interfaces with proper typing
- Python Pydantic models with validation
- API client classes with error handling
- Comprehensive type definitions

## Best Practices Covered

- API versioning and evolution
- Security (JWT, API keys, rate limiting)
- Performance optimization (caching, indexing)
- Error handling patterns
- Testing strategies
- Documentation standards

## Installation

The skill is distributed as a `.skill` package and can be installed in compatible environments.

## Requirements

- Python 3.7+
- Dependencies: pydantic, jinja2 (for Python script execution)

## License

MIT License - see LICENSE file for details.