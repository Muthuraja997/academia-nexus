import google.generativeai as genai
import requests
from bs4 import BeautifulSoup
import json
import os

# 🔑 Configure Gemini API
genai.configure(api_key="AIzaSyAvI5VvIAOfte5XU8r1mZJ_vIF5G8EyMUM")
model = genai.GenerativeModel(model_name="gemini-2.5-pro")

# ✅ Clean and fetch webpage
def fetch_clean_text_and_links(url, limit=30000):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Clean plain text
        text = soup.get_text(separator=' ', strip=True)[:limit]

        # Extract links related to scholarships
        links = []
        for a_tag in soup.find_all('a', href=True):
            link_text = a_tag.get_text(strip=True)
            href = a_tag['href']
            if link_text and ('scholarship' in link_text.lower() or 'apply' in link_text.lower()):
                full_url = requests.compat.urljoin(url, href)
                links.append({"text": link_text, "url": full_url})
        return text, links
    except Exception as e:
        print(f"[ERROR] Failed to fetch {url}:\n{e}")
        return "", []

# ✅ Gemini prompt to extract structured scholarship data
def extract_scholarship_json(text, links):
    prompt = f"""
You are a scholarship extraction bot.

From the given article text and links, extract a list of scholarships in JSON format:
[
  {{
    "name": "Scholarship Name",
    "eligibility": "Eligibility details",
    "target_group": "Girls/OBC/ST/SC/General",
    "funded_by": "Central Government / Private / State",
    "link": "Direct application or info link from the link list"
  }},
  ...
]

TEXT:
{text}

LINKS:
{links}
"""

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[ERROR] Gemini failed to generate:\n{e}")
        return ""

# ✅ Final agent function with JSON dump
def run_scholarship_agent(urls, output_file="scholarships_output.json"):
    final_results = []

    for url in urls:
        print(f"\n🔗 Fetching from: {url}")
        text, links = fetch_clean_text_and_links(url)
        if text:
            result_text = extract_scholarship_json(text, links)
            try:
                # Gemini sometimes adds ```json or extra info, handle it
                if "```json" in result_text:
                    result_text = result_text.split("```json")[1].split("```")[0].strip()
                scholarships = json.loads(result_text)
                final_results.extend(scholarships)
            except Exception as e:
                print(f"[WARNING] Couldn't parse Gemini JSON output for {url}:\n{e}")

    # ✅ Save to JSON file
    if final_results:
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(final_results, f, indent=2, ensure_ascii=False)
        print(f"\n✅ Saved {len(final_results)} scholarships to {output_file}")
    else:
        print("\n⚠️ No scholarship data extracted.")

# ✅ Scholarship source URLs
urls_to_check = [
    "https://www.buddy4study.com/article/scholarships-for-engineering-students",
    "https://www.buddy4study.com/scholarships/tamil-nadu",
    "https://www.buddy4study.com/article/scholarships-for-obc-students"
]


run_scholarship_agent(urls_to_check)
