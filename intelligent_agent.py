import json
from flask import Flask, request
from flask_cors import CORS
from langchain_community.tools import DuckDuckGoSearchRun
from bs4 import BeautifulSoup
import re

# --- The Agent's Core Logic (Upgraded) ---

def process_search_results_for_scholarships(search_results_html):
    """
    This is the NEW, SMARTER version of the parsing function.
    It's more robust and forgiving when analyzing messy HTML from search results.
    """
    soup = BeautifulSoup(search_results_html, 'html.parser')
    extracted_scholarships = []
    
    # 1. Find all potential titles first (headings are strong indicators).
    potential_titles = soup.find_all(['h3', 'h4', 'a'], string=re.compile(r'scholarship|grant|fellowship', re.IGNORECASE))

    print(f"Found {len(potential_titles)} potential scholarship titles.")

    for title_element in potential_titles:
        title_text = title_element.get_text(strip=True)
        
        # 2. Search the "neighborhood" of the title for more details.
        # We look at the parent container of the title to find related text.
        parent_container = title_element.find_parent()
        if not parent_container:
            continue
            
        container_text = parent_container.get_text(strip=True, separator='\n')

        # 3. Be more forgiving with our checks.
        # If the surrounding text has any relevant keywords, we'll consider it a match.
        keywords = ['eligibility', 'award', 'deadline', 'amount', 'apply by']
        if any(keyword in container_text.lower() for keyword in keywords):
            
            # Simple check to avoid adding duplicate entries.
            if not any(d['name'] == title_text for d in extracted_scholarships):
                print(f"Found a likely scholarship: {title_text}")
                extracted_scholarships.append({
                    "name": title_text,
                    "description": container_text,
                    "source": "Live Web Search"
                })

        # Limit to 5 results to keep the output clean and fast.
        if len(extracted_scholarships) >= 5:
            break
            
    return extracted_scholarships


def run_scholarship_agent(student_profile: dict):
    """
    This is the main agent function. It now takes a dictionary of student details,
    constructs a search query, and uses a search tool to find information.
    """
    print(f"Agent received profile: {student_profile}")
    
    # Construct a detailed, natural-language search query.
    query_parts = ["scholarships"]
    if student_profile.get("major"):
        query_parts.append(f"for {student_profile['major']} students")
    if student_profile.get("state"):
        query_parts.append(f"in {student_profile['state']}")
    if student_profile.get("income") == "low":
        query_parts.append("for low-income family")
    
    search_query = " ".join(query_parts)
    print(f"Agent is searching for: '{search_query}'")
    
    # Retrieval (RAG): Use the search tool.
    search_tool = DuckDuckGoSearchRun()
    raw_search_results = search_tool.run(search_query)
    
    print("Agent received raw search results.")
    
    # Augmentation & Generation (RAG): Process the results with our new, smarter parser.
    structured_scholarships = process_search_results_for_scholarships(raw_search_results)
    
    # Generate a dynamic summary.
    summary = f"Based on your profile, I found {len(structured_scholarships)} potential scholarships. I recommend you visit the official websites for detailed eligibility criteria as these are generated from a live web search."
    
    if not structured_scholarships:
        summary = f"I couldn't find specific scholarships for your profile ({search_query}) from a quick web search. However, you should check major portals like the National Scholarship Portal (NSP) and Buddy4Study for opportunities that may not have appeared in the search results."

    return {
        "summary": summary,
        "scholarships": structured_scholarships
    }


# --- The API Server (using Flask) ---
app = Flask(__name__)
CORS(app)

@app.route('/api/find-scholarships-by-details', methods=['POST'])
def find_scholarships_by_details_endpoint():
    """
    This is the API endpoint that our React frontend will call.
    """
    print("Received request at /api/find-scholarships-by-details")
    if not request.is_json:
        return {"error": "Request must be JSON"}, 400
        
    student_details = request.get_json()
    
    if not student_details:
        return {"error": "Missing student details in request body"}, 400
    
    try:
        agent_response = run_scholarship_agent(student_details)
        return agent_response
    except Exception as e:
        print(f"An error occurred in the agent: {e}")
        return {"error": "An internal error occurred while processing your request."}, 500

if __name__ == '__main__':
    app.run(port=5002, debug=True)
