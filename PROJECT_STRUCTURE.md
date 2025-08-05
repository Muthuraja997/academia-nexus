# Academia Nexus - Project Structure

## 📁 Project Overview
Academia Nexus is a comprehensive student career development platform built with Next.js frontend and Flask backend services, featuring AI-powered career guidance, scholarship discovery, and personalized learning analytics.

## 🏗️ Root Directory Structure

```
academia-nexus/
├── 📄 Configuration Files
├── 🗄️ Database Layer
├── 📱 Frontend Application (Next.js)
├── 🔧 Backend Services (Flask/Python)
├── 📚 Documentation
└── 🔒 Environment & Security
```

## 📄 Configuration Files

### Core Configuration
```
├── package.json                 # Node.js dependencies and scripts
├── package-lock.json           # Locked dependency versions
├── next.config.mjs             # Next.js configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── postcss.config.mjs          # PostCSS ES module config
├── eslint.config.mjs           # ESLint linting configuration
└── jsconfig.json               # JavaScript project configuration
```

### Environment Configuration
```
├── .env                        # Base environment variables
├── .env.local                  # Local development environment
├── .env.development           # Development-specific variables
├── .env.example               # Environment template
├── config.py                  # Python configuration management
└── security_config.py         # Security settings and keys
```

## 🗄️ Database Layer

### Database Management
```
database/
├── db.js                      # Main database connection (Node.js)
├── init.js                    # Database initialization script
├── mysql-config.js           # MySQL connection configuration
├── mysql-init.js            # MySQL setup and initialization
├── viewer.js                # Database viewer utilities
├── add-profile-columns.js   # Profile table migrations
└── MYSQL_SETUP.md          # Database setup instructions
```

### Database Operations
```
├── check_table_structure.js   # Table structure validation
├── check-all-users.js        # User data verification
├── check-users.js            # User existence checks
├── delete-user.js            # User deletion utilities
├── verify-deletion.js        # Deletion verification
├── fix_achievements_table.js  # Achievement table fixes
└── final_database_test.js    # Comprehensive database testing
```

## 📱 Frontend Application (Next.js)

### Application Structure
```
src/
├── app/                       # Next.js 14 App Router
│   ├── layout.js             # Root layout component
│   ├── page.js               # Home page
│   ├── globals.css           # Global CSS styles
│   │
│   ├── 🔐 Authentication
│   ├── 📊 Dashboard & Analytics
│   ├── 🎯 Career Development
│   ├── 💬 Communication & Learning
│   └── 🔗 API Routes
│
├── components/               # Reusable UI components
│   ├── common/              # Shared components
│   ├── dashboard/           # Dashboard-specific components
│   └── layout/              # Layout components
│
├── config/                  # Frontend configuration
├── contexts/                # React Context providers
├── hooks/                   # Custom React hooks
└── lib/                     # Utility libraries
```

### Authentication System
```
src/app/auth/
├── login/
│   └── page.js               # Login page
└── register/
    └── page.js               # Registration page

src/app/api/auth/
├── login/                    # Login API endpoint
├── register/                 # Registration API endpoint
└── logout/                   # Logout API endpoint
```

### Dashboard & Analytics
```
src/app/dashboard/
├── page.js                   # Main dashboard
├── enhanced_page.js         # Enhanced dashboard version
├── page_backup.js           # Dashboard backup
├── page_clean.js            # Clean dashboard version
└── page_original.js         # Original dashboard

src/components/dashboard/
├── CareerInsightsPanel.js   # Career insights widget
├── PersonalizedWelcome.js   # Welcome component
├── ProgressChart.js         # Progress visualization
├── StudyStreakCard.js       # Study streak display
├── WeeklyGoalsCard.js       # Weekly goals tracker
└── MotivationalInsights.js  # Motivational content
```

### Career Development
```
src/app/career-path/
└── page.js                   # Career path exploration with government jobs

src/app/interview-prep/
└── page.js                   # Interview preparation tools

src/app/scholarships/
└── page.js                   # Scholarship discovery
```

### Communication & Learning
```
src/app/communication-practice/
└── page.js                   # Communication skills practice

src/app/study/
└── page.js                   # Study materials and resources

src/app/profile/
└── page.js                   # User profile management

src/app/test/
└── page.js                   # Assessment and testing
```

### API Routes
```
src/app/api/
├── auth/                     # Authentication endpoints
├── career/                   # Career-related APIs
├── chat/                     # Chat and communication APIs
├── temp/                     # Temporary API endpoints
└── user/                     # User management APIs
```

### Shared Components
```
src/components/
├── common/
│   ├── Button.js            # Reusable button component
│   ├── Card.js              # Card UI component
│   ├── Charts.js            # Chart components
│   ├── Icons.js             # Icon components
│   └── UserHistory.js       # User activity history
│
└── layout/
    └── AppShell.js          # Main application shell
```

### Configuration & Utilities
```
src/config/
├── index.js                 # Main configuration export
└── configManager.js         # Configuration management

src/contexts/
├── AuthContext.js           # Authentication context
└── DataContext.js           # Data management context

src/hooks/
├── useActivityLogger.js     # Activity logging hook
└── useDashboardAnalytics.js # Dashboard analytics hook

src/lib/
└── auth.js                  # Authentication utilities
```

## 🔧 Backend Services (Flask/Python)

### Analytics & Dashboard API
```
├── simplified_dashboard_api.py    # Main dashboard analytics service
├── dashboard_analytics_api.py     # Advanced analytics API
└── dashboard_mcp_server.js       # Dashboard MCP server
```

### AI & Study Services
```
├── study_mcp_server.py           # Study management server
├── study_mcp_http_server.py      # HTTP study server
├── unified_study_server.py       # Unified study service
├── setup_gemini_study.py         # Gemini AI integration
└── intelligent_agent.py          # AI agent functionality
```

### Scholarship & Career Services
```
├── scholarship_mcp_server.py     # Scholarship discovery service
└── setup_mcp_dashboard.py        # MCP dashboard setup
```

### Setup & Utilities
```
├── setup.py                      # Python package setup
└── test_user_with_data.js        # User data testing
```

## 📚 Documentation

### Setup Guides
```
docs/
├── database-schema.md            # Database schema documentation
├── er-diagram-ascii.txt         # Entity relationship diagram
└── er-diagram.svg               # Visual ER diagram
```

### Implementation Guides
```
├── CONFIGURATION_GUIDE.md        # Configuration setup guide
├── DYNAMIC_CONFIGURATION_COMPLETE.md # Dynamic config completion
├── ENV_CONFIGURATION_COMPLETE.md # Environment setup completion
├── ENV_SETUP.md                  # Environment setup instructions
├── FIXES_COMPLETED.md            # Completed fixes documentation
├── GOVERNMENT_JOBS_IMPLEMENTATION.md # Government jobs feature
├── MCP_IMPLEMENTATION_SUCCESS.md # MCP implementation guide
├── NODE_SCRIPT_FIX.md           # Node.js script fixes
├── STUDY_AI_SETUP_COMPLETE.md   # AI study setup completion
└── STUDY_CHAT_IMPLEMENTATION.md # Study chat implementation
```

## 🔒 Security & Environment

### Version Control
```
├── .git/                        # Git repository
├── .gitignore                   # Git ignore rules
└── .vscode/                     # VS Code settings
```

### Build & Dependencies
```
├── .next/                       # Next.js build output
├── node_modules/                # Node.js dependencies
├── venv/                        # Python virtual environment
└── __pycache__/                 # Python bytecode cache
```

### Static Assets
```
public/
├── file.svg                     # File icon
├── globe.svg                    # Globe icon
├── next.svg                     # Next.js logo
├── scholarships_output.json     # Scholarship data
├── vercel.svg                   # Vercel logo
└── window.svg                   # Window icon
```

## 🚀 Key Features by Directory

### 🎯 Career Development (`/career-path`)
- **Government Jobs Integration**: Real USAJOBS.gov API integration
- **Profile-based Matching**: Personalized job recommendations
- **Application Tracking**: Direct links to government job applications

### 📊 Dashboard Analytics (`/dashboard`)
- **Personalized Insights**: AI-powered learning analytics
- **Progress Tracking**: Study streaks and performance metrics
- **Goal Setting**: Weekly goals and achievement tracking

### 💡 Study & Learning (`/study`)
- **AI-powered Study Chat**: Gemini AI integration for study assistance
- **Adaptive Learning**: Personalized learning paths
- **Progress Analytics**: Learning pattern analysis

### 🎓 Scholarship Discovery (`/scholarships`)
- **Real-time Search**: Live scholarship database integration
- **Eligibility Matching**: Profile-based scholarship recommendations
- **Application Tracking**: Scholarship application management

### 💬 Communication Practice (`/communication-practice`)
- **Mock Interviews**: AI-powered interview simulation
- **Feedback System**: Performance analysis and improvement suggestions
- **Confidence Building**: Progressive skill development

## 🔧 Development Workflow

### Local Development
1. **Frontend**: `npm run dev` (localhost:3000)
2. **Dashboard API**: `python simplified_dashboard_api.py` (localhost:8082)
3. **Study Server**: `python study_mcp_http_server.py` (localhost:8081)

### Environment Configuration
- **Dynamic Config**: 32+ environment variables
- **Database**: MySQL with PyMySQL connector
- **Security**: Encrypted configuration and secure API keys

### Testing Structure
- **Database Tests**: `final_database_test.js`
- **User Testing**: `test_user_with_data.js`
- **Registration**: `test-registration.js`

## 📈 Architecture Highlights

### Frontend (Next.js 14)
- **App Router**: Modern Next.js routing system
- **Server Components**: Optimized rendering
- **Tailwind CSS**: Utility-first styling
- **Dynamic Configuration**: Environment-based configuration

### Backend (Flask + Python)
- **Microservices Architecture**: Separate services for different features
- **PyMySQL Integration**: Reliable database connectivity
- **AI Integration**: Gemini AI for intelligent features
- **RESTful APIs**: Clean API design

### Database (MySQL)
- **Normalized Schema**: Efficient data structure
- **User Profiles**: Comprehensive user data
- **Activity Tracking**: Detailed learning analytics
- **Test Results**: Performance tracking

This structure provides a comprehensive overview of your Academia Nexus project, making it easy to understand the organization and purpose of each component.
