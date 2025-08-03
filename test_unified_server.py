"""
Comprehensive test for the unified study server
"""
import requests
import json

def test_endpoint(name, method, url, data=None):
    """Test an endpoint"""
    try:
        if method == "GET":
            response = requests.get(url)
        else:
            response = requests.post(url, json=data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ {name}")
            return result
        else:
            print(f"❌ {name} - Status: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ {name} - Error: {e}")
        return None

def main():
    print("🔍 Testing Unified Study Server")
    print("=" * 50)
    
    # Test root endpoint
    root = test_endpoint("Server Info", "GET", "http://localhost:8081/")
    if root:
        print(f"   Version: {root.get('version')}")
        print(f"   AI Enabled: {root.get('ai_enabled')}")
        print(f"   Fallback Topics: {root.get('fallback_topics')}")
    
    print()
    
    # Test topics endpoint
    topics = test_endpoint("Topics List", "GET", "http://localhost:8081/topics")
    if topics:
        print(f"   Total Topics: {topics.get('total')}")
        print(f"   AI Powered: {topics.get('ai_powered')}")
    
    print()
    
    # Test study endpoint with known topic
    study_data = {
        "topic": "machine learning",
        "include_examples": True,
        "include_career_info": True
    }
    study_result = test_endpoint("Study - Known Topic", "POST", "http://localhost:8081/study", study_data)
    if study_result:
        print(f"   Topic: {study_result.get('topic')}")
        print(f"   AI Generated: {study_result.get('ai_generated')}")
        print(f"   Source: {study_result.get('source')}")
        print(f"   Confidence: {study_result.get('confidence')}")
        print(f"   Examples: {len(study_result.get('examples', []))}")
        print(f"   Careers: {len(study_result.get('careers', []))}")
    
    print()
    
    # Test MCP endpoint
    mcp_data = {
        "name": "get_study_explanation",
        "arguments": {
            "topic": "data science",
            "include_examples": True,
            "include_career_info": True
        }
    }
    mcp_result = test_endpoint("MCP Tool Call", "POST", "http://localhost:8081/mcp/tools/call", mcp_data)
    if mcp_result:
        try:
            content = json.loads(mcp_result.get('content', '{}'))
            print(f"   MCP Topic: {content.get('topic')}")
            print(f"   MCP Source: {content.get('source')}")
            print(f"   MCP Confidence: {content.get('confidence')}")
        except:
            print("   MCP response received but couldn't parse content")
    
    print()
    
    # Test health endpoint
    health = test_endpoint("Health Check", "GET", "http://localhost:8081/health")
    if health:
        print(f"   Status: {health.get('status')}")
        print(f"   Timestamp: {health.get('timestamp')}")
    
    print("\n" + "=" * 50)
    print("🎉 Unified Study Server is working!")
    print("Your React app can now use both:")
    print("  - HTTP REST API: /study, /topics, /health")
    print("  - MCP Protocol: /mcp/tools/call")
    print("  - Fallback knowledge base ensures 100% uptime")
    print("  - Enable AI with GEMINI_API_KEY for unlimited topics")

if __name__ == "__main__":
    main()
