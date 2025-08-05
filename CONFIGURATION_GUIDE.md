# Configuration Management

This document explains the dynamic configuration system implemented to replace hardcoded values throughout the Academia Nexus application.

## Overview

The application now uses a centralized configuration system that supports:
- Environment-based configuration
- Feature flags
- Dynamic API endpoints
- Configurable database limits
- Development/production settings

## Configuration Files

### `/src/config/index.js`
Main configuration file that exports all configuration objects:
- `SERVER_CONFIG`: API base URLs and server endpoints
- `DB_CONFIG`: Database query limits and pagination
- `APP_CONFIG`: Application features and UI settings
- `STUDY_CONFIG`: Study-specific configuration
- `DEV_CONFIG`: Development and testing settings
- `LAYOUT_CONFIG`: UI layout and grid configurations
- `STYLE_CONFIG`: Styling constants and themes
- `API_ENDPOINTS`: Centralized API endpoint definitions

### `/src/config/configManager.js`
Configuration utility class that provides:
- Environment validation
- Helper methods for accessing configuration
- Feature flag checking
- URL building utilities

### Environment Files

#### `.env.local` (Active Development)
Contains your current development configuration with database credentials.

#### `.env.development` (Template)
Template for development environment variables.

## Usage Examples

### In React Components

```javascript
import configManager from '@/config/configManager';
import { SERVER_CONFIG, API_ENDPOINTS } from '@/config';

// Using configuration manager
const apiUrl = configManager.getApiUrl('study', '/health');
const isAnalyticsEnabled = configManager.isFeatureEnabled('analytics');

// Direct config usage
const response = await fetch(`${SERVER_CONFIG.STUDY_API_BASE_URL}${API_ENDPOINTS.STUDY_HEALTH}`);
```

### In Database Layer

```javascript
// database/db.js
const DB_CONFIG = {
    DEFAULT_LIMIT: parseInt(process.env.DB_DEFAULT_LIMIT) || 20,
    MAX_LIMIT: parseInt(process.env.DB_MAX_LIMIT) || 100,
    PAGE_SIZE: parseInt(process.env.DB_PAGE_SIZE) || 10,
};

async getUserActivities(userId, limit = DB_CONFIG.DEFAULT_LIMIT) {
    // Method implementation
}
```

### In Test Files

```javascript
// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Use configurable test user
const userId = parseInt(process.env.TEST_USER_ID) || 8;
```

## Environment Variables

### Required for Production
```bash
# API Configuration
NEXT_PUBLIC_MCP_API_BASE_URL=https://your-mcp-api.com
NEXT_PUBLIC_STUDY_API_BASE_URL=https://your-study-api.com
NEXT_PUBLIC_INTERVIEW_API_BASE_URL=https://your-interview-api.com

# Database
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
```

### Optional Configuration
```bash
# Database Limits
DB_DEFAULT_LIMIT=20
DB_MAX_LIMIT=100
DB_PAGE_SIZE=10

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_STUDY_AI=true
NEXT_PUBLIC_ENABLE_INTERVIEW_PREP=true
NEXT_PUBLIC_ENABLE_SCHOLARSHIPS=true

# UI Configuration
NEXT_PUBLIC_DASHBOARD_REFRESH_INTERVAL=30000
NEXT_PUBLIC_NOTIFICATION_TIMEOUT=5000

# Development Testing
USE_TEST_USER=false
TEST_USER_ID=8
TEST_USER_EMAIL=test@example.com
```

## Benefits

### ✅ Removed Hardcoded Values
- API URLs (localhost:8080, localhost:8081, localhost:8082)
- Database query limits (10, 20, 50)
- Test user IDs (userId = 8)
- Port numbers and service endpoints

### ✅ Environment Flexibility
- Easy deployment to different environments
- Configurable API endpoints for development/staging/production
- Feature flags for enabling/disabling functionality

### ✅ Maintainability
- Centralized configuration management
- Type-safe configuration access
- Environment validation and warnings

### ✅ Development Experience
- Consistent configuration across all components
- Easy testing with configurable test users
- Clear separation of concerns

## Migration Summary

### Files Updated
1. **Frontend Components**:
   - `src/app/study/page.js` - Updated API calls to use SERVER_CONFIG
   - `src/app/interview-prep/page.js` - Updated all hardcoded URLs
   - `src/hooks/useDashboardAnalytics.js` - Updated analytics API endpoint

2. **Database Layer**:
   - `database/db.js` - Updated all query limits to use DB_CONFIG

3. **Test Files**:
   - `test_user_with_data.js` - Updated to use configurable user ID
   - `final_database_test.js` - Updated to use configurable user ID
   - `test_user_data.js` - Updated to use configurable user ID

4. **Configuration**:
   - Created centralized configuration system
   - Updated `.env.local` with all required variables

### Before vs After

**Before (Hardcoded):**
```javascript
const response = await fetch('http://localhost:8081/mcp/tools/call');
const userId = 8;
const limit = 20;
```

**After (Dynamic):**
```javascript
const response = await fetch(`${SERVER_CONFIG.STUDY_API_BASE_URL}${API_ENDPOINTS.STUDY_MCP_CALL}`);
const userId = parseInt(process.env.TEST_USER_ID) || 8;
const limit = DB_CONFIG.DEFAULT_LIMIT;
```

## Next Steps

1. **Production Setup**: Configure production environment variables
2. **CI/CD Integration**: Add environment-specific configuration files
3. **Monitoring**: Add configuration validation in production
4. **Documentation**: Update deployment guides with environment setup

The application is now fully dynamic and ready for deployment across different environments without code changes!
