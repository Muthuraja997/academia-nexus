"""
Configuration module for Academia Nexus Study Server
Loads environment variables from .env file and provides configuration access
"""

import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for the study server"""
    
    # Gemini AI Configuration
    GEMINI_API_KEY: Optional[str] = os.getenv('GEMINI_API_KEY')
    
    # Server Configuration
    SERVER_HOST: str = os.getenv('SERVER_HOST', '0.0.0.0')
    SERVER_PORT: int = int(os.getenv('SERVER_PORT', 8081))
    
    # Study Server Settings
    FALLBACK_ENABLED: bool = os.getenv('FALLBACK_ENABLED', 'true').lower() == 'true'
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')
    
    @classmethod
    def is_gemini_configured(cls) -> bool:
        """Check if Gemini API key is properly configured"""
        return (
            cls.GEMINI_API_KEY is not None and 
            cls.GEMINI_API_KEY != '' and 
            cls.GEMINI_API_KEY != 'your_gemini_api_key_here'
        )
    
    @classmethod
    def get_gemini_status(cls) -> str:
        """Get human-readable Gemini AI status"""
        if cls.is_gemini_configured():
            key = cls.GEMINI_API_KEY or ""
            masked_key = f"{key[:8]}...{key[-4:]}" if len(key) > 12 else "****"
            return f"✅ Enabled (Key: {masked_key})"
        else:
            return "❌ Disabled (set GEMINI_API_KEY in .env file)"
    
    @classmethod
    def validate_config(cls) -> dict:
        """Validate configuration and return status"""
        return {
            "gemini_configured": cls.is_gemini_configured(),
            "gemini_status": cls.get_gemini_status(),
            "server_host": cls.SERVER_HOST,
            "server_port": cls.SERVER_PORT,
            "fallback_enabled": cls.FALLBACK_ENABLED,
            "log_level": cls.LOG_LEVEL
        }

# Create a global config instance
config = Config()

# Export commonly used values
GEMINI_API_KEY = config.GEMINI_API_KEY
SERVER_HOST = config.SERVER_HOST
SERVER_PORT = config.SERVER_PORT
FALLBACK_ENABLED = config.FALLBACK_ENABLED
LOG_LEVEL = config.LOG_LEVEL

# Functions for external use
def is_gemini_enabled() -> bool:
    """Check if Gemini AI is enabled and configured"""
    return config.is_gemini_configured()

def get_gemini_api_key() -> Optional[str]:
    """Get the Gemini API key"""
    return config.GEMINI_API_KEY

def get_server_config() -> dict:
    """Get server configuration"""
    return {
        "host": config.SERVER_HOST,
        "port": config.SERVER_PORT,
        "gemini_enabled": config.is_gemini_configured(),
        "fallback_enabled": config.FALLBACK_ENABLED,
        "log_level": config.LOG_LEVEL
    }

def print_config_status():
    """Print current configuration status"""
    print("📋 Academia Nexus Configuration Status")
    print("=" * 45)
    print(f"Gemini AI: {config.get_gemini_status()}")
    print(f"Server: {config.SERVER_HOST}:{config.SERVER_PORT}")
    print(f"Fallback: {'✅ Enabled' if config.FALLBACK_ENABLED else '❌ Disabled'}")
    print(f"Log Level: {config.LOG_LEVEL}")
    print("=" * 45)

if __name__ == "__main__":
    # Print configuration when run directly
    print_config_status()
    
    # Validate configuration
    validation = config.validate_config()
    print(f"\nConfiguration validation: {validation}")
