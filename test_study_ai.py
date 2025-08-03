"""
Test script to verify the Gemini AI integration in the study server
"""
import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Test the study server
SERVER_URL = "http://localhost:8081"

def test_server_status():
    """Test if server is running"""
    try:
        response = requests.get(f"{SERVER_URL}/")
        if response.status_code == 200:
            data = response.json()
            print("✅ Server is running")
            print(f"   AI Enabled: {data.get('ai_enabled', False)}")
            print(f"   Version: {data.get('version', 'Unknown')}")
            return True
        else:
            print(f"❌ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running. Start it with:")
        print("   python study_mcp_http_server.py --port 8081")
        return False
    except Exception as e:
        print(f"❌ Error connecting to server: {e}")
        return False

def test_study_endpoint():
    """Test the study endpoint with a simple topic"""
    try:
        # Test with a basic topic
        topic = "machine learning"
        response = requests.get(f"{SERVER_URL}/study/{topic}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Study endpoint working for topic: {topic}")
            print(f"   AI Generated: {data.get('ai_generated', False)}")
            print(f"   Source: {data.get('source', 'Unknown')}")
            print(f"   Confidence: {data.get('confidence', 0)}")
            print(f"   Definition: {data.get('definition', 'N/A')[:100]}...")
            return True
        else:
            print(f"❌ Study endpoint failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing study endpoint: {e}")
        return False

def check_gemini_api_key():
    """Check if Gemini API key is configured"""
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        print("✅ GEMINI_API_KEY is configured")
        print(f"   Key starts with: {api_key[:10]}...")
        return True
    else:
        print("❌ GEMINI_API_KEY not found")
        print("   To enable full AI functionality:")
        print("   1. Get API key from: https://aistudio.google.com/app/apikey")
        print("   2. Set environment variable: set GEMINI_API_KEY=your_key_here")
        print("   3. Restart the server")
        return False

def main():
    """Run all tests"""
    print("🔍 Testing Study Server with Gemini AI Integration\n")
    
    print("1. Checking Gemini API Key...")
    has_api_key = check_gemini_api_key()
    print()
    
    print("2. Testing Server Status...")
    server_running = test_server_status()
    print()
    
    if server_running:
        print("3. Testing Study Endpoint...")
        endpoint_working = test_study_endpoint()
        print()
        
        if endpoint_working:
            if has_api_key:
                print("🎉 All systems working! AI-powered study responses available.")
            else:
                print("⚠️  Server working with fallback knowledge base. Set GEMINI_API_KEY for AI responses.")
        else:
            print("❌ Study endpoint not working properly.")
    else:
        print("❌ Cannot test endpoints - server not running.")
    
    print("\n" + "="*60)
    print("Next steps:")
    print("1. Make sure the server is running: python study_mcp_http_server.py --port 8081")
    print("2. Set GEMINI_API_KEY for full AI functionality")
    print("3. Test the study page in your React app")

if __name__ == "__main__":
    main()
