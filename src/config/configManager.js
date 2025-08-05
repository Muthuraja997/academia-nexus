/**
 * Configuration Utility for Academia Nexus
 * Provides centralized access to all configuration values with validation
 */

// Import the main configuration
import config from './index.js';

class ConfigManager {
    constructor() {
        this.config = config;
        this.validateEnvironment();
    }

    /**
     * Validate that required environment variables are set
     */
    validateEnvironment() {
        const requiredVars = [
            'NEXT_PUBLIC_MCP_API_BASE_URL',
            'NEXT_PUBLIC_STUDY_API_BASE_URL',
        ];

        const missing = requiredVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            console.warn('⚠️ Missing environment variables:', missing.join(', '));
            console.warn('Using default values. For production, set these in .env.local');
        }
    }

    /**
     * Get API URL with endpoint
     * @param {string} service - Service name (mcp, study, interview, analytics)
     * @param {string} endpoint - API endpoint
     * @returns {string} Full URL
     */
    getApiUrl(service, endpoint = '') {
        const baseUrls = {
            mcp: this.config.SERVER_CONFIG.MCP_API_BASE_URL,
            study: this.config.SERVER_CONFIG.STUDY_API_BASE_URL,
            interview: this.config.SERVER_CONFIG.INTERVIEW_API_BASE_URL,
            analytics: this.config.SERVER_CONFIG.ANALYTICS_API_BASE,
            api: this.config.SERVER_CONFIG.API_BASE_URL,
        };

        const baseUrl = baseUrls[service];
        if (!baseUrl) {
            throw new Error(`Unknown service: ${service}`);
        }

        return endpoint ? `${baseUrl}${endpoint}` : baseUrl;
    }

    /**
     * Get database configuration
     * @returns {object} Database config
     */
    getDbConfig() {
        return this.config.DB_CONFIG;
    }

    /**
     * Get application configuration
     * @returns {object} App config
     */
    getAppConfig() {
        return this.config.APP_CONFIG;
    }

    /**
     * Get study configuration
     * @returns {object} Study config
     */
    getStudyConfig() {
        return this.config.STUDY_CONFIG;
    }

    /**
     * Get development configuration
     * @returns {object} Dev config
     */
    getDevConfig() {
        return this.config.DEV_CONFIG;
    }

    /**
     * Get layout configuration
     * @returns {object} Layout config
     */
    getLayoutConfig() {
        return this.config.LAYOUT_CONFIG;
    }

    /**
     * Get style configuration
     * @returns {object} Style config
     */
    getStyleConfig() {
        return this.config.STYLE_CONFIG;
    }

    /**
     * Get API endpoints
     * @returns {object} API endpoints
     */
    getApiEndpoints() {
        return this.config.API_ENDPOINTS;
    }

    /**
     * Check if a feature is enabled
     * @param {string} feature - Feature name
     * @returns {boolean} Feature enabled status
     */
    isFeatureEnabled(feature) {
        const features = {
            analytics: this.config.APP_CONFIG.ENABLE_ANALYTICS,
            studyAi: this.config.APP_CONFIG.ENABLE_STUDY_AI,
            interviewPrep: this.config.APP_CONFIG.ENABLE_INTERVIEW_PREP,
            scholarships: this.config.APP_CONFIG.ENABLE_SCHOLARSHIPS,
        };

        return features[feature] || false;
    }

    /**
     * Get test user configuration for development
     * @returns {object} Test user config
     */
    getTestUser() {
        if (!this.config.DEV_CONFIG.USE_TEST_USER) {
            return null;
        }

        return {
            id: this.config.DEV_CONFIG.TEST_USER_ID,
            email: this.config.DEV_CONFIG.TEST_USER_EMAIL,
        };
    }

    /**
     * Get environment-specific settings
     * @returns {object} Environment settings
     */
    getEnvironment() {
        return {
            isDevelopment: process.env.NODE_ENV === 'development',
            isProduction: process.env.NODE_ENV === 'production',
            isTest: process.env.NODE_ENV === 'test',
        };
    }

    /**
     * Get pagination settings
     * @returns {object} Pagination config
     */
    getPaginationConfig() {
        return {
            defaultPageSize: this.config.APP_CONFIG.DEFAULT_PAGE_SIZE,
            maxPageSize: this.config.APP_CONFIG.MAX_PAGE_SIZE,
            dbDefaultLimit: this.config.DB_CONFIG.DEFAULT_LIMIT,
            dbMaxLimit: this.config.DB_CONFIG.MAX_LIMIT,
            dbPageSize: this.config.DB_CONFIG.PAGE_SIZE,
        };
    }

    /**
     * Get timeout configurations
     * @returns {object} Timeout config
     */
    getTimeoutConfig() {
        return {
            dashboardRefresh: this.config.APP_CONFIG.DASHBOARD_REFRESH_INTERVAL,
            notification: this.config.APP_CONFIG.NOTIFICATION_TIMEOUT,
            session: this.config.APP_CONFIG.SESSION_TIMEOUT,
        };
    }
}

// Create singleton instance
const configManager = new ConfigManager();

// Export both the class and the singleton instance
export { ConfigManager };
export default configManager;
