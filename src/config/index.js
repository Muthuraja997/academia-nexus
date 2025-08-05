/**
 * Configuration constants for the Academia Nexus application
 * Centralizes all environment-dependent and configurable values
 */

// Server Configuration
export const SERVER_CONFIG = {
  // Frontend
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  
  // Backend APIs
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  MCP_API_BASE_URL: process.env.NEXT_PUBLIC_MCP_API_BASE_URL || 'http://localhost:8082',
  STUDY_API_BASE_URL: process.env.NEXT_PUBLIC_STUDY_API_BASE_URL || 'http://localhost:8081',
  INTERVIEW_API_BASE_URL: process.env.NEXT_PUBLIC_INTERVIEW_API_BASE_URL || 'http://localhost:8080',
  
  // Analytics API
  ANALYTICS_API_BASE: process.env.NEXT_PUBLIC_ANALYTICS_API_BASE || 'http://localhost:8082/api/dashboard',
};

// Database Configuration
export const DB_CONFIG = {
  DEFAULT_LIMIT: parseInt(process.env.DB_DEFAULT_LIMIT) || 20,
  MAX_LIMIT: parseInt(process.env.DB_MAX_LIMIT) || 100,
  PAGE_SIZE: parseInt(process.env.DB_PAGE_SIZE) || 10,
};

// Application Configuration
export const APP_CONFIG = {
  // Authentication
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT) || 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  
  // Features
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
  ENABLE_STUDY_AI: process.env.NEXT_PUBLIC_ENABLE_STUDY_AI !== 'false',
  ENABLE_INTERVIEW_PREP: process.env.NEXT_PUBLIC_ENABLE_INTERVIEW_PREP !== 'false',
  ENABLE_SCHOLARSHIPS: process.env.NEXT_PUBLIC_ENABLE_SCHOLARSHIPS !== 'false',
  
  // UI Configuration
  DASHBOARD_REFRESH_INTERVAL: parseInt(process.env.NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL) || 30000, // 30 seconds
  NOTIFICATION_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_NOTIFICATION_TIMEOUT) || 5000, // 5 seconds
  
  // Pagination
  DEFAULT_PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE) || 10,
  MAX_PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_MAX_PAGE_SIZE) || 50,
};

// Study Configuration
export const STUDY_CONFIG = {
  DEFAULT_CONFIDENCE_THRESHOLD: parseFloat(process.env.NEXT_PUBLIC_CONFIDENCE_THRESHOLD) || 0.8,
  MIN_CONFIDENCE_THRESHOLD: parseFloat(process.env.NEXT_PUBLIC_MIN_CONFIDENCE_THRESHOLD) || 0.6,
  DEFAULT_DIFFICULTY: process.env.NEXT_PUBLIC_DEFAULT_DIFFICULTY || 'medium',
  AVAILABLE_DIFFICULTIES: ['easy', 'medium', 'hard', 'expert'],
};

// Test User Configuration (for development)
export const DEV_CONFIG = {
  USE_TEST_USER: process.env.NODE_ENV === 'development' && process.env.USE_TEST_USER === 'true',
  TEST_USER_ID: parseInt(process.env.TEST_USER_ID) || 8,
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'muthuraja05980@gmail.com',
};

// Grid Layout Configuration
export const LAYOUT_CONFIG = {
  GRID_BREAKPOINTS: {
    SM: 'grid-cols-1',
    MD: 'grid-cols-2',
    LG: 'grid-cols-3',
    XL: 'grid-cols-4',
  },
  
  // Dashboard specific layouts
  DASHBOARD_STATS_GRID: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  DASHBOARD_MAIN_GRID: 'grid-cols-1 md:grid-cols-3',
  SCHOLARSHIPS_GRID: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
};

// Styling Constants
export const STYLE_CONFIG = {
  COLORS: {
    PRIMARY: 'blue',
    SECONDARY: 'gray',
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red',
  },
  
  OPACITY: {
    BACKDROP: '80',
    HOVER: '70',
    DISABLED: '50',
  },
  
  BORDER_RADIUS: {
    SM: 'rounded',
    MD: 'rounded-lg',
    LG: 'rounded-xl',
    FULL: 'rounded-full',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  
  // User
  USER_DASHBOARD: '/api/user/dashboard',
  USER_ACTIVITY: '/api/user/activity',
  USER_PROFILE: '/api/user/profile',
  
  // Study
  STUDY_HEALTH: '/health',
  STUDY_MCP_CALL: '/mcp/tools/call',
  
  // Analytics
  ANALYTICS_INSIGHTS: '/insights',
  ANALYTICS_TRENDS: '/trends',
  ANALYTICS_RECOMMENDATIONS: '/recommendations',
};

export default {
  SERVER_CONFIG,
  DB_CONFIG,
  APP_CONFIG,
  STUDY_CONFIG,
  DEV_CONFIG,
  LAYOUT_CONFIG,
  STYLE_CONFIG,
  API_ENDPOINTS,
};
