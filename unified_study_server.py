#!/usr/bin/env python3
"""
Unified Study Server - Combines MCP and HTTP functionality with Gemini AI
Handles both MCP protocol and REST API endpoints for study content
"""

import asyncio
import json
import logging
import os
import sys
from typing import Dict, Any, List
import argparse
from config import config, is_gemini_enabled, get_gemini_api_key, print_config_status

# HTTP Server imports
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# MCP Server imports
from mcp.server import Server
from mcp.types import Resource, Tool, TextContent, ImageContent, EmbeddedResource

# AI imports
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. Install with: pip install google-generativeai")

# Configure logging
logging.basicConfig(level=getattr(logging, config.LOG_LEVEL.upper()))
logger = logging.getLogger(__name__)

# Initialize Gemini AI if available
GEMINI_API_KEY = get_gemini_api_key()
if GEMINI_AVAILABLE and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        # Use the current model name for Gemini
        model = genai.GenerativeModel('gemini-2.5-pro')
        logger.info("Gemini AI configured successfully")
        GEMINI_ENABLED = True
    except Exception as e:
        logger.error(f"Failed to configure Gemini AI: {e}")
        GEMINI_ENABLED = False
else:
    GEMINI_ENABLED = False
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not found in .env file. Using fallback knowledge base.")

# Comprehensive knowledge base for fallback
STUDY_KNOWLEDGE_BASE = {
    "machine learning": {
        "definition": "Machine Learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.",
        "explanation": """Machine Learning (ML) is a powerful branch of artificial intelligence that focuses on developing algorithms and statistical models that enable computer systems to improve their performance on a specific task through experience, without being explicitly programmed for that task.

## Core Concepts:
- **Supervised Learning**: Learning with labeled training data
- **Unsupervised Learning**: Finding patterns in data without labels  
- **Reinforcement Learning**: Learning through interaction and feedback
- **Deep Learning**: Using neural networks with multiple layers
- **Feature Engineering**: Selecting and transforming input variables

## Key Algorithms:
- Linear Regression, Logistic Regression
- Decision Trees, Random Forests
- Support Vector Machines (SVM)
- Neural Networks and Deep Learning
- Clustering algorithms (K-means, DBSCAN)""",
        "examples": [
            "Netflix recommendation system suggesting movies based on viewing history",
            "Google Photos automatically recognizing and tagging people in images",
            "Tesla's Autopilot system learning to drive from millions of miles of data",
            "Amazon's Alexa understanding and responding to voice commands",
            "Credit card fraud detection systems identifying suspicious transactions"
        ],
        "applications": [
            "Healthcare: Medical image analysis and drug discovery",
            "Finance: Algorithmic trading and risk assessment",
            "Transportation: Autonomous vehicles and route optimization",
            "Technology: Search engines and recommendation systems",
            "Manufacturing: Predictive maintenance and quality control"
        ],
        "careers": [
            "Machine Learning Engineer",
            "Data Scientist", 
            "AI Research Scientist",
            "Deep Learning Engineer"
        ],
        "skills": [
            "Python/R programming",
            "Statistics and mathematics",
            "TensorFlow/PyTorch",
            "Data preprocessing and analysis"
        ],
        "salary": "$95,000 - $180,000+ annually",
        "growth": "22% job growth projected through 2030",
        "confidence": 0.95
    },
    "data science": {
        "definition": "Data Science is an interdisciplinary field that combines statistics, programming, and domain expertise to extract insights from structured and unstructured data.",
        "explanation": """Data Science is a multidisciplinary field that uses scientific methods, processes, algorithms, and systems to extract knowledge and insights from data. It combines elements of statistics, computer science, mathematics, and domain expertise to analyze complex data sets and solve real-world problems.

## Core Components:
- **Data Collection**: Gathering data from various sources
- **Data Cleaning**: Preparing and preprocessing raw data
- **Exploratory Data Analysis**: Understanding data patterns and relationships
- **Statistical Modeling**: Applying mathematical models to data
- **Machine Learning**: Building predictive models
- **Data Visualization**: Communicating findings through charts and graphs

## The Data Science Process:
1. Problem Definition and Understanding
2. Data Acquisition and Integration
3. Data Exploration and Preparation
4. Model Development and Validation
5. Deployment and Monitoring
6. Communication of Results""",
        "examples": [
            "Spotify analyzing listening patterns to create personalized playlists",
            "Uber using surge pricing algorithms based on demand patterns",
            "Netflix analyzing viewer data to decide which shows to produce",
            "Weather forecasting using satellite data and historical patterns",
            "Social media platforms detecting fake news and misinformation"
        ],
        "applications": [
            "Business Intelligence: Sales forecasting and customer segmentation",
            "Healthcare: Epidemic tracking and personalized medicine",
            "Marketing: Customer behavior analysis and targeted advertising",
            "Sports: Player performance analysis and game strategy",
            "Government: Policy analysis and resource allocation"
        ],
        "careers": [
            "Data Scientist",
            "Data Analyst",
            "Business Intelligence Analyst",
            "Quantitative Researcher"
        ],
        "skills": [
            "SQL and database management",
            "Python/R for data analysis",
            "Statistical analysis and modeling",
            "Data visualization (Tableau, Power BI)"
        ],
        "salary": "$85,000 - $160,000+ annually",
        "growth": "25% job growth projected through 2030",
        "confidence": 0.90
    },
    "calculus": {
        "definition": "Calculus is a branch of mathematics that deals with continuous change, focusing on derivatives, integrals, and the fundamental relationships between them.",
        "explanation": """Calculus is one of the most important mathematical tools, developed independently by Isaac Newton and Gottfried Leibniz in the 17th century. It provides a framework for modeling and analyzing systems that change continuously.

## Main Branches:
- **Differential Calculus**: Studies rates of change and slopes (derivatives)
- **Integral Calculus**: Studies accumulation of quantities and areas under curves
- **Multivariable Calculus**: Extends concepts to functions of several variables

## Key Concepts:
- **Limits**: The foundation of calculus, describing behavior as inputs approach values
- **Derivatives**: Instantaneous rates of change and slopes of tangent lines
- **Integrals**: Accumulation of quantities and areas under curves
- **Fundamental Theorem**: Connects derivatives and integrals

## Applications in Real World:
- Physics: Motion, forces, and energy calculations
- Engineering: Optimization and system design
- Economics: Marginal analysis and optimization
- Biology: Population dynamics and growth models""",
        "examples": [
            "NASA calculating spacecraft trajectories to Mars",
            "Engineers optimizing bridge designs for maximum strength",
            "Economists modeling supply and demand curves",
            "Medical researchers tracking the spread of diseases",
            "Game developers creating realistic physics simulations"
        ],
        "applications": [
            "Engineering: Structural analysis and optimization",
            "Physics: Modeling motion and electromagnetic fields",
            "Economics: Optimization and marginal analysis",
            "Computer Graphics: Smooth curves and animations",
            "Medicine: Modeling drug concentrations in bloodstream"
        ],
        "careers": [
            "Applied Mathematician",
            "Engineering (all fields)",
            "Quantitative Analyst",
            "Physics Researcher"
        ],
        "skills": [
            "Strong algebra and trigonometry foundation",
            "Analytical thinking and problem-solving",
            "Mathematical software (Mathematica, MATLAB)",
            "Understanding of limits and infinite series"
        ],
        "salary": "$60,000 - $120,000+ annually",
        "growth": "15% growth in STEM fields requiring calculus",
        "confidence": 0.95
    },
    "quantum physics": {
        "definition": "Quantum Physics is the branch of physics that studies the behavior of matter and energy at the atomic and subatomic scale, where classical physics laws break down.",
        "explanation": """Quantum Physics, also known as Quantum Mechanics, revolutionized our understanding of nature at the smallest scales. Unlike classical physics, quantum mechanics deals with probabilities rather than certainties, and introduces concepts that seem to defy common sense.

## Fundamental Principles:
- **Wave-Particle Duality**: Particles exhibit both wave and particle properties
- **Uncertainty Principle**: Cannot simultaneously know exact position and momentum
- **Superposition**: Particles can exist in multiple states simultaneously
- **Entanglement**: Particles can be correlated across vast distances
- **Quantum Tunneling**: Particles can pass through energy barriers

## Key Phenomena:
- **Schrödinger's Cat**: Thought experiment illustrating quantum superposition
- **Double-Slit Experiment**: Demonstrates wave-particle duality
- **Quantum Interference**: Waves combining constructively or destructively
- **Measurement Problem**: How observation affects quantum systems""",
        "examples": [
            "MRI machines using nuclear magnetic resonance for medical imaging",
            "Laser technology based on stimulated emission of photons",
            "Computer processors using quantum tunneling in transistors",
            "GPS satellites correcting for relativistic time dilation",
            "LED lights and solar panels utilizing quantum effects"
        ],
        "applications": [
            "Technology: Quantum computers and cryptography",
            "Medicine: MRI imaging and radiation therapy",
            "Energy: Solar cells and laser technology",
            "Communications: Fiber optics and quantum networking",
            "Research: Particle accelerators and atomic clocks"
        ],
        "careers": [
            "Quantum Physicist",
            "Research Scientist",
            "Quantum Computing Engineer",
            "Medical Physics Specialist"
        ],
        "skills": [
            "Advanced mathematics (linear algebra, calculus)",
            "Programming (Python, MATLAB, Mathematica)",
            "Laboratory techniques and instrumentation",
            "Abstract thinking and problem-solving"
        ],
        "salary": "$75,000 - $150,000+ annually",
        "growth": "8% growth in physics research positions",
        "confidence": 0.90
    },
    "biology": {
        "definition": "Biology is the scientific study of life and living organisms, including their structure, function, growth, evolution, distribution, and taxonomy.",
        "explanation": """Biology is a vast field that encompasses all aspects of living organisms, from the molecular level to entire ecosystems. Modern biology integrates chemistry, physics, mathematics, and computer science to understand life processes.

## Major Branches:
- **Molecular Biology**: Study of biological molecules and their interactions
- **Cell Biology**: Structure and function of cells
- **Genetics**: Heredity and genetic variation
- **Ecology**: Interactions between organisms and their environment
- **Evolution**: Change in species over time
- **Physiology**: Functions of living systems

## Levels of Organization:
1. Molecules (DNA, proteins, lipids)
2. Cells (basic unit of life)
3. Tissues (groups of similar cells)
4. Organs (tissues working together)
5. Organ Systems (organs working together)
6. Organisms (complete living beings)
7. Populations, Communities, Ecosystems

## Modern Developments:
- **Biotechnology**: Using biological systems for practical applications
- **Bioinformatics**: Using computers to analyze biological data
- **Synthetic Biology**: Engineering biological systems
- **CRISPR**: Gene editing technology""",
        "examples": [
            "COVID-19 mRNA vaccines developed using molecular biology",
            "CRISPR gene editing treating genetic diseases",
            "Insulin production using genetically modified bacteria",
            "Biofuels created from algae and plant materials",
            "Forensic DNA analysis solving criminal cases"
        ],
        "applications": [
            "Medicine: Drug development and gene therapy",
            "Agriculture: Crop improvement and pest control",
            "Environment: Conservation and ecosystem restoration",
            "Biotechnology: Enzyme production and biomaterials",
            "Research: Understanding diseases and aging"
        ],
        "careers": [
            "Biologist/Research Scientist",
            "Biotechnology Specialist",
            "Medical Research Scientist",
            "Environmental Consultant"
        ],
        "skills": [
            "Laboratory techniques and microscopy",
            "Data analysis and statistics",
            "Scientific writing and communication",
            "Bioinformatics and computational tools"
        ],
        "salary": "$65,000 - $130,000+ annually",
        "growth": "5% growth in biological sciences",
        "confidence": 0.95
    }
}

# FastAPI app setup
app = FastAPI(title="Unified Study Server", version="3.0.0", description="Combined MCP and HTTP Study Server with AI")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class StudyRequest(BaseModel):
    topic: str
    include_examples: bool = True
    include_career_info: bool = True

class MCPToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]

# MCP Server setup
mcp_server = Server("unified-study-server")

# Core functions
async def get_gemini_study_explanation(topic: str, include_examples: bool = True, include_career_info: bool = True) -> dict:
    """Get comprehensive study explanation using Gemini AI"""
    if not GEMINI_ENABLED:
        raise Exception("Gemini AI not available")
    
    try:
        prompt = f"""You are an expert educational AI tutor providing comprehensive academic explanations.

Topic: "{topic}"

Provide a detailed, educational response in JSON format with these exact fields:

{{
    "topic": "{topic}",
    "definition": "Clear, concise definition",
    "explanation": "Comprehensive explanation with key concepts, principles, and important details (use markdown formatting)",
    "examples": ["real-world example 1", "example 2", "example 3", "example 4", "example 5"],
    "applications": ["current application 1", "application 2", "application 3", "application 4", "application 5"],
    "careers": ["relevant career 1", "career 2", "career 3", "career 4"],
    "skills": ["key skill 1", "skill 2", "skill 3", "skill 4", "skill 5"],
    "salary": "realistic salary range with currency",
    "growth": "job market growth percentage and outlook",
    "confidence": 0.95,
    "sources": ["source type 1", "source type 2", "source type 3"]
}}

Requirements:
- All information must be accurate and current for 2025
- Examples should be real companies/applications where possible
- Career and salary info should be realistic and current
- Explanation should be comprehensive but accessible
- Include practical study tips within the explanation

Respond ONLY with valid JSON, no additional text or formatting."""

        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Clean response
        if response_text.startswith('```json'):
            response_text = response_text[7:-3].strip()
        elif response_text.startswith('```'):
            response_text = response_text[3:-3].strip()
        
        try:
            result = json.loads(response_text)
            
            # Ensure required fields
            required_fields = {
                'topic': topic,
                'definition': f"{topic.title()} is an important academic subject.",
                'explanation': f"Detailed information about {topic}.",
                'examples': [],
                'applications': [],
                'careers': [],
                'skills': [],
                'salary': 'Varies by location and experience',
                'growth': 'Research current market trends',
                'confidence': 0.85,
                'sources': ['Gemini AI', 'Academic Resources']
            }
            
            for field, default_value in required_fields.items():
                if field not in result:
                    result[field] = default_value
            
            # Apply filters
            if not include_examples:
                result['examples'] = []
                result['applications'] = []
            
            if not include_career_info:
                result['careers'] = []
                result['skills'] = []
                result['salary'] = ''
                result['growth'] = ''
            
            result['ai_generated'] = True
            result['source'] = 'gemini-ai'
            
            logger.info(f"Generated AI explanation for: {topic}")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {e}")
            # Return structured fallback
            return {
                'topic': topic,
                'definition': f"{topic.title()} is an important academic subject.",
                'explanation': response_text[:1000] + "..." if len(response_text) > 1000 else response_text,
                'examples': [f"Research current applications of {topic}"] if include_examples else [],
                'applications': [f"Explore industry uses of {topic}"] if include_examples else [],
                'careers': [f"Research careers in {topic}"] if include_career_info else [],
                'skills': ["Critical thinking", "Research skills"] if include_career_info else [],
                'salary': 'Varies by field and experience' if include_career_info else '',
                'growth': 'Research current trends' if include_career_info else '',
                'confidence': 0.7,
                'sources': ['Gemini AI'],
                'ai_generated': True,
                'source': 'gemini-ai-fallback'
            }
            
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        raise Exception(f"AI service error: {str(e)}")

def search_knowledge_base(topic: str) -> dict:
    """Search the fallback knowledge base"""
    topic_lower = topic.lower().strip()
    
    # Direct match
    if topic_lower in STUDY_KNOWLEDGE_BASE:
        result = STUDY_KNOWLEDGE_BASE[topic_lower].copy()
        result['topic'] = topic
        result['ai_generated'] = False
        result['source'] = 'knowledge-base'
        return result
    
    # Fuzzy matching
    for kb_topic, content in STUDY_KNOWLEDGE_BASE.items():
        if topic_lower in kb_topic or kb_topic in topic_lower:
            result = content.copy()
            result['topic'] = topic
            result['ai_generated'] = False
            result['source'] = 'knowledge-base'
            result['confidence'] = result.get('confidence', 0.85) * 0.8  # Lower confidence for fuzzy match
            return result
    
    # No match found
    return {
        'topic': topic,
        'definition': f"Information about '{topic}' is not available in the current knowledge base.",
        'explanation': f"""I don't have specific information about "{topic}" in my knowledge base. Here are some suggestions:

**Research Strategies:**
1. Check academic databases and peer-reviewed sources
2. Use educational platforms like Khan Academy or Coursera
3. Consult textbooks and authoritative sources in the field
4. Look for recent research papers and publications

**Available Topics in Knowledge Base:**
{', '.join(STUDY_KNOWLEDGE_BASE.keys())}

For comprehensive information about "{topic}", I recommend consulting subject matter experts or specialized educational resources.""",
        'examples': [],
        'applications': [],
        'careers': ["Research careers related to this field"],
        'skills': ["Research methodology", "Critical thinking"],
        'salary': 'Varies by specialization',
        'growth': 'Research current market trends', 
        'confidence': 0.2,
        'sources': ['Local Knowledge Base'],
        'ai_generated': False,
        'source': 'knowledge-base',
        'needs_research': True
    }

async def get_study_explanation(topic: str, include_examples: bool = True, include_career_info: bool = True) -> dict:
    """Get study explanation with AI-first approach and fallback"""
    
    # Try AI first
    if GEMINI_ENABLED:
        try:
            logger.info(f"Using Gemini AI for: {topic}")
            return await get_gemini_study_explanation(topic, include_examples, include_career_info)
        except Exception as e:
            logger.warning(f"AI failed for {topic}: {e}")
    
    # Fallback to knowledge base
    logger.info(f"Using knowledge base for: {topic}")
    result = search_knowledge_base(topic)
    
    # Apply filters to fallback
    if not include_examples:
        result['examples'] = []
        result['applications'] = []
    
    if not include_career_info:
        result['careers'] = []
        result['skills'] = []
        result['salary'] = ''
        result['growth'] = ''
    
    return result

# HTTP API Endpoints
@app.get("/")
async def root():
    """Root endpoint with server information"""
    return {
        "name": "Unified Study Server",
        "version": "3.0.0",
        "description": "Combined MCP and HTTP Study Server with Gemini AI",
        "ai_enabled": GEMINI_ENABLED,
        "fallback_topics": len(STUDY_KNOWLEDGE_BASE),
        "protocols": ["HTTP REST API", "Model Context Protocol"],
        "endpoints": {
            "POST /study": "Get detailed study explanations",
            "GET /topics": "List available topics",
            "POST /mcp/tools/call": "MCP tool call endpoint", 
            "GET /health": "Health check"
        }
    }

@app.post("/study")
async def get_study_content(request: StudyRequest):
    """Get comprehensive study content for a topic"""
    try:
        if not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic is required")
        
        logger.info(f"Study request for: {request.topic}")
        
        result = await get_study_explanation(
            topic=request.topic.strip(),
            include_examples=request.include_examples,
            include_career_info=request.include_career_info
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Study request error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/topics")
async def list_available_topics():
    """List all available study topics"""
    try:
        if GEMINI_ENABLED:
            return {
                "message": "AI can explain any academic topic",
                "sample_topics": [
                    {"topic": "artificial intelligence", "confidence": 0.95},
                    {"topic": "quantum computing", "confidence": 0.90},
                    {"topic": "molecular biology", "confidence": 0.95},
                    {"topic": "macroeconomics", "confidence": 0.85},
                    {"topic": "organic chemistry", "confidence": 0.90},
                    {"topic": "renaissance history", "confidence": 0.85},
                    {"topic": "linear algebra", "confidence": 0.95},
                    {"topic": "cognitive psychology", "confidence": 0.90}
                ],
                "total": "unlimited",
                "ai_powered": True,
                "fallback_topics": list(STUDY_KNOWLEDGE_BASE.keys())
            }
        else:
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
                "ai_powered": False,
                "message": "Limited to knowledge base topics. Enable AI for unlimited coverage."
            }
            
    except Exception as e:
        logger.error(f"Topics listing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mcp/tools/call")
async def mcp_tool_call(request: MCPToolCall):
    """MCP-compatible tool call endpoint"""
    try:
        if request.name == "get_study_explanation":
            topic = request.arguments.get("topic", "").strip()
            include_examples = request.arguments.get("include_examples", True)
            include_career_info = request.arguments.get("include_career_info", True)
            
            if not topic:
                return {"content": json.dumps({"error": "Topic is required"})}
            
            result = await get_study_explanation(topic, include_examples, include_career_info)
            return {"content": json.dumps(result)}
            
        elif request.name == "search_topics":
            query = request.arguments.get("query", "").lower()
            
            if GEMINI_ENABLED:
                return {
                    "content": json.dumps({
                        "query": query,
                        "message": f"AI can explain '{query}' and related topics",
                        "ai_powered": True
                    })
                }
            else:
                matches = []
                for topic in STUDY_KNOWLEDGE_BASE.keys():
                    if query in topic or topic in query:
                        matches.append(topic)
                
                return {
                    "content": json.dumps({
                        "query": query,
                        "matches": matches,
                        "total": len(matches),
                        "ai_powered": False
                    })
                }
        else:
            return {"content": json.dumps({"error": f"Unknown tool: {request.name}"})}
            
    except Exception as e:
        logger.error(f"MCP tool call error: {e}")
        return {"content": json.dumps({"error": str(e)})}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ai_enabled": GEMINI_ENABLED,
        "knowledge_base_topics": len(STUDY_KNOWLEDGE_BASE),
        "timestamp": "2025-08-03"
    }

# MCP Protocol Implementation
@mcp_server.list_resources()
async def list_resources() -> List[Resource]:
    """List available study resources"""
    resources = []
    
    if GEMINI_ENABLED:
        resources.append(Resource(
            uri="study://ai-unlimited",
            name="AI-Powered Study Assistant",
            description="Unlimited topic coverage with Gemini AI",
            mimeType="application/json"
        ))
    
    for topic in STUDY_KNOWLEDGE_BASE.keys():
        resources.append(Resource(
            uri=f"study://knowledge-base/{topic}",
            name=f"Study Guide: {topic.title()}",
            description=f"Comprehensive guide for {topic}",
            mimeType="application/json"
        ))
    
    return resources

@mcp_server.read_resource()
async def read_resource(uri: str) -> str:
    """Read a specific study resource"""
    if uri == "study://ai-unlimited":
        if GEMINI_ENABLED:
            return json.dumps({
                "message": "AI-powered study assistant ready",
                "capabilities": "Unlimited topic coverage with detailed explanations",
                "ai_model": "Google Gemini Pro"
            })
        else:
            return json.dumps({"error": "AI not available"})
    
    if uri.startswith("study://knowledge-base/"):
        topic = uri.replace("study://knowledge-base/", "")
        if topic in STUDY_KNOWLEDGE_BASE:
            result = STUDY_KNOWLEDGE_BASE[topic].copy()
            result['topic'] = topic
            return json.dumps(result)
        else:
            return json.dumps({"error": f"Topic '{topic}' not found"})
    
    return json.dumps({"error": "Resource not found"})

@mcp_server.list_tools()
async def list_tools() -> List[Tool]:
    """List available MCP tools"""
    return [
        Tool(
            name="get_study_explanation",
            description="Get comprehensive explanation for any study topic",
            inputSchema={
                "type": "object",
                "properties": {
                    "topic": {"type": "string", "description": "The topic to explain"},
                    "include_examples": {"type": "boolean", "default": True},
                    "include_career_info": {"type": "boolean", "default": True}
                },
                "required": ["topic"]
            }
        ),
        Tool(
            name="search_topics",
            description="Search for available study topics",
            inputSchema={
                "type": "object", 
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            }
        )
    ]

@mcp_server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> List[TextContent]:
    """Handle MCP tool calls"""
    try:
        if name == "get_study_explanation":
            topic = arguments.get("topic", "").strip()
            include_examples = arguments.get("include_examples", True)
            include_career_info = arguments.get("include_career_info", True)
            
            if not topic:
                return [TextContent(type="text", text=json.dumps({"error": "Topic is required"}))]
            
            result = await get_study_explanation(topic, include_examples, include_career_info)
            return [TextContent(type="text", text=json.dumps(result, indent=2))]
            
        elif name == "search_topics":
            query = arguments.get("query", "").lower()
            
            if GEMINI_ENABLED:
                result = {
                    "query": query,
                    "message": f"AI can provide explanations for '{query}' and any related topics",
                    "unlimited": True,
                    "ai_powered": True
                }
            else:
                matches = []
                for topic in STUDY_KNOWLEDGE_BASE.keys():
                    if query in topic or topic in query:
                        matches.append(topic)
                
                result = {
                    "query": query,
                    "matches": matches,
                    "total": len(matches),
                    "ai_powered": False,
                    "available_topics": list(STUDY_KNOWLEDGE_BASE.keys())
                }
            
            return [TextContent(type="text", text=json.dumps(result, indent=2))]
        
        else:
            return [TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))]
            
    except Exception as e:
        logger.error(f"Tool call error: {e}")
        return [TextContent(type="text", text=json.dumps({"error": str(e)}))]

async def run_mcp_server():
    """Run the MCP server"""
    import mcp.server.stdio
    
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await mcp_server.run(
            read_stream,
            write_stream,
            mcp_server.create_initialization_options()
        )

def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Unified Study Server")
    parser.add_argument("--port", type=int, default=config.SERVER_PORT, help="HTTP server port")
    parser.add_argument("--host", default=config.SERVER_HOST, help="HTTP server host")
    parser.add_argument("--mcp-only", action="store_true", help="Run MCP server only")
    parser.add_argument("--http-only", action="store_true", help="Run HTTP server only")
    
    args = parser.parse_args()
    
    print("🚀 Unified Study Server Starting...")
    print("=" * 50)
    print_config_status()
    print(f"Fallback Topics: {list(STUDY_KNOWLEDGE_BASE.keys())}")
    print(f"Protocols: {'MCP + HTTP' if not (args.mcp_only or args.http_only) else 'MCP' if args.mcp_only else 'HTTP'}")
    
    if args.mcp_only:
        # Run MCP server only
        print("Starting MCP server on stdio...")
        asyncio.run(run_mcp_server())
    elif args.http_only:
        # Run HTTP server only
        print(f"Starting HTTP server on http://{args.host}:{args.port}")
        uvicorn.run(app, host=args.host, port=args.port)
    else:
        # Run HTTP server (MCP runs on stdio when needed)
        print(f"Starting HTTP server on http://{args.host}:{args.port}")
        print("MCP server available via stdio interface")
        uvicorn.run(app, host=args.host, port=args.port)

if __name__ == "__main__":
    main()
