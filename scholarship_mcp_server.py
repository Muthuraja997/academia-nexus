from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import json
import os
from typing import Dict, Any, List
import uvicorn
from functools import lru_cache
import re
import requests
from bs4 import BeautifulSoup
import asyncio
from datetime import datetime

# Configure Gemini AI
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyAvI5VvIAOfte5XU8r1mZJ_vIF5G8EyMUM")
MODEL_NAME = "gemini-2.5-pro"

print(f"Initializing Gemini AI with API key: {GEMINI_API_KEY[:10]}...")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)
print("Gemini AI model initialized successfully")

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def scrape_scholarships(student_details: Dict[str, Any]) -> List[Dict]:
    """Scrape scholarships from multiple sources based on student details"""
    print("Scraping scholarships for:", student_details)
    
    # For testing, return some sample scholarships tailored to the student
    education_level = student_details.get('educationLevel', 'All')
    major_field = student_details.get('majorField', 'All Fields')
    nationality = student_details.get('nationality', 'International')
    
    sample_scholarships = [
        {
            'name': f"Merit Scholarship for {major_field}",
            'eligibility': f"{education_level} students with excellent academic record in {major_field}",
            'deadline': '2025-12-31',
            'amount': '$10,000',
            'link': 'https://example.com/scholarship1',
            'source': 'https://example.com',
            'target_group': 'ALL',
            'last_updated': datetime.now().isoformat()
        },
        {
            'name': 'Technology Innovation Scholarship',
            'eligibility': f"High School and Undergraduate students in Computer Science, Technology, or STEM fields. Strong academic performance required.",
            'deadline': '2025-11-30',
            'amount': '$15,000',
            'link': 'https://example.com/scholarship2',
            'source': 'https://example.com',
            'target_group': 'ALL',
            'last_updated': datetime.now().isoformat()
        },
        {
            'name': 'Global Tech Talent Scholarship',
            'eligibility': f"International students from {nationality} pursuing Computer Science or Technology fields",
            'deadline': '2025-10-31',
            'amount': '$20,000',
            'link': 'https://example.com/scholarship3',
            'source': 'https://example.com',
            'target_group': 'ALL',
            'last_updated': datetime.now().isoformat()
        },
        {
            'name': 'AI & Machine Learning Excellence Award',
            'eligibility': f"Students interested in AI/ML with demonstrated projects or achievements. Open to {education_level} students.",
            'deadline': '2025-09-30',
            'amount': '$25,000',
            'link': 'https://example.com/scholarship4',
            'source': 'https://example.com',
            'target_group': 'ALL',
            'last_updated': datetime.now().isoformat()
        }
    ]
    
    print(f"Returning {len(sample_scholarships)} sample scholarships")
    return sample_scholarships



def extract_scholarship_details(url: str) -> Dict:
    """Extract detailed information from a scholarship page"""
    # For testing, return sample details
    return {
        'full_eligibility': 'Must be enrolled in an accredited institution\nMinimum GPA of 3.0\nDemonstrated leadership abilities',
        'documents_required': 'Academic transcripts\nTwo letters of recommendation\nPersonal statement\nResume/CV',
        'application_process': '1. Complete online application form\n2. Submit required documents\n3. Wait for review\n4. Interview if selected',
        'important_dates': 'Application Opens: September 1, 2025\nDeadline: December 31, 2025\nNotification: January 31, 2026'
    }

def preprocess_student_details(details: Dict[str, Any]) -> Dict[str, Any]:
    """Preprocess and validate student details"""
    processed = {}
    
    # Convert GPA to float if possible
    try:
        processed['gpa'] = float(details.get('gpa', 0))
    except:
        processed['gpa'] = 0
    
    # Clean and standardize fields
    processed['name'] = details.get('name', '').strip()
    processed['educationLevel'] = details.get('educationLevel', '').lower()
    processed['majorField'] = details.get('majorField', '').lower()
    processed['nationality'] = details.get('nationality', '').lower()
    processed['interests'] = details.get('interests', '').lower()
    processed['achievements'] = details.get('achievements', '').lower()
    
    return processed

def filter_scholarships(student: Dict[str, Any], scholarships: List[Dict]) -> List[Dict]:
    """Pre-filter scholarships based on basic criteria"""
    filtered = []
    print(f"Starting filtering with {len(scholarships)} scholarships")
    
    for scholarship in scholarships:
        score = 0.1  # Base score for all scholarships
        reason = ["Base match"]

        # Education level matching (case-insensitive, flexible)
        if student['educationLevel']:
            edu_level = student['educationLevel'].lower().replace(" ", "")
            eligibility = scholarship['eligibility'].lower().replace(" ", "")
            # Accept common variants
            education_keywords = {
                'highschool': ['highschool', 'secondary', 'k-12', 'school'],
                'undergraduate': ['undergraduate', 'college', 'university', 'bachelor', 'bachelors'],
                'graduate': ['graduate', 'masters', 'phd', 'doctoral', 'postgraduate']
            }
            # Try all possible variants
            found = False
            for key, variants in education_keywords.items():
                if key in edu_level:
                    if any(variant in eligibility for variant in variants):
                        score += 0.3
                        reason.append(f"Matches your education level ({student['educationLevel']})")
                        found = True
                        break
            # Fallback: direct substring
            if not found and edu_level in eligibility:
                score += 0.2
                reason.append(f"Partial education level match ({student['educationLevel']})")

        # Major/Field relevance
        if student['majorField']:
            major = student['majorField'].lower()
            name = scholarship['name'].lower()
            eligibility = scholarship['eligibility'].lower()
            # Check for field matches in both name and eligibility
            field_keywords = ['computer science', 'engineering', 'medical', 'arts', 'science', 'commerce', 'law', 'technology', 'tech', 'stem', 'ml', 'ai', 'machine learning']
            for keyword in field_keywords:
                if keyword in major and (keyword in eligibility or keyword in name):
                    score += 0.2
                    reason.append(f"Relevant for {keyword} students")
                    break

        # Academic performance consideration
        try:
            gpa = float(student['gpa'])
            # Convert GPA to percentage (assuming 4.0 scale)
            gpa_percent = (gpa / 4.0) * 100
            if gpa_percent >= 80:  # Equivalent to 3.2/4.0
                if 'merit' in scholarship['name'].lower():
                    score += 0.2
                    reason.append(f"Matches merit criteria (GPA: {gpa})")
                elif any(word in scholarship['eligibility'].lower() for word in ['outstanding', 'excellent', 'meritorious']):
                    score += 0.15
                    reason.append("Matches academic excellence criteria")
        except (ValueError, TypeError):
            pass
        if score > 0:
            filtered.append({
                "scholarship": scholarship,
                "match_score": min(score + 0.1, 1.0),
                "reason": ". ".join(reason)
            })

    # If nothing matched, return all scholarships with base score for testing/demo
    if not filtered:
        for scholarship in scholarships:
            filtered.append({
                "scholarship": scholarship,
                "match_score": 0.1,
                "reason": "General match (no strong criteria met)"
            })
    return sorted(filtered, key=lambda x: x['match_score'], reverse=True)

async def get_scholarship_recommendations(student_details: Dict[str, Any]) -> List[Dict]:
    """Get personalized scholarship recommendations using web scraping and AI"""
    try:
        # Preprocess student details
        processed_details = preprocess_student_details(student_details)
        
        # Scrape scholarships
        scholarships = await scrape_scholarships(processed_details)
        
        # Initial filtering
        filtered_recommendations = filter_scholarships(processed_details, scholarships)
        print(f"Filtered recommendations before AI: {filtered_recommendations}")
        
        # Always try to get AI analysis, even without filtered recommendations
        # Use AI to analyze and enhance the recommendations
        prompt = f"""
            You are a scholarship matching assistant. Analyze these scholarships and student details.
            Provide detailed matching analysis and additional insights.

            Student Details:
            - Name: {processed_details['name']}
            - Education Level: {processed_details['educationLevel']}
            - GPA: {processed_details['gpa']}
            - Major/Field: {processed_details['majorField']}
            - Nationality: {processed_details['nationality']}
            - Interests: {processed_details['interests']}
            - Achievements: {processed_details['achievements']}

            Current Scholarship Matches:
            {json.dumps(filtered_recommendations[:5], indent=2)}

            For each scholarship, provide:
            1. Match score (0.0-1.0)
            2. Detailed eligibility analysis
            3. Application tips
            4. Required documents
            5. Success probability

            Return enhanced recommendations in JSON format:
            [{{
                "scholarship": {{original scholarship object}},
                "match_score": float,
                "analysis": {{
                    "eligibility_match": string,
                    "application_tips": string,
                    "required_documents": string,
                    "success_probability": string
                }},
                "reason": string
            }}]
            """

        try:
            print("Sending prompt to Gemini AI...")
            response = model.generate_content(prompt)
            response_text = response.text.strip()
            print("Received response from Gemini AI:", response_text)
            
            # Try to find JSON content if there's additional text
            if not response_text.startswith('['):
                import re
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)
        except Exception as e:
            print(f"Error calling Gemini AI: {str(e)}")
            return filtered_recommendations[:5]
        
        try:
            ai_recommendations = json.loads(response_text)
            
            # Validate AI recommendations format
            ai_recommendations = [
                rec for rec in ai_recommendations 
                if isinstance(rec, dict) 
                and 'scholarship' in rec 
                and 'match_score' in rec 
                and 'reason' in rec
            ]
            
            # Combine and sort recommendations
            all_recommendations = filtered_recommendations + ai_recommendations
            unique_recommendations = {
                rec['scholarship']['name']: rec 
                for rec in sorted(all_recommendations, key=lambda x: x['match_score'], reverse=True)
            }.values()
            
            return list(unique_recommendations)[:5]
            
        except json.JSONDecodeError as e:
            print(f"Error parsing AI response: {e}")
            print(f"Response was: {response_text}")
            return filtered_recommendations[:5]
        
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        return filtered_recommendations[:5] if filtered_recommendations else []

# FastAPI endpoints
@app.get("/getAllScholarships")
async def get_all_scholarships():
    try:
        # Use empty student details to get general scholarships
        scholarships = await scrape_scholarships({})
        return scholarships
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/getRecommendations")
async def get_recommendations(student_details: Dict[str, Any]):
    try:
        print("Received student details:", student_details)
        
        # Validate required fields
        required_fields = ['educationLevel', 'gpa', 'majorField', 'name']
        missing_fields = [field for field in required_fields if not student_details.get(field)]
        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
            
        # Get scholarship recommendations using AI analysis
        recommendations = await get_scholarship_recommendations(student_details)
        
        if not recommendations:
            return {
                "message": "No matching scholarships found",
                "recommendations": []
            }
        
        print(f"Returning {len(recommendations)} recommendations")
        return {
            "message": "Successfully found matching scholarships",
            "recommendations": recommendations
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting Scholarship Server on port 8080...")
    uvicorn.run(app, host="127.0.0.1", port=8080)
