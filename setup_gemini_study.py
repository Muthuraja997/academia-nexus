#!/usr/bin/env python3
"""
Setup script for Gemini AI Study Server
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def setup_gemini_api():
    """Setup Gemini API key"""
    print("🚀 Gemini AI Study Server Setup")
    print("=" * 40)
    
    current_key = os.getenv('GEMINI_API_KEY')
    if current_key and current_key != 'your_gemini_api_key_here':
        print(f"✅ Gemini API key is already configured")
        print(f"Key: {current_key[:8]}...{current_key[-4:] if len(current_key) > 12 else '****'}")
        return True
    
    print("❌ Gemini API key not found or not configured")
    print("\nTo enable AI-powered study explanations, you need a Gemini API key.")
    print("Get your free API key from: https://aistudio.google.com/app/apikey")
    print("\nOptions:")
    print("1. Update .env file with your API key")
    print("2. Enter key now (will update .env file)")
    print("3. Continue without AI (uses fallback knowledge base)")
    
    choice = input("\nEnter choice (1/2/3): ").strip()
    
    if choice == "2":
        api_key = input("Enter your Gemini API key: ").strip()
        if api_key:
            # Update .env file
            env_path = ".env"
            if os.path.exists(env_path):
                # Read existing .env file
                with open(env_path, 'r') as f:
                    lines = f.readlines()
                
                # Update GEMINI_API_KEY line
                updated = False
                for i, line in enumerate(lines):
                    if line.startswith('GEMINI_API_KEY='):
                        lines[i] = f'GEMINI_API_KEY={api_key}\n'
                        updated = True
                        break
                
                # If not found, add it
                if not updated:
                    lines.append(f'GEMINI_API_KEY={api_key}\n')
                
                # Write back to .env file
                with open(env_path, 'w') as f:
                    f.writelines(lines)
            else:
                # Create new .env file
                with open(env_path, 'w') as f:
                    f.write(f'GEMINI_API_KEY={api_key}\n')
            
            # Set environment variable for current session
            os.environ['GEMINI_API_KEY'] = api_key
            print("✅ API key saved to .env file and set for current session")
            return True
        else:
            print("❌ No key entered")
            return False
    elif choice == "1":
        print("\nUpdate your .env file:")
        print("1. Open .env file in your editor")
        print("2. Replace 'your_gemini_api_key_here' with your actual API key")
        print("3. Save the file and restart this script")
        return False
    else:
        print("📚 Continuing with fallback knowledge base")
        return False

def test_gemini_connection():
    """Test Gemini AI connection"""
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key or api_key == 'your-api-key-here':
            return False
            
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
        
        # Test with a simple query
        response = model.generate_content("What is 2+2? Respond with just the number.")
        
        if response and response.text:
            print(f"✅ Gemini AI connection successful")
            print(f"Test response: {response.text.strip()}")
            return True
        else:
            print("❌ Gemini AI test failed - no response")
            return False
            
    except Exception as e:
        print(f"❌ Gemini AI connection failed: {e}")
        return False

if __name__ == "__main__":
    print("Setting up Unified Study Server with Gemini AI...")
    
    # Setup API key
    if setup_gemini_api():
        # Test connection
        if test_gemini_connection():
            print("\n🎉 Setup complete! Starting unified server with AI enabled...")
            # Start unified server
            os.system("python unified_study_server.py --port 8081")
        else:
            print("\n⚠️  API key configured but connection failed")
            print("Starting unified server anyway (will use fallback if AI fails)")
            os.system("python unified_study_server.py --port 8081")
    else:
        print("\n📚 Starting unified server without AI (using fallback knowledge base)")
        os.system("python unified_study_server.py --port 8081")
