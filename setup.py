#!/usr/bin/env python3
"""
Quick Setup Script for Academia Nexus
Helps users configure their environment quickly
"""

import os
import shutil
import sys
from pathlib import Path

def main():
    """Main setup function"""
    print("🎓 Academia Nexus - Quick Setup")
    print("=" * 40)
    
    # Check if .env exists
    env_file = Path('.env')
    env_example = Path('.env.example')
    
    if not env_example.exists():
        print("❌ .env.example file not found!")
        return 1
    
    if env_file.exists():
        response = input("📁 .env file already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("⏭️  Skipping .env creation")
        else:
            shutil.copy(env_example, env_file)
            print("✅ .env file created from template")
    else:
        shutil.copy(env_example, env_file)
        print("✅ .env file created from template")
    
    print("\n📝 Next Steps:")
    print("   1. Edit .env file and add your actual API keys:")
    print("      - Get Gemini API key: https://aistudio.google.com/app/apikey")
    print("   2. Test configuration: python test_env_config.py")
    print("   3. Install dependencies: pip install -r requirements.txt")
    print("   4. Start servers:")
    print("      - Frontend: npm run dev")
    print("      - Backend: python intelligent_agent.py")
    print("      - MCP Servers: python scholarship_mcp_server.py")
    
    print("\n🔐 Security Reminder:")
    print("   - Never commit .env file to version control")
    print("   - Keep your API keys secure and private")
    print("   - Rotate keys regularly for production use")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
