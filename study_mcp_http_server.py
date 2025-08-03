#!/usr/bin/env python3
"""
HTTP wrapper for Study MCP Server with Gemini AI integration
Provides REST API endpoints for AI-powered study functionality
"""

import asyncio
import json
import logging
import os
from typing import Any, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import google.generativeai as genai
from security_config import get_gemini_api_key

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini AI
GEMINI_API_KEY = get_gemini_api_key()
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    GEMINI_AVAILABLE = True
    logger.info("Gemini AI configured successfully")
else:
    GEMINI_AVAILABLE = False
    logger.warning("GEMINI_API_KEY environment variable not found. Using fallback knowledge base.")

# Import the fallback study server functions
from study_mcp_server import search_knowledge_base, STUDY_KNOWLEDGE_BASE

app = FastAPI(title="Study MCP HTTP Server", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StudyRequest(BaseModel):
    topic: str
    include_examples: bool = True
    include_career_info: bool = True

class MCPToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]

async def get_gemini_study_explanation(topic: str, include_examples: bool = True, include_career_info: bool = True):
    """Get study explanation using Gemini AI"""
    try:
        prompt = f"""You are an expert educational AI assistant. Provide a comprehensive, accurate explanation about "{topic}".

Please structure your response as a JSON object with the following fields:

1. "definition": A clear, concise definition of the topic
2. "explanation": A detailed explanation covering key concepts, principles, and important details (use markdown formatting for better readability)
3. "examples": An array of 5 real-world, current examples (2024-2025) showing practical applications
4. "applications": An array of 5 current technological/industry applications 
5. "careers": An array of relevant career paths related to this topic
6. "skills": An array of key skills needed to work in this field
7. "salary": Realistic salary range for careers in this field (use current 2025 data)
8. "growth": Job market growth outlook with percentage
9. "confidence": Your confidence level in this information (0.0 to 1.0)
10. "sources": Array of types of sources this information comes from

Make sure all information is:
- Accurate and up-to-date for 2025
- Educational and comprehensive
- Includes real companies/organizations in examples
- Provides realistic career and salary information
- Uses current industry terminology

Topic: {topic}
Include examples: {include_examples}
Include career info: {include_career_info}

Respond ONLY with valid JSON, no additional text."""

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean up the response to ensure it's valid JSON
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        try:
            parsed_response = json.loads(response_text)
            
            # Ensure all required fields are present
            required_fields = {
                'definition': f"{topic.title()} is an important academic subject.",
                'explanation': f"Detailed information about {topic}.",
                'examples': [],
                'applications': [],
                'careers': [],
                'skills': [],
                'salary': 'Varies by location and experience',
                'growth': 'Research current market trends',
                'confidence': 0.85,
                'sources': ['Gemini AI', 'Academic Resources', 'Industry Data']
            }
            
            for field, default_value in required_fields.items():
                if field not in parsed_response:
                    parsed_response[field] = default_value
            
            # Filter examples and career info based on parameters
            if not include_examples:
                parsed_response['examples'] = []
                parsed_response['applications'] = []
            
            if not include_career_info:
                parsed_response['careers'] = []
                parsed_response['skills'] = []
                parsed_response['salary'] = ''
                parsed_response['growth'] = ''
            
            parsed_response['topic'] = topic
            parsed_response['ai_generated'] = True
            
            return parsed_response
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            logger.error(f"Raw response: {response_text[:500]}...")
            
            # Fallback to structured response
            return {
                'topic': topic,
                'definition': f"{topic.title()} is an important academic subject that requires detailed study.",
                'explanation': response_text[:1000] + "..." if len(response_text) > 1000 else response_text,
                'examples': [f"Research current applications of {topic}"] if include_examples else [],
                'applications': [f"Explore how {topic} is used in industry"] if include_examples else [],
                'careers': [f"Research career paths related to {topic}"] if include_career_info else [],
                'skills': ["Critical thinking", "Research skills"] if include_career_info else [],
                'salary': 'Varies by location and experience' if include_career_info else '',
                'growth': 'Research current market trends' if include_career_info else '',
                'confidence': 0.7,
                'sources': ['Gemini AI', 'Academic Resources'],
                'ai_generated': True,
                'parsing_error': True
            }
            
    except Exception as e:
        logger.error(f"Error getting Gemini explanation: {e}")
        raise Exception(f"Failed to get AI explanation: {str(e)}")

async def get_study_explanation_with_ai(topic: str, include_examples: bool = True, include_career_info: bool = True):
    """Get study explanation using AI or fallback to knowledge base"""
    
    if GEMINI_AVAILABLE:
        try:
            logger.info(f"Using Gemini AI for topic: {topic}")
            return await get_gemini_study_explanation(topic, include_examples, include_career_info)
        except Exception as e:
            logger.error(f"Gemini AI failed, using fallback: {e}")
    
    # Fallback to local knowledge base
    logger.info(f"Using fallback knowledge base for topic: {topic}")
    content = search_knowledge_base(topic)
    
    if content:
        response = {
            "topic": topic,
            "definition": content["definition"],
            "explanation": content["explanation"],
            "confidence": content.get("confidence", 0.85),
            "sources": ["Local Knowledge Base", "Academic Resources", "Industry Data 2025"],
            "ai_generated": False
        }
        
        if include_examples:
            response["examples"] = content.get("examples", [])
            response["applications"] = content.get("applications", [])
        
        if include_career_info:
            response["careers"] = content.get("careers", [])
            response["skills"] = content.get("skills", [])
            response["salary"] = content.get("salary", "Varies")
            response["growth"] = content.get("growth", "Research needed")
        
        return response
    
    # Final fallback for unknown topics
    return {
        "topic": topic,
        "definition": f"{topic.title()} is an important academic subject that requires detailed study.",
        "explanation": f"""I don't have comprehensive information about "{topic}" in my current knowledge base. However, I can provide some general guidance:

**Research Strategy:**
1. Start with reputable academic sources and textbooks
2. Use educational platforms like Khan Academy, Coursera, or edX  
3. Apply concepts through exercises and real-world problems
4. Join study groups or online communities related to this topic

**Recommended Resources:**
- Academic textbooks and peer-reviewed journals
- University course materials and lecture notes
- Professional organizations in the field
- Expert-reviewed online resources

For the most accurate and detailed information about "{topic}", I recommend consulting authoritative sources in the field.""",
        "examples": [
            "Search for current research papers and case studies",
            "Look for industry applications and real-world implementations", 
            "Find recent news articles about developments in this field"
        ] if include_examples else [],
        "applications": [
            "Explore how this topic applies to current technology and industry",
            "Research recent breakthroughs and innovations",
            "Investigate career opportunities in related fields"
        ] if include_examples else [],
        "careers": ["Research career paths related to this field"] if include_career_info else [],
        "skills": ["Identify key skills needed for this topic"] if include_career_info else [],
        "salary": "Research current market rates" if include_career_info else "",
        "growth": "Investigate job market trends" if include_career_info else "",
        "confidence": 0.3,
        "sources": ["Academic institutions", "Professional organizations", "Industry publications"],
        "needs_research": True,
        "ai_generated": False
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Study MCP HTTP Server with Gemini AI",
        "version": "2.0.0",
        "ai_enabled": GEMINI_AVAILABLE,
        "endpoints": {
            "/study": "Get detailed study explanations (AI-powered)",
            "/topics": "List available topics",
            "/mcp/tools/call": "MCP tool call endpoint",
            "/health": "Health check"
        }
    }

@app.post("/study")
async def get_study_explanation(request: StudyRequest):
    """Get detailed explanation for a study topic using AI"""
    try:
        topic = request.topic.strip()
        if not topic:
            raise HTTPException(status_code=400, detail="Topic is required")
        
        logger.info(f"Getting AI study explanation for: {topic}")
        
        response = await get_study_explanation_with_ai(
            topic=topic,
            include_examples=request.include_examples,
            include_career_info=request.include_career_info
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting study explanation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/study/{topic}")
async def get_study_explanation_simple(topic: str):
    """Get detailed explanation for a study topic using AI (simple GET endpoint)"""
    try:
        if not topic or not topic.strip():
            raise HTTPException(status_code=400, detail="Topic is required")
        
        topic = topic.strip()
        logger.info(f"Getting AI study explanation for: {topic}")
        
        response = await get_study_explanation_with_ai(
            topic=topic,
            include_examples=True,
            include_career_info=True
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting study explanation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/topics")
async def list_topics():
    """List all available study topics"""
    try:
        if GEMINI_AVAILABLE:
            # With AI, we can handle any topic
            sample_topics = [
                {"topic": "machine learning", "definition": "AI subset enabling computers to learn from data", "confidence": 0.95},
                {"topic": "quantum physics", "definition": "Physics of atomic and subatomic particles", "confidence": 0.90},
                {"topic": "calculus", "definition": "Mathematical study of continuous change", "confidence": 0.95},
                {"topic": "biology", "definition": "Scientific study of life and living organisms", "confidence": 0.90},
                {"topic": "data science", "definition": "Extracting insights from structured and unstructured data", "confidence": 0.95},
                {"topic": "chemistry", "definition": "Science of matter and its properties", "confidence": 0.90},
                {"topic": "psychology", "definition": "Scientific study of mind and behavior", "confidence": 0.85},
                {"topic": "economics", "definition": "Study of production, distribution, and consumption", "confidence": 0.85}
            ]
            
            return {
                "message": "AI can explain any academic topic",
                "sample_topics": sample_topics,
                "total": "unlimited with AI",
                "ai_powered": True
            }
        else:
            # Fallback to knowledge base topics
            topics = []
            for topic, content in STUDY_KNOWLEDGE_BASE.items():
                topics.append({
                    "topic": topic,
                    "definition": content["definition"][:100] + "...",
                    "confidence": content.get("confidence", 0.85)
                })
            
            return {
                "topics": topics,
                "total": len(topics),
                "ai_powered": False
            }
        
    except Exception as e:
        logger.error(f"Error listing topics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mcp/tools/call")
async def mcp_tool_call(request: MCPToolCall):
    """MCP-compatible tool call endpoint with AI support"""
    try:
        if request.name == "get_study_explanation":
            topic = request.arguments.get("topic", "").strip()
            include_examples = request.arguments.get("include_examples", True)
            include_career_info = request.arguments.get("include_career_info", True)
            
            if not topic:
                return {"content": json.dumps({"error": "Topic is required"})}
            
            # Use AI-powered explanation
            response = await get_study_explanation_with_ai(
                topic=topic,
                include_examples=include_examples,
                include_career_info=include_career_info
            )
            
            return {"content": json.dumps(response)}
            
        elif request.name == "search_topics":
            query = request.arguments.get("query", "").lower()
            
            if GEMINI_AVAILABLE:
                # With AI, we can search any topic
                result = {
                    "query": query,
                    "message": f"AI can provide detailed explanations for '{query}' and any related topics",
                    "matches": [{"topic": query, "definition": f"AI can explain {query} in detail"}],
                    "total": "unlimited",
                    "ai_powered": True
                }
            else:
                # Fallback to knowledge base search
                matching_topics = []
                for topic, content in STUDY_KNOWLEDGE_BASE.items():
                    if query in topic or query in content["definition"].lower():
                        matching_topics.append({
                            "topic": topic,
                            "definition": content["definition"][:100] + "..."
                        })
                
                result = {
                    "query": query,
                    "matches": matching_topics,
                    "total": len(matching_topics),
                    "ai_powered": False
                }
            
            return {"content": json.dumps(result)}
        
        else:
            return {"content": json.dumps({"error": f"Unknown tool '{request.name}'"})}
            
    except Exception as e:
        logger.error(f"Error in MCP tool call: {e}")
        return {"content": json.dumps({"error": str(e)})}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "Study MCP HTTP Server",
        "ai_enabled": GEMINI_AVAILABLE,
        "version": "2.0.0"
    }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print("Study MCP HTTP Server with Gemini AI")
        print("Usage: python study_mcp_http_server.py [--port PORT]")
        print("\nEnvironment Variables:")
        print("  GEMINI_API_KEY - Your Google AI Gemini API key")
        print("\nEndpoints:")
        print("  POST /study - Get detailed study explanations (AI-powered)")
        print("  GET /topics - List available topics")
        print("  POST /mcp/tools/call - MCP tool call endpoint")
        print("  GET /health - Health check")
        print(f"\nAI Status: {'Enabled' if GEMINI_AVAILABLE else 'Disabled (set GEMINI_API_KEY)'}")
    else:
        port = 8080
        if "--port" in sys.argv:
            try:
                port_idx = sys.argv.index("--port") + 1
                if port_idx < len(sys.argv):
                    port = int(sys.argv[port_idx])
            except (ValueError, IndexError):
                print("Invalid port number, using default 8080")
        
        print(f"Starting Study MCP HTTP Server with Gemini AI on port {port}")
        print(f"AI Status: {'✅ Enabled' if GEMINI_AVAILABLE else '❌ Disabled (set GEMINI_API_KEY environment variable)'}")
        if not GEMINI_AVAILABLE:
            print("Fallback topics:", list(STUDY_KNOWLEDGE_BASE.keys()))
        else:
            print("🤖 AI can explain any academic topic!")
        
        uvicorn.run(app, host="0.0.0.0", port=port)
