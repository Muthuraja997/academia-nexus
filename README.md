# 🎓 Academia Nexus: An AI-Powered Student Success Platform

This is a **Next.js** project bootstrapped with `create-next-app`. It is extended with a **Python Flask backend** to create a **full-stack, AI-driven student assistant platform**.

---

## 🚀 About The Project

**Academia Nexus** is a comprehensive web application designed to serve as an all-in-one assistant for college students. The platform integrates multiple **intelligent agents** to provide **personalized support** in academics, career planning, and skill development.

---

## ✨ Features

- 👤 **User Authentication**: Secure Register & Login pages.
- 📊 **Main Dashboard**: A central hub with deadlines and career predictions.
- ✍️ **Test Agent**: Take practice quizzes.
- 📈 **Career Path Agent**: Predictive agent suggesting career paths.
- 👔 **Interview Prep Agent**: Generates questions based on company and job role.
- 🎙️ **Communication Practice Agent**: Voice-based interview practice with AI feedback.
- 🧠 **Scholarship Agent**: Gemini-powered agent that scrapes and suggests scholarship opportunities.

---

## 🛠️ Tech Stack

| Category     | Technology                              |
|--------------|------------------------------------------|
| Frontend     | Next.js (React), Tailwind CSS           |
| Backend      | Python, Flask (API Server)              |
| AI / ML      | Google Gemini API                       |
| Web Scraping | BeautifulSoup, Requests                 |

---

## 🔑 Key Methodologies

> A core principle of this project is the use of a **Model Context Protocol (MCP)** to interact with the Gemini LLM. Instead of sending raw prompts, we structure rich context (like student profiles) to ensure **accurate and consistent JSON responses**.

---

## 🧑‍💻 Getting Started

To run the project locally, you need to start both the **frontend** and **backend** servers.

### ✅ Prerequisites

- Node.js (v18 or later)
- Python (v3.9 or later)
- Google Gemini API Key

---

## 🧩 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/academia-nexus.git
cd academia-nexus
```

### 2. Setup the Frontend (Terminal 1)
```bash
# Install dependencies
npm install

# Run development server
npm run dev
Then open http://localhost:3000 in your browser.
```
3. Setup the Backend (Terminal 2)
```bash
# Create and activate a virtual environment
python -m venv venv

# On Windows
.\venv\Scripts\activate

# Install backend dependencies
pip install Flask Flask-Cors google-generativeai requests beautifulsoup4

# Set your Google Gemini API key in intelligent_agent.py

# Run the Flask backend
python intelligent_agent.py
```

### 📚 Learn More
- Next.js Documentation – Features and APIs.

- Learn Next.js – Interactive tutorial.

### 🚀 Deployment
- The recommended way to deploy this app is using Vercel, the creators of Next.js.

- For detailed deployment steps, refer to the Next.js deployment documentation.
