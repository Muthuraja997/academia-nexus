from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import json
import os
from typing import Dict, Any, List
import uvicorn
import re
from security_config import get_gemini_api_key

# Ensure app and model are defined before any endpoint
app = FastAPI()

# Configure Gemini AI
GEMINI_API_KEY = get_gemini_api_key()
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required. Please add it to your .env file.")

MODEL_NAME = "gemini-2.5-pro"

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(MODEL_NAME)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- In-memory conversation storage (for demo purposes) ---
conversations = {}

# --- Alexa-like Conversational AI Functions ---
def create_alexa_response(user_message: str, conversation_history: List[Dict], session_id: str) -> str:
    """Generate an Alexa-like response to continue the conversation."""
    # Build conversation context
    context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history])
    
    prompt = f"""
You are an AI communication coach similar to Alexa, helping a student practice their communication skills. 
You should be conversational, encouraging, and ask follow-up questions to keep the dialogue flowing naturally.

Your role:
- Act like a friendly interviewer or conversation partner
- Ask engaging follow-up questions
- Show interest in what the student says
- Keep the conversation natural and educational
- Provide gentle guidance when needed
- Use a warm, encouraging tone

Conversation so far:
{context}

Student just said: "{user_message}"

Respond naturally as an AI coach would, asking a follow-up question or making an encouraging comment to continue the conversation. Keep your response to 1-2 sentences and sound conversational like Alexa would.
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Error generating Alexa response: {e}")
        return "I'm sorry, I didn't quite catch that. Could you please repeat what you said?"

def analyze_full_conversation(conversation_history: List[Dict]) -> Dict[str, Any]:
    """Analyze the complete conversation and provide comprehensive feedback."""
    # Build conversation text
    conversation_text = "\n".join([
        f"{msg['role']}: {msg['content']}" 
        for msg in conversation_history 
        if msg['role'] in ['student', 'ai']
    ])
    
    prompt = f"""
You are an expert communication coach analyzing a complete conversation between a student and an AI coach.
Provide comprehensive feedback on the student's communication performance.

Conversation:
{conversation_text}

Analyze the student's communication and provide feedback in the following JSON format:
{{
    "overall_performance": "Excellent/Good/Fair/Needs Improvement",
    "clarity": {{
        "score": "Excellent/Good/Fair/Poor",
        "feedback": "Detailed feedback on how clearly the student expressed themselves"
    }},
    "confidence": {{
        "score": "Excellent/Good/Fair/Poor", 
        "feedback": "Assessment of the student's confidence level throughout the conversation"
    }},
    "engagement": {{
        "score": "Excellent/Good/Fair/Poor",
        "feedback": "How well the student engaged with questions and kept the conversation flowing"
    }},
    "strengths": ["List of 2-3 specific strengths observed"],
    "areas_for_improvement": ["List of 2-3 specific areas to work on"],
    "conversation_flow": {{
        "score": "Excellent/Good/Fair/Poor",
        "feedback": "How well the student maintained natural conversation flow"
    }},
    "suggestions": [
        "Specific actionable suggestions for improvement",
        "Another practical tip",
        "One more recommendation"
    ],
    "encouragement": "A personalized encouraging message for the student"
}}
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
        
        return json.loads(response_text)
    except Exception as e:
        print(f"Error analyzing conversation: {e}")
        return {
            "overall_performance": "Unable to analyze",
            "error": "Failed to analyze conversation. Please try again."
        }

# --- Helper Function to Preprocess Student Details ---
def preprocess_student_details(details: Dict[str, Any]) -> Dict[str, Any]:
    """Preprocess and clean student details."""
    processed = {}
    try:
        processed['gpa'] = float(details.get('gpa', 0))
    except (ValueError, TypeError):
        processed['gpa'] = "Not provided"
    
    # Clean and standardize other fields
    processed['name'] = details.get('name', 'N/A').strip()
    processed['educationLevel'] = details.get('educationLevel', 'N/A').strip()
    processed['majorField'] = details.get('majorField', 'N/A').strip()
    processed['nationality'] = details.get('nationality', 'N/A').strip()
    processed['interests'] = details.get('interests', 'N/A').strip()
    processed['achievements'] = details.get('achievements', 'N/A').strip()
    
    return processed

# --- Core Logic for Getting Scholarship Recommendations ---
async def get_scholarship_recommendations(student_details: Dict[str, Any]) -> List[Dict]:
    """Get personalized scholarship recommendations using a dynamic AI search."""
    try:
        # 1. Preprocess student details
        processed_details = preprocess_student_details(student_details)
        
        # 2. Create a new prompt that asks the LLM to FIND real scholarships with valid links
        prompt = f"""
        You are an expert scholarship search assistant. Your task is to find real, currently active scholarships based on a student's profile.
        Please find 5 to 7 scholarships that are a strong match for the student below.

        **Crucially, you must provide the real, direct, and valid URL for each scholarship's information or application page.** Do not use placeholder links like 'example.com'. If a deadline has passed for the current year, find the link for the upcoming year if possible.

        **Student Profile:**
        - Education Level: {processed_details.get('educationLevel')}
        - GPA: {processed_details.get('gpa')}
        - Major/Field of Study: {processed_details.get('majorField')}
        - Nationality: {processed_details.get('nationality')}
        - Interests: {processed_details.get('interests')}
        - Key Achievements: {processed_details.get('achievements')}

        For each scholarship found, provide the following details. Return the entire output as a single, clean JSON array of objects. Do not include any text before or after the JSON array.

        **Required JSON Format:**
        [
          {{
            "name": "Full Name of the Scholarship",
            "eligibility": "Key eligibility criteria (e.g., major, GPA, nationality).",
            "deadline": "Application deadline in YYYY-MM-DD format. If not available, state 'Varies' or 'Check website'.",
            "amount": "The award amount (e.g., '$10,000' or 'Varies').",
            "link": "The valid, direct URL to the scholarship page.",
            "reason": "A brief, 1-2 sentence explanation of why this scholarship is a good match for the student."
          }}
        ]
        """

        # 3. Call the Gemini model
        print("Sending dynamic scholarship search prompt to Gemini AI...")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        print("Received dynamic scholarship data from Gemini AI.")
        
        # 4. Extract and parse the JSON response
        # Use regex to find the JSON array within the response text, in case the model adds extra words.
        json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if not json_match:
            print("Error: No JSON array found in the LLM response.")
            raise Exception("LLM did not return a valid JSON array of scholarships.")

        recommendations_json_str = json_match.group(0)
        recommendations = json.loads(recommendations_json_str)

        # 5. Validate the structure of the returned data to ensure quality
        validated_recs = []
        for rec in recommendations:
            if isinstance(rec, dict) and rec.get('name') and rec.get('link') and "example.com" not in rec.get('link', ''):
                validated_recs.append(rec)

        return validated_recs

    except json.JSONDecodeError as e:
        print(f"Error parsing JSON from Gemini AI: {e}")
        print(f"Response text that failed to parse: {response_text}")
        raise HTTPException(status_code=500, detail="Failed to parse scholarship data from AI.")
    except Exception as e:
        print(f"An error occurred in get_scholarship_recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# --- FastAPI Endpoints ---

@app.post("/getCommunicationFeedback")
async def get_communication_feedback(payload: Dict[str, str] = Body(...)):
    """Analyze a student's spoken response and return AI-powered feedback."""
    transcript = payload.get("transcript", "").strip()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript is required.")
    try:
        prompt = f'''
        You are an expert communication coach. Analyze the following spoken response and provide feedback on:
        1. Clarity (Poor, Fair, Good, Excellent)
        2. Confidence (Poor, Fair, Good, Excellent)
        3. List of filler words used (e.g., um, like, you know, etc.)
        4. A short suggestion for improvement (1-2 sentences)
        5. Reason for the score
        6. grammar errors (if any)
        7. Best way to say it

        Spoken Response:
        """
        {transcript}
        """

        Return the feedback as a JSON object with keys: clarity, confidence, fillerWords (array), suggestion.
        '''
        print("Sending communication feedback prompt to Gemini AI...")
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
            
        feedback = json.loads(response_text)
        return {
            "clarity": feedback.get("clarity", "N/A"),
            "confidence": feedback.get("confidence", "N/A"),
            "fillerWords": feedback.get("fillerWords", []),
            "suggestion": feedback.get("suggestion", "Could not generate suggestion.")
        }
    except Exception as e:
        print(f"Error getting communication feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze communication feedback.")


@app.post("/getRecommendations")
async def get_recommendations(student_details: Dict[str, Any]):
    """Receives student details and returns dynamic, AI-found scholarship recommendations."""
    try:
        print("Received student details for recommendation:", student_details)
        
        # Validate required fields
        required_fields = ['educationLevel', 'gpa', 'majorField', 'name']
        missing_fields = [field for field in required_fields if not student_details.get(field)]
        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
            
        recommendations = await get_scholarship_recommendations(student_details)
        
        if not recommendations:
            return {
                "message": "No matching scholarships found at this time. Please try adjusting your profile.",
                "recommendations": []
            }
        
        print(f"Returning {len(recommendations)} recommendations.")
        return {
            "message": "Successfully found matching scholarships",
            "recommendations": recommendations
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /getRecommendations endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- New Alexa-like Conversational Endpoints ---

@app.post("/startCommunicationSession")
async def start_communication_session(payload: Dict[str, Any] = Body(...)):
    """Start a new communication practice session with Alexa-like AI."""
    session_id = payload.get("sessionId")
    student_name = payload.get("studentName", "Student")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="Session ID is required.")
    
    # Initialize conversation with a welcoming message
    welcome_message = f"Hi {student_name}! I'm your AI communication coach. I'm here to help you practice your communication skills in a friendly conversation. Let's start with something simple - tell me about yourself and what you're studying?"
    
    # Store the session
    conversations[session_id] = {
        "messages": [
            {"role": "ai", "content": welcome_message, "timestamp": ""}
        ],
        "student_name": student_name,
        "status": "active"
    }
    
    return {
        "message": "Session started successfully",
        "sessionId": session_id,
        "aiResponse": welcome_message
    }

@app.post("/sendMessage")
async def send_message(payload: Dict[str, Any] = Body(...)):
    """Send a message in an ongoing conversation and get AI response."""
    session_id = payload.get("sessionId")
    user_message = payload.get("message", "").strip()
    
    if not session_id or session_id not in conversations:
        raise HTTPException(status_code=400, detail="Invalid or expired session ID.")
    
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required.")
    
    try:
        # Get conversation history
        conversation = conversations[session_id]
        conversation_history = conversation["messages"]
        
        # Add user message
        conversation_history.append({
            "role": "student", 
            "content": user_message,
            "timestamp": ""
        })
        
        # Generate AI response
        ai_response = create_alexa_response(user_message, conversation_history, session_id)
        
        # Add AI response
        conversation_history.append({
            "role": "ai",
            "content": ai_response,
            "timestamp": ""
        })
        
        # Update conversation
        conversations[session_id]["messages"] = conversation_history
        
        return {
            "aiResponse": ai_response,
            "conversationLength": len(conversation_history)
        }
        
    except Exception as e:
        print(f"Error in sendMessage: {e}")
        raise HTTPException(status_code=500, detail="Failed to process message.")

@app.post("/endCommunicationSession")
async def end_communication_session(payload: Dict[str, Any] = Body(...)):
    """End a communication session and provide comprehensive feedback."""
    session_id = payload.get("sessionId")
    
    if not session_id or session_id not in conversations:
        raise HTTPException(status_code=400, detail="Invalid or expired session ID.")
    
    try:
        conversation = conversations[session_id]
        conversation_history = conversation["messages"]
        
        # Analyze the full conversation
        feedback = analyze_full_conversation(conversation_history)
        
        # Mark session as ended
        conversations[session_id]["status"] = "ended"
        
        return {
            "message": "Session ended successfully",
            "feedback": feedback,
            "conversationLength": len(conversation_history)
        }
        
    except Exception as e:
        print(f"Error ending session: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze conversation.")

@app.get("/getConversationHistory/{session_id}")
async def get_conversation_history(session_id: str):
    """Get the conversation history for a session."""
    if session_id not in conversations:
        raise HTTPException(status_code=404, detail="Session not found.")
    
    return {
        "sessionId": session_id,
        "messages": conversations[session_id]["messages"],
        "status": conversations[session_id]["status"]
    }

# New endpoint for continuous communication
@app.post("/startConversation")
async def start_conversation(payload: Dict[str, Any] = Body(...)):
    """Handle continuous communication between student and AI."""
    conversation = payload.get("conversation", [])  # List of conversation turns
    if not isinstance(conversation, list):
        raise HTTPException(status_code=400, detail="Conversation must be a list of messages.")

    try:
        # Build a prompt to analyze the entire conversation
        prompt = """
        You are an expert communication coach. Analyze the following conversation and provide feedback on:
        1. Overall Clarity (Poor, Fair, Good, Excellent)
        2. Overall Confidence (Poor, Fair, Good, Excellent)
        3. Common filler words used (e.g., um, like, you know)
        4. Suggestions for improvement (2-3 sentences)

        Conversation:
        """
        for turn in conversation:
            speaker = turn.get("speaker", "Unknown")
            message = turn.get("message", "").strip()
            prompt += f"{speaker}: {message}\n"

        prompt += """
        Return the feedback as a JSON object with keys: clarity, confidence, fillerWords (array), suggestion.
        """

        print("Sending conversation analysis prompt to Gemini AI...\n", prompt)
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        print("Received conversation feedback from Gemini AI:\n", response_text)

        # Extract JSON from the response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
        feedback = json.loads(response_text)

        return {
            "clarity": feedback.get("clarity", ""),
            "confidence": feedback.get("confidence", ""),
            "fillerWords": feedback.get("fillerWords", []),
            "suggestion": feedback.get("suggestion", "")
        }
    except Exception as e:
        print(f"Error analyzing conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze conversation.")

# --- Test Generation Functions ---
def generate_company_test(company_name: str, role: str, test_type: str = "technical") -> Dict[str, Any]:
    """Generate a company-specific test based on the company and role."""
    prompt = f"""
You are an expert test creator for job interviews and assessments. Generate a comprehensive test for a candidate applying to {company_name} for the position of {role}.

Test Type: {test_type}

Create a test with 10 multiple-choice questions that are specifically tailored to:
1. {company_name}'s culture and values
2. Technical skills required for {role}
3. Industry knowledge relevant to {company_name}
4. Problem-solving scenarios specific to the role
5. Company-specific knowledge (products, services, history)

Return the test in the following JSON format:
{{
    "test_title": "Test title",
    "company": "{company_name}",
    "role": "{role}",
    "duration_minutes": 20,
    "total_questions": 10,
    "questions": [
        {{
            "id": 1,
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0,
            "explanation": "Why this is the correct answer",
            "category": "Technical/Culture/Industry/Problem-solving"
        }}
    ]
}}

Make sure the questions are:
- Realistic and relevant to the actual job
- Mix of technical and cultural fit questions
- Progressive difficulty (easier questions first)
- Include {company_name}-specific knowledge where appropriate
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
            
        return json.loads(response_text)
    except Exception as e:
        print(f"Error generating test: {e}")
        return {
            "error": "Failed to generate test",
            "test_title": f"{company_name} Assessment",
            "company": company_name,
            "role": role,
            "questions": []
        }

@app.post("/generateCompanyTest")
async def generate_company_test_endpoint(payload: Dict[str, Any] = Body(...)):
    """Generate a company-specific test."""
    company = payload.get("company", "").strip()
    role = payload.get("role", "").strip()
    test_type = payload.get("test_type", "technical")
    
    if not company or not role:
        raise HTTPException(status_code=400, detail="Company and role are required.")
    
    try:
        test_data = generate_company_test(company, role, test_type)
        return {
            "success": True,
            "test": test_data
        }
    except Exception as e:
        print(f"Error in generate_company_test_endpoint: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate test.")

@app.post("/submitTestAnswer")
async def submit_test_answer(payload: Dict[str, Any] = Body(...)):
    """Submit and evaluate a test answer."""
    test_id = payload.get("test_id")
    question_id = payload.get("question_id")
    selected_answer = payload.get("selected_answer")
    correct_answer = payload.get("correct_answer")
    
    if test_id is None or question_id is None or selected_answer is None:
        raise HTTPException(status_code=400, detail="test_id, question_id, and selected_answer are required.")
    
    is_correct = selected_answer == correct_answer
    
    return {
        "question_id": question_id,
        "is_correct": is_correct,
        "selected_answer": selected_answer,
        "correct_answer": correct_answer
    }

@app.post("/evaluateTestResults")
async def evaluate_test_results(payload: Dict[str, Any] = Body(...)):
    """Evaluate complete test results and provide feedback."""
    answers = payload.get("answers", [])
    company = payload.get("company", "")
    role = payload.get("role", "")
    
    if not answers:
        raise HTTPException(status_code=400, detail="Answers are required.")
    
    total_questions = len(answers)
    correct_answers = sum(1 for answer in answers if answer.get("is_correct", False))
    score_percentage = (correct_answers / total_questions) * 100 if total_questions > 0 else 0
    
    # Generate personalized feedback
    feedback_prompt = f"""
You are an expert career coach providing feedback on a test for {company} - {role} position.

Test Results:
- Total Questions: {total_questions}
- Correct Answers: {correct_answers}
- Score: {score_percentage:.1f}%

Provide encouraging and constructive feedback in the following JSON format:
{{
    "overall_performance": "Excellent/Good/Fair/Needs Improvement",
    "score_interpretation": "What this score means for their readiness",
    "strengths": ["Identified strengths based on correct answers"],
    "areas_for_improvement": ["Specific areas to focus on"],
    "recommendations": ["Actionable steps to improve"],
    "encouragement": "Motivational message for the candidate"
}}
"""
    
    try:
        response = model.generate_content(feedback_prompt)
        response_text = response.text.strip()
        
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
            
        feedback = json.loads(response_text)
    except:
        feedback = {
            "overall_performance": "Good" if score_percentage >= 70 else "Needs Improvement",
            "score_interpretation": f"You scored {score_percentage:.1f}% on this assessment.",
            "encouragement": "Keep practicing and learning!"
        }
    
    return {
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "score_percentage": score_percentage,
        "feedback": feedback
    }

@app.post("/getPreviousYearQuestions")
async def get_previous_year_questions(payload: Dict[str, Any] = Body(...)):
    """Get previous year interview questions for a specific company and role."""
    company = payload.get("company", "").strip()
    role = payload.get("role", "").strip()
    
    if not company or not role:
        raise HTTPException(status_code=400, detail="Company and role are required.")
    
    prompt = f"""
You are an expert in interview preparation and have access to comprehensive interview databases. 
Generate a collection of authentic previous year interview questions for {company} - {role} position.

Create realistic questions that were commonly asked in {company} interviews for {role} positions in recent years. 
Include various categories and provide correct/ideal answers.

Return the data in the following JSON format:
{{
    "company": "{company}",
    "role": "{role}", 
    "total_questions": 15,
    "questions": [
        {{
            "id": 1,
            "question": "Actual interview question text",
            "category": "Technical/Behavioral/System Design/Cultural Fit/Problem Solving",
            "difficulty": "Easy/Medium/Hard",
            "ideal_answer": "Comprehensive ideal answer or approach",
            "key_points": ["Important point 1", "Important point 2", "Important point 3"],
            "follow_up_questions": ["Possible follow-up question 1", "Possible follow-up question 2"],
            "year_range": "2022-2024"
        }}
    ]
}}

Make sure to include:
- Mix of technical and behavioral questions
- Company-specific questions about {company}'s products/services
- Role-specific technical questions for {role}
- System design questions (if applicable for {role})
- Questions about handling challenges and teamwork
- Cultural fit questions specific to {company}'s values
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
            
        questions_data = json.loads(response_text)
        
        return {
            "success": True,
            "questions": questions_data
        }
        
    except Exception as e:
        print(f"Error generating previous year questions: {e}")
        return {
            "success": False,
            "error": "Failed to fetch previous year questions",
            "questions": {
                "company": company,
                "role": role,
                "total_questions": 0,
                "questions": []
            }
        }

@app.post("/getProgrammingQuestions")
async def get_programming_questions(payload: Dict[str, Any] = Body(...)):
    """Get programming questions with optimal solutions for a specific company and role."""
    company = payload.get("company", "").strip()
    role = payload.get("role", "").strip()
    
    if not company or not role:
        raise HTTPException(status_code=400, detail="Company and role are required.")
    
    prompt = f"""
You are an expert programming interview coach with extensive knowledge of coding questions asked at top tech companies.
Generate programming questions that are commonly asked at {company} for {role} positions, with optimal solutions and practice links.

Create realistic programming questions with comprehensive solutions that include:
1. Problem statement
2. Multiple solution approaches (brute force and optimized)
3. Time and space complexity analysis
4. Links to similar problems on coding platforms
5. Follow-up questions

Return the data in the following JSON format:
{{
    "company": "{company}",
    "role": "{role}",
    "total_questions": 10,
    "questions": [
        {{
            "id": 1,
            "title": "Problem Title",
            "description": "Clear problem statement with examples",
            "difficulty": "Easy/Medium/Hard",
            "category": "Array/String/Tree/Graph/Dynamic Programming/etc",
            "input_format": "Description of input format",
            "output_format": "Description of expected output",
            "examples": [
                {{
                    "input": "Example input",
                    "output": "Example output",
                    "explanation": "Why this output"
                }}
            ],
            "brute_force_solution": {{
                "approach": "Explanation of brute force approach",
                "code": "def brute_force_solution():\n    # Python code here\n    pass",
                "time_complexity": "O(n^2)",
                "space_complexity": "O(1)"
            }},
            "optimal_solution": {{
                "approach": "Explanation of optimal approach",
                "code": "def optimal_solution():\n    # Optimized Python code here\n    pass",
                "time_complexity": "O(n)",
                "space_complexity": "O(1)"
            }},
            "practice_links": [
                {{
                    "platform": "LeetCode",
                    "problem_name": "Similar Problem Name",
                    "url": "https://leetcode.com/problems/problem-name",
                    "difficulty": "Medium"
                }},
                {{
                    "platform": "HackerRank",
                    "problem_name": "Related Problem",
                    "url": "https://hackerrank.com/challenges/problem",
                    "difficulty": "Medium"
                }}
            ],
            "follow_up_questions": [
                "What if the input size is very large?",
                "How would you handle duplicate values?"
            ],
            "company_frequency": "High/Medium/Low",
            "tags": ["array", "two-pointers", "sorting"]
        }}
    ]
}}

Focus on questions that are:
- Actually asked at {company} interviews
- Relevant to {role} position level
- Include data structures and algorithms commonly tested
- Have multiple solution approaches
- Include real practice platform links
"""

    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
            
        questions_data = json.loads(response_text)
        
        return {
            "success": True,
            "questions": questions_data
        }
        
    except Exception as e:
        print(f"Error generating programming questions: {e}")
        return {
            "success": False,
            "error": "Failed to fetch programming questions",
            "questions": {
                "company": company,
                "role": role,
                "total_questions": 0,
                "questions": []
            }
        }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"Starting Scholarship Server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)