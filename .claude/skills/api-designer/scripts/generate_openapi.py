#!/usr/bin/env python3
"""
Generate OpenAPI 3.0 specification from API models and business logic.
"""

import json
import yaml
from datetime import datetime
from typing import Dict, List, Any

def generate_openapi_spec(title: str, version: str, base_path: str = "/api/v1") -> Dict[str, Any]:
    """
    Generate a basic OpenAPI 3.0 specification structure.
    """
    return {
        "openapi": "3.0.3",
        "info": {
            "title": title,
            "version": version,
            "description": f"API specification for {title}",
            "contact": {
                "name": "API Team",
                "email": "api@example.com"
            }
        },
        "servers": [
            {
                "url": base_path,
                "description": "Production server"
            }
        ],
        "paths": {},
        "components": {
            "schemas": {},
            "responses": {},
            "parameters": {},
            "securitySchemes": {}
        }
    }

def add_schema(spec: Dict[str, Any], name: str, schema: Dict[str, Any]) -> None:
    """
    Add a schema component to the OpenAPI spec.
    """
    spec["components"]["schemas"][name] = schema

def add_path(spec: Dict[str, Any], path: str, method: str, operation: Dict[str, Any]) -> None:
    """
    Add a path operation to the OpenAPI spec.
    """
    if path not in spec["paths"]:
        spec["paths"][path] = {}
    spec["paths"][path][method.lower()] = operation

def create_user_schema() -> Dict[str, Any]:
    """Create a standard User schema."""
    return {
        "type": "object",
        "required": ["id", "email", "createdAt"],
        "properties": {
            "id": {
                "type": "string",
                "format": "uuid",
                "description": "Unique identifier for the user"
            },
            "email": {
                "type": "string",
                "format": "email",
                "description": "User's email address"
            },
            "firstName": {
                "type": "string",
                "description": "User's first name"
            },
            "lastName": {
                "type": "string",
                "description": "User's last name"
            },
            "createdAt": {
                "type": "string",
                "format": "date-time",
                "description": "Timestamp when user was created"
            },
            "updatedAt": {
                "type": "string",
                "format": "date-time",
                "description": "Timestamp when user was last updated"
            }
        }
    }

def create_error_response() -> Dict[str, Any]:
    """Create standard error response schema."""
    return {
        "type": "object",
        "properties": {
            "error": {
                "type": "object",
                "properties": {
                    "code": {"type": "string"},
                    "message": {"type": "string"},
                    "details": {"type": "array", "items": {"type": "string"}}
                }
            },
            "timestamp": {
                "type": "string",
                "format": "date-time"
            }
        }
    }

def generate_user_endpoints() -> List[Dict[str, Any]]:
    """Generate common user management endpoints."""
    return [
        {
            "path": "/users",
            "method": "get",
            "operation": {
                "summary": "List all users",
                "tags": ["users"],
                "parameters": [
                    {
                        "name": "page",
                        "in": "query",
                        "schema": {"type": "integer", "default": 1},
                        "description": "Page number for pagination"
                    },
                    {
                        "name": "limit",
                        "in": "query",
                        "schema": {"type": "integer", "default": 20},
                        "description": "Number of items per page"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "List of users",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "data": {
                                            "type": "array",
                                            "items": {"$ref": "#/components/schemas/User"}
                                        },
                                        "pagination": {
                                            "type": "object",
                                            "properties": {
                                                "page": {"type": "integer"},
                                                "limit": {"type": "integer"},
                                                "total": {"type": "integer"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        {
            "path": "/users/{id}",
            "method": "get",
            "operation": {
                "summary": "Get user by ID",
                "tags": ["users"],
                "parameters": [
                    {
                        "name": "id",
                        "in": "path",
                        "required": True,
                        "schema": {"type": "string", "format": "uuid"}
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User details",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "data": {"$ref": "#/components/schemas/User"}
                                    }
                                }
                            }
                        }
                    },
                    "404": {
                        "description": "User not found",
                        "content": {
                            "application/json": {
                                "schema": {"$ref": "#/components/schemas/ErrorResponse"}
                            }
                        }
                    }
                }
            }
        }
    ]

def main():
    """Generate a sample OpenAPI specification."""
    spec = generate_openapi_spec("Example API", "1.0.0")

    # Add schemas
    add_schema(spec, "User", create_user_schema())
    add_schema(spec, "ErrorResponse", create_error_response())

    # Add endpoints
    for endpoint in generate_user_endpoints():
        add_path(spec, endpoint["path"], endpoint["method"], endpoint["operation"])

    # Output the specification
    print(yaml.dump(spec, default_flow_style=False, sort_keys=False))

if __name__ == "__main__":
    main()