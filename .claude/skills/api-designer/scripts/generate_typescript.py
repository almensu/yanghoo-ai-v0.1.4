#!/usr/bin/env python3
"""
Generate TypeScript interfaces and types from API schemas.
"""

import json
from typing import Dict, List, Any, Optional

class TypeScriptGenerator:
    """Generate TypeScript types from schemas."""

    def __init__(self):
        self.generated_types = set()
        self.imports = set()

    def generate_interface(self, name: str, schema: Dict[str, Any]) -> str:
        """Generate a TypeScript interface from a schema."""
        if name in self.generated_types:
            return ""

        self.generated_types.add(name)

        required_fields = schema.get("required", [])
        properties = schema.get("properties", {})

        interface_lines = [f"export interface {name} {{"]

        for field_name, field_schema in properties.items():
            field_type = self._get_typescript_type(field_schema)
            is_required = field_name in required_fields
            optional_marker = "" if is_required else "?"

            # Add comment if description exists
            if "description" in field_schema:
                interface_lines.append(f"  /** {field_schema['description']} */")

            interface_lines.append(f"  {field_name}{optional_marker}: {field_type};")

        interface_lines.append("}")

        return "\n".join(interface_lines)

    def _get_typescript_type(self, schema: Dict[str, Any]) -> str:
        """Convert JSON schema type to TypeScript type."""
        schema_type = schema.get("type", "any")

        if schema_type == "string":
            format_type = schema.get("format")
            if format_type == "date-time":
                return "Date"
            elif format_type == "email":
                return "string"
            elif format_type == "uuid":
                return "string"
            return "string"

        elif schema_type == "integer":
            return "number"

        elif schema_type == "number":
            return "number"

        elif schema_type == "boolean":
            return "boolean"

        elif schema_type == "array":
            items_schema = schema.get("items", {})
            item_type = self._get_typescript_type(items_schema)
            return f"{item_type}[]"

        elif schema_type == "object":
            if "properties" in schema:
                # Generate nested interface
                nested_name = f"Nested{len(self.generated_types)}"
                return nested_name
            elif "additionalProperties" in schema:
                additional_props = schema["additionalProperties"]
                value_type = self._get_typescript_type(additional_props)
                return f"Record<string, {value_type}>"

        return "any"

def create_common_types() -> str:
    """Generate common TypeScript types for API usage."""
    return '''
// Common API Types
export interface ApiResponse<T> {
  data: T;
  error: null | ApiError;
  meta: {
    timestamp: Date;
    version: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SortOptions {
  field: string;
  order: "asc" | "desc";
}

export interface FilterOptions {
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
}

// HTTP Configuration
export interface HttpConfig {
  timeout?: number;
  retries?: number;
  baseURL?: string;
  headers?: Record<string, string>;
}

// Request/Response Types
export interface CreateRequest<T> {
  data: Partial<T>;
}

export interface UpdateRequest<T> {
  data: Partial<T>;
}

export interface DeleteResponse {
  success: boolean;
  deletedId: string;
}
'''

def generate_user_types() -> str:
    """Generate user-related TypeScript types."""
    return '''
// User Management Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
  GUEST = "guest"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending"
}

export interface CreateUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  status?: UserStatus;
  role?: UserRole;
}

export interface UserProfile {
  userId: string;
  bio?: string;
  website?: string;
  location?: string;
  socialLinks?: SocialLinks;
  preferences: UserPreferences;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}
'''

def generate_api_client() -> str:
    """Generate a base API client class."""
    return '''
// API Client Base Class
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: HttpConfig = {}) {
    this.baseURL = config.baseURL || '/api/v1';
    this.defaultHeaders = config.headers || {};
    this.timeout = config.timeout || 10000;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        data: data.data || data,
        error: null,
        meta: {
          timestamp: new Date(),
          version: '1.0.0',
        },
      };
    } catch (error) {
      return {
        data: null as any,
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: [],
        },
        meta: {
          timestamp: new Date(),
          version: '1.0.0',
        },
      };
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Usage Example:
const apiClient = new ApiClient({
  baseURL: 'https://api.example.com/v1',
  headers: {
    'Authorization': 'Bearer your-token-here',
  },
});

// Example API calls:
const usersResponse = await apiClient.get<User[]>('/users', { page: 1, limit: 20 });
const userResponse = await apiClient.get<User>('/users/123');
const newUserResponse = await apiClient.post<User>('/users', { email: 'user@example.com' });
'''

def main():
    """Generate a complete TypeScript API client file."""
    typescript_code = f'''\
// Auto-generated TypeScript API types and client
// Generated on: {__import__('datetime').datetime.now().isoformat()}

{create_common_types()}

{generate_user_types()}

{generate_api_client()}
'''

    print(typescript_code)

if __name__ == "__main__":
    main()