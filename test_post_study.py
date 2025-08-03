"""
Test POST endpoint for the study server
"""
import requests
import json

def test_post_endpoint():
    """Test the POST /study endpoint"""
    url = "http://localhost:8081/study"
    
    # Test data
    payload = {
        "topic": "artificial intelligence",
        "include_examples": True,
        "include_career_info": True
    }
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ POST /study endpoint working!")
            print(f"   Topic: {data.get('topic', 'N/A')}")
            print(f"   AI Generated: {data.get('ai_generated', False)}")
            print(f"   Confidence: {data.get('confidence', 0)}")
            print(f"   Definition: {data.get('definition', 'N/A')[:100]}...")
            
            if data.get('examples'):
                print(f"   Examples: {len(data['examples'])} provided")
            if data.get('careers'):
                print(f"   Careers: {len(data['careers'])} provided")
                
            return True
        else:
            print(f"❌ POST request failed with status {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing POST endpoint: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing POST /study endpoint")
    test_post_endpoint()
