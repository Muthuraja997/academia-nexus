# MCP Server Architecture & Connections
## Academia Nexus - Model Context Protocol Integration

### 📋 Overview
This document illustrates the MCP (Model Context Protocol) server architecture in Academia Nexus, showing how different servers connect and communicate to provide intelligent features across the platform.

---

## 🏗️ MCP Server Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ACADEMIA NEXUS PLATFORM                          │
│                         (Next.js Frontend - Port 3000)                     │
└─────────────────────┬───────────────────────────────────────────────────────┘
                      │
                      │ HTTP/REST API Calls
                      │
┌─────────────────────▼───────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │   Dashboard API │  │   Career API    │  │      Study Chat API         │ │
│  │   (Port 8082)   │  │  (Integrated)   │  │     (Port 8081)             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────┬───────────────────────┬───────────────────────────────┘
                      │                       │
                      │                       │
┌─────────────────────▼───────────────────────▼───────────────────────────────┐
│                         MCP SERVER LAYER                                   │
│                                                                             │
│  ┌───────────────────┐    ┌─────────────────┐    ┌─────────────────────┐   │
│  │   STUDY MCP       │    │ SCHOLARSHIP MCP │    │   DASHBOARD MCP     │   │
│  │   SERVER          │    │    SERVER       │    │    (Replaced)       │   │
│  │                   │    │                 │    │                     │   │
│  │ ┌───────────────┐ │    │ ┌─────────────┐ │    │ Status: Deprecated  │   │
│  │ │  Gemini AI    │ │    │ │ Web Scraper │ │    │                     │   │
│  │ │  Integration  │ │    │ │ & Matcher   │ │    │ Replaced by:        │   │
│  │ └───────────────┘ │    │ └─────────────┘ │    │ Direct PyMySQL API  │   │
│  │                   │    │                 │    │                     │   │
│  │ Port: 8081        │    │ Port: 8083      │    │                     │   │
│  │ Protocol: HTTP    │    │ Protocol: HTTP  │    │                     │   │
│  └───────────────────┘    └─────────────────┘    └─────────────────────┘   │
└─────────────────────┬───────────────────────┬───────────────────────────────┘
                      │                       │
                      │                       │
┌─────────────────────▼───────────────────────▼───────────────────────────────┐
│                        DATA & AI LAYER                                     │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │    MySQL DB     │  │   Gemini AI     │  │      External APIs          │ │
│  │                 │  │    (Vertex)     │  │                             │ │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────┐ ┌─────────────┐ │ │
│  │ │   Users     │ │  │ │ Study Chat  │ │  │ │USAJOBS  │ │ Scholarship │ │ │
│  │ │ Activities  │ │  │ │ Assistant   │ │  │ │   API   │ │   Sources   │ │ │
│  │ │ Test Results│ │  │ │ Content Gen │ │  │ │         │ │             │ │ │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────┘ └─────────────┘ │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 Server Connection Details

### 1. **Study MCP HTTP Server** (Port 8081)
```yaml
Service: Study Assistant with AI Integration
Protocol: HTTP REST API
Status: ✅ Active
AI Engine: Google Gemini Pro 2.5

Connections:
├── Frontend (Next.js) ──────→ HTTP Requests
├── Gemini AI API ──────────→ Direct Integration
└── Fallback Knowledge Base → Local Data Store

Endpoints:
├── GET /health ────────────→ Health Check
├── POST /study/chat ──────→ AI Chat Interface
├── GET /study/topics ─────→ Topic Suggestions
└── POST /study/explain ───→ Concept Explanations
```

### 2. **Scholarship MCP Server** (Port 8083)
```yaml
Service: Scholarship Discovery & Matching
Protocol: HTTP REST API
Status: ✅ Active
AI Engine: Google Gemini Pro 2.5

Connections:
├── Frontend (Next.js) ──────→ HTTP Requests
├── Gemini AI API ──────────→ Content Analysis
├── Web Scrapers ───────────→ Real-time Data
└── External APIs ──────────→ Scholarship Sources

Endpoints:
├── GET /health ────────────→ Health Check
├── POST /scholarships/search → Scholarship Search
├── GET /scholarships/match ──→ Profile Matching
└── GET /docs ──────────────→ API Documentation
```

### 3. **Dashboard Analytics API** (Port 8082)
```yaml
Service: User Analytics & Insights
Protocol: HTTP REST API (Direct MySQL)
Status: ✅ Active (Replaced MCP with Direct DB)
Database: PyMySQL Direct Connection

Connections:
├── Frontend (Next.js) ──────→ HTTP Requests
├── MySQL Database ─────────→ Direct PyMySQL Connection
└── Analytics Engine ───────→ Insight Generation

Endpoints:
├── GET /health ────────────────────→ Health Check
├── GET /api/dashboard/insights/{id} → User Insights
├── GET /api/dashboard/patterns/{id} → Learning Patterns
└── GET /api/dashboard/analysis/{id} → Complete Analysis
```

---

## 🔄 Data Flow Architecture

### **Request Flow Diagram**
```
User Action (Frontend)
        │
        ▼
┌───────────────┐    HTTP/REST     ┌─────────────────┐
│   Next.js     │ ────────────────→│   API Gateway   │
│  (Port 3000)  │                  │   (Routes)      │
└───────────────┘                  └─────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
        ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │  Dashboard API  │    │   Study MCP     │    │ Scholarship MCP │
        │  (Port 8082)    │    │  (Port 8081)    │    │  (Port 8083)    │
        └─────────────────┘    └─────────────────┘    └─────────────────┘
                │                      │                      │
                ▼                      ▼                      ▼
        ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │   MySQL DB      │    │   Gemini AI     │    │  External APIs  │
        │   (PyMySQL)     │    │   (Vertex)      │    │  + Web Scraping │
        └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🌐 Communication Protocols

### **HTTP REST Communication**
```javascript
// Frontend to MCP Servers
const studyResponse = await fetch('http://localhost:8081/study/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Explain quantum physics' })
});

const dashboardData = await fetch('http://localhost:8082/api/dashboard/insights/8', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
});

const scholarships = await fetch('http://localhost:8083/scholarships/search', {
    method: 'POST',
    body: JSON.stringify({ profile: userProfile })
});
```

### **MCP Protocol Integration** (Previous Architecture)
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "analyze_user_progress",
    "arguments": {
      "user_id": 8,
      "time_range": "month"
    }
  }
}
```

---

## 🔐 Security & Authentication

### **Authentication Flow**
```
┌─────────────┐    JWT Token    ┌─────────────────┐    Verify Token    ┌─────────────────┐
│   Frontend  │ ──────────────→ │   API Gateway   │ ─────────────────→ │   Auth Service  │
│   (React)   │                 │   (Next.js)     │                    │   (Integrated)  │
└─────────────┘                 └─────────────────┘                    └─────────────────┘
                                         │                                       │
                                         ▼                                       ▼
                                ┌─────────────────┐                    ┌─────────────────┐
                                │   MCP Servers   │                    │   User Session  │
                                │  (Authorized)   │                    │   Management    │
                                └─────────────────┘                    └─────────────────┘
```

---

## 📊 Server Status & Monitoring

### **Current Server Status**
| Server | Port | Status | Protocol | AI Integration | Database |
|--------|------|--------|----------|----------------|-----------|
| Next.js Frontend | 3000 | ✅ Running | HTTP | - | - |
| Dashboard Analytics | 8082 | ✅ Running | HTTP/REST | - | PyMySQL Direct |
| Study MCP Server | 8081 | ✅ Running | HTTP/REST | Gemini AI | Fallback KB |
| Scholarship MCP | 8083 | ✅ Running | HTTP/REST | Gemini AI | External APIs |

### **Health Check Endpoints**
```bash
# Dashboard API Health
curl http://localhost:8082/health

# Study MCP Health  
curl http://localhost:8081/health

# Scholarship MCP Health
curl http://localhost:8083/health

# Next.js Frontend
curl http://localhost:3000
```

---

## 🔧 Configuration Management

### **Environment Variables**
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=academia_nexus

# AI Integration
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro

# Server Ports
NEXT_PORT=3000
DASHBOARD_PORT=8082
STUDY_PORT=8081
SCHOLARSHIP_PORT=8083
```

### **Dynamic Configuration System**
```javascript
// src/config/index.js
export const SERVER_CONFIG = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    DASHBOARD_API_URL: process.env.DASHBOARD_API_URL || 'http://localhost:8082',
    STUDY_API_URL: process.env.STUDY_API_URL || 'http://localhost:8081',
    SCHOLARSHIP_API_URL: process.env.SCHOLARSHIP_API_URL || 'http://localhost:8083'
};
```

---

## 🚀 Deployment Architecture

### **Development Environment**
```
localhost:3000  ← Next.js Frontend
localhost:8082  ← Dashboard Analytics API (Flask + PyMySQL)
localhost:8081  ← Study MCP Server (FastAPI + Gemini)
localhost:8083  ← Scholarship MCP Server (FastAPI + Gemini)
```

### **Production Considerations**
```
Frontend:        Vercel/Netlify Deployment
Dashboard API:   Docker Container + Cloud SQL
Study MCP:       Docker Container + Vertex AI
Scholarship MCP: Docker Container + Cloud Functions
Database:        MySQL Cloud Instance
```

---

## 📈 Performance & Scalability

### **Load Balancing Strategy**
```
┌─────────────┐    Load Balancer    ┌─────────────────┐
│   Users     │ ─────────────────→  │   API Gateway   │
│ (Multiple)  │                     │   (Next.js)     │
└─────────────┘                     └─────────────────┘
                                            │
                                            ▼
                                    ┌───────────────────┐
                                    │  MCP Server Pool  │
                                    │ ┌───┐ ┌───┐ ┌───┐ │
                                    │ │S1 │ │S2 │ │S3 │ │
                                    │ └───┘ └───┘ └───┘ │
                                    └───────────────────┘
```

### **Caching Strategy**
```yaml
Level 1: Browser Cache (Static Assets)
Level 2: Next.js Cache (API Responses)
Level 3: Redis Cache (Database Queries)
Level 4: Database Query Cache (MySQL)
```

---

## 🔍 Troubleshooting Guide

### **Common Connection Issues**
```bash
# Port Conflicts
netstat -an | findstr :8081
netstat -an | findstr :8082
netstat -an | findstr :8083

# Service Health Checks
curl -f http://localhost:8081/health || echo "Study MCP Down"
curl -f http://localhost:8082/health || echo "Dashboard API Down"  
curl -f http://localhost:8083/health || echo "Scholarship MCP Down"

# Database Connectivity
python -c "import pymysql; print('PyMySQL Available')"
```

### **Log Monitoring**
```bash
# Study MCP Logs
tail -f study_mcp_server.log

# Dashboard API Logs  
tail -f dashboard_api.log

# Next.js Development Logs
npm run dev --verbose
```

---

## 🎯 Future Enhancements

### **Planned Improvements**
1. **WebSocket Integration**: Real-time communication between MCP servers
2. **Event-Driven Architecture**: Message queues for async processing
3. **Microservices Mesh**: Service discovery and circuit breakers
4. **AI Model Switching**: Dynamic model selection based on load
5. **Analytics Dashboard**: Real-time monitoring of MCP server performance

### **Scalability Roadmap**
```
Phase 1: Current HTTP/REST Architecture ✅
Phase 2: WebSocket + Real-time Updates
Phase 3: Message Queue Integration  
Phase 4: Kubernetes Orchestration
Phase 5: Multi-Region Deployment
```

---

*This documentation reflects the current MCP server architecture as of August 2025. For updates and changes, please refer to the project repository.*
