import { NextResponse } from 'next/server';

// Learning resources API based on career path and skill gaps
export async function POST(request) {
    try {
        const { career, missingSkills, userLevel } = await request.json();
        
        const resources = generateLearningResources(career, missingSkills, userLevel);
        
        return NextResponse.json({
            success: true,
            career,
            resources,
            generatedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Learning resources error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate learning resources' },
            { status: 500 }
        );
    }
}

function generateLearningResources(career, missingSkills, userLevel = 'beginner') {
    const skillResources = {
        'python': {
            beginner: [
                { title: 'Python for Everybody (Coursera)', type: 'course', duration: '8 weeks', provider: 'University of Michigan' },
                { title: 'Automate the Boring Stuff with Python', type: 'book', duration: 'Self-paced', provider: 'Al Sweigart' },
                { title: 'Python.org Tutorial', type: 'tutorial', duration: '2-3 weeks', provider: 'Python Foundation' }
            ],
            intermediate: [
                { title: 'Python for Data Science (edX)', type: 'course', duration: '6 weeks', provider: 'IBM' },
                { title: 'Effective Python', type: 'book', duration: 'Self-paced', provider: 'Brett Slatkin' },
                { title: 'Real Python', type: 'platform', duration: 'Ongoing', provider: 'Real Python Team' }
            ]
        },
        'sql': {
            beginner: [
                { title: 'SQL for Data Science (Coursera)', type: 'course', duration: '4 weeks', provider: 'UC Davis' },
                { title: 'W3Schools SQL Tutorial', type: 'tutorial', duration: '1-2 weeks', provider: 'W3Schools' },
                { title: 'SQLBolt', type: 'interactive', duration: '1 week', provider: 'SQLBolt' }
            ],
            intermediate: [
                { title: 'Advanced SQL (DataCamp)', type: 'course', duration: '4 weeks', provider: 'DataCamp' },
                { title: 'SQL Performance Explained', type: 'book', duration: 'Self-paced', provider: 'Markus Winand' }
            ]
        },
        'machine learning': {
            beginner: [
                { title: 'Machine Learning (Coursera)', type: 'course', duration: '11 weeks', provider: 'Stanford University' },
                { title: 'Hands-On Machine Learning', type: 'book', duration: 'Self-paced', provider: 'Aurélien Géron' },
                { title: 'Kaggle Learn ML', type: 'course', duration: '2-3 weeks', provider: 'Kaggle' }
            ],
            intermediate: [
                { title: 'Deep Learning Specialization', type: 'specialization', duration: '4 months', provider: 'DeepLearning.AI' },
                { title: 'Applied Machine Learning in Python', type: 'course', duration: '5 weeks', provider: 'University of Michigan' }
            ]
        },
        'data analysis': {
            beginner: [
                { title: 'Data Analysis with Python', type: 'course', duration: '5 weeks', provider: 'FreeCodeCamp' },
                { title: 'Pandas Documentation', type: 'tutorial', duration: '2-3 weeks', provider: 'Pandas Team' },
                { title: 'Python for Data Analysis', type: 'book', duration: 'Self-paced', provider: 'Wes McKinney' }
            ],
            intermediate: [
                { title: 'Advanced Pandas Techniques', type: 'course', duration: '3 weeks', provider: 'DataCamp' },
                { title: 'Statistical Analysis with Python', type: 'course', duration: '6 weeks', provider: 'Coursera' }
            ]
        },
        'statistics': {
            beginner: [
                { title: 'Introduction to Statistics', type: 'course', duration: '8 weeks', provider: 'Khan Academy' },
                { title: 'Think Stats', type: 'book', duration: 'Self-paced', provider: 'Allen Downey' },
                { title: 'Statistics for Data Science', type: 'course', duration: '4 weeks', provider: 'edX' }
            ],
            intermediate: [
                { title: 'Statistical Inference', type: 'course', duration: '6 weeks', provider: 'Johns Hopkins' },
                { title: 'Bayesian Statistics', type: 'course', duration: '8 weeks', provider: 'Duke University' }
            ]
        },
        'programming': {
            beginner: [
                { title: 'CS50 Introduction to Computer Science', type: 'course', duration: '12 weeks', provider: 'Harvard' },
                { title: 'FreeCodeCamp', type: 'platform', duration: 'Self-paced', provider: 'FreeCodeCamp' },
                { title: 'The Odin Project', type: 'curriculum', duration: '6-12 months', provider: 'The Odin Project' }
            ],
            intermediate: [
                { title: 'Algorithms Specialization', type: 'specialization', duration: '4 months', provider: 'Stanford' },
                { title: 'System Design Interview', type: 'book', duration: 'Self-paced', provider: 'Alex Xu' }
            ]
        },
        'communication': {
            beginner: [
                { title: 'Presentation Skills', type: 'course', duration: '3 weeks', provider: 'Coursera' },
                { title: 'Toastmasters International', type: 'organization', duration: 'Ongoing', provider: 'Toastmasters' },
                { title: 'TED Talks Public Speaking', type: 'course', duration: '4 weeks', provider: 'TED' }
            ],
            intermediate: [
                { title: 'Executive Communication', type: 'course', duration: '5 weeks', provider: 'Wharton' },
                { title: 'Crucial Conversations', type: 'book', duration: 'Self-paced', provider: 'Kerry Patterson' }
            ]
        },
        'leadership': {
            beginner: [
                { title: 'Leadership Fundamentals', type: 'course', duration: '4 weeks', provider: 'LinkedIn Learning' },
                { title: 'The Leader in Me', type: 'book', duration: 'Self-paced', provider: 'Stephen Covey' }
            ],
            intermediate: [
                { title: 'Strategic Leadership', type: 'course', duration: '6 weeks', provider: 'MIT Sloan' },
                { title: 'Leadership in Crisis', type: 'course', duration: '3 weeks', provider: 'HBS Online' }
            ]
        },
        'analytics': {
            beginner: [
                { title: 'Google Analytics Certification', type: 'certification', duration: '2 weeks', provider: 'Google' },
                { title: 'Data Analytics Fundamentals', type: 'course', duration: '4 weeks', provider: 'IBM' }
            ],
            intermediate: [
                { title: 'Advanced Google Analytics', type: 'course', duration: '4 weeks', provider: 'Google' },
                { title: 'Business Intelligence with Tableau', type: 'course', duration: '6 weeks', provider: 'UC Davis' }
            ]
        },
        'design': {
            beginner: [
                { title: 'Design Thinking (IDEO)', type: 'course', duration: '6 weeks', provider: 'IDEO' },
                { title: 'Figma Basics', type: 'tutorial', duration: '1 week', provider: 'Figma Academy' }
            ],
            intermediate: [
                { title: 'UX Design Specialization', type: 'specialization', duration: '6 months', provider: 'Google' },
                { title: 'Advanced Prototyping', type: 'course', duration: '4 weeks', provider: 'Interaction Design Foundation' }
            ]
        }
    };

    const careerSpecificResources = {
        'Data Scientist': {
            certifications: [
                { title: 'Google Data Analytics Certificate', provider: 'Google', duration: '6 months' },
                { title: 'IBM Data Science Professional Certificate', provider: 'IBM', duration: '8 months' },
                { title: 'Microsoft Azure Data Scientist Associate', provider: 'Microsoft', duration: '3-6 months' }
            ],
            projects: [
                'Build a recommendation system using collaborative filtering',
                'Create a predictive model for customer churn',
                'Analyze social media sentiment using NLP techniques',
                'Design an A/B testing framework'
            ]
        },
        'Software Engineer': {
            certifications: [
                { title: 'AWS Certified Developer', provider: 'Amazon', duration: '3-6 months' },
                { title: 'Google Cloud Professional Developer', provider: 'Google', duration: '4-6 months' },
                { title: 'Oracle Java Certification', provider: 'Oracle', duration: '2-4 months' }
            ],
            projects: [
                'Build a full-stack web application with authentication',
                'Create a RESTful API with proper documentation',
                'Implement a microservices architecture',
                'Contribute to open source projects on GitHub'
            ]
        },
        'Product Manager': {
            certifications: [
                { title: 'Google Project Management Certificate', provider: 'Google', duration: '6 months' },
                { title: 'Certified Scrum Product Owner', provider: 'Scrum Alliance', duration: '2 days' },
                { title: 'Product Management Certificate', provider: 'UC Berkeley', duration: '6 months' }
            ],
            projects: [
                'Conduct user research and create personas',
                'Build a product roadmap with stakeholder buy-in',
                'Launch a feature from conception to market',
                'Analyze product metrics and KPIs'
            ]
        },
        'UX Designer': {
            certifications: [
                { title: 'Google UX Design Certificate', provider: 'Google', duration: '6 months' },
                { title: 'HCI Certificate', provider: 'Interaction Design Foundation', duration: '12 months' },
                { title: 'Adobe Certified Expert', provider: 'Adobe', duration: '3-6 months' }
            ],
            projects: [
                'Design a mobile app from wireframes to prototype',
                'Conduct usability testing and iterate on feedback',
                'Create a design system for consistency',
                'Redesign an existing product for better accessibility'
            ]
        }
    };

    const result = {
        skillBasedResources: [],
        careerResources: careerSpecificResources[career] || { certifications: [], projects: [] },
        practiceOpportunities: [],
        networkingTips: []
    };

    // Add resources for missing skills
    missingSkills.forEach(skill => {
        const skillKey = skill.toLowerCase();
        if (skillResources[skillKey]) {
            const levelResources = skillResources[skillKey][userLevel] || skillResources[skillKey]['beginner'];
            result.skillBasedResources.push({
                skill: skill,
                resources: levelResources
            });
        }
    });

    // Add practice opportunities based on career
    const practiceMap = {
        'Data Scientist': [
            'Participate in Kaggle competitions',
            'Complete DataCamp or Coursera projects',
            'Join local data science meetups',
            'Practice on public datasets'
        ],
        'Software Engineer': [
            'Solve coding challenges on LeetCode/HackerRank',
            'Build projects and showcase on GitHub',
            'Contribute to open source projects',
            'Join coding bootcamps or workshops'
        ],
        'Product Manager': [
            'Analyze products you use daily',
            'Join product management communities',
            'Practice case studies from consulting firms',
            'Shadow current product managers'
        ],
        'UX Designer': [
            'Participate in design challenges',
            'Create unsolicited redesigns',
            'Join design communities (Dribbble, Behance)',
            'Practice user interviews with friends/family'
        ]
    };

    result.practiceOpportunities = practiceMap[career] || [
        'Join professional associations in your field',
        'Attend industry conferences and workshops',
        'Find mentors in your target career',
        'Practice relevant skills through online platforms'
    ];

    // Add networking tips
    result.networkingTips = [
        `Join ${career.toLowerCase()} groups on LinkedIn`,
        'Attend virtual industry meetups and conferences',
        'Connect with professionals on LinkedIn with personalized messages',
        'Follow industry leaders and engage with their content',
        'Join relevant Discord/Slack communities',
        'Participate in industry-specific forums and discussions'
    ];

    return result;
}
