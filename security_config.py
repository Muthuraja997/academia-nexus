"""
Security utilities for Academia Nexus
Handles environment variable loading and API key management
"""

import os
from dotenv import load_dotenv
from typing import Optional
import logging

# Setup logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class SecurityConfig:
    """Centralized security configuration management"""
    
    @staticmethod
    def get_gemini_api_key() -> Optional[str]:
        """
        Get Gemini API key from environment variables
        Returns None if not found or invalid
        """
        api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            return None
            
        if api_key == 'your_gemini_api_key_here':
            logger.warning("GEMINI_API_KEY is still set to placeholder value")
            return None
            
        if len(api_key) < 30:  # Gemini API keys are typically longer
            logger.warning("GEMINI_API_KEY appears to be invalid (too short)")
            return None
            
        logger.info("Gemini API key loaded successfully")
        return api_key
    
    @staticmethod
    def get_database_url() -> Optional[str]:
        """Get database URL from environment variables"""
        return os.getenv('DATABASE_URL')
    
    @staticmethod
    def get_jwt_secret() -> Optional[str]:
        """Get JWT secret from environment variables"""
        secret = os.getenv('JWT_SECRET')
        if not secret:
            logger.warning("JWT_SECRET not found in environment variables")
        return secret
    
    @staticmethod
    def get_api_port() -> int:
        """Get API server port from environment variables"""
        return int(os.getenv('API_PORT', 8080))
    
    @staticmethod
    def get_server_port() -> int:
        """Get server port from environment variables"""
        return int(os.getenv('SERVER_PORT', 8081))
    
    @staticmethod
    def is_development() -> bool:
        """Check if running in development mode"""
        return os.getenv('NODE_ENV', 'development').lower() == 'development'
    
    @staticmethod
    def get_log_level() -> str:
        """Get logging level from environment variables"""
        return os.getenv('LOG_LEVEL', 'INFO').upper()
    
    @staticmethod
    def validate_required_env_vars() -> dict:
        """
        Validate that all required environment variables are set
        Returns a dict with validation results
        """
        results = {
            'valid': True,
            'missing': [],
            'warnings': []
        }
        
        # Check required variables
        required_vars = ['GEMINI_API_KEY']
        
        for var in required_vars:
            if not os.getenv(var):
                results['missing'].append(var)
                results['valid'] = False
        
        # Check for placeholder values
        gemini_key = os.getenv('GEMINI_API_KEY')
        if gemini_key == 'your_gemini_api_key_here':
            results['warnings'].append('GEMINI_API_KEY is set to placeholder value')
        
        return results
    
    @staticmethod
    def print_env_status():
        """Print environment variable status for debugging"""
        validation = SecurityConfig.validate_required_env_vars()
        
        print("🔐 Environment Configuration Status:")
        print(f"   Development Mode: {SecurityConfig.is_development()}")
        print(f"   Log Level: {SecurityConfig.get_log_level()}")
        print(f"   API Port: {SecurityConfig.get_api_port()}")
        print(f"   Server Port: {SecurityConfig.get_server_port()}")
        
        if validation['valid']:
            print("   ✅ All required environment variables are set")
        else:
            print("   ❌ Missing required environment variables:")
            for var in validation['missing']:
                print(f"      - {var}")
        
        if validation['warnings']:
            print("   ⚠️  Warnings:")
            for warning in validation['warnings']:
                print(f"      - {warning}")

# Export commonly used functions
get_gemini_api_key = SecurityConfig.get_gemini_api_key
validate_env = SecurityConfig.validate_required_env_vars
print_env_status = SecurityConfig.print_env_status
