# 🎓 Academia Nexus: AI-Powered Student Success Platform

A comprehensive **Next.js** application with **Python Flask backend** that serves as an intelligent assistant platform for college students, featuring AI-powered career guidance, interview preparation, scholarship discovery, and personalized learning analytics.

---

## 🚀 About The Project

**Academia Nexus** is a full-stack web application designed to empower college students with AI-driven tools for academic success and career development. The platform integrates multiple intelligent agents, data persistence, and personalized recommendations to provide a holistic student support experience.

### 🌟 Core Philosophy
Built on the **Model Context Protocol (MCP)** architecture, Academia Nexus structures rich contextual data to ensure accurate and consistent AI responses, moving beyond simple prompt-based interactions to intelligent, context-aware assistance.

---

## ✨ Key Features

### � **Authentication & User Management**
- **Secure JWT-based authentication** with session management
- User registration with comprehensive profile creation
- Protected routes and persistent login sessions
- Role-based access control

### 📊 **Intelligent Dashboard**
- **Real-time analytics** with interactive charts and visualizations
- Activity tracking with learning streak calculations
- Personalized career insights and recommendations
- Achievement system with progress tracking
- Data persistence across sessions with localStorage integration

### 🧪 **Advanced Test Agent**
- **AI-generated practice tests** tailored to specific companies and roles
- Comprehensive scoring system with detailed feedback
- **Persistent test results** that remain until manually deleted
- Individual test result management with delete functionality
- Progress tracking and performance analytics

### � **Career Path Intelligence**
- **AI-powered career prediction** based on user activities and preferences
- Industry trend analysis and job market insights
- Skill gap identification and learning recommendations
- Career trajectory mapping with milestone tracking

### 🎯 **Interview Preparation Suite**
- **Company-specific question generation** for targeted interview prep
- **Previous year questions** with detailed answers and explanations
- **Programming questions** with complete solutions and complexity analysis
- **Persistent question storage** - questions remain visible until deleted
- Individual question set management with metadata tracking
- Practice link integration with coding platforms

### 🎙️ **Communication Practice Agent**
- **Voice-based interview simulation** with AI feedback using Web Speech API
- **Real-time conversation analysis** and improvement suggestions
- **Speech-triggered flower animations** for enhanced user engagement
- **Text-to-speech AI responses** with voice selection
- **Session-based practice** with timed conversations (5-minute sessions)
- **Comprehensive feedback system** with detailed scoring
- **Persistent feedback storage** - all practice sessions saved locally
- **Individual session management** with delete functionality
- **Responsive design** with overflow-safe animations
- **Accessibility features** including keyboard navigation and screen reader support

### 🎓 **Scholarship Discovery Engine**
- **AI-powered scholarship matching** using Google Gemini
- Automated web scraping for real-time opportunities
- Personalized recommendations based on user profile
- Application deadline tracking and reminders

### � **Data Persistence & Management**
- **Comprehensive localStorage integration** for offline capability
- User-specific data isolation and security
- Individual item deletion without affecting other data
- Cross-browser session synchronization
- Activity logging with infinite loop prevention

---

## 🛠️ Technical Architecture

### **Frontend Stack**
| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React framework with App Router | 14.2.30 |
| **React** | UI library with Context API | Latest |
| **Tailwind CSS** | Utility-first styling with PostCSS | Latest |
| **Chart.js** | Data visualization | Custom components |
| **Web Speech API** | Voice recognition and synthesis | Native browser API |
| **CSS Animations** | Keyframe animations for interactive elements | CSS3 |

### **Backend Stack**
| Technology | Purpose | Features |
|------------|---------|----------|
| **Python Flask** | AI API server | RESTful endpoints |
| **MySQL** | Database | User data, activities, test results |
| **JWT** | Authentication | Token-based security |
| **Google Gemini API** | AI intelligence | Advanced language model |
| **MCP Servers** | Modular AI services | Scholarship and study servers |
| **Speech Processing** | Voice interaction | Real-time speech recognition |

### **Data Flow Architecture**
- **Context Providers**: AuthContext, DataContext for state management
- **API Routes**: Secure, authenticated endpoints with middleware
- **Database Schema**: Normalized tables for users, activities, test results
- **Client-Side Storage**: localStorage with database synchronization

---

## 🚦 Getting Started

### **Prerequisites**
- Node.js (v18 or later)
- Python (v3.9 or later)
- MySQL Server (v8.0 or later)
- Google Gemini API Key

### **Installation Steps**

#### 1. **Clone Repository**
```bash
git clone https://github.com/Muthuraja997/academia-nexus.git
cd academia-nexus
```

#### 2. **Frontend Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
<<<<<<< HEAD
*Application will be available at `http://localhost:3000`*

#### 3. **Backend Setup**
=======
### 3. Setup the Backend (Terminal 2)
>>>>>>> ae67b5ce755513a4880aa13a7941d3a311249724
```bash
# Create virtual environment
python -m venv venv

# Activate environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install Flask Flask-Cors google-generativeai requests beautifulsoup4 sqlite3

# Configure API key in intelligent_agent.py
export GEMINI_API_KEY="your-api-key-here"

# Start main Flask server
python intelligent_agent.py

# In separate terminals, start MCP servers:
python scholarship_mcp_server.py
python study_mcp_http_server.py --port 8081
```
*Backend will run on `http://localhost:8080`*
*MCP servers will run on ports 8080 and 8081*

#### 4. **Database Setup**
```bash
# Configure MySQL credentials in .env.local
# See database/MYSQL_SETUP.md for detailed instructions

# Initialize MySQL database
npm run db:init
```

---

## 🏗️ Project Structure

```
academia-nexus/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── api/                      # API routes with authentication
│   │   ├── auth/                     # Authentication pages
│   │   ├── dashboard/                # Main dashboard
│   │   ├── interview-prep/           # Interview preparation
│   │   ├── career-path/              # Career guidance
│   │   ├── communication-practice/   # Voice-based communication practice
│   │   ├── scholarships/             # Scholarship finder
│   │   └── tests/                    # Test agent
│   ├── components/                   # Reusable React components
│   │   ├── common/                   # Shared components
│   │   └── layout/                   # Layout components
│   ├── contexts/                     # React Context providers
│   │   ├── AuthContext.js            # Authentication state
│   │   └── DataContext.js            # Data management
│   └── lib/                          # Utility functions
├── database/                         # Database configuration
├── intelligent_agent.py             # Python Flask backend
├── scholarship_mcp_server.py        # MCP scholarship server
├── study_mcp_http_server.py         # Study assistance MCP server
├── unified_study_server.py          # Unified study server
└── public/                           # Static assets
```

---

## 🆕 Recent Updates & Features

### **Communication Practice Enhancements** (Latest)
- ✨ **Speech-triggered flower animations** - Beautiful floating flowers appear when users speak
- 🔧 **Overflow fixes** - All animations now stay within viewport boundaries
- 🎯 **Improved positioning** - Flowers use percentage-based responsive positioning
- 🎨 **Enhanced CSS animations** - Optimized keyframes with proper constraints
- 🔊 **Voice synthesis improvements** - Better AI voice selection and controls
- 📱 **Mobile responsiveness** - Touch-friendly interface with gesture support

### **Technical Improvements**
- 🛡️ **CSS validation** - Fixed Tailwind CSS unknown at-rule warnings
- 🚀 **Performance optimization** - Reduced animation computation overhead
- 🎮 **Interactive elements** - Debug panel removal for cleaner UI
- 🔒 **Security enhancements** - Proper CORS and API endpoint protection

### **Developer Experience**
- 📝 **Comprehensive logging** - Enhanced debugging capabilities
- 🧪 **Testing utilities** - Manual flower generation for testing
- 🔧 **VS Code integration** - Custom settings for Tailwind CSS support
- 📚 **Documentation updates** - Complete feature documentation

---

## � Key Features Deep Dive

### **Persistent Data Management**
- ✅ All user data persists across browser sessions
- ✅ Individual deletion of test results, questions, and activities  
- ✅ Automatic data synchronization between localStorage and database
- ✅ User-specific data isolation for privacy and security

### **AI-Powered Intelligence**
- ✅ Context-aware responses using Model Context Protocol
- ✅ Company-specific interview questions with detailed solutions
- ✅ Career path predictions based on activity patterns
- ✅ Personalized scholarship matching and recommendations

### **Enhanced User Experience**
- ✅ Responsive design with dark mode support
- ✅ Real-time data visualization with interactive charts
- ✅ Progressive loading states and error handling
- ✅ Keyboard shortcuts and accessibility features
- ✅ **Speech-triggered visual animations** with flower effects
- ✅ **Overflow-safe CSS animations** that stay within viewport
- ✅ **Voice interaction capabilities** with speech recognition
- ✅ **Cross-browser compatibility** with fallback support

---

## 🚀 Deployment

### **Recommended Deployment**
- **Frontend**: [Vercel](https://vercel.com) (optimized for Next.js)
- **Backend**: [Heroku](https://heroku.com) or [Railway](https://railway.app)
- **Database**: SQLite (development) → PostgreSQL (production)

### **Environment Variables**
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080
JWT_SECRET=your-jwt-secret

# Backend
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=your-database-url
```

---

## 📚 API Documentation

### **Authentication Endpoints**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout

### **User Data Endpoints**
- `GET /api/user/dashboard` - Dashboard data
- `POST /api/user/activity` - Log user activity
- `GET /api/user/profile` - User profile

### **AI Agent Endpoints**
- `POST /getPreviousYearQuestions` - Interview questions
- `POST /getProgrammingQuestions` - Coding challenges
- `POST /getScholarships` - Scholarship opportunities
- `POST /startCommunicationSession` - Start voice practice session
- `POST /sendMessage` - Send message in communication session
- `POST /endCommunicationSession` - End session and get feedback

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini API** for AI capabilities
- **Next.js team** for the excellent framework
- **Vercel** for deployment platform
- **Web Speech API** for voice interaction capabilities
- **Tailwind CSS** for utility-first styling
- **Open source community** for inspiration and tools
- **CSS3 Animation** specifications for smooth visual effects

---

**Built with ❤️ by [Muthuraja997](https://github.com/Muthuraja997)**

*Empowering students with AI-driven success tools and immersive learning experiences*
