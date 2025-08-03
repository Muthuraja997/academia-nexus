#!/usr/bin/env python3
"""
Environment Configuration Test Script
Tests that all environment variables are properly loaded
"""

import sys
import os
from security_config import SecurityConfig, print_env_status

def main():
    """Test environment configuration"""
    print("🧪 Academia Nexus - Environment Configuration Test")
    print("=" * 60)
    
    # Print current environment status
    print_env_status()
    
    print("\n📋 Detailed Configuration Check:")
    
    # Test Gemini API Key
    gemini_key = SecurityConfig.get_gemini_api_key()
    if gemini_key:
        print(f"   ✅ Gemini API Key: Found ({len(gemini_key)} characters)")
    else:
        print("   ❌ Gemini API Key: Not found or invalid")
    
    # Test other configurations
    print(f"   📊 Database URL: {'✅ Set' if SecurityConfig.get_database_url() else '⚠️  Not set'}")
    print(f"   🔐 JWT Secret: {'✅ Set' if SecurityConfig.get_jwt_secret() else '⚠️  Not set'}")
    print(f"   🌍 Environment: {'Development' if SecurityConfig.is_development() else 'Production'}")
    
    # Validation results
    validation = SecurityConfig.validate_required_env_vars()
    
    print(f"\n🎯 Overall Status: {'✅ VALID' if validation['valid'] else '❌ INVALID'}")
    
    if not validation['valid']:
        print("\n📝 To fix issues:")
        print("   1. Copy .env.example to .env")
        print("   2. Add your actual API keys to .env")
        print("   3. Restart the servers")
        return 1
    
    print("\n🚀 Environment is properly configured!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
