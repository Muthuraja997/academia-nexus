import { NextResponse } from 'next/server';

// Predefined responses for common queries
const ASSISTANT_RESPONSES = {
  greetings: [
    "Hello! I'm your Academia Nexus AI assistant. How can I help you with your academic journey today?",
    "Hi there! Ready to explore new learning opportunities?",
    "Welcome! I'm here to help you with scholarships, career planning, and study resources."
  ],
  scholarships: [
    "I can help you find scholarships! What's your field of study or area of interest?",
    "Let me guide you through available scholarship opportunities. Are you looking for undergraduate or graduate programs?",
    "Scholarships are a great way to fund your education! Tell me about your academic background and interests."
  ],
  career: [
    "Career planning is exciting! What field are you interested in pursuing?",
    "I can help you explore different career paths. What are your strengths and interests?",
    "Let's discuss your career goals! Are you looking for guidance on a specific industry?"
  ],
  study: [
    "Study resources are essential for success! What subject do you need help with?",
    "I can recommend study materials and techniques. What's your current learning challenge?",
    "Effective studying is key to academic success. What topic would you like to focus on?"
  ],
  interviews: [
    "Interview preparation is crucial! Are you preparing for academic interviews or job interviews?",
    "I can help you practice common interview questions. What type of interview are you preparing for?",
    "Great choice focusing on interview prep! What specific areas would you like to work on?"
  ],
  communication: [
    "Communication skills are vital for success! Are you looking to improve written or verbal communication?",
    "I can help you practice professional communication. What specific scenario would you like to work on?",
    "Excellent focus on communication! What type of communication skills interest you most?"
  ]
};

const QUICK_SUGGESTIONS = [
  "Find scholarships for my major",
  "Help me plan my career path",
  "Recommend study resources",
  "Practice interview questions",
  "Improve communication skills",
  "What courses should I take?",
  "How to write a good resume?",
  "Tips for academic success"
];

function getRandomResponse(category) {
  const responses = ASSISTANT_RESPONSES[category];
  return responses[Math.floor(Math.random() * responses.length)];
}

function categorizeMessage(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return 'greetings';
  }
  if (lowerMessage.includes('scholarship') || lowerMessage.includes('funding') || lowerMessage.includes('grant')) {
    return 'scholarships';
  }
  if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('profession')) {
    return 'career';
  }
  if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('course')) {
    return 'study';
  }
  if (lowerMessage.includes('interview') || lowerMessage.includes('preparation') || lowerMessage.includes('practice')) {
    return 'interviews';
  }
  if (lowerMessage.includes('communication') || lowerMessage.includes('speaking') || lowerMessage.includes('writing')) {
    return 'communication';
  }
  
  return 'general';
}

function generateContextualResponse(message, history = []) {
  const category = categorizeMessage(message);
  
  if (category !== 'general') {
    return getRandomResponse(category);
  }
  
  // General intelligent responses
  const responses = [
    `That's an interesting question about "${message}". Let me help you explore this topic further. What specific aspect would you like to focus on?`,
    `I understand you're asking about "${message}". Could you provide more details so I can give you the most relevant guidance?`,
    `Great question! Based on your inquiry about "${message}", I'd recommend checking out our resources section. What would you like to know more about?`,
    `Thanks for reaching out about "${message}". I'm here to help! Could you tell me more about your current situation or goals?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function POST(request) {
  try {
    const { message, history = [] } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Generate contextual response
    const aiResponse = generateContextualResponse(message.trim(), history);
    
    // Add some suggestions based on the conversation
    const suggestions = QUICK_SUGGESTIONS
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return NextResponse.json({
      text: aiResponse,
      suggestions: suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
