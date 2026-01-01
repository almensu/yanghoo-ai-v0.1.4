# Auto-generated Pydantic models for API
# Generated on: 2025-12-19T16:55:42.197790


from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List, Dict, Any, Generic, TypeVar
from enum import Enum
import uuid

T = TypeVar('T')

class BaseSchema(BaseModel):
    """Base schema with common fields."""

    class Config:
        from_attributes = True
        validate_assignment = True
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            uuid.UUID: lambda v: str(v)
        }

class TimestampMixin(BaseSchema):
    """Mixin for timestamp fields."""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    @validator('updated_at', pre=True, always=True)
    def set_updated_at(cls, v, values):
        return v or datetime.utcnow()

class IdMixin(BaseSchema):
    """Mixin for ID field."""
    id: uuid.UUID = Field(default_factory=uuid.UUID)

# Response Models
class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""
    data: T
    error: Optional['APIError'] = None
    meta: 'ResponseMeta'

class APIError(BaseModel):
    """API error details."""
    code: str
    message: str
    details: Optional[List[str]] = None

class ResponseMeta(BaseModel):
    """Response metadata."""
    timestamp: datetime
    version: str = "1.0.0"
    request_id: Optional[uuid.UUID] = None

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""
    data: List[T]
    pagination: 'PaginationInfo'

class PaginationInfo(BaseModel):
    """Pagination details."""
    page: int = Field(ge=1)
    limit: int = Field(ge=1, le=100)
    total: int = Field(ge=0)
    has_next: bool
    has_prev: bool
    pages: int = Field(ge=0)

# Query Parameters
class QueryParams(BaseSchema):
    """Base query parameters."""
    page: int = Field(1, ge=1, description="Page number")
    limit: int = Field(20, ge=1, le=100, description="Items per page")
    sort_by: Optional[str] = Field(None, description="Sort field")
    sort_order: Optional[str] = Field("asc", regex="^(asc|desc)$", description="Sort order")

class SearchParams(QueryParams):
    """Search parameters."""
    search: Optional[str] = Field(None, min_length=1, max_length=100, description="Search term")

class DateRangeParams(BaseSchema):
    """Date range parameters."""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

    @validator('end_date')
    def validate_date_range(cls, v, values):
        if v and 'start_date' in values and values['start_date']:
            if v <= values['start_date']:
                raise ValueError('end_date must be after start_date')
        return v



# User Models

class UserRole(str, Enum):
    """User role enumeration."""
    ADMIN = "admin"
    USER = "user"
    MODERATOR = "moderator"
    GUEST = "guest"

class UserStatus(str, Enum):
    """User status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class UserBase(BaseSchema):
    """Base user model."""
    email: EmailStr = Field(..., description="User email address")
    first_name: Optional[str] = Field(None, max_length=50, description="First name")
    last_name: Optional[str] = Field(None, max_length=50, description="Last name")

class UserCreate(UserBase):
    """User creation model."""
    password: str = Field(..., min_length=8, max_length=128, description="Password")
    role: UserRole = Field(UserRole.USER, description="User role")

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class UserUpdate(BaseSchema):
    """User update model."""
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None

class UserInDB(IdMixin, UserBase, TimestampMixin):
    """User model as stored in database."""
    role: UserRole
    status: UserStatus = UserStatus.ACTIVE
    avatar_url: Optional[str] = None
    last_login_at: Optional[datetime] = None
    is_email_verified: bool = False
    email_verification_token: Optional[str] = None
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None

class User(UserInDB):
    """User model for API responses."""
    pass

class UserProfile(BaseSchema):
    """User profile information."""
    user_id: uuid.UUID
    bio: Optional[str] = Field(None, max_length=500)
    website: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=100)
    timezone: str = Field("UTC", max_length=50)
    language: str = Field("en", max_length=10, regex="^[a-z]{2}(-[A-Z]{2})?$")

class SocialLinks(BaseSchema):
    """Social media links."""
    twitter: Optional[str] = Field(None, max_length=50)
    linkedin: Optional[str] = Field(None, max_length=100)
    github: Optional[str] = Field(None, max_length=50)
    instagram: Optional[str] = Field(None, max_length=50)

    @validator('*')
    def validate_username(cls, v):
        if v and not v.startswith('@'):
            v = f'@{v}'
        return v

class UserPreferences(BaseSchema):
    """User preferences."""
    theme: str = Field("light", regex="^(light|dark|auto)$")
    language: str = Field("en", max_length=10)
    timezone: str = Field("UTC", max_length=50)
    email_notifications: bool = True
    push_notifications: bool = False
    marketing_emails: bool = False

# Authentication Models

class LoginRequest(BaseSchema):
    """Login request model."""
    email: EmailStr = Field(..., description="Email address")
    password: str = Field(..., description="Password")
    remember_me: bool = Field(False, description="Remember me option")

class LoginResponse(BaseSchema):
    """Login response model."""
    user: User
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")

class RefreshTokenRequest(BaseSchema):
    """Refresh token request model."""
    refresh_token: str = Field(..., description="Refresh token")

class RegisterRequest(UserCreate):
    """User registration request model."""
    confirm_password: str = Field(..., description="Password confirmation")

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class PasswordResetRequest(BaseSchema):
    """Password reset request model."""
    email: EmailStr = Field(..., description="Email address")

class PasswordResetConfirm(BaseSchema):
    """Password reset confirmation model."""
    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8, description="New password")

    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v

class ChangePasswordRequest(BaseSchema):
    """Change password request model."""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")

    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        return v


