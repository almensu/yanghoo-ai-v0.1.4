/**
 * Application configuration constants
 * Centralized configuration for API endpoints and settings
 */

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';
export const WS_BASE_URL = process.env.REACT_APP_WS_BASE_URL || 'ws://127.0.0.1:8000';

// Request Configuration
export const REQUEST_TIMEOUT = 30000;

// WebSocket Configuration
export const WS_HEARTBEAT_MS = 30000;
export const WS_RETRY_BACKOFF = [1000, 2000, 5000, 10000];

// UI Configuration
export const SIDEBAR_STORAGE_KEY = 'sidebarExpanded';

// Theme Configuration
export const DEFAULT_THEME = 'cupcake';
