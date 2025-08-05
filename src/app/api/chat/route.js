import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { message, history = [] } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' }, 
                { status: 400 }
            );
        }

        // Enhanced AI assistant response
        const aiResponse = await generateDynamicResponse(message, history);

        return NextResponse.json({ 
            text: aiResponse,
            timestamp: new Date().toISOString() 
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process message' }, 
            { status: 500 }
        );
    }
}

async function generateDynamicResponse(message, history) {
    // Check if the message is about scholarships
    const scholarshipKeywords = ['scholarship', 'financial aid', 'grant', 'funding', 'tuition', 'college money'];
    const isScholarshipRelated = scholarshipKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );

    // Check if the message is about career guidance
    const careerKeywords = ['career', 'job', 'internship', 'major', 'field of study', 'profession'];
    const isCareerRelated = careerKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );

    // Check if the message is about communication practice
    const commKeywords = ['interview', 'communication', 'speaking', 'presentation', 'practice'];
    const isCommRelated = commKeywords.some(keyword => 
        message.toLowerCase().includes(keyword)
    );

    // Dynamic responses based on context
    if (isScholarshipRelated) {
        return `I can help you find scholarships! 🎓 To get personalized recommendations, I'll need to know:

• Your current education level (high school, undergraduate, graduate)
• Your field of study or intended major
• Your GPA (if comfortable sharing)
• Any specific interests or achievements

You can also visit our Scholarships page where I can search through hundreds of verified opportunities for you. Would you like me to guide you there, or would you prefer to share some details here for quick suggestions?`;
    }

    if (isCareerRelated) {
        return `Great question about career planning! 🚀 I can assist you with:

• **Career Path Exploration** - Discover fields that match your interests and skills
• **Industry Insights** - Learn about job markets, salary expectations, and growth opportunities  
• **Skill Development** - Identify key skills needed for your target career
• **Academic Planning** - Choose the right major and courses for your goals

What specific aspect of career planning would you like to explore? Are you trying to choose a major, exploring job options, or planning your academic path?`;
    }

    if (isCommRelated) {
        return `I'd love to help you improve your communication skills! 🗣️ Our platform offers:

• **Mock Interviews** - Practice with AI-powered interview simulations
• **Speech Analysis** - Get feedback on clarity, confidence, and delivery
• **Communication Coaching** - Personalized tips for better verbal and written communication
• **Presentation Practice** - Build confidence for academic and professional presentations

Would you like to try a quick practice session, or would you prefer tips for a specific situation like job interviews, presentations, or general conversation skills?`;
    }

    // Check for greetings
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    if (greetings.some(greeting => message.toLowerCase().includes(greeting))) {
        return `Hello! Welcome to Academia Nexus AI! 👋 I'm your personal academic and career assistant. 

I can help you with:
🎓 **Scholarship Search** - Find personalized funding opportunities
🚀 **Career Guidance** - Explore career paths and plan your future  
🗣️ **Communication Practice** - Improve interview and presentation skills
📚 **Study Support** - Get academic guidance and resources

What would you like to explore today? Just ask me anything about your academic or career journey!`;
    }

    // Check for gratitude
    if (message.toLowerCase().includes('thank') || message.toLowerCase().includes('thanks')) {
        return `You're very welcome! 😊 I'm here whenever you need help with scholarships, career planning, or communication practice. 

Is there anything else I can assist you with today? Remember, I can provide personalized recommendations once I know more about your academic goals and interests!`;
    }

    // For general questions, provide a helpful response
    return `That's an interesting question! 🤔 I'm here to help you succeed academically and professionally. 

Based on what you're asking, I think you might be interested in:

• **Academic Planning** - Course selection, major guidance, and study strategies
• **Career Exploration** - Understanding different career paths and requirements
• **Financial Planning** - Scholarships, grants, and funding your education
• **Skill Development** - Communication, interview prep, and professional skills

Could you tell me a bit more about what you're looking for? I can provide much more specific and helpful guidance once I understand your particular situation and goals!

Feel free to ask about scholarships, career paths, communication practice, or any other academic topics! 🎯`;
}
